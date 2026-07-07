// functions/api/admin/content.js
// Admin content management — delete any content from within the app

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

const ADMIN_USERS = ['eki']

// GET — list content for review
export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)

  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'threads'
  const search = url.searchParams.get('q') || ''
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = 20
  const offset = (page - 1) * limit

  try {
    if (type === 'threads') {
      const where = search ? `WHERE t.title LIKE '%${search.replace(/'/g,"''")}%'` : ''
      const { results } = await env.DB.prepare(`
        SELECT t.id, t.title, t.body, t.created_at, t.reply_count, t.view_count,
               u.display_name, u.username, c.label as cat_label
        FROM threads t JOIN users u ON t.author_id = u.id JOIN categories c ON t.category_id = c.id
        ${where} ORDER BY t.created_at DESC LIMIT ${limit} OFFSET ${offset}
      `).all()
      const count = await env.DB.prepare(`SELECT COUNT(*) as n FROM threads ${where}`).first()
      return json({ items: results, total: count?.n || 0, page, type })
    }

    if (type === 'replies') {
      const where = search ? `WHERE r.body LIKE '%${search.replace(/'/g,"''")}%'` : ''
      const { results } = await env.DB.prepare(`
        SELECT r.id, r.body, r.created_at, r.thread_id,
               u.display_name, u.username, t.title as thread_title
        FROM replies r JOIN users u ON r.author_id = u.id JOIN threads t ON r.thread_id = t.id
        ${where} ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}
      `).all()
      return json({ items: results, page, type })
    }

    if (type === 'users') {
      const where = search ? `WHERE username LIKE '%${search.replace(/'/g,"''")}%' OR display_name LIKE '%${search.replace(/'/g,"''")}%'` : ''
      const { results } = await env.DB.prepare(`
        SELECT id, username, display_name, badge, reputation, created_at,
               (SELECT COUNT(*) FROM threads WHERE author_id = users.id) as thread_count,
               (SELECT COUNT(*) FROM replies WHERE author_id = users.id) as reply_count
        FROM users ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `).all()
      return json({ items: results, page, type })
    }

    if (type === 'armchair_posts') {
      const { results } = await env.DB.prepare(`
        SELECT p.id, p.title, p.excerpt, p.created_at, u.display_name
        FROM armchair_posts p JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}
      `).all()
      return json({ items: results, page, type })
    }

    if (type === 'groups') {
      const { results } = await env.DB.prepare(`
        SELECT g.id, g.name, g.member_count, g.post_count, g.created_at, u.display_name
        FROM study_groups g JOIN users u ON g.owner_id = u.id
        ORDER BY g.created_at DESC LIMIT ${limit} OFFSET ${offset}
      `).all()
      return json({ items: results, page, type })
    }

    return json({ error: 'Unknown type' }, 400)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

// DELETE — remove content
export async function onRequestDelete({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)

  const { type, id } = await request.json()
  if (!type || !id) return json({ error: 'type and id required' }, 400)

  try {
    if (type === 'thread') {
      await env.DB.prepare(`DELETE FROM replies WHERE thread_id = ?`).bind(id).run()
      await env.DB.prepare(`DELETE FROM thread_likes WHERE thread_id = ?`).bind(id).run()
      await env.DB.prepare(`DELETE FROM notifications WHERE thread_id = ?`).bind(id).run()
      await env.DB.prepare(`DELETE FROM threads WHERE id = ?`).bind(id).run()
      return json({ ok: true, message: 'Thread and all replies deleted' })
    }

    if (type === 'reply') {
      // Get thread_id first to decrement count
      const reply = await env.DB.prepare(`SELECT thread_id FROM replies WHERE id = ?`).bind(id).first()
      await env.DB.prepare(`DELETE FROM replies WHERE id = ?`).bind(id).run()
      if (reply) await env.DB.prepare(`UPDATE threads SET reply_count = MAX(0, reply_count - 1) WHERE id = ?`).bind(reply.thread_id).run()
      return json({ ok: true, message: 'Reply deleted' })
    }

    if (type === 'user') {
      // Soft approach — don't delete, just anonymise
      await env.DB.prepare(`UPDATE users SET display_name = 'Deleted User', username = 'deleted_${id}', email = 'deleted_${id}@deleted.com', bio = '' WHERE id = ?`).bind(id).run()
      return json({ ok: true, message: 'User account anonymised' })
    }

    if (type === 'armchair_post') {
      await env.DB.prepare(`DELETE FROM armchair_posts WHERE id = ?`).bind(id).run()
      return json({ ok: true, message: 'Blog post deleted' })
    }

    if (type === 'armchair_session') {
      await env.DB.prepare(`DELETE FROM armchair_messages WHERE session_id = ?`).bind(id).run()
      await env.DB.prepare(`DELETE FROM armchair_message_flags WHERE message_id IN (SELECT id FROM armchair_messages WHERE session_id = ?)`).bind(id).run()
      await env.DB.prepare(`DELETE FROM armchair_sessions WHERE id = ?`).bind(id).run()
      return json({ ok: true, message: 'Session and all messages deleted' })
    }

    if (type === 'group') {
      await env.DB.prepare(`DELETE FROM study_group_posts WHERE group_id = ?`).bind(id).run()
      await env.DB.prepare(`DELETE FROM study_group_members WHERE group_id = ?`).bind(id).run()
      await env.DB.prepare(`DELETE FROM study_groups WHERE id = ?`).bind(id).run()
      return json({ ok: true, message: 'Study group deleted' })
    }

    return json({ error: 'Unknown content type' }, 400)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS'
  }})
}
