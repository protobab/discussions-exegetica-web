// functions/api/armchair/feed.js
// Returns the combined hub feed: next/live session + recent posts

export async function onRequestGet({ env }) {
  const now = new Date().toISOString()

  // Next or currently live session
  const liveOrNext = await env.DB.prepare(`
    SELECT s.*, u.display_name as host_name, u.avatar_color as host_avatar_color
    FROM armchair_sessions s JOIN users u ON s.host_id = u.id
    WHERE s.status = 'live'
    ORDER BY s.scheduled_at ASC LIMIT 1
  `).first() || await env.DB.prepare(`
    SELECT s.*, u.display_name as host_name, u.avatar_color as host_avatar_color
    FROM armchair_sessions s JOIN users u ON s.host_id = u.id
    WHERE s.status = 'scheduled' AND s.scheduled_at >= ?
    ORDER BY s.scheduled_at ASC LIMIT 1
  `).bind(now).first()

  // Past recorded sessions
  const { results: pastSessions } = await env.DB.prepare(`
    SELECT s.id, s.title, s.guest_name, s.cover_image, s.scheduled_at, s.recording_url, s.listener_count
    FROM armchair_sessions s
    WHERE s.status = 'ended'
    ORDER BY s.scheduled_at DESC LIMIT 6
  `).all()

  // Recent blog posts
  const { results: posts } = await env.DB.prepare(`
    SELECT p.id, p.title, p.excerpt, p.body, p.cover_image, p.view_count, p.created_at,
           u.display_name as author_name, u.avatar_color as author_avatar_color
    FROM armchair_posts p JOIN users u ON p.author_id = u.id
    WHERE p.published = 1
    ORDER BY p.created_at DESC LIMIT 12
  `).all()

  return json({ featured: liveOrNext || null, pastSessions, posts })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' }
  })
}
