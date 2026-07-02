// functions/api/armchair/messages/[id]/flag.js
import { getSession, json } from '../../../../_shared.js'

export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Sign in to report' }, 401)
  const existing = await env.DB.prepare(`SELECT 1 FROM armchair_message_flags WHERE message_id = ? AND user_id = ?`).bind(params.id, session.user_id).first()
  if (existing) return json({ error: 'Already reported' }, 400)
  await env.DB.prepare(`INSERT INTO armchair_message_flags (message_id, user_id) VALUES (?,?)`).bind(params.id, session.user_id).run()
  const updated = await env.DB.prepare(`UPDATE armchair_messages SET flag_count = flag_count + 1 WHERE id = ? RETURNING flag_count`).bind(params.id).first()
  if (updated?.flag_count >= 3) await env.DB.prepare(`UPDATE armchair_messages SET is_hidden = 1 WHERE id = ?`).bind(params.id).run()
  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' }})
}
