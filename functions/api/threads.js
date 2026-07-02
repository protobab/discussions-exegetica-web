// functions/api/threads.js
import { getSession, json } from '../_shared.js'

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = 20
  let q = `SELECT t.id, t.title, t.body, t.is_pinned, t.view_count, t.reply_count, t.like_count, t.created_at,
             u.username, u.display_name, u.avatar_color, u.badge,
             c.slug as cat_slug, c.label as cat_label
           FROM threads t JOIN users u ON t.author_id = u.id JOIN categories c ON t.category_id = c.id`
  const p = []
  if (category && category !== 'all') { q += ` WHERE c.slug = ?`; p.push(category) }
  q += ` ORDER BY t.is_pinned DESC, t.updated_at DESC LIMIT ${limit} OFFSET ${(page-1)*limit}`
  const { results } = await env.DB.prepare(q).bind(...p).all()
  return json({ threads: results, page })
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to post' }, 401)
  const { title, body, category_slug } = await request.json()
  if (!title?.trim() || !body?.trim() || !category_slug) return json({ error: 'Missing fields' }, 400)
  const cat = await env.DB.prepare(`SELECT id FROM categories WHERE slug = ?`).bind(category_slug).first()
  if (!cat) return json({ error: 'Invalid category' }, 400)
  const r = await env.DB.prepare(`INSERT INTO threads (category_id, author_id, title, body) VALUES (?,?,?,?)`).bind(cat.id, session.user_id, title.trim(), body.trim()).run()
  await env.DB.prepare(`UPDATE users SET reputation = reputation + 5 WHERE id = ?`).bind(session.user_id).run()
  return json({ id: r.meta.last_row_id }, 201)
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}
