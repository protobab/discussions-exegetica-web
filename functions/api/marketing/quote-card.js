// functions/api/marketing/quote-card.js
//
// Serves today's quote-card image directly (proxied and verified, not just
// redirected), cycling through the 5 uploaded cards by day-of-year so the
// same card doesn't repeat two days running. Used by the daily Facebook
// auto-post Make scenario: Make's HTTP module downloads this URL directly.
//
// We proxy rather than 302-redirect because Google Drive's public
// "uc?export=download" links sometimes serve an HTML "can't scan this file"
// interstitial page instead of the real file to non-browser clients. By
// fetching server-side and checking the content-type ourselves, a bad
// response fails loudly (502) instead of silently posting garbage to
// Facebook.

const QUOTE_CARDS = [
  'https://drive.google.com/uc?export=download&confirm=t&id=1vKUxsT8KWWFopXZgWmltwuTWUZQzzJIm',
  'https://drive.google.com/uc?export=download&confirm=t&id=16y0iPGeIeAwm86fENopBrqAnjaYUl1zh',
  'https://drive.google.com/uc?export=download&confirm=t&id=1wI8VELAWdIvMc13I4pKe1AscamrLabX5',
  'https://drive.google.com/uc?export=download&confirm=t&id=1NDDeBsplRa02Pm_u0SgSn3_GoX8K1sCo',
  'https://drive.google.com/uc?export=download&confirm=t&id=1z2TQH9SoN-ITGOMOFcn6ZGoCJ4wJ5Y7c',
]

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start
  return Math.floor(diff / 86400000)
}

export async function onRequestGet() {
  const idx = dayOfYear(new Date()) % QUOTE_CARDS.length
  const url = QUOTE_CARDS[idx]

  const upstream = await fetch(url, { redirect: 'follow' })
  const contentType = upstream.headers.get('content-type') || ''

  if (!upstream.ok || !contentType.startsWith('image/')) {
    return new Response(
      `Quote card fetch failed or returned non-image content (index ${idx}, status ${upstream.status}, content-type "${contentType}"). Google Drive may be serving its virus-scan interstitial for this file.`,
      { status: 502 }
    )
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    },
  })
}
