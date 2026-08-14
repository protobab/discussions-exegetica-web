// functions/api/testimonies/index.js
// Public: GET published testimonies. Admin (via ?admin=1 + auth): full CRUD.

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

async function adminSession(request, env) {
  const s = await getSession(request, env)
  return s && s.is_admin ? s : null
}

// GET /api/testimonies — public, published only
// GET /api/testimonies?admin=1 — admin only, all rows
export async function onRequestGet({ env, request }) {
  const url = new URL(request.url)
  if (url.searchParams.get('admin') === '1') {
    if (!(await adminSession(request, env))) return json({ error: 'Unauthorised' }, 401)
    const { results } = await env.DB.prepare(`SELECT * FROM testimonies ORDER BY created_at DESC`).all()
    return json({ testimonies: results })
  }
  const { results } = await env.DB.prepare(`SELECT id, name, location, video_url, story, created_at FROM testimonies WHERE published = 1 ORDER BY created_at DESC`).all()
  return json({ testimonies: results })
}

// POST /api/testimonies — admin: create
export async function onRequestPost({ env, request }) {
  if (!(await adminSession(request, env))) return json({ error: 'Unauthorised' }, 401)
  const { name, location, video_url, story, published } = await request.json().catch(() => ({}))
  if (!name?.trim() || !story?.trim()) return json({ error: 'Name and story are required' }, 400)
  const status = published ? 'published' : 'draft'
  const r = await env.DB.prepare(
    `INSERT INTO testimonies (name, location, video_url, story, published, status) VALUES (?,?,?,?,?,?)`
  ).bind(name.trim(), location?.trim() || '', video_url?.trim() || '', story.trim(), published ? 1 : 0, status).run()
  return json({ ok: true, id: r.meta.last_row_id }, 201)
}

// PUT /api/testimonies — admin: update (expects id in body). Also accepts
// a bare { id, status } for quick approve/reject actions on pending items.
export async function onRequestPut({ env, request }) {
  if (!(await adminSession(request, env))) return json({ error: 'Unauthorised' }, 401)
  const body = await request.json().catch(() => ({}))
  const { id, name, location, video_url, story, published, status } = body
  if (!id) return json({ error: 'id required' }, 400)

  // Quick approve/reject: only status (and derived published flag) provided.
  if (status && name === undefined) {
    const pub = status === 'published' ? 1 : 0
    await env.DB.prepare(`UPDATE testimonies SET status=?, published=? WHERE id=?`).bind(status, pub, id).run()
    return json({ ok: true })
  }

  const resolvedStatus = status || (published ? 'published' : 'draft')
  await env.DB.prepare(
    `UPDATE testimonies SET name=?, location=?, video_url=?, story=?, published=?, status=? WHERE id=?`
  ).bind(name?.trim() || '', location?.trim() || '', video_url?.trim() || '', story?.trim() || '', published ? 1 : 0, resolvedStatus, id).run()
  return json({ ok: true })
}

// DELETE /api/testimonies?id=123 — admin
export async function onRequestDelete({ env, request }) {
  if (!(await adminSession(request, env))) return json({ error: 'Unauthorised' }, 401)
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'id required' }, 400)
  await env.DB.prepare(`DELETE FROM testimonies WHERE id = ?`).bind(id).run()
  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  }})
}
