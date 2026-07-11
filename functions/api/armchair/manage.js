// functions/api/armchair/manage.js


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

async function adminSession(request, env) {
  const s = await getSession(request, env)
  return s && ADMIN_USERS.includes(s.username) ? s : null
}

// GET: list all sessions for admin
export async function onRequestGet({ env, request }) {
  if (!(await adminSession(request, env))) return json({ error: 'Unauthorised' }, 401)
  const { results } = await env.DB.prepare(
    `SELECT id, title, guest_name, status, scheduled_at, cover_image, recording_url, zoom_link FROM armchair_sessions ORDER BY scheduled_at DESC`
  ).all()
  return json({ sessions: results })
}

// POST: create post or session
export async function onRequestPost({ env, request }) {
  const admin = await adminSession(request, env)
  if (!admin) return json({ error: 'Unauthorised' }, 401)
  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  const body = await request.json()

  if (type === 'post') {
    const { title, excerpt, body: content, cover_image } = body
    if (!title?.trim() || !content?.trim()) return json({ error: 'Title and content required' }, 400)
    const r = await env.DB.prepare(`INSERT INTO armchair_posts (title, excerpt, body, cover_image, author_id) VALUES (?,?,?,?,?)`).bind(title.trim(), excerpt?.trim()||'', content.trim(), cover_image?.trim()||'', admin.user_id).run()
    return json({ id: r.meta.last_row_id }, 201)
  }

  if (type === 'session') {
    const { title, description, guest_name, guest_bio, cover_image, scheduled_at, zoom_link } = body
    if (!title?.trim() || !scheduled_at) return json({ error: 'Title and date required' }, 400)
    const room_id = 'room_' + crypto.randomUUID().replace(/-/g,'').slice(0,10)
    const r = await env.DB.prepare(`INSERT INTO armchair_sessions (title, description, guest_name, guest_bio, cover_image, scheduled_at, room_id, zoom_link, host_id) VALUES (?,?,?,?,?,?,?,?,?)`).bind(title.trim(), description?.trim()||'', guest_name?.trim()||'', guest_bio?.trim()||'', cover_image?.trim()||'', scheduled_at, room_id, zoom_link?.trim()||'', admin.user_id).run()
    return json({ id: r.meta.last_row_id, room_id }, 201)
  }

  return json({ error: 'Invalid type' }, 400)
}

// PUT: update session status or recording URL
export async function onRequestPut({ env, request }) {
  if (!(await adminSession(request, env))) return json({ error: 'Unauthorised' }, 401)
  const { session_id, status, recording_url } = await request.json()
  if (!session_id || !status) return json({ error: 'session_id and status required' }, 400)
  await env.DB.prepare(`UPDATE armchair_sessions SET status = ?, recording_url = COALESCE(?, recording_url) WHERE id = ?`).bind(status, recording_url || null, session_id).run()
  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS' }})
}

// PATCH: update session details
export async function onRequestPatch({ env, request }) {
  const admin = await adminSession(request, env)
  if (!admin) return json({ error: 'Unauthorised' }, 401)
  const { id, title, description, guest_name, guest_bio, scheduled_at, zoom_link, cover_image } = await request.json()
  if (!id) return json({ error: 'Session id required' }, 400)
  await env.DB.prepare(`
    UPDATE armchair_sessions SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      guest_name = COALESCE(?, guest_name),
      guest_bio = COALESCE(?, guest_bio),
      scheduled_at = COALESCE(?, scheduled_at),
      zoom_link = COALESCE(?, zoom_link),
      cover_image = COALESCE(?, cover_image)
    WHERE id = ?
  `).bind(title||null, description||null, guest_name||null, guest_bio||null, scheduled_at||null, zoom_link||null, cover_image||null, id).run()
  return json({ ok: true })
}

// DELETE: remove a session and its messages
export async function onRequestDelete({ env, request }) {
  const admin = await adminSession(request, env)
  if (!admin) return json({ error: 'Unauthorised' }, 401)
  const url = new URL(request.url)
  const session_id = url.searchParams.get('session_id')
  if (!session_id) return json({ error: 'session_id required' }, 400)
  await env.DB.prepare(`DELETE FROM armchair_messages WHERE session_id = ?`).bind(session_id).run()
  await env.DB.prepare(`DELETE FROM armchair_sessions WHERE id = ?`).bind(session_id).run()
  return json({ ok: true })
}
