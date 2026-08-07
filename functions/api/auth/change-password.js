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
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = [...salt].map(b => b.toString(16).padStart(2,'0')).join('')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations:100000, hash:'SHA-256' }, key, 256)
  return saltHex + ':' + [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('')
}
async function verifyPassword(pw, stored) {
  const [saltHex, h] = stored.split(':')
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b=>parseInt(b,16)))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations:100000, hash:'SHA-256' }, key, 256)
  return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('') === h
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in first' }, 401)
  const { current_password, new_password } = await request.json().catch(() => ({}))
  if (!current_password || !new_password) return json({ error: 'Current and new password required' }, 400)
  if (new_password.length < 8) return json({ error: 'New password must be at least 8 characters' }, 400)
  if (!/[A-Z]/.test(new_password)) return json({ error: 'Password must contain at least one capital letter' }, 400)
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};:'",.?]/.test(new_password)) return json({ error: 'Password must contain at least one number or special character' }, 400)
  const user = await env.DB.prepare(`SELECT id, password_hash FROM users WHERE id = ?`).bind(session.user_id).first()
  if (!user || !(await verifyPassword(current_password, user.password_hash))) return json({ error: 'Current password is incorrect' }, 400)
  const newHash = await hashPassword(new_password)
  await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).bind(newHash, session.user_id).run()
  return json({ ok: true, message: 'Password changed successfully' })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } })
}
