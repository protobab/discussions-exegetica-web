// functions/api/admin/curate-testimonies.js
//
// Discovers candidate testimony videos from YouTube (public search),
// and stores them as 'pending' rows in the testimonies table — nothing
// goes live on the public Testimonies page until an admin approves it
// via the Admin panel's "Pending Review" queue.
//
// Requires env.YOUTUBE_API_KEY — a free Google Cloud API key with the
// YouTube Data API v3 enabled (10,000 free quota units/day; each search
// call here costs 100 units, so this can safely run several times a day).
// Get one at https://console.cloud.google.com/apis/credentials
//
// Can be triggered two ways:
//   1. Manually, by an admin, from the Admin panel (Bearer session token).
//   2. On a schedule, by any external caller (e.g. a Make.com scenario,
//      or a free cron-ping service) POSTing with header
//      X-Cron-Secret: <CRON_SECRET>  — same pattern as auto-content.js.

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

// Search queries rotated across runs to get a variety of testimony content
// while staying tightly scoped to genuine personal faith testimonies.
const SEARCH_QUERIES = [
  'my testimony God changed my life',
  'salvation testimony Jesus Christ',
  'how I became a Christian testimony',
  'God saved me from addiction testimony',
  'miracle testimony answered prayer',
]

export async function onRequestPost({ env, request }) {
  const cronSecret = request.headers.get('X-Cron-Secret')
  const isValidCron = cronSecret && env.CRON_SECRET && cronSecret === env.CRON_SECRET
  if (!isValidCron) {
    const session = await getSession(request, env)
    if (!session || !session.is_admin) return json({ error: 'Unauthorised' }, 401)
  }

  if (!env.YOUTUBE_API_KEY) {
    return json({ error: 'YOUTUBE_API_KEY is not configured in this project\'s environment variables. Add a free YouTube Data API v3 key in Cloudflare Pages settings to enable discovery.' }, 400)
  }

  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

  let items = []
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=medium&safeSearch=strict&relevanceLanguage=en&maxResults=10&order=relevance&q=${encodeURIComponent(query)}&key=${env.YOUTUBE_API_KEY}`
    const res = await fetch(url)
    const data = await res.json()
    if (!res.ok) return json({ error: data?.error?.message || 'YouTube search failed' }, 502)
    items = data.items || []
  } catch (e) {
    return json({ error: `YouTube search failed: ${e.message}` }, 502)
  }

  let added = 0
  const addedTitles = []
  for (const item of items) {
    const videoId = item?.id?.videoId
    if (!videoId) continue

    const existing = await env.DB.prepare(`SELECT id FROM testimonies WHERE source_video_id = ?`).bind(videoId).first()
    if (existing) continue

    const title = item.snippet?.title || 'Testimony'
    const channel = item.snippet?.channelTitle || 'Unknown channel'
    const description = (item.snippet?.description || '').slice(0, 500)
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    await env.DB.prepare(
      `INSERT INTO testimonies (name, location, video_url, story, published, status, source_video_id, discovered_at, curated)
       VALUES (?, ?, ?, ?, 0, 'pending', ?, datetime('now'), 1)`
    ).bind(
      channel,
      '',
      videoUrl,
      description || title,
      videoId
    ).run()

    added++
    addedTitles.push(title)
  }

  return json({ ok: true, query, found: items.length, added, titles: addedTitles })
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Cron-Secret',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  }})
}
