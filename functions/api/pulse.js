// functions/api/pulse.js
// Returns live community stats for the Weekly Pulse banner

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

export async function onRequestGet({ env }) {
  try {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const today = new Date().toISOString()

    const [newMembers, newThreads, newReplies, topThread, totalMembers, totalThreads] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) as n FROM users WHERE created_at >= ?`).bind(weekAgo).first(),
      env.DB.prepare(`SELECT COUNT(*) as n FROM threads WHERE created_at >= ?`).bind(weekAgo).first(),
      env.DB.prepare(`SELECT COUNT(*) as n FROM replies WHERE created_at >= ?`).bind(weekAgo).first(),
      env.DB.prepare(`SELECT id, title, reply_count, like_count FROM threads WHERE created_at >= ? ORDER BY (reply_count + like_count) DESC LIMIT 1`).bind(weekAgo).first(),
      env.DB.prepare(`SELECT COUNT(*) as n FROM users`).first(),
      env.DB.prepare(`SELECT COUNT(*) as n FROM threads`).first(),
    ])

    return json({
      week: {
        newMembers: newMembers?.n || 0,
        newThreads: newThreads?.n || 0,
        newReplies: newReplies?.n || 0,
        topThread: topThread || null,
      },
      total: {
        members: totalMembers?.n || 0,
        threads: totalThreads?.n || 0,
      }
    })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}
