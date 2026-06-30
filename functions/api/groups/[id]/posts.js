// functions/api/groups/[id]/posts.js

export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to post' }, 401)

  const member = await env.DB.prepare(
    `SELECT 1 FROM study_group_members WHERE group_id = ? AND user_id = ?`
  ).bind(params.id, session.user_id).first()
  if (!member) return json({ error: 'Join the group to post' }, 403)

  const { body } = await request.json()
  if (!body?.trim()) return json({ error: 'Post cannot be empty' }, 400)

  await env.DB.prepare(
    `INSERT INTO study_group_posts (group_id, author_id, body) VALUES (?,?,?)`
  ).bind(params.id, session.user_id, body.trim()).run()

  await env.DB.prepare(
    `UPDATE study_groups SET post_count = post_count + 1 WHERE id = ?`
  ).bind(params.id).run()

  return json({ ok: true }, 201)
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
  return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors() } })
}
