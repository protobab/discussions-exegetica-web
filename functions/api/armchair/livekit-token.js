// functions/api/armchair/livekit-token.js
// Generates a LiveKit access token for joining an Armchair session room

// ── Shared helpers (inlined — Cloudflare Pages doesn't support relative imports) ──
async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

async function hashPassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = [...salt].map(b => b.toString(16).padStart(2,'0')).join('')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations:100000, hash:'SHA-256' }, key, 256)
  return saltHex + ':' + [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('')
}

async function verifyPassword(pw, stored) {
  const [saltHex, h] = stored.split(':')
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b=>parseInt(b,16)))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations:100000, hash:'SHA-256' }, key, 256)
  return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('') === h
}

async function makeToken() {
  return [...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('')
}

const ADMIN_USERS = ['eki']

// Uses LiveKit's JWT format — no external SDK needed, pure Web Crypto


export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  const url = new URL(request.url)
  const session_id = url.searchParams.get('session_id')

  if (!session_id) return json({ error: 'session_id required' }, 400)
  if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
    return json({ error: 'LiveKit not configured' }, 503)
  }

  // Determine identity and permissions
  const isHost = session && ADMIN_USERS.includes(session.username)
  const identity = session
    ? (isHost ? `host-${session.username}` : `listener-${session.user_id}-${Date.now()}`)
    : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const roomName = `armchair-${session_id}`

  try {
    const token = await generateLiveKitToken({
      apiKey: env.LIVEKIT_API_KEY,
      apiSecret: env.LIVEKIT_API_SECRET,
      identity,
      roomName,
      canPublish: isHost,       // only host can publish audio
      canSubscribe: true,       // everyone can listen
      canPublishData: true,     // everyone can send chat
      ttl: 4 * 60 * 60,        // 4 hour token validity
    })

    return json({
      token,
      roomName,
      wsUrl: env.LIVEKIT_WS_URL || 'wss://your-project.livekit.cloud',
      identity,
      isHost
    })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }})
}

// ── LiveKit JWT token generator (pure Web Crypto, no npm) ────

async function generateLiveKitToken({ apiKey, apiSecret, identity, roomName, canPublish, canSubscribe, canPublishData, ttl }) {
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    iss: apiKey,
    sub: identity,
    iat: now,
    exp: now + ttl,
    nbf: now,
    video: {
      room: roomName,
      roomJoin: true,
      canPublish,
      canSubscribe,
      canPublishData,
    }
  }

  const enc = new TextEncoder()
  const b64url = v => btoa(String.fromCharCode(...new Uint8Array(v)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const headerB64  = b64url(enc.encode(JSON.stringify(header)))
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)))
  const signingInput = `${headerB64}.${payloadB64}`

  const key = await crypto.subtle.importKey(
    'raw', enc.encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput))
  const sigB64 = b64url(sig)

  return `${signingInput}.${sigB64}`
}
