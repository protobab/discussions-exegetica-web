// functions/api/threads/[id]/replies.js

export async function onRequestGet({ env, params }) {
  const { results } = await env.DB.prepare(
    `SELECT r.id, r.body, r.like_count, r.created_at,
            u.username, u.display_name, u.avatar_color, u.badge
     FROM replies r JOIN users u ON r.author_id = u.id
     WHERE r.thread_id = ? ORDER BY r.created_at ASC`
  ).bind(params.id).all()

  // increment view count
  await env.DB.prepare(`UPDATE threads SET view_count = view_count + 1 WHERE id = ?`).bind(params.id).run()

  return json({ replies: results })
}

export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to reply' }, 401)

  const { body } = await request.json()
  if (!body?.trim()) return json({ error: 'Reply cannot be empty' }, 400)

  await env.DB.prepare(`INSERT INTO replies (thread_id, author_id, body) VALUES (?,?,?)`
  ).bind(params.id, session.user_id, body.trim()).run()

  await env.DB.prepare(`UPDATE threads SET reply_count = reply_count + 1, updated_at = datetime('now') WHERE id = ?`
  ).bind(params.id).run()

  await env.DB.prepare(`UPDATE users SET reputation = reputation + 2 WHERE id = ?`).bind(session.user_id).run()

  return json({ ok: true }, 201)
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' } })
}

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ','')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' }
  })
}
