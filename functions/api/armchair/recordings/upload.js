// functions/api/armchair/recordings/upload.js
// Accepts a binary audio file (webm/mp3) and stores it in R2
import { getSession, json, ADMIN_USERS } from '../../../_shared.js'

export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)

  const url = new URL(request.url)
  const session_id = url.searchParams.get('session_id')
  if (!session_id) return json({ error: 'session_id required' }, 400)

  try {
    const blob = await request.arrayBuffer()
    const key = `recordings/session-${session_id}-${Date.now()}.webm`
    await env.RECORDINGS.put(key, blob, { httpMetadata: { contentType: 'audio/webm' } })
    // Store recording key on the session
    await env.DB.prepare(`UPDATE armchair_sessions SET recording_key = ?, status = 'ended' WHERE id = ?`).bind(key, session_id).run()
    return json({ ok: true, key })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' }})
}
