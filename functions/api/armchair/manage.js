// functions/api/armchair/manage.js
// Admin-only: create blog posts and schedule live sessions

const ADMIN_USERS = ['eki']

async function isAdmin(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const session = JSON.parse(await env.SESSIONS.get(`s:${token}`))
    return ADMIN_USERS.includes(session.username) ? session : null
  } catch { return null }
}

export async function onRequestPost({ env, request }) {
  const session = await isAdmin(request, env)
  if (!session) return json({ error: 'Unauthorised' }, 401)

  const url = new URL(request.url)
  const type = url.searchParams.get('type') // 'post' | 'session'
  const body = await request.json()

  if (type === 'post') {
    const { title, excerpt, body: content, cover_image } = body
    if (!title?.trim() || !content?.trim()) return json({ error: 'Title and content required' }, 400)
    const r = await env.DB.prepare(
      `INSERT INTO armchair_posts (title, excerpt, body, cover_image, author_id) VALUES (?,?,?,?,?)`
    ).bind(title.trim(), excerpt?.trim() || '', content.trim(), cover_image?.trim() || '', session.user_id).run()
    return json({ id: r.meta.last_row_id }, 201)
  }

  if (type === 'session') {
    const { title, description, guest_name, guest_bio, cover_image, scheduled_at } = body
    if (!title?.trim() || !scheduled_at) return json({ error: 'Title and date/time required' }, 400)
    const room_id = 'room_' + Math.random().toString(36).slice(2, 10)
    const r = await env.DB.prepare(
      `INSERT INTO armchair_sessions (title, description, guest_name, guest_bio, cover_image, scheduled_at, room_id, host_id)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(title.trim(), description?.trim() || '', guest_name?.trim() || '', guest_bio?.trim() || '',
           cover_image?.trim() || '', scheduled_at, room_id, session.user_id).run()
    return json({ id: r.meta.last_row_id, room_id }, 201)
  }

  return json({ error: 'Invalid type' }, 400)
}

export async function onRequestPut({ env, request }) {
  // Update session status: scheduled -> live -> ended
  const session = await isAdmin(request, env)
  if (!session) return json({ error: 'Unauthorised' }, 401)

  const { session_id, status, recording_url, recording_notes } = await request.json()
  if (!session_id || !status) return json({ error: 'session_id and status required' }, 400)

  await env.DB.prepare(
    `UPDATE armchair_sessions SET status = ?, recording_url = COALESCE(?, recording_url), recording_notes = COALESCE(?, recording_notes) WHERE id = ?`
  ).bind(status, recording_url || null, recording_notes || null, session_id).run()

  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: cors() })
}

function cors() {
  return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS' }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors() } })
}
