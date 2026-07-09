// functions/api/invite.js

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

// GET — get or create invite code for logged-in user
export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in to get your invite link' }, 401)

  // Check if user already has an invite code
  const existing = await env.SESSIONS.get(`invite_code:${session.user_id}`)
  if (existing) {
    const uses = await env.SESSIONS.get(`invite_uses:${session.user_id}`) || '0'
    return json({ code: existing, uses: parseInt(uses), url: `https://discussionsexegetica.com/join/${existing}` })
  }

  // Generate a new invite code
  const code = session.username.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' +
    [...crypto.getRandomValues(new Uint8Array(3))].map(b => b.toString(16).padStart(2,'0')).join('')

  await env.SESSIONS.put(`invite_code:${session.user_id}`, code, { expirationTtl: 60 * 60 * 24 * 365 })
  await env.SESSIONS.put(`invite_owner:${code}`, String(session.user_id), { expirationTtl: 60 * 60 * 24 * 365 })

  return json({ code, uses: 0, url: `https://discussionsexegetica.com/join/${code}` })
}

// POST — record that someone used an invite code (called on registration)
export async function onRequestPost({ env, request }) {
  const { code, new_user_id } = await request.json().catch(() => ({}))
  if (!code || !new_user_id) return json({ error: 'code and new_user_id required' }, 400)

  const ownerId = await env.SESSIONS.get(`invite_owner:${code}`)
  if (!ownerId) return json({ ok: false, message: 'Invalid invite code' })

  // Increment use count
  const uses = parseInt(await env.SESSIONS.get(`invite_uses:${ownerId}`) || '0') + 1
  await env.SESSIONS.put(`invite_uses:${ownerId}`, String(uses), { expirationTtl: 60 * 60 * 24 * 365 })

  // Reward inviter with reputation points
  await env.DB.prepare(`UPDATE users SET reputation = reputation + 20 WHERE id = ?`).bind(parseInt(ownerId)).run()

  // Record on new user which invite they used
  await env.DB.prepare(`UPDATE users SET bio = CASE WHEN bio = '' THEN ? ELSE bio END WHERE id = ?`)
    .bind(`invited_by:${ownerId}`, new_user_id).run()

  return json({ ok: true, inviterId: ownerId })
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }})
}
