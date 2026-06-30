// functions/api/groups/[id]/join.js

export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to join a group' }, 401)

  const existing = await env.DB.prepare(
    `SELECT 1 FROM study_group_members WHERE group_id = ? AND user_id = ?`
  ).bind(params.id, session.user_id).first()

  if (existing) return json({ error: 'You are already a member' }, 400)

  await env.DB.prepare(
    `INSERT INTO study_group_members (group_id, user_id) VALUES (?,?)`
  ).bind(params.id, session.user_id).run()

  await env.DB.prepare(
    `UPDATE study_groups SET member_count = member_count + 1 WHERE id = ?`
  ).bind(params.id).run()

  return json({ ok: true })
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
