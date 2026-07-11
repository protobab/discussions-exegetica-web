// functions/api/groups/[id]/settings.js
async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}
const ADMIN_USERS = ['eki']

export async function onRequestPatch({ env, request, params }) {
  const session = await getSession(request, env)
  if (!session) return json({ error: 'Unauthorised' }, 401)
  const group = await env.DB.prepare(`SELECT owner_id FROM study_groups WHERE id = ?`).bind(params.id).first()
  if (!group) return json({ error: 'Group not found' }, 404)
  const isOwner = group.owner_id === session.user_id
  const isAdmin = ADMIN_USERS.includes(session.username)
  if (!isOwner && !isAdmin) return json({ error: 'Only the group owner can change settings' }, 403)
  const { max_members, approval_required } = await request.json()
  await env.DB.prepare(`UPDATE study_groups SET max_members = COALESCE(?, max_members), approval_required = COALESCE(?, approval_required) WHERE id = ?`)
    .bind(max_members ?? null, approval_required !== undefined ? (approval_required ? 1 : 0) : null, params.id).run()
  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'PATCH, OPTIONS' } })
}
