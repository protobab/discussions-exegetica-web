// functions/api/announcement.js

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' } })
}
const ADMIN_USERS = ['eki']

// GET — return current active announcement
export async function onRequestGet({ env }) {
  try {
    const data = await env.SESSIONS.get('site:announcement')
    if (!data) return json({ announcement: null })
    return json({ announcement: JSON.parse(data) })
  } catch { return json({ announcement: null }) }
}

// POST — create/update announcement
export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)
  const { text, type, expires_hours } = await request.json()
  if (!text?.trim()) return json({ error: 'Announcement text required' }, 400)
  const announcement = {
    text: text.trim(),
    type: type || 'info', // info | success | warning
    created_at: new Date().toISOString(),
    expires_at: expires_hours ? new Date(Date.now() + expires_hours * 3600000).toISOString() : null
  }
  const ttl = expires_hours ? expires_hours * 3600 : 60 * 60 * 24 * 7
  await env.SESSIONS.put('site:announcement', JSON.stringify(announcement), { expirationTtl: ttl })
  return json({ ok: true, announcement })
}

// DELETE — remove announcement
export async function onRequestDelete({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)
  await env.SESSIONS.delete('site:announcement')
  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS' } })
}
