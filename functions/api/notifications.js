// functions/api/notifications.js
import { getSession, json } from '../_shared.js'

export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Unauthorised' }, 401)
  const { results } = await env.DB.prepare(
    `SELECT id, type, thread_id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`
  ).bind(session.user_id).all()
  return json({ notifications: results, unread: results.filter(n=>!n.is_read).length })
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Unauthorised' }, 401)
  await env.DB.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).bind(session.user_id).run()
  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
