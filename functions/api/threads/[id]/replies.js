// functions/api/threads/[id]/replies.js
import { getSession, json } from '../../../_shared.js'

export async function onRequestGet({ env, params }) {
  const { results } = await env.DB.prepare(
    `SELECT r.id, r.body, r.like_count, r.created_at, u.username, u.display_name, u.avatar_color, u.badge
     FROM replies r JOIN users u ON r.author_id = u.id WHERE r.thread_id = ? ORDER BY r.created_at ASC`
  ).bind(params.id).all()
  await env.DB.prepare(`UPDATE threads SET view_count = view_count + 1 WHERE id = ?`).bind(params.id).run()
  const thread = await env.DB.prepare(`SELECT id, title, author_id FROM threads WHERE id = ?`).bind(params.id).first()
  return json({ replies: results, thread })
}

export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to reply' }, 401)
  const { body } = await request.json()
  if (!body?.trim()) return json({ error: 'Reply cannot be empty' }, 400)
  await env.DB.prepare(`INSERT INTO replies (thread_id, author_id, body) VALUES (?,?,?)`).bind(params.id, session.user_id, body.trim()).run()
  await env.DB.prepare(`UPDATE threads SET reply_count = reply_count + 1, updated_at = datetime('now') WHERE id = ?`).bind(params.id).run()
  await env.DB.prepare(`UPDATE users SET reputation = reputation + 2 WHERE id = ?`).bind(session.user_id).run()
  const thread = await env.DB.prepare(`SELECT author_id, title FROM threads WHERE id = ?`).bind(params.id).first()
  if (thread && thread.author_id !== session.user_id) {
    await env.DB.prepare(`INSERT INTO notifications (user_id, type, thread_id, message) VALUES (?,?,?,?)`
    ).bind(thread.author_id, 'reply', params.id, `${session.username} replied to "${thread.title}"`).run()
  }
  return json({ ok: true }, 201)
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
