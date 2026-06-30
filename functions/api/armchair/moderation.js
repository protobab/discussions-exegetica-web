// functions/api/armchair/moderation.js

const ADMIN_USERS = ['eki']

async function isAdmin(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const session = JSON.parse(await env.SESSIONS.get(`s:${token}`))
    return ADMIN_USERS.includes(session.username) ? session : null
  } catch { return null }
}

export async function onRequestGet({ env, request }) {
  if (!(await isAdmin(request, env))) return json({ error: 'Unauthorised' }, 401)

  const { results } = await env.DB.prepare(`
    SELECT m.id, m.body, m.flag_count, m.is_hidden, m.created_at,
           u.username, u.display_name, s.title as session_title, s.id as session_id
    FROM armchair_messages m
    JOIN users u ON m.user_id = u.id
    JOIN armchair_sessions s ON m.session_id = s.id
    WHERE m.flag_count > 0
    ORDER BY m.created_at DESC LIMIT 100
  `).all()

  return json({ flagged: results })
}

export async function onRequestPost({ env, request }) {
  // restore or permanently remove a flagged message
  const admin = await isAdmin(request, env)
  if (!admin) return json({ error: 'Unauthorised' }, 401)

  const { message_id, action } = await request.json() // action: 'restore' | 'remove'
  if (!message_id || !action) return json({ error: 'message_id and action required' }, 400)

  if (action === 'restore') {
    await env.DB.prepare(`UPDATE armchair_messages SET is_hidden = 0, flag_count = 0 WHERE id = ?`).bind(message_id).run()
  } else if (action === 'remove') {
    await env.DB.prepare(`UPDATE armchair_messages SET is_hidden = 1 WHERE id = ?`).bind(message_id).run()
  }

  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: cors() })
}

function cors() {
  return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors() } })
}
