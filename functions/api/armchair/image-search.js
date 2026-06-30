// functions/api/armchair/image-search.js
// Searches Pixabay's free API for royalty-free images by keyword
// Requires PIXABAY_API_KEY to be set as a Cloudflare Pages environment variable

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  if (!query?.trim()) return json({ error: 'Search query required' }, 400)

  const apiKey = env.PIXABAY_API_KEY
  if (!apiKey) return json({ error: 'Image search not configured yet' }, 503)

  try {
    const pixabayUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&per_page=12&orientation=horizontal`
    const res = await fetch(pixabayUrl)
    const data = await res.json()

    const images = (data.hits || []).map(hit => ({
      id: hit.id,
      thumb: hit.webformatURL,
      full: hit.largeImageURL,
      tags: hit.tags,
      photographer: hit.user
    }))

    return json({ images })
  } catch (e) {
    return json({ error: 'Image search failed' }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: cors() })
}

function cors() {
  return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,OPTIONS' }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors() } })
}
