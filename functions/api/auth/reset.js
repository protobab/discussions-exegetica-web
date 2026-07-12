// functions/api/auth/reset.js
// Password reset via email token

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'de-salt-2024'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}

async function makeToken() {
  const arr = new Uint8Array(24)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('')
}

// POST /api/auth/reset — step 1: request reset (sends email)
// POST /api/auth/reset?confirm=1 — step 2: confirm with token + new password
export async function onRequestPost({ env, request }) {
  const url = new URL(request.url)
  const body = await request.json().catch(() => ({}))

  // Step 2: confirm reset
  if (url.searchParams.get('confirm') === '1') {
    const { token, password } = body
    if (!token || !password) return json({ error: 'Token and password required' }, 400)
    if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)
    if (!/[A-Z]/.test(password)) return json({ error: 'Password must contain at least one capital letter' }, 400)
    if (!/[0-9!@#$%^&*()_+\-=\[\]{};:'",.?]/.test(password)) return json({ error: 'Password must contain at least one number or special character' }, 400)

    const stored = await env.SESSIONS.get(`reset:${token}`)
    if (!stored) return json({ error: 'Reset link has expired or is invalid. Please request a new one.' }, 400)

    const { user_id } = JSON.parse(stored)
    const hash = await hashPassword(password)
    await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).bind(hash, user_id).run()
    await env.SESSIONS.delete(`reset:${token}`)
    return json({ ok: true, message: 'Password updated successfully. You can now sign in.' })
  }

  // Step 1: request reset
  const { email } = body
  if (!email?.trim()) return json({ error: 'Email address required' }, 400)

  const user = await env.DB.prepare(`SELECT id, display_name, email FROM users WHERE email = ?`)
    .bind(email.toLowerCase().trim()).first()

  // Always return success to prevent email enumeration
  if (!user) return json({ ok: true, message: 'If that email is registered, a reset link has been sent.' })

  const token = await makeToken()
  const resetUrl = `https://discussionsexegetica.com/reset-password?token=${token}`

  await env.SESSIONS.put(`reset:${token}`, JSON.stringify({ user_id: user.id, email: user.email }), {
    expirationTtl: 60 * 60 // 1 hour
  })

  // Send email via Resend if configured
  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Discussions Exegetica <noreply@discussionsexegetica.com>',
          to: user.email,
          subject: 'Reset your Discussions Exegetica password',
          html: `
            <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0f1e;color:#E8E0D0;border-radius:12px">
              <h2 style="color:#C9A84C;font-size:22px;margin-bottom:8px">Reset your password</h2>
              <p style="color:rgba(255,255,255,0.7);margin-bottom:24px">Hi ${user.display_name}, click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${resetUrl}" style="display:inline-block;background:#C9A84C;color:#0a0f1e;padding:13px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none">Reset Password →</a>
              <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:24px">If you didn't request this, ignore this email. Your password won't change.</p>
              <p style="color:rgba(255,255,255,0.25);font-size:11px">Or copy this link: ${resetUrl}</p>
            </div>
          `
        })
      })
    } catch(e) { console.error('Email send failed:', e) }
  }

  return json({ ok: true, message: 'If that email is registered, a reset link has been sent.' })
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }})
}
