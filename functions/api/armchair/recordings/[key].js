// functions/api/armchair/recordings/[key].js
// Serves a recording from R2

export async function onRequestGet({ env, params }) {
  try {
    const key = `recordings/${params.key}`
    const obj = await env.RECORDINGS.get(key)
    if (!obj) return new Response('Not found', { status: 404 })
    return new Response(obj.body, {
      headers: {
        'Content-Type': obj.httpMetadata?.contentType || 'audio/webm',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (e) {
    return new Response('Error', { status: 500 })
  }
}
