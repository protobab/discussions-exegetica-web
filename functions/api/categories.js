// functions/api/categories.js
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`SELECT slug, label, icon, description FROM categories ORDER BY sort_order`).all()
  return new Response(JSON.stringify({ categories: results }), { headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Cache-Control':'public,max-age=86400' }})
}
