// functions/api/daily-word.js

export async function onRequestGet({ env }) {
  const today = new Date().toISOString().split('T')[0]
  const word = await env.DB.prepare(
    `SELECT verse_ref, verse_text, theme FROM daily_words WHERE posted_date = ?`
  ).bind(today).first()
    || await env.DB.prepare(
    `SELECT verse_ref, verse_text, theme FROM daily_words ORDER BY posted_date DESC LIMIT 1`
  ).first()

  return new Response(JSON.stringify({ word }), {
    headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Cache-Control':'public,max-age=3600' }
  })
}
