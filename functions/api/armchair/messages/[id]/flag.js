// functions/api/armchair/messages/[id]/flag.js

export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to report' }, 401)

  const existing = await env.DB.prepare(
    `SELECT 1 FROM armchair_message_flags WHERE message_id = ? AND user_id = ?`
  ).bind(params.id, session.user_id).first()
  if (existing) return json({ error: 'You already reported this message' }, 400)

  await env.DB.prepare(
    `INSERT INTO armchair_message_flags (message_id, user_id) VALUES (?,?)`
  ).bind(params.id, session.user_id).run()

  const updated = await env.DB.prepare(
    `UPDATE armchair_messages SET flag_count = flag_count + 1 WHERE id = ? RETURNING flag_count`
  ).bind(params.id).first()

  // Auto-hide after 3 distinct flags
  if (updated && updated.flag_count >= 3) {
    await env.DB.prepare(`UPDATE armchair_messages SET is_hidden = 1 WHERE id = ?`).bind(params.id).run()
  }

  return json({ ok: true, flag_count: updated?.flag_count || 0 })
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
