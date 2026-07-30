// functions/api/armchair/recordings/[key].js
// Serves a recording from R2, with HTTP Range support so mobile browsers
// can seek/scrub instead of stalling after a couple of seconds.

export async function onRequestGet({ env, params, request }) {
  if (!env.RECORDINGS) {
    return new Response(JSON.stringify({ error: 'Recording storage (R2) is not connected to this environment.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
  try {
    const key = `recordings/${params.key}`
    const rangeHeader = request.headers.get('Range')

    const obj = rangeHeader
      ? await env.RECORDINGS.get(key, { range: parseRange(rangeHeader) })
      : await env.RECORDINGS.get(key)

    if (!obj) {
      return new Response(JSON.stringify({ error: 'Recording not found', key }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const contentType = obj.httpMetadata?.contentType || 'audio/webm'
    const headers = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }

    // obj.range is populated by R2 when a range request was honoured
    if (rangeHeader && obj.range) {
      const totalSize = obj.size
      const start = obj.range.offset ?? 0
      const length = obj.range.length ?? (totalSize - start)
      const end = start + length - 1
      headers['Content-Range'] = `bytes ${start}-${end}/${totalSize}`
      headers['Content-Length'] = String(length)
      return new Response(obj.body, { status: 206, headers })
    }

    headers['Content-Length'] = String(obj.size)
    return new Response(obj.body, { status: 200, headers })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }})
}

// Parses "bytes=0-1023", "bytes=1000-", "bytes=-500" into R2's {offset,length} shape
function parseRange(header) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match) return undefined
  const [, startStr, endStr] = match
  if (startStr === '' && endStr !== '') {
    // suffix range: last N bytes
    return { suffix: parseInt(endStr, 10) }
  }
  const offset = parseInt(startStr, 10)
  if (endStr === '') return { offset }
  const end = parseInt(endStr, 10)
  return { offset, length: end - offset + 1 }
}
