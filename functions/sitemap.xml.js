// functions/sitemap.xml.js
// Dynamically generates a sitemap including every thread and group

export async function onRequestGet({ env }) {
  const base = 'https://discussionsexegetica.com'

  const staticPages = [
    { loc: '/', priority: '1.0' },
    { loc: '/forum', priority: '0.9' },
    { loc: '/groups', priority: '0.8' },
    { loc: '/daily-word', priority: '0.8' },
    { loc: '/register', priority: '0.6' },
    { loc: '/login', priority: '0.5' },
  ]

  let threadUrls = []
  let groupUrls = []

  try {
    const { results: threads } = await env.DB.prepare(
      `SELECT id, updated_at FROM threads ORDER BY updated_at DESC LIMIT 5000`
    ).all()
    threadUrls = threads.map(t => ({
      loc: `/thread/${t.id}`,
      lastmod: t.updated_at?.split(' ')[0],
      priority: '0.7'
    }))

    const { results: groups } = await env.DB.prepare(
      `SELECT id, created_at FROM study_groups ORDER BY created_at DESC LIMIT 1000`
    ).all()
    groupUrls = groups.map(g => ({
      loc: `/groups/${g.id}`,
      lastmod: g.created_at?.split(' ')[0],
      priority: '0.6'
    }))
  } catch (e) {
    // If DB query fails, just serve static pages
  }

  const allUrls = [...staticPages, ...threadUrls, ...groupUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${base}${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
