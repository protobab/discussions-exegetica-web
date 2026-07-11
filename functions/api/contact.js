// functions/api/contact.js

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}

export async function onRequestPost({ env, request }) {
  const { name, email, subject, message } = await request.json().catch(() => ({}))
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return json({ error: 'Name, email and message are required' }, 400)
  }

  // Simple spam check
  if (message.length > 5000) return json({ error: 'Message too long' }, 400)

  // Store in KV as a simple inbox (visible in admin)
  const id = `contact:${Date.now()}`
  const entry = { id, name: name.trim(), email: email.trim(), subject: subject?.trim() || 'Contact form message', message: message.trim(), created_at: new Date().toISOString(), read: false }
  await env.SESSIONS.put(id, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 90 }) // 90 days

  // Send email if Resend configured
  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Discussions Exegetica <noreply@discussionsexegetica.com>',
          to: env.ADMIN_EMAIL || 'admin@discussionsexegetica.com',
          subject: `Contact: ${entry.subject}`,
          html: `<p><strong>From:</strong> ${entry.name} &lt;${entry.email}&gt;</p><p><strong>Subject:</strong> ${entry.subject}</p><hr/><p>${entry.message.replace(/\n/g,'<br/>')}</p>`
        })
      })
    } catch {}
  }

  return json({ ok: true })
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } })
}
