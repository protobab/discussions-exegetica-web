// functions/api/admin/daily-words.js

const ADMIN_USERS = ['protobab']

async function isAdmin(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return false
  try {
    const session = JSON.parse(await env.SESSIONS.get(`s:${token}`))
    return session && ADMIN_USERS.includes(session.username)
  } catch { return false }
}

export async function onRequestGet({ env }) {
  const today = new Date().toISOString().split('T')[0]
  const { results } = await env.DB.prepare(
    `SELECT verse_ref, verse_text, theme, posted_date
     FROM daily_words
     WHERE posted_date >= ?
     ORDER BY posted_date ASC
     LIMIT 60`
  ).bind(today).all()

  return new Response(JSON.stringify({ words: results }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

export async function onRequestPost({ env, request }) {
  if (!(await isAdmin(request, env)))
    return json({ error: 'Unauthorised' }, 401)

  const { verse_ref, verse_text, theme, posted_date } = await request.json()
  if (!verse_ref || !verse_text || !posted_date)
    return json({ error: 'Reference, text and date are required' }, 400)

  try {
    await env.DB.prepare(
      `INSERT INTO daily_words (verse_ref, verse_text, theme, posted_date)
       VALUES (?, ?, ?, ?)`
    ).bind(verse_ref.trim(), verse_text.trim(), theme?.trim() || '', posted_date).run()
    return json({ ok: true }, 201)
  } catch (e) {
    if (e.message?.includes('UNIQUE'))
      return json({ error: 'A verse is already set for that date. Choose a different date.' }, 400)
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
