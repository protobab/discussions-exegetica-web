// functions/api/groups.js

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT g.id, g.name, g.description, g.book_focus, g.member_count, g.post_count, g.created_at,
           u.username, u.display_name, u.avatar_color
    FROM study_groups g
    JOIN users u ON g.owner_id = u.id
    ORDER BY g.created_at DESC
  `).all()
  return json({ groups: results })
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to create a group' }, 401)

  const { name, description, book_focus } = await request.json()
  if (!name?.trim()) return json({ error: 'Group name is required' }, 400)

  const r = await env.DB.prepare(
    `INSERT INTO study_groups (name, description, book_focus, owner_id) VALUES (?,?,?,?)`
  ).bind(name.trim(), description?.trim() || '', book_focus?.trim() || '', session.user_id).run()

  await env.DB.prepare(
    `INSERT INTO study_group_members (group_id, user_id, role) VALUES (?,?,'owner')`
  ).bind(r.meta.last_row_id, session.user_id).run()

  return json({ id: r.meta.last_row_id }, 201)
}

export async function onRequestOptions() {
  return new Response(null, { headers: cors() })
}

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

function cors() {
  return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors() } })
}
