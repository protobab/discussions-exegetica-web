// functions/api/armchair/sessions.js
// Returns ALL sessions for admin management

const ADMIN_USERS = ['eki']

export async function onRequestGet({ env, request }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return json({ error: 'Unauthorised' }, 401)
  try {
    const session = JSON.parse(await env.SESSIONS.get(`s:${token}`))
    if (!ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)
  } catch { return json({ error: 'Unauthorised' }, 401) }

  const { results } = await env.DB.prepare(`
    SELECT s.id, s.title, s.guest_name, s.status, s.scheduled_at, s.cover_image
    FROM armchair_sessions s
    ORDER BY s.scheduled_at DESC
  `).all()

  return json({ sessions: results })
}

export async function onRequestOptions() {
  return new Response(null, { headers: cors() })
}

function cors() {
  return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,OPTIONS' }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors() } })
}
