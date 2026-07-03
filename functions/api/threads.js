// functions/api/threads.js


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
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = 20
  let q = `SELECT t.id, t.title, t.body, t.is_pinned, t.view_count, t.reply_count, t.like_count, t.created_at,
             u.username, u.display_name, u.avatar_color, u.badge,
             c.slug as cat_slug, c.label as cat_label
           FROM threads t JOIN users u ON t.author_id = u.id JOIN categories c ON t.category_id = c.id`
  const p = []
  if (category && category !== 'all') { q += ` WHERE c.slug = ?`; p.push(category) }
  q += ` ORDER BY t.is_pinned DESC, t.updated_at DESC LIMIT ${limit} OFFSET ${(page-1)*limit}`
  const { results } = await env.DB.prepare(q).bind(...p).all()
  return json({ threads: results, page })
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to post' }, 401)
  const { title, body, category_slug } = await request.json()
  if (!title?.trim() || !body?.trim() || !category_slug) return json({ error: 'Missing fields' }, 400)
  const cat = await env.DB.prepare(`SELECT id FROM categories WHERE slug = ?`).bind(category_slug).first()
  if (!cat) return json({ error: 'Invalid category' }, 400)
  const r = await env.DB.prepare(`INSERT INTO threads (category_id, author_id, title, body) VALUES (?,?,?,?)`).bind(cat.id, session.user_id, title.trim(), body.trim()).run()
  await env.DB.prepare(`UPDATE users SET reputation = reputation + 5 WHERE id = ?`).bind(session.user_id).run()
  return json({ id: r.meta.last_row_id }, 201)
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
