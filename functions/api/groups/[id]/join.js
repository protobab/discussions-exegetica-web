// functions/api/groups/[id]/join.js
import { getSession, json } from '../../../_shared.js'
export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in' }, 401)
  const existing = await env.DB.prepare(`SELECT 1 FROM study_group_members WHERE group_id = ? AND user_id = ?`).bind(params.id, session.user_id).first()
  if (existing) return json({ error: 'Already a member' }, 400)
  await env.DB.prepare(`INSERT INTO study_group_members (group_id, user_id) VALUES (?,?)`).bind(params.id, session.user_id).run()
  await env.DB.prepare(`UPDATE study_groups SET member_count = member_count + 1 WHERE id = ?`).bind(params.id).run()
  return json({ ok: true })
}
export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' }})
}
