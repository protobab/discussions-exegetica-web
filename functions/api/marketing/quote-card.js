// functions/api/marketing/quote-card.js
//
// Serves today's quote-card image, cycling through the 5 cards in
// public/quote-cards/ by day-of-year so the same card doesn't repeat two
// days running. Used by the daily Facebook auto-post Make scenario.
//
// These are hosted directly as static files in this repo (not fetched from
// Google Drive) — Drive's public "uc?export=download" links unreliably
// serve an HTML "can't scan this file" interstitial to non-browser clients
// like Make/Cloudflare instead of the real image, which broke the original
// version of this endpoint. Serving our own files removes that dependency
// entirely.

const QUOTE_CARDS = [
  '/quote-cards/quote-1.jpg',
  '/quote-cards/quote-2.jpg',
  '/quote-cards/quote-3.jpg',
  '/quote-cards/quote-4.jpg',
  '/quote-cards/quote-5.jpg',
]

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start
  return Math.floor(diff / 86400000)
}

export async function onRequestGet({ request }) {
  const idx = dayOfYear(new Date()) % QUOTE_CARDS.length
  const origin = new URL(request.url).origin
  const upstream = await fetch(`${origin}${QUOTE_CARDS[idx]}`)

  if (!upstream.ok) {
    return new Response(`Quote card asset missing (index ${idx}, status ${upstream.status}).`, { status: 502 })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'no-store',
    },
  })
}
