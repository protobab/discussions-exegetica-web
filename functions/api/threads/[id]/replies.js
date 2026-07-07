// functions/api/threads/[id]/replies.js


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

export async function onRequestGet({ env, params }) {
  const { results } = await env.DB.prepare(
    `SELECT r.id, r.body, r.like_count, r.created_at, u.username, u.display_name, u.avatar_color, u.badge
     FROM replies r JOIN users u ON r.author_id = u.id WHERE r.thread_id = ? ORDER BY r.created_at ASC`
  ).bind(params.id).all()
  await env.DB.prepare(`UPDATE threads SET view_count = view_count + 1 WHERE id = ?`).bind(params.id).run()
  const thread = await env.DB.prepare(`
    SELECT t.id, t.title, t.body, t.author_id, t.created_at, t.like_count, t.reply_count,
           u.display_name, u.avatar_color, u.badge, u.username,
           c.label as cat_label, c.slug as cat_slug
    FROM threads t
    JOIN users u ON t.author_id = u.id
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).bind(params.id).first()
  return json({ replies: results, thread })
}

export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to reply' }, 401)
  const { body } = await request.json()
  if (!body?.trim()) return json({ error: 'Reply cannot be empty' }, 400)
  await env.DB.prepare(`INSERT INTO replies (thread_id, author_id, body) VALUES (?,?,?)`).bind(params.id, session.user_id, body.trim()).run()
  await env.DB.prepare(`UPDATE threads SET reply_count = reply_count + 1, updated_at = datetime('now') WHERE id = ?`).bind(params.id).run()
  await env.DB.prepare(`UPDATE users SET reputation = reputation + 2 WHERE id = ?`).bind(session.user_id).run()
  const thread = await env.DB.prepare(`SELECT author_id, title FROM threads WHERE id = ?`).bind(params.id).first()
  if (thread && thread.author_id !== session.user_id) {
    await env.DB.prepare(`INSERT INTO notifications (user_id, type, thread_id, message) VALUES (?,?,?,?)`
    ).bind(thread.author_id, 'reply', params.id, `${session.username} replied to "${thread.title}"`).run()
  }
  return json({ ok: true }, 201)
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
