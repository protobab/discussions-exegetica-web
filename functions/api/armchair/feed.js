// functions/api/armchair/feed.js
import { json } from '../../_shared.js'

export async function onRequestGet({ env }) {
  const now = new Date().toISOString()
  const live = await env.DB.prepare(`SELECT s.*, u.display_name as host_name FROM armchair_sessions s JOIN users u ON s.host_id = u.id WHERE s.status = 'live' ORDER BY s.scheduled_at ASC LIMIT 1`).first()
  const next = live || await env.DB.prepare(`SELECT s.*, u.display_name as host_name FROM armchair_sessions s JOIN users u ON s.host_id = u.id WHERE s.status = 'scheduled' AND s.scheduled_at >= ? ORDER BY s.scheduled_at ASC LIMIT 1`).bind(now).first()  const { results: past } = await env.DB.prepare(`SELECT id, title, guest_name, cover_image, scheduled_at, recording_url, listener_count FROM armchair_sessions WHERE status = 'ended' ORDER BY scheduled_at DESC LIMIT 6`).all()
  const { results: posts } = await env.DB.prepare(`SELECT p.id, p.title, p.excerpt, p.body, p.cover_image, p.view_count, p.created_at, u.display_name as author_name, u.avatar_color FROM armchair_posts p JOIN users u ON p.author_id = u.id WHERE p.published = 1 ORDER BY p.created_at DESC LIMIT 12`).all()
  return json({ featured: next || null, pastSessions: past, posts })
}
