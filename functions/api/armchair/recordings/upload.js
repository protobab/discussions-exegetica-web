// functions/api/armchair/recordings/upload.js


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

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) {
    return json({ error: 'Unauthorised' }, 401)
  }

  const url = new URL(request.url)
  const session_id = url.searchParams.get('session_id')
  if (!session_id) return json({ error: 'session_id required' }, 400)

  // Check R2 binding exists
  if (!env.RECORDINGS) {
    // R2 not available — just mark session ended and return error
    await env.DB.prepare(`UPDATE armchair_sessions SET status = 'ended' WHERE id = ?`).bind(session_id).run()
    return json({ error: 'R2 storage not configured — recording not saved to site, but your local download should be available.' }, 503)
  }

  try {
    const audioData = await request.arrayBuffer()
    if (!audioData || audioData.byteLength === 0) {
      await env.DB.prepare(`UPDATE armchair_sessions SET status = 'ended' WHERE id = ?`).bind(session_id).run()
      return json({ error: 'No audio data received' }, 400)
    }

    const key = `recordings/session-${session_id}-${Date.now()}.webm`

    await env.RECORDINGS.put(key, audioData, {
      httpMetadata: { contentType: 'audio/webm' },
      customMetadata: { session_id: String(session_id) }
    })

    await env.DB.prepare(
      `UPDATE armchair_sessions SET recording_key = ?, status = 'ended' WHERE id = ?`
    ).bind(key, session_id).run()

    return json({ ok: true, key })
  } catch (e) {
    // Still mark ended even if R2 fails
    try {
      await env.DB.prepare(`UPDATE armchair_sessions SET status = 'ended' WHERE id = ?`).bind(session_id).run()
    } catch {}
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }})
}
