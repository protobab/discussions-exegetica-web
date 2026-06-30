// functions/thread/[id].js
// Intercepts /thread/:id requests from social media crawlers and bots
// to inject proper Open Graph meta tags, then serves the normal React app

export async function onRequestGet({ env, params, request, next }) {
  const userAgent = request.headers.get('User-Agent') || ''
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|Googlebot|bingbot|SkypeUriPreview|vkShare|W3C_Validator|redditbot|Pinterest|Applebot/i.test(userAgent)

  // For regular users, just serve the normal React app
  if (!isCrawler) return next()

  // For social media crawlers and search bots, serve pre-rendered meta tags
  try {
    const thread = await env.DB.prepare(`
      SELECT t.title, t.body, c.label as category_label
      FROM threads t JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).bind(params.id).first()

    if (!thread) return next()

    const title = `${thread.title} — Discussions Exegetica`
    const description = thread.body.slice(0, 160).replace(/\n/g, ' ') + '…'
    const ogImage = `https://discussionsexegetica.com/api/og-image?title=${encodeURIComponent(thread.title)}&category=${encodeURIComponent(thread.category_label)}`
    const pageUrl = `https://discussionsexegetica.com/thread/${params.id}`

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:site_name" content="Discussions Exegetica" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <meta http-equiv="refresh" content="0; url=${pageUrl}" />
</head>
<body>
  <p>${escapeHtml(thread.title)}</p>
</body>
</html>`

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch (err) {
    return next()
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
