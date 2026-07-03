// functions/api/armchair/recordings/upload.js
import { getSession, json, ADMIN_USERS } from '../../../_shared.js'

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
