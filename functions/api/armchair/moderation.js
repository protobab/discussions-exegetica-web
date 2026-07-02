// functions/api/armchair/moderation.js
import { getSession, json, ADMIN_USERS } from '../../_shared.js'

export async function onRequestGet({ env, request }) {
  const s = await getSession(request, env)
  if (!s || !ADMIN_USERS.includes(s.username)) return json({ error: 'Unauthorised' }, 401)
  const { results } = await env.DB.prepare(`
    SELECT m.id, m.body, m.flag_count, m.is_hidden, m.created_at,
           u.username, u.display_name, se.title as session_title
    FROM armchair_messages m JOIN users u ON m.user_id = u.id JOIN armchair_sessions se ON m.session_id = se.id
    WHERE m.flag_count > 0 ORDER BY m.created_at DESC LIMIT 100
  `).all()
  return json({ flagged: results })
}

export async function onRequestPost({ env, request }) {
  const s = await getSession(request, env)
  if (!s || !ADMIN_USERS.includes(s.username)) return json({ error: 'Unauthorised' }, 401)
  const { message_id, action } = await request.json()
  if (action === 'restore') await env.DB.prepare(`UPDATE armchair_messages SET is_hidden = 0, flag_count = 0 WHERE id = ?`).bind(message_id).run()
  else if (action === 'remove') await env.DB.prepare(`UPDATE armchair_messages SET is_hidden = 1 WHERE id = ?`).bind(message_id).run()
  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
