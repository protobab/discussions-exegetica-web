// functions/api/notifications.js

export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Unauthorised' }, 401)

  const { results } = await env.DB.prepare(
    `SELECT id, type, thread_id, group_id, message, is_read, created_at
     FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`
  ).bind(session.user_id).all()

  const unread = results.filter(n => !n.is_read).length
  return json({ notifications: results, unread })
}

export async function onRequestPost({ env, request }) {
  // Mark all as read
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Unauthorised' }, 401)

  await env.DB.prepare(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ?`
  ).bind(session.user_id).run()

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
  return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors() } })
}
