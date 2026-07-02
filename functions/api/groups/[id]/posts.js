// functions/api/groups/[id]/posts.js
import { getSession, json } from '../../../_shared.js'
export async function onRequestPost({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Please sign in' }, 401)
  const member = await env.DB.prepare(`SELECT 1 FROM study_group_members WHERE group_id = ? AND user_id = ?`).bind(params.id, session.user_id).first()
  if (!member) return json({ error: 'Join the group to post' }, 403)
  const { body } = await request.json()
  if (!body?.trim()) return json({ error: 'Cannot be empty' }, 400)
  await env.DB.prepare(`INSERT INTO study_group_posts (group_id, author_id, body) VALUES (?,?,?)`).bind(params.id, session.user_id, body.trim()).run()
  await env.DB.prepare(`UPDATE study_groups SET post_count = post_count + 1 WHERE id = ?`).bind(params.id).run()
  return json({ ok: true }, 201)
}
export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' }})
}
