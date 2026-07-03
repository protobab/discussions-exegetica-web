// functions/api/armchair/sessions/[id]/messages.js
import { getSession, json } from '../../../../_shared.js'

export async function onRequestGet({ env, params }) {
  const { results } = await env.DB.prepare(`SELECT m.id, m.body, m.is_question, m.flag_count, m.created_at, u.username, u.display_name, u.avatar_color, u.badge FROM armchair_messages m JOIN users u ON m.user_id = u.id WHERE m.session_id = ? AND m.is_hidden = 0 ORDER BY m.created_at ASC LIMIT 300`).bind(params.id).all()
  const session = await env.DB.prepare(`SELECT id, title, status, guest_name, description, cover_image, room_id, recording_url, recording_key, zoom_link, listener_count FROM armchair_sessions WHERE id = ?`).bind(params.id).first()
  return json({ messages: results, session })
}

export async function onRequestPost({ env, request, params }) {
  const sess = await getSession(request, env)
  if (!sess) return json({ error: 'Please sign in' }, 401)
  const { body, is_question } = await request.json()
  if (!body?.trim()) return json({ error: 'Cannot be empty' }, 400)
  await env.DB.prepare(`INSERT INTO armchair_messages (session_id, user_id, body, is_question) VALUES (?,?,?,?)`).bind(params.id, sess.user_id, body.trim(), is_question ? 1 : 0).run()
  await env.DB.prepare(`UPDATE armchair_sessions SET listener_count = listener_count + 1 WHERE id = ? AND status = 'live'`).bind(params.id).run()
  return json({ ok: true }, 201)
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
