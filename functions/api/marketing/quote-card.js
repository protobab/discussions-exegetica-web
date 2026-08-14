// functions/api/marketing/quote-card.js
//
// Returns (via 302 redirect) today's quote-card image, cycling through
// the 5 uploaded cards by day-of-year so the same card doesn't repeat
// two days running. Used by the daily Facebook auto-post Make scenario:
// Make's HTTP module just downloads whatever this redirects to.

const QUOTE_CARDS = [
  'https://drive.google.com/uc?export=download&id=1vKUxsT8KWWFopXZgWmltwuTWUZQzzJIm',
  'https://drive.google.com/uc?export=download&id=16y0iPGeIeAwm86fENopBrqAnjaYUl1zh',
  'https://drive.google.com/uc?export=download&id=1wI8VELAWdIvMc13I4pKe1AscamrLabX5',
  'https://drive.google.com/uc?export=download&id=1NDDeBsplRa02Pm_u0SgSn3_GoX8K1sCo',
  'https://drive.google.com/uc?export=download&id=1z2TQH9SoN-ITGOMOFcn6ZGoCJ4wJ5Y7c',
]

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start
  return Math.floor(diff / 86400000)
}

export async function onRequestGet() {
  const idx = dayOfYear(new Date()) % QUOTE_CARDS.length
  return Response.redirect(QUOTE_CARDS[idx], 302)
}
