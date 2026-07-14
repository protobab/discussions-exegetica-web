// functions/_middleware.js
export async function onRequest({ request, next }) {
  const url = new URL(request.url)

  // Serve assetlinks.json for Android TWA verification
  if (url.pathname === '/.well-known/assetlinks.json') {
    return new Response(JSON.stringify([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.discussionsexegetica.app",
          sha256_cert_fingerprints: [
            "11:80:C5:15:83:F5:67:1E:C5:4A:A0:77:5F:A6:55:B0:C2:19:29:81:3D:5A:80:8F:11:69:BC:00:B8:AE:87:3A"
          ]
        }
      }
    ], null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }

  // Redirect .org to .com
  if (url.hostname === 'discussionsexegetica.org') {
    return Response.redirect(`https://discussionsexegetica.com${url.pathname}${url.search}`, 301)
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }})
  }

  return next()
}
