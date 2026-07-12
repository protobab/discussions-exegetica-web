// functions/api/auth/change-password.js

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}
async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'de-salt-2024'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in first' }, 401)
  const { current_password, new_password } = await request.json().catch(() => ({}))
  if (!current_password || !new_password) return json({ error: 'Current and new password required' }, 400)
  if (new_password.length < 8) return json({ error: 'New password must be at least 8 characters' }, 400)
  if (!/[A-Z]/.test(new_password)) return json({ error: 'Password must contain at least one capital letter' }, 400)
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};:'",.?]/.test(new_password)) return json({ error: 'Password must contain at least one number or special character' }, 400)
  const currentHash = await hashPassword(current_password)
  const user = await env.DB.prepare(`SELECT id FROM users WHERE id = ? AND password_hash = ?`).bind(session.user_id, currentHash).first()
  if (!user) return json({ error: 'Current password is incorrect' }, 400)
  const newHash = await hashPassword(new_password)
  await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).bind(newHash, session.user_id).run()
  return json({ ok: true, message: 'Password changed successfully' })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } })
}
