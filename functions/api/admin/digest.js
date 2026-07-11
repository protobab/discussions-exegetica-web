// functions/api/admin/digest.js
// Sends weekly email digest to all members with top discussions
// Triggered manually from admin panel or via cron

async function getSession(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try { return JSON.parse(await env.SESSIONS.get(`s:${token}`)) } catch { return null }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

const ADMIN_USERS = ['eki']

export async function onRequestPost({ env, request }) {
  const cronSecret = request.headers.get('X-Cron-Secret')
  const isValidCron = cronSecret && cronSecret === env.CRON_SECRET

  if (!isValidCron) {
    const session = await getSession(request, env)
    if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)
  }

  if (!env.SENDGRID_API_KEY && !env.RESEND_API_KEY) {
    return json({ error: 'No email provider configured. Add RESEND_API_KEY to Cloudflare environment variables.' }, 503)
  }

  try {
    // Get top threads from this week
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const { results: topThreads } = await env.DB.prepare(`
      SELECT t.id, t.title, t.body, t.reply_count, t.like_count,
             u.display_name, c.label as cat_label
      FROM threads t
      JOIN users u ON t.author_id = u.id
      JOIN categories c ON t.category_id = c.id
      WHERE t.created_at >= ?
      ORDER BY (t.reply_count + t.like_count) DESC LIMIT 5
    `).bind(weekAgo).all()

    // Get new member count
    const newMembers = await env.DB.prepare(`SELECT COUNT(*) as n FROM users WHERE created_at >= ?`).bind(weekAgo).first()

    // Get all users who want email digests
    const { results: users } = await env.DB.prepare(`
      SELECT email, display_name FROM users WHERE email_replies = 1 AND email NOT LIKE 'deleted_%'
    `).all()

    if (users.length === 0) return json({ ok: true, sent: 0, message: 'No subscribers yet' })

    const html = buildDigestEmail(topThreads, newMembers?.n || 0)
    const subject = `This week on Discussions Exegetica — ${topThreads.length} discussions you might love`

    let sent = 0
    const errors = []

    // Send via Resend (recommended — free tier: 3,000 emails/month)
    if (env.RESEND_API_KEY) {
      for (const user of users) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Discussions Exegetica <noreply@discussionsexegetica.com>',
              to: user.email,
              subject,
              html: html.replace('{{NAME}}', user.display_name)
            })
          })
          if (res.ok) sent++
          else errors.push(user.email)
          // Rate limit: 2 per second
          await new Promise(r => setTimeout(r, 500))
        } catch { errors.push(user.email) }
      }
    }

    return json({ ok: true, sent, total: users.length, errors: errors.length })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestGet({ env, request }) {
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) return json({ error: 'Unauthorised' }, 401)

  const subscriberCount = await env.DB.prepare(`SELECT COUNT(*) as n FROM users WHERE email_replies = 1`).first()
  const hasEmail = !!(env.RESEND_API_KEY)

  return json({
    subscriberCount: subscriberCount?.n || 0,
    hasEmailProvider: hasEmail,
    provider: env.RESEND_API_KEY ? 'Resend' : 'None configured'
  })
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-Secret',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }})
}

function buildDigestEmail(threads, newMembers) {
  const threadRows = threads.map(t => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #E5E7EB;">
        <span style="background:#EEF2F7;color:#2E4270;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;">${t.cat_label}</span>
        <h3 style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:#1B2A4A;margin:8px 0 5px;line-height:1.35;">
          <a href="https://discussionsexegetica.com/thread/${t.id}" style="color:#1B2A4A;text-decoration:none;">${t.title}</a>
        </h3>
        <p style="font-family:Arial,sans-serif;font-size:13px;color:#6B7280;margin:0 0 8px;line-height:1.55;">${t.body?.slice(0, 120)}…</p>
        <span style="font-family:Arial,sans-serif;font-size:12px;color:#9CA3AF;">By ${t.display_name} · 💬 ${t.reply_count} replies · ❤️ ${t.like_count} likes</span>
      </td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EB;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1B2A4A,#2E4270);border-radius:14px 14px 0 0;padding:32px;text-align:center;">
          <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#fff;margin:0 0 6px;">Discussions Exegetica</h1>
          <p style="font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.65);margin:0;">Where Scripture is opened together</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:32px;border-radius:0 0 14px 14px;">
          <p style="font-family:Arial,sans-serif;font-size:15px;color:#2C2C2C;margin:0 0 6px;">Hello {{NAME}},</p>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.65;">
            Here's what the global community has been discussing this week${newMembers > 0 ? ` — and ${newMembers} new member${newMembers !== 1 ? 's' : ''} joined` : ''}.
          </p>

          <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1B2A4A;margin:0 0 16px;">🔥 Top discussions this week</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${threadRows}
          </table>

          <div style="text-align:center;margin:32px 0;">
            <a href="https://discussionsexegetica.com/forum" style="background:#C9A84C;color:#1B2A4A;border-radius:10px;padding:13px 28px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;">
              Join the conversation →
            </a>
          </div>

          <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;">
          <p style="font-family:Arial,sans-serif;font-size:12px;color:#9CA3AF;text-align:center;margin:0;line-height:1.6;">
            You're receiving this because you're a member of Discussions Exegetica.<br/>
            <a href="https://discussionsexegetica.com" style="color:#C9A84C;">Visit the community</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
