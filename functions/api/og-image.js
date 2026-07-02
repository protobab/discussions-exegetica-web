// functions/api/og-image.js
export async function onRequestGet({ request }) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Discussions Exegetica'
  const category = url.searchParams.get('category') || 'Bible Discussion'
  const t = title.length > 60 ? title.slice(0,59)+'…' : title
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1B2A4A"/><stop offset="100%" stop-color="#2E4270"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="600" cy="170" r="80" fill="none" stroke="#C9A84C" stroke-width="2.5" opacity="0.35"/>
    <circle cx="600" cy="170" r="44" fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.45"/>
    <circle cx="600" cy="170" r="16" fill="#C9A84C"/>
    <text x="600" y="310" font-family="Georgia,serif" font-size="42" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(t)}</text>
    <rect x="500" y="358" width="200" height="34" rx="17" fill="#C9A84C"/>
    <text x="600" y="381" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#1B2A4A" text-anchor="middle">${esc(category.toUpperCase())}</text>
    <text x="600" y="555" font-family="Georgia,serif" font-size="26" font-weight="700" fill="#C9A84C" text-anchor="middle">Discussions Exegetica</text>
    <text x="600" y="585" font-family="Arial,sans-serif" font-size="15" fill="rgba(255,255,255,0.55)" text-anchor="middle">Where Scripture is opened together</text>
  </svg>`
  return new Response(svg, { headers: { 'Content-Type':'image/svg+xml', 'Cache-Control':'public,max-age=86400', 'Access-Control-Allow-Origin':'*' }})
}
