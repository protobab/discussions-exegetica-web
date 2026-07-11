// functions/api/streak.js

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

// GET — return user's streak and "continue where you left off" data
export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ streak: 0, lastThread: null, lastBibleRef: null })

  const user = await env.DB.prepare(
    `SELECT current_streak, longest_streak, last_active_date, last_thread_id, last_bible_ref FROM users WHERE id = ?`
  ).bind(session.user_id).first()

  if (!user) return json({ streak: 0, lastThread: null, lastBibleRef: null })

  // Get last thread title if exists
  let lastThread = null
  if (user.last_thread_id) {
    lastThread = await env.DB.prepare(
      `SELECT id, title FROM threads WHERE id = ?`
    ).bind(user.last_thread_id).first()
  }

  return json({
    streak: user.current_streak || 0,
    longestStreak: user.longest_streak || 0,
    lastThread: lastThread || null,
    lastBibleRef: user.last_bible_ref || null,
  })
}

// POST — record activity and update streak
export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Unauthorised' }, 401)

  const { type, ref } = await request.json().catch(() => ({}))
  const today = new Date().toISOString().split('T')[0]

  const user = await env.DB.prepare(
    `SELECT current_streak, longest_streak, last_active_date, last_thread_id FROM users WHERE id = ?`
  ).bind(session.user_id).first()

  if (!user) return json({ error: 'User not found' }, 404)

  let newStreak = user.current_streak || 0
  const lastDate = user.last_active_date || ''

  if (lastDate === today) {
    // Already active today — no change to streak
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (lastDate === yesterday) {
      newStreak = (user.current_streak || 0) + 1
    } else if (lastDate !== today) {
      newStreak = 1 // streak broken, restart
    }
  }

  const longestStreak = Math.max(user.longest_streak || 0, newStreak)

  // Build update based on activity type
  const updates = { current_streak: newStreak, longest_streak: longestStreak, last_active_date: today }
  if (type === 'thread' && ref) updates.last_thread_id = parseInt(ref)
  if (type === 'bible' && ref) updates.last_bible_ref = ref

  await env.DB.prepare(`
    UPDATE users SET
      current_streak = ?,
      longest_streak = ?,
      last_active_date = ?,
      last_thread_id = COALESCE(?, last_thread_id),
      last_bible_ref = COALESCE(?, last_bible_ref)
    WHERE id = ?
  `).bind(
    updates.current_streak,
    updates.longest_streak,
    updates.last_active_date,
    updates.last_thread_id || null,
    updates.last_bible_ref || null,
    session.user_id
  ).run()

  return json({ streak: newStreak, longestStreak })
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }})
}
