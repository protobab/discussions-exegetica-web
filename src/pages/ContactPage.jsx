import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { Logo, Btn } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export default function ContactPage() {
  usePageTitle('Contact')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('❌ Please fill in your name, email and message.')
      return
    }
    setLoading(true); setStatus('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.ok) {
        setStatus('✅ Message sent! We will get back to you soon.')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus(`❌ ${data.error || 'Something went wrong. Please try again.'}`)
      }
    } catch {
      setStatus('❌ Connection error. Please try again.')
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 13px', fontFamily: F.body, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: C.parchment }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '38px 32px', width: '100%', maxWidth: 520, boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><Logo size={38}/></div>
        <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.navy, textAlign: 'center', marginBottom: 6 }}>Get in Touch</h1>
        <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.muted, textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
          Have a question, suggestion, or need help? We'd love to hear from you.
        </p>

        {status && (
          <div style={{ background: status.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${status.startsWith('✅') ? '#BBF7D0' : '#FECACA'}`, borderRadius: 8, padding: '10px 14px', fontFamily: F.body, fontSize: 13, color: status.startsWith('✅') ? '#15803D' : '#DC2626', marginBottom: 16 }}>
            {status}
          </div>
        )}

        <input value={form.name} onChange={set('name')} placeholder="Your name *" style={inputStyle}/>
        <input type="email" value={form.email} onChange={set('email')} placeholder="Your email *" style={inputStyle}/>
        <input value={form.subject} onChange={set('subject')} placeholder="Subject (optional)" style={inputStyle}/>
        <textarea value={form.message} onChange={set('message')} placeholder="Your message *" rows={5}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65, marginBottom: 20 }}/>

        <Btn variant="gold" onClick={submit} disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 15, justifyContent: 'center' }}>
          {loading ? 'Sending…' : 'Send Message'}
        </Btn>

        <p style={{ fontFamily: F.body, fontSize: 12.5, color: C.muted, textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ color: C.gold }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
