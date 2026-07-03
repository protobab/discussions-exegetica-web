// functions/api/auth/[[action]].js


// ── Shared helpers (inlined — Cloudflare Pages doesn't support relative imports) ──
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

async function makeToken() {
  return [...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('')
}

const ADMIN_USERS = ['eki']

export async function onRequestPost({ env, request, params }) {
  const action = params.action?.[0]
  if (action === 'register') return register(env, request)
  if (action === 'login') return login(env, request)
  return json({ error: 'Not found' }, 404)
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' }})
}

async function register(env, request) {
  const { username, email, password, display_name } = await request.json()
  if (!username || !email || !password || !display_name) return json({ error: 'All fields are required' }, 400)
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)
  try {
    const hash = await hashPassword(password)
    const colors = ['#1B2A4A','#7A9E7E','#C9A84C','#2E4270','#4A6741']
    const avatar_color = colors[Math.floor(Math.random() * colors.length)]
    const r = await env.DB.prepare(
      `INSERT INTO users (username, email, password_hash, display_name, avatar_color) VALUES (?,?,?,?,?)`
    ).bind(username.toLowerCase().trim(), email.toLowerCase().trim(), hash, display_name.trim(), avatar_color).run()
    const token = await makeToken()
    const userData = { user_id: r.meta.last_row_id, username: username.toLowerCase().trim(), display_name: display_name.trim(), badge: 'Seeker', avatar_color, is_admin: 0 }
    await env.SESSIONS.put(`s:${token}`, JSON.stringify(userData), { expirationTtl: 60*60*24*30 })
    return json({ token, user: { id: r.meta.last_row_id, ...userData } }, 201)
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return json({ error: 'Username or email already taken' }, 400)
    return json({ error: e.message }, 500)
  }
}

async function login(env, request) {
  const { email, password } = await request.json()
  if (!email || !password) return json({ error: 'Email and password required' }, 400)
  const user = await env.DB.prepare(
    `SELECT id, username, display_name, password_hash, badge, avatar_color, is_admin FROM users WHERE email = ?`
  ).bind(email.toLowerCase().trim()).first()
  if (!user || !(await verifyPassword(password, user.password_hash))) return json({ error: 'Invalid email or password' }, 401)
  const token = await makeToken()
  const userData = { user_id: user.id, username: user.username, display_name: user.display_name, badge: user.badge, avatar_color: user.avatar_color, is_admin: user.is_admin }
  await env.SESSIONS.put(`s:${token}`, JSON.stringify(userData), { expirationTtl: 60*60*24*30 })
  return json({ token, user: { id: user.id, ...userData } })
}
