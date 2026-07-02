// functions/api/armchair/recordings/upload.js
import { getSession, json, ADMIN_USERS } from '../../../_shared.js'

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)

  const url = new URL(request.url)
  const session_id = url.searchParams.get('session_id')
  if (!session_id) return json({ error: 'session_id required' }, 400)

  if (!env.RECORDINGS) return json({ error: 'R2 bucket not configured' }, 503)

  try {
    const blob = await request.arrayBuffer()
    if (!blob || blob.byteLength === 0) return json({ error: 'No audio data received' }, 400)

    const key = `recordings/session-${session_id}-${Date.now()}.webm`
    await env.RECORDINGS.put(key, blob, {
      httpMetadata: { contentType: 'audio/webm' }
    })

    // Update session with recording key and mark ended
    await env.DB.prepare(
      `UPDATE armchair_sessions SET recording_key = ?, status = 'ended' WHERE id = ?`
    ).bind(key, session_id).run()

    return json({ ok: true, key })
  } catch (e) {
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
