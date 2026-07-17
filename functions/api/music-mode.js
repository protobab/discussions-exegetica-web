// functions/api/music-mode.js
// GET — returns current music mode (local or jamendo)
// POST — admin sets music mode

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

const ADMIN_USERS = ['eki']
const KV_KEY = 'music_mode'

export async function onRequestGet({ env }) {
  try {
    const mode = await env.SESSIONS.get(KV_KEY) || 'local'
    return new Response(JSON.stringify({ mode }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch {
    return new Response(JSON.stringify({ mode: 'local' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestPost({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  const { mode } = await request.json()
  if (!['local', 'jamendo'].includes(mode)) {
    return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400 })
  }
  await env.SESSIONS.put(KV_KEY, mode)
  return new Response(JSON.stringify({ ok: true, mode }), {
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
