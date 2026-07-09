// functions/api/profile/[username].js

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

export async function onRequestGet({ env, params, request }) {
  const username = params.username?.toLowerCase()
  if (!username) return json({ error: 'Username required' }, 400)

  const user = await env.DB.prepare(`
    SELECT id, username, display_name, bio, avatar_color, badge, reputation,
           current_streak, longest_streak, created_at
    FROM users WHERE username = ?
  `).bind(username).first()

  if (!user) return json({ error: 'User not found' }, 404)

  // Get their threads
  const { results: threads } = await env.DB.prepare(`
    SELECT t.id, t.title, t.reply_count, t.like_count, t.view_count, t.created_at,
           c.label as cat_label, c.slug as cat_slug
    FROM threads t JOIN categories c ON t.category_id = c.id
    WHERE t.author_id = ? ORDER BY t.created_at DESC LIMIT 10
  `).bind(user.id).all()

  // Get reply count
  const replyCount = await env.DB.prepare(`SELECT COUNT(*) as n FROM replies WHERE author_id = ?`).bind(user.id).first()

  // Check if viewing own profile
  const session = await getSession(request, env)
  const isOwn = session?.user_id === user.id

  return json({
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      bio: user.bio || '',
      avatar_color: user.avatar_color,
      badge: user.badge,
      reputation: user.reputation,
      current_streak: user.current_streak || 0,
      longest_streak: user.longest_streak || 0,
      joined: user.created_at,
      reply_count: replyCount?.n || 0,
      thread_count: threads.length,
    },
    threads,
    isOwn
  })
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }})
}
