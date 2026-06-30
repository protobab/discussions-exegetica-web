// functions/api/og-image.js
// Generates a simple branded social-share image for a given thread title

export async function onRequestGet({ request }) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Discussions Exegetica'
  const category = url.searchParams.get('category') || 'Bible Discussion'

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1B2A4A"/>
          <stop offset="100%" stop-color="#2E4270"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <circle cx="600" cy="180" r="90" fill="none" stroke="#C9A84C" stroke-width="3" opacity="0.4"/>
      <circle cx="600" cy="180" r="50" fill="none" stroke="#C9A84C" stroke-width="2" stroke-dasharray="4 3" opacity="0.5"/>
      <circle cx="600" cy="180" r="18" fill="#C9A84C"/>
      <text x="600" y="320" font-family="Georgia, serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle">
        ${escapeXml(truncate(title, 60))}
      </text>
      <rect x="490" y="370" width="220" height="36" rx="18" fill="#C9A84C"/>
      <text x="600" y="394" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#1B2A4A" text-anchor="middle">
        ${escapeXml(category.toUpperCase())}
      </text>
      <text x="600" y="560" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#C9A84C" text-anchor="middle">
        Discussions Exegetica
      </text>
      <text x="600" y="592" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.6)" text-anchor="middle">
        Where Scripture is opened together
      </text>
    </svg>
  `.trim()

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

function escapeXml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
