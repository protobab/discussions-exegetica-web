async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}
const ADMIN_USERS = ['eki']
export async function onRequestPatch({ env, params, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in' }, 401)
  const { replyId } = params
  const { body } = await request.json()
  if (!body?.trim()) return json({ error: 'Body required' }, 400)
  const reply = await env.DB.prepare(`SELECT author_id FROM replies WHERE id = ?`).bind(replyId).first()
  if (!reply) return json({ error: 'Not found' }, 404)
  if (reply.author_id !== session.user_id && !ADMIN_USERS.includes(session.username)) return json({ error: 'Forbidden' }, 403)
  await env.DB.prepare(`UPDATE replies SET body = ?, edited_at = datetime('now') WHERE id = ?`).bind(body.trim(), replyId).run()
  return json({ ok: true })
}
export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } })
}
