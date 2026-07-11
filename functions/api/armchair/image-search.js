// functions/api/armchair/image-search.js
export async function onRequestGet({ env, request }) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')
  if (!q?.trim()) return new Response(JSON.stringify({ error: 'Query required' }), { status: 400, headers: { 'Content-Type':'application/json' }})
  const apiKey = env.PIXABAY_API_KEY
  if (!apiKey) return new Response(JSON.stringify({ images: [] }), { headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' }})
  const res = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(q)}&image_type=photo&safesearch=true&per_page=12&orientation=horizontal`)
  const data = await res.json()
  const images = (data.hits||[]).map(h => ({ id: h.id, thumb: h.webformatURL, full: h.largeImageURL, photographer: h.user }))
  return new Response(JSON.stringify({ images }), { headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' }})
}
