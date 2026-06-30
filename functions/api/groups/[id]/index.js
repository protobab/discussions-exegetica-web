// functions/api/groups/[id]/index.js

export async function onRequestGet({ env, params }) {
  const group = await env.DB.prepare(`
    SELECT g.*, u.username, u.display_name, u.avatar_color
    FROM study_groups g JOIN users u ON g.owner_id = u.id
    WHERE g.id = ?
  `).bind(params.id).first()

  if (!group) return json({ error: 'Group not found' }, 404)

  const { results: posts } = await env.DB.prepare(`
    SELECT p.id, p.body, p.created_at, u.username, u.display_name, u.avatar_color, u.badge
    FROM study_group_posts p JOIN users u ON p.author_id = u.id
    WHERE p.group_id = ? ORDER BY p.created_at ASC
  `).bind(params.id).all()

  return json({ group, posts })
}

export async function onRequestOptions() {
  return new Response(null, { headers: cors() })
}

function cors() {
  return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors() } })
}
