// functions/api/groups/[id]/index.js

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}
const ADMIN_USERS = ['eki']

export async function onRequestGet({ env, params, request }) {
  const session = await getSession(request, env)
  const id = params.id

  const group = await env.DB.prepare(`
    SELECT g.*, u.display_name, u.avatar_color, u.username
    FROM study_groups g JOIN users u ON g.owner_id = u.id
    WHERE g.id = ?
  `).bind(id).first()

  if (!group) return json({ error: 'Group not found' }, 404)

  // Enforce privacy
  const isAdmin = session && ADMIN_USERS.includes(session.username)
  const isOwner = session && group.owner_id === session.user_id

  if (group.is_private && !isAdmin && !isOwner) {
    // Check if user is a member
    const isMember = session
      ? await env.DB.prepare(`SELECT 1 FROM study_group_members WHERE group_id = ? AND user_id = ?`).bind(id, session.user_id).first()
      : null
    if (!isMember) return json({ error: 'This is a private group. You need an invite link to join.', is_private: true }, 403)
  }

  const { results: posts } = await env.DB.prepare(`
    SELECT p.*, u.display_name, u.avatar_color, u.badge
    FROM study_group_posts p JOIN users u ON p.author_id = u.id
    WHERE p.group_id = ? ORDER BY p.created_at DESC LIMIT 30
  `).bind(id).all()

  // Generate invite link if owner or admin
  let inviteUrl = null
  if ((isOwner || isAdmin) && group.is_private) {
    if (!group.invite_code) {
      const arr = new Uint8Array(6)
      crypto.getRandomValues(arr)
      const code = Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('')
      await env.DB.prepare(`UPDATE study_groups SET invite_code = ? WHERE id = ?`).bind(code, id).run()
      group.invite_code = code
    }
    inviteUrl = `https://discussionsexegetica.com/groups/join/${group.invite_code}`
  }

  return json({ group: { ...group, invite_url: inviteUrl }, posts })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } })
}
