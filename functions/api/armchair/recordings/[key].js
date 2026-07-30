// functions/api/armchair/recordings/[key].js
// Serves a recording from R2

export async function onRequestGet({ env, params }) {
  if (!env.RECORDINGS) {
    // This is the clearest possible signal that the R2 binding isn't attached to this
    // environment (check Cloudflare Pages dashboard → Settings → Functions → R2 bucket
    // bindings for both Production and Preview). Returned as JSON so it's visible
    // directly in the browser Network tab without needing further digging.
    return new Response(JSON.stringify({ error: 'Recording storage (R2) is not connected to this environment.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
  try {
    const key = `recordings/${params.key}`
    const obj = await env.RECORDINGS.get(key)
    if (!obj) {
      return new Response(JSON.stringify({ error: 'Recording not found', key }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    return new Response(obj.body, {
      headers: {
        'Content-Type': obj.httpMetadata?.contentType || 'audio/webm',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}
