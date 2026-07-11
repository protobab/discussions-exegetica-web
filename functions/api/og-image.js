// functions/api/og-image.js
export async function onRequestGet({ request }) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Discussions Exegetica'
  const category = url.searchParams.get('category') || 'Bible Discussion'
  const t = title.length > 55 ? title.slice(0,54)+'…' : title
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1B2A4A"/>
        <stop offset="100%" stop-color="#2E4270"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <!-- Rings -->
    <circle cx="600" cy="185" r="95" fill="none" stroke="#C9A84C" stroke-width="1.8" opacity="0.35"/>
    <circle cx="600" cy="185" r="62" fill="none" stroke="#C9A84C" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.45"/>
    <!-- Dove descending into rings -->
    <g transform="translate(600,148) rotate(15) scale(3.2)">
      <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#C9A84C"/>
      <circle cx="4.5" cy="-2" r="2.8" fill="#C9A84C"/>
      <path d="M7 -2.3 L9.5 -1.5 L7 -1" fill="#C9A84C"/>
      <circle cx="5.5" cy="-2.2" r="0.7" fill="#1B2A4A"/>
      <path d="M-2 -1 Q-11 -9 -13 -3 Q-9 1 -2 1Z" fill="#E8C97A" opacity="0.9"/>
      <path d="M2 -2 Q9 -10 13 -6 Q10 -1 3 0Z" fill="#E8C97A" opacity="0.9"/>
      <path d="M-5 2 Q-7 6 -9 5 Q-7 8 -5 6 Q-3 4 -4 3Z" fill="#C9A84C" opacity="0.75"/>
    </g>
    <!-- Light rays -->
    <line x1="600" y1="68" x2="600" y2="88" stroke="#C9A84C" stroke-width="1.5" opacity="0.3" stroke-dasharray="3 3"/>
    <line x1="585" y1="72" x2="592" y2="88" stroke="#C9A84C" stroke-width="1" opacity="0.2"/>
    <line x1="615" y1="72" x2="608" y2="88" stroke="#C9A84C" stroke-width="1" opacity="0.2"/>
    <!-- Centre dot -->
    <circle cx="600" cy="185" r="5" fill="#C9A84C" opacity="0.5"/>
    <!-- Title -->
    <text x="600" y="310" font-family="Georgia,serif" font-size="40" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(t)}</text>
    <!-- Category pill -->
    <rect x="475" y="345" width="250" height="38" rx="19" fill="#C9A84C"/>
    <text x="600" y="370" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#1B2A4A" text-anchor="middle">${esc(category.toUpperCase())}</text>
    <!-- Site name -->
    <text x="600" y="560" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#C9A84C" text-anchor="middle">Discussions Exegetica</text>
    <text x="600" y="592" font-family="Arial,sans-serif" font-size="15" fill="rgba(255,255,255,0.5)" text-anchor="middle">Where Scripture is opened together</text>
  </svg>`
  return new Response(svg, { headers: { 'Content-Type':'image/svg+xml', 'Cache-Control':'public,max-age=86400', 'Access-Control-Allow-Origin':'*' }})
}
