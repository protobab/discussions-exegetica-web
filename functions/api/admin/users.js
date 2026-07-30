// functions/api/admin/users.js

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

// GET — list users with search and pagination
export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !session.is_admin) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const search = url.searchParams.get('search') || ''
  const limit = 20
  const offset = (page - 1) * limit

  try {
    let users
    if (search) {
      const { results } = await env.DB.prepare(`
        SELECT u.id, u.username, u.display_name, u.email, u.avatar_color,
               u.badge, u.created_at, u.status, u.is_admin, u.is_moderator,
               COUNT(t.id) as post_count
        FROM users u
        LEFT JOIN threads t ON t.author_id = u.id
        WHERE u.username LIKE ? OR u.display_name LIKE ? OR u.email LIKE ?
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `).bind(`%${search}%`, `%${search}%`, `%${search}%`, limit, offset).all()
      users = results
    } else {
      const { results } = await env.DB.prepare(`
        SELECT u.id, u.username, u.display_name, u.email, u.avatar_color,
               u.badge, u.created_at, u.status, u.is_admin, u.is_moderator,
               COUNT(t.id) as post_count
        FROM users u
        LEFT JOIN threads t ON t.author_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `).bind(limit, offset).all()
      users = results
    }
    return json({ users })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

// POST — suspend, unsuspend, delete, set badge, set admin, set moderator
export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !session.is_admin) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { user_id, action, badge, value } = await request.json()
  if (!user_id || !action) return json({ error: 'Missing fields' }, 400)

  try {
    if (action === 'suspend') {
      await env.DB.prepare(`UPDATE users SET status = 'suspended' WHERE id = ?`).bind(user_id).run()
      return json({ ok: true })
    }
    if (action === 'unsuspend') {
      await env.DB.prepare(`UPDATE users SET status = 'active' WHERE id = ?`).bind(user_id).run()
      return json({ ok: true })
    }
    if (action === 'delete') {
      // Anonymise rather than hard delete to preserve thread integrity
      await env.DB.prepare(`
        UPDATE users SET
          username = 'deleted_' || id,
          display_name = 'Deleted User',
          email = 'deleted_' || id || '@deleted.invalid',
          status = 'deleted',
          password_hash = ''
        WHERE id = ?
      `).bind(user_id).run()
      return json({ ok: true })
    }
    if (action === 'set_badge') {
      await env.DB.prepare(`UPDATE users SET badge = ? WHERE id = ?`).bind(badge || null, user_id).run()
      return json({ ok: true })
    }
    if (action === 'set_admin') {
      // Safety: don't let an admin remove their own admin status (avoids accidental lockout)
      if (Number(user_id) === Number(session.user_id) && !value) {
        return json({ error: "You can't remove your own admin status." }, 400)
      }
      await env.DB.prepare(`UPDATE users SET is_admin = ? WHERE id = ?`).bind(value ? 1 : 0, user_id).run()
      return json({ ok: true })
    }
    if (action === 'set_moderator') {
      await env.DB.prepare(`UPDATE users SET is_moderator = ? WHERE id = ?`).bind(value ? 1 : 0, user_id).run()
      return json({ ok: true })
    }
    return json({ error: 'Unknown action' }, 400)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
