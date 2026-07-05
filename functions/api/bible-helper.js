// functions/api/bible-helper.js
// Secure server-side proxy for the Bible Study AI helper
// Keeps the Anthropic API key on the server, not in the browser

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

export async function onRequestPost({ env, request }) {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'AI helper not configured yet — please add ANTHROPIC_API_KEY to Cloudflare environment variables.' }, 503)
  }

  const { query, reference } = await request.json().catch(() => ({}))
  if (!query?.trim()) return json({ error: 'Query required' }, 400)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: `You are a knowledgeable, warm Bible study helper on Discussions Exegetica — a global non-denominational evangelical platform. Help users understand Scripture clearly and faithfully. Reference specific verses. Keep responses to 150-200 words. End with a question that invites deeper reflection or points them to the forum to discuss with the community.`,
        messages: [{ role: 'user', content: reference ? `Context: Currently reading ${reference}\n\n${query}` : query }]
      })
    })

    const data = await res.json()
    const text = data.content?.[0]?.text
    if (!text) return json({ error: 'No response from AI' }, 500)
    return json({ response: text })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }})
}
