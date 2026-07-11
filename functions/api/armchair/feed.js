// functions/api/armchair/feed.js


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

export async function onRequestGet({ env }) {
  const now = new Date().toISOString()
  const live = await env.DB.prepare(`SELECT s.*, u.display_name as host_name FROM armchair_sessions s JOIN users u ON s.host_id = u.id WHERE s.status = 'live' ORDER BY s.scheduled_at ASC LIMIT 1`).first()
  const next = live || await env.DB.prepare(`SELECT s.*, u.display_name as host_name FROM armchair_sessions s JOIN users u ON s.host_id = u.id WHERE s.status = 'scheduled' AND s.scheduled_at >= ? ORDER BY s.scheduled_at ASC LIMIT 1`).bind(now).first()
  const { results: past } = await env.DB.prepare(`SELECT id, title, guest_name, cover_image, scheduled_at, recording_url, listener_count FROM armchair_sessions WHERE status = 'ended' ORDER BY scheduled_at DESC LIMIT 6`).all()
  const { results: posts } = await env.DB.prepare(`SELECT p.id, p.title, p.excerpt, p.body, p.cover_image, p.view_count, p.created_at, u.display_name as author_name, u.avatar_color FROM armchair_posts p JOIN users u ON p.author_id = u.id WHERE p.published = 1 ORDER BY p.created_at DESC LIMIT 12`).all()
  return json({ featured: next || null, pastSessions: past, posts })
}
