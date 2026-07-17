// functions/api/threads/[id]/edit.js
// PATCH — edit thread title and body (author only)

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

const ADMIN_USERS = ['eki']

export async function onRequestPatch({ env, params, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in' }, 401)

  const id = params.id
  const { title, body } = await request.json()
  if (!title?.trim() || !body?.trim()) return json({ error: 'Title and body required' }, 400)

  // Check ownership
  const thread = await env.DB.prepare(
    `SELECT author_id FROM threads WHERE id = ?`
  ).bind(id).first()

  if (!thread) return json({ error: 'Thread not found' }, 404)

  const isAuthor = thread.author_id === session.user_id
  const isAdmin = ADMIN_USERS.includes(session.username)

  if (!isAuthor && !isAdmin) return json({ error: 'You can only edit your own posts' }, 403)

  await env.DB.prepare(
    `UPDATE threads SET title = ?, body = ?, edited_at = datetime('now') WHERE id = ?`
  ).bind(title.trim(), body.trim(), id).run()

  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
