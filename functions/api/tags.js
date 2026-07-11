// functions/api/tags.js

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}

// GET — search threads by tag or fuzzy keyword
export async function onRequestGet({ env, request }) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim()
  const tag = url.searchParams.get('tag')?.trim()

  if (!q && !tag) return json({ threads: [] })

  try {
    if (tag) {
      // Exact tag search
      const { results } = await env.DB.prepare(`
        SELECT t.id, t.title, t.body, t.reply_count, t.view_count, t.created_at,
               u.display_name, u.avatar_color, u.badge, c.label as cat_label
        FROM threads t JOIN users u ON t.author_id = u.id JOIN categories c ON t.category_id = c.id
        WHERE t.body LIKE ? OR t.title LIKE ?
        ORDER BY t.created_at DESC LIMIT 30
      `).bind(`%#${tag}%`, `%${tag}%`).all()
      return json({ threads: results, tag })
    }

    if (q) {
      // Fuzzy search — match title, body, or extract hashtags
      const terms = q.split(/\s+/).filter(Boolean).slice(0, 5)
      const conditions = terms.map(() => `(t.title LIKE ? OR t.body LIKE ?)`).join(' OR ')
      const binds = terms.flatMap(term => [`%${term}%`, `%${term}%`])
      const { results } = await env.DB.prepare(`
        SELECT t.id, t.title, t.body, t.reply_count, t.view_count, t.created_at, t.like_count,
               u.display_name, u.avatar_color, u.badge, c.label as cat_label, c.slug as cat_slug
        FROM threads t JOIN users u ON t.author_id = u.id JOIN categories c ON t.category_id = c.id
        WHERE ${conditions}
        ORDER BY (t.reply_count + t.like_count) DESC LIMIT 30
      `).bind(...binds).all()
      return json({ threads: results, query: q })
    }
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

// GET popular tags — extract hashtags from recent thread bodies
export async function onRequestGet2({ env }) {
  const { results } = await env.DB.prepare(`SELECT body FROM threads ORDER BY created_at DESC LIMIT 100`).all()
  const tagCounts = {}
  for (const row of results) {
    const tags = (row.body || '').match(/#[a-zA-Z][a-zA-Z0-9_]*/g) || []
    tags.forEach(t => { tagCounts[t.toLowerCase()] = (tagCounts[t.toLowerCase()] || 0) + 1 })
  }
  const sorted = Object.entries(tagCounts).sort((a,b) => b[1]-a[1]).slice(0, 20).map(([tag, count]) => ({ tag, count }))
  return json({ tags: sorted })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } })
}
