// functions/api/armchair/signal.js
// KV-based WebRTC signalling relay
// Stores offers/answers keyed by session + listener ID, TTL 5 minutes

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url)
  const session = url.searchParams.get('session')
  const type = url.searchParams.get('type')
  const listener = url.searchParams.get('listener')

  if (!session || !type) return json({ error: 'session and type required' }, 400)

  try {
    if (type === 'host_live') {
      // Check if host is live
      const val = await env.SESSIONS.get(`signal:${session}:host_live`)
      return json({ live: !!val })
    }

    if (type === 'answer') {
      // Host polling for listener answers
      const { keys } = await env.SESSIONS.list({ prefix: `signal:${session}:answer:` })
      const signals = []
      for (const key of (keys || [])) {
        const val = await env.SESSIONS.get(key.name)
        if (val) {
          const parsed = JSON.parse(val)
          signals.push(parsed)
          await env.SESSIONS.delete(key.name) // consume once read
        }
      }
      return json({ signals })
    }

    if (type === 'offer' && listener) {
      // Listener polling for their specific offer
      const val = await env.SESSIONS.get(`signal:${session}:offer:${listener}`)
      return json(val ? JSON.parse(val) : { sdp: null })
    }

    return json({ error: 'Unknown type' }, 400)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestPost({ env, request }) {
  const url = new URL(request.url)
  const session = url.searchParams.get('session')
  const type = url.searchParams.get('type')
  const listener = url.searchParams.get('listener')
  const body = await request.json()

  try {
    if (type === 'host_live') {
      await env.SESSIONS.put(`signal:${session}:host_live`, '1', { expirationTtl: 7200 })
      return json({ ok: true })
    }

    if (type === 'listener_ready') {
      // Listener announces they're waiting — host will pick this up
      await env.SESSIONS.put(`signal:${session}:answer:${body.listener_id}`, JSON.stringify({ listener_id: body.listener_id, sdp: null, waiting: true }), { expirationTtl: 300 })
      return json({ ok: true })
    }

    if (type === 'offer' && listener) {
      // Host sending offer to specific listener
      await env.SESSIONS.put(`signal:${session}:offer:${listener}`, JSON.stringify(body), { expirationTtl: 300 })
      return json({ ok: true })
    }

    if (type === 'answer' && listener) {
      // Listener sending answer to host
      await env.SESSIONS.put(`signal:${session}:answer:${listener}`, JSON.stringify({ listener_id: listener, sdp: body }), { expirationTtl: 300 })
      return json({ ok: true })
    }

    return json({ error: 'Unknown type' }, 400)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }})
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' }})
}
