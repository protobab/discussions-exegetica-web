// functions/api/admin/daily-words.js
import { getSession, json, ADMIN_USERS } from '../../_shared.js'

export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)
  const today = new Date().toISOString().split('T')[0]
  const { results } = await env.DB.prepare(`SELECT verse_ref, verse_text, theme, posted_date FROM daily_words WHERE posted_date >= ? ORDER BY posted_date ASC LIMIT 60`).bind(today).all()
  return json({ words: results })
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)
  const { verse_ref, verse_text, theme, posted_date } = await request.json()
  if (!verse_ref || !verse_text || !posted_date) return json({ error: 'Reference, text and date required' }, 400)
  try {
    await env.DB.prepare(`INSERT INTO daily_words (verse_ref, verse_text, theme, posted_date) VALUES (?,?,?,?)`).bind(verse_ref.trim(), verse_text.trim(), theme?.trim()||'', posted_date).run()
    return json({ ok: true }, 201)
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return json({ error: 'A verse already exists for that date' }, 400)
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
