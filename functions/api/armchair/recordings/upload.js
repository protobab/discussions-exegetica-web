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

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !(session.is_admin || session.is_moderator)) {
    return json({ error: 'Unauthorised' }, 401)
  }

  const url = new URL(request.url)
  const session_id = url.searchParams.get('session_id')
  if (!session_id) return json({ error: 'session_id required' }, 400)

  // format=mp4 is a second, WebKit-compatible upload of the SAME recording,
  // sent after the primary webm upload. Everything else defaults to webm
  // to preserve existing behaviour exactly.
  const format = url.searchParams.get('format') === 'mp4' ? 'mp4' : 'webm'

  if (!env.RECORDINGS) {
    if (format === 'webm') {
      await env.DB.prepare(`UPDATE armchair_sessions SET status = 'ended' WHERE id = ?`).bind(session_id).run()
    }
    return json({ error: 'Recording storage (R2) is not connected to this environment. Check Settings → Functions → R2 bucket bindings in the Cloudflare Pages dashboard — the recording was not saved, but your local download should still be available.' }, 503)
  }

  try {
    const audioData = await request.arrayBuffer()
    if (!audioData || audioData.byteLength === 0) {
      if (format === 'webm') {
        await env.DB.prepare(`UPDATE armchair_sessions SET status = 'ended' WHERE id = ?`).bind(session_id).run()
      }
      return json({ error: 'No audio data received' }, 400)
    }

    // Bare DB key has no "recordings/" prefix — the prefix is added only
    // when writing to R2, so the frontend and playback endpoint never need
    // to add/strip prefixes themselves.
    const ext = format === 'mp4' ? 'm4a' : 'webm'
    const contentType = format === 'mp4' ? 'audio/mp4' : 'audio/webm'
    const bareKey = `session-${session_id}-${Date.now()}.${ext}`
    const r2Key = `recordings/${bareKey}`

    await env.RECORDINGS.put(r2Key, audioData, {
      httpMetadata: { contentType },
      customMetadata: { session_id: String(session_id), format }
    })

    if (format === 'mp4') {
      // Secondary format — store in its own column, don't touch status
      // (the primary webm upload already handles session lifecycle).
      await env.DB.prepare(
        `UPDATE armchair_sessions SET recording_key_mp4 = ? WHERE id = ?`
      ).bind(bareKey, session_id).run()
    } else {
      await env.DB.prepare(
        `UPDATE armchair_sessions SET recording_key = ?, status = 'ended' WHERE id = ?`
      ).bind(bareKey, session_id).run()
    }

    return json({ ok: true, key: bareKey, format })
  } catch (e) {
    if (format === 'webm') {
      try {
        await env.DB.prepare(`UPDATE armchair_sessions SET status = 'ended' WHERE id = ?`).bind(session_id).run()
      } catch {}
    }
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
