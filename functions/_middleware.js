// functions/_middleware.js

export async function onRequest({ request, next }) {
  const url = new URL(request.url)

  // Redirect .org to .com
  if (url.hostname === 'discussionsexegetica.org') {
    return Response.redirect(`https://discussionsexegetica.com${url.pathname}${url.search}`, 301)
  }

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  return next()
}
