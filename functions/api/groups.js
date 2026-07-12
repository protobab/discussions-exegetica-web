// functions/api/groups.js

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}
async function makeCode() {
  const arr = new Uint8Array(6)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('')
}
const ADMIN_USERS = ['eki']

// GET — list groups (excludes private groups unless member or admin)
export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  const url = new URL(request.url)
  const inviteCode = url.searchParams.get('invite')

  // If invite code provided, return that specific group
  if (inviteCode) {
    const group = await env.DB.prepare(`
      SELECT g.*, u.display_name, u.avatar_color, u.username
      FROM study_groups g JOIN users u ON g.owner_id = u.id
      WHERE g.invite_code = ?
    `).bind(inviteCode).first()
    if (!group) return json({ error: 'Invalid invite link' }, 404)
    return json({ group })
  }

  try {
    let groups
    if (session && ADMIN_USERS.includes(session.username)) {
      // Admin sees ALL groups including private
      const { results } = await env.DB.prepare(`
        SELECT g.id, g.name, g.description, g.book_focus, g.cover_image,
               g.member_count, g.post_count, g.created_at, g.is_private,
               g.approval_required, g.max_members,
               u.display_name, u.avatar_color
        FROM study_groups g JOIN users u ON g.owner_id = u.id
        ORDER BY g.created_at DESC
      `).all()
      groups = results
    } else if (session) {
      // Logged in: see public groups + private groups you're a member of
      const { results } = await env.DB.prepare(`
        SELECT g.id, g.name, g.description, g.book_focus, g.cover_image,
               g.member_count, g.post_count, g.created_at, g.is_private,
               g.approval_required, g.max_members,
               u.display_name, u.avatar_color,
               (SELECT 1 FROM study_group_members m WHERE m.group_id = g.id AND m.user_id = ?) as is_member
        FROM study_groups g JOIN users u ON g.owner_id = u.id
        WHERE g.is_private = 0 OR g.owner_id = ?
           OR EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = g.id AND m.user_id = ?)
        ORDER BY g.created_at DESC
      `).bind(session.user_id, session.user_id, session.user_id).all()
      groups = results
    } else {
      // Public only
      const { results } = await env.DB.prepare(`
        SELECT g.id, g.name, g.description, g.book_focus, g.cover_image,
               g.member_count, g.post_count, g.created_at, g.is_private,
               g.approval_required, g.max_members,
               u.display_name, u.avatar_color
        FROM study_groups g JOIN users u ON g.owner_id = u.id
        WHERE g.is_private = 0
        ORDER BY g.created_at DESC
      `).all()
      groups = results
    }
    return json({ groups })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

// POST — create group
export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to create a group' }, 401)
  const { name, description, book_focus, cover_image, max_members, approval_required, is_private } = await request.json()
  if (!name?.trim()) return json({ error: 'Group name required' }, 400)

  try {
    const inviteCode = await makeCode()
    const r = await env.DB.prepare(`
      INSERT INTO study_groups (name, description, book_focus, cover_image, owner_id, max_members, approval_required, is_private, invite_code)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).bind(
      name.trim(), description?.trim()||'', book_focus?.trim()||'',
      cover_image||'', session.user_id,
      parseInt(max_members)||0,
      approval_required ? 1 : 0,
      is_private ? 1 : 0,
      inviteCode
    ).run()

    // Auto-add creator as member
    await env.DB.prepare(`INSERT OR IGNORE INTO study_group_members (group_id, user_id) VALUES (?,?)`).bind(r.meta.last_row_id, session.user_id).run()
    await env.DB.prepare(`UPDATE study_groups SET member_count = 1 WHERE id = ?`).bind(r.meta.last_row_id).run()

    return json({ id: r.meta.last_row_id, invite_code: inviteCode })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } })
}
