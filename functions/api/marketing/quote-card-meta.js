// functions/api/marketing/quote-card-meta.js
//
// JSON companion to quote-card.js — returns today's image URL and a
// rotating caption promoting "The Riches of Christ", in one clean response
// Make's "Make a request" module can parse natively. (Raw HTTP headers
// aren't reliable for non-ASCII text like emoji/em-dashes, so caption data
// travels as JSON instead of a response header.)

const QUOTE_CARDS = [
  '/quote-cards/quote-1.jpg',
  '/quote-cards/quote-2.jpg',
  '/quote-cards/quote-3.jpg',
  '/quote-cards/quote-4.jpg',
  '/quote-cards/quote-5.jpg',
]

const RICHES_URL = 'https://discussionsexegetica.com/riches-of-christ'

const CAPTIONS = [
  `📖 "For it is by grace you have been saved, through faith." (Ephesians 2:8) — this is just one of 281 promises from Scripture, free to read, download, or hear read aloud in The Riches of Christ → ${RICHES_URL} 💎`,
  `📖 "If you declare with your mouth, 'Jesus is Lord'... you will be saved." (Romans 10:9) — discover 281 more promises like this one, organised by theme, in The Riches of Christ → ${RICHES_URL} 💎`,
  `📖 Every promise God has made you — organised, cross-referenced, and free. Explore all 281 passages in The Riches of Christ → ${RICHES_URL} 💎`,
  `📖 "For God so loved the world..." (John 3:16) One of 281 promises collected in The Riches of Christ — read online, download the book, or have it read aloud to you → ${RICHES_URL} 💎`,
  `📖 "In the beginning was the Word..." (John 1:1) Go deeper into Scripture's promises with The Riches of Christ — a free, categorised guide to what God has said He'll do → ${RICHES_URL} 💎`,
]

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start
  return Math.floor(diff / 86400000)
}

export async function onRequestGet({ request }) {
  const idx = dayOfYear(new Date()) % QUOTE_CARDS.length
  const origin = new URL(request.url).origin
  return new Response(JSON.stringify({
    image_url: `${origin}${QUOTE_CARDS[idx]}`,
    caption: CAPTIONS[idx],
    index: idx,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
