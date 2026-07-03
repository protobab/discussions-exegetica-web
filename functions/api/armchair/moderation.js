// functions/api/armchair/moderation.js


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

export async function onRequestGet({ env, request }) {
  const s = await getSession(request, env)
  if (!s || !ADMIN_USERS.includes(s.username)) return json({ error: 'Unauthorised' }, 401)
  const { results } = await env.DB.prepare(`
    SELECT m.id, m.body, m.flag_count, m.is_hidden, m.created_at,
           u.username, u.display_name, se.title as session_title
    FROM armchair_messages m JOIN users u ON m.user_id = u.id JOIN armchair_sessions se ON m.session_id = se.id
    WHERE m.flag_count > 0 ORDER BY m.created_at DESC LIMIT 100
  `).all()
  return json({ flagged: results })
}

export async function onRequestPost({ env, request }) {
  const s = await getSession(request, env)
  if (!s || !ADMIN_USERS.includes(s.username)) return json({ error: 'Unauthorised' }, 401)
  const { message_id, action } = await request.json()
  if (action === 'restore') await env.DB.prepare(`UPDATE armchair_messages SET is_hidden = 0, flag_count = 0 WHERE id = ?`).bind(message_id).run()
  else if (action === 'remove') await env.DB.prepare(`UPDATE armchair_messages SET is_hidden = 1 WHERE id = ?`).bind(message_id).run()
  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
