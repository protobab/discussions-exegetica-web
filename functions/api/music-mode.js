// functions/api/music-mode.js
// GET — returns current Bible audio reader/narrator
// POST — admin sets the reader

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

const KV_KEY = 'bible_reader'
const VALID_READERS = ['souer', 'hays', 'gilbert']

export async function onRequestGet({ env }) {
  try {
    const reader = await env.SESSIONS.get(KV_KEY) || 'souer'
    return new Response(JSON.stringify({ reader }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch {
    return new Response(JSON.stringify({ reader: 'souer' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !session.is_admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  const { reader } = await request.json()
  if (!VALID_READERS.includes(reader)) {
    return new Response(JSON.stringify({ error: 'Invalid reader' }), { status: 400 })
  }
  await env.SESSIONS.put(KV_KEY, reader)
  return new Response(JSON.stringify({ ok: true, reader }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
