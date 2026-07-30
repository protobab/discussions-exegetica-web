// functions/api/media/[key].js
// Serves a re-hosted image (e.g. a Pixabay cover image we downloaded and saved permanently) from R2

export async function onRequestGet({ env, params }) {
  try {
    const key = `covers/${params.key}`
    const obj = await env.RECORDINGS.get(key)
    if (!obj) return new Response('Not found', { status: 404 })
    return new Response(obj.body, {
      headers: {
        'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (e) {
    return new Response('Error', { status: 500 })
  }
}
