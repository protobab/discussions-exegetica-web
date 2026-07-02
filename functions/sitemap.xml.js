// functions/sitemap.xml.js
export async function onRequestGet({ env }) {
  const base = 'https://discussionsexegetica.com'
  const statics = ['/', '/forum', '/groups', '/armchair', '/daily-word', '/register']
  let threadUrls = [], groupUrls = []
  try {
    const { results: threads } = await env.DB.prepare(`SELECT id, updated_at FROM threads ORDER BY updated_at DESC LIMIT 5000`).all()
    threadUrls = threads.map(t => `  <url><loc>${base}/thread/${t.id}</loc><lastmod>${t.updated_at?.split(' ')[0]||''}</lastmod><priority>0.7</priority></url>`)
    const { results: groups } = await env.DB.prepare(`SELECT id, created_at FROM study_groups ORDER BY created_at DESC LIMIT 1000`).all()
    groupUrls = groups.map(g => `  <url><loc>${base}/groups/${g.id}</loc><priority>0.6</priority></url>`)
  } catch {}
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${statics.map(s=>`  <url><loc>${base}${s}</loc><priority>0.9</priority></url>`).join('\n')}
${threadUrls.join('\n')}
${groupUrls.join('\n')}
</urlset>`
  return new Response(xml, { headers: { 'Content-Type':'application/xml', 'Cache-Control':'public,max-age=3600' }})
}
