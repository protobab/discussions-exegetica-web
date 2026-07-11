// functions/thread/[id].js
export async function onRequestGet({ env, params, request, next }) {
  const ua = request.headers.get('User-Agent') || ''
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|Googlebot|bingbot|SkypeUriPreview|Pinterest|Applebot/i.test(ua)
  if (!isCrawler) return next()
  try {
    const thread = await env.DB.prepare(`SELECT t.title, t.body, c.label as cat FROM threads t JOIN categories c ON t.category_id = c.id WHERE t.id = ?`).bind(params.id).first()
    if (!thread) return next()
    const title = `${thread.title} — Discussions Exegetica`
    const desc = thread.body.slice(0,160).replace(/\n/g,' ') + '…'
    const img = `https://discussionsexegetica.com/api/og-image?title=${encodeURIComponent(thread.title)}&category=${encodeURIComponent(thread.cat)}`
    const pageUrl = `https://discussionsexegetica.com/thread/${params.id}`
    const e = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    return new Response(`<!DOCTYPE html><html><head>
      <title>${e(title)}</title>
      <meta name="description" content="${e(desc)}"/>
      <meta property="og:title" content="${e(title)}"/>
      <meta property="og:description" content="${e(desc)}"/>
      <meta property="og:image" content="${img}"/>
      <meta property="og:url" content="${pageUrl}"/>
      <meta name="twitter:card" content="summary_large_image"/>
      <meta name="twitter:title" content="${e(title)}"/>
      <meta name="twitter:image" content="${img}"/>
      <meta http-equiv="refresh" content="0;url=${pageUrl}"/>
    </head><body></body></html>`, { headers: { 'Content-Type':'text/html; charset=utf-8' }})
  } catch { return next() }
}
