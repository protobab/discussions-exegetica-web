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

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !(session.is_admin || session.is_moderator)) {
    return json({ error: 'Unauthorised' }, 401)
  }

  const url = new URL(request.url)
  const session_id = url.searchParams.get('session_id')
  if (!session_id) return json({ error: 'session_id required' }, 400)

  // Check R2 binding exists — if this fires, the RECORDINGS binding isn't attached
  // to this environment in the Cloudflare Pages dashboard (Settings → Functions → R2 bucket bindings).
  if (!env.RECORDINGS) {
    await env.DB.prepare(`UPDATE armchair_sessions SET status = 'ended' WHERE id = ?`).bind(session_id).run()
    return json({ error: 'Recording storage (R2) is not connected to this environment. Check Settings → Functions → R2 bucket bindings in the Cloudflare Pages dashboard — the recording was not saved, but your local download should still be available.' }, 503)
  }

  try {
    const audioData = await request.arrayBuffer()
    if (!audioData || audioData.byteLength === 0) {
      await env.DB.prepare(`UPDATE armchair_sessions SET status = 'ended' WHERE id = ?`).bind(session_id).run()
      return json({ error: 'No audio data received' }, 400)
    }

    // Store the DB key WITHOUT the "recordings/" prefix — the prefix is added only
    // when writing to R2 below. This means the frontend and the playback endpoint
    // never need to add/strip prefixes themselves, removing an entire class of
    // key-mismatch bugs.
    const bareKey = `session-${session_id}-${Date.now()}.webm`
    const r2Key = `recordings/${bareKey}`

    await env.RECORDINGS.put(r2Key, audioData, {
      httpMetadata: { contentType: 'audio/webm' },
      customMetadata: { session_id: String(session_id) }
    })

    await env.DB.prepare(
      `UPDATE armchair_sessions SET recording_key = ?, status = 'ended' WHERE id = ?`
    ).bind(bareKey, session_id).run()

    return json({ ok: true, key: bareKey })
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
