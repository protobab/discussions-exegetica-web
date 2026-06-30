import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Btn, Logo } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'

// Only these usernames can access the admin panel
const ADMIN_USERS = ['eki']

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ verse_ref: '', verse_text: '', theme: '', posted_date: '' })
  const [upcoming, setUpcoming] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const isAdmin = user && ADMIN_USERS.includes(user.username)

  useEffect(() => {
    if (!isAdmin) return
    fetchUpcoming()
  }, [isAdmin])

  const fetchUpcoming = async () => {
    const res = await fetch(`${API}/admin/daily-words`)
    const data = await res.json()
    setUpcoming(data.words || [])
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.verse_ref || !form.verse_text || !form.posted_date)
      return setStatus('Please fill in the reference, text, and date.')
    setLoading(true); setStatus('')
    const res = await fetch(`${API}/admin/daily-words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.ok) {
      setStatus('✅ Verse added successfully!')
      setForm({ verse_ref: '', verse_text: '', theme: '', posted_date: '' })
      fetchUpcoming()
    } else {
      setStatus(`❌ ${data.error}`)
    }
    setLoading(false)
  }

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: F.body, color: C.muted }}>
      Please sign in to access this page.
    </div>
  )

  if (!isAdmin) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: F.body, color: C.muted }}>
      You do not have permission to view this page.
    </div>
  )

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <Logo size={32} />
        <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.navy }}>
          Daily Word Admin
        </h1>
      </div>

      {/* Add new verse */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '28px 28px',
        border: `1px solid ${C.border}`, marginBottom: 36
      }}>
        <h2 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, color: C.navy, marginBottom: 20 }}>
          Add a Daily Word
        </h2>

        {status && (
          <div style={{
            background: status.startsWith('✅') ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${status.startsWith('✅') ? '#BBF7D0' : '#FECACA'}`,
            borderRadius: 8, padding: '10px 14px',
            fontFamily: F.body, fontSize: 13.5,
            color: status.startsWith('✅') ? '#15803D' : '#DC2626',
            marginBottom: 18
          }}>{status}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>
              Verse Reference *
            </label>
            <input
              value={form.verse_ref}
              onChange={set('verse_ref')}
              placeholder="e.g. John 3:16"
              style={{
                width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8,
                padding: '10px 13px', fontFamily: F.body, fontSize: 14, outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>
              Date *
            </label>
            <input
              type="date"
              value={form.posted_date}
              onChange={set('posted_date')}
              style={{
                width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8,
                padding: '10px 13px', fontFamily: F.body, fontSize: 14, outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>
            Verse Text *
          </label>
          <textarea
            value={form.verse_text}
            onChange={set('verse_text')}
            placeholder="The full verse text…"
            rows={3}
            style={{
              width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8,
              padding: '10px 13px', fontFamily: F.body, fontSize: 14,
              resize: 'vertical', outline: 'none', lineHeight: 1.6
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>
            Theme / Topic
          </label>
          <input
            value={form.theme}
            onChange={set('theme')}
            placeholder="e.g. The Nature of Christ"
            style={{
              width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8,
              padding: '10px 13px', fontFamily: F.body, fontSize: 14, outline: 'none'
            }}
          />
        </div>

        <Btn variant="gold" onClick={submit} disabled={loading} style={{ fontSize: 14, padding: '10px 24px' }}>
          {loading ? 'Saving…' : 'Add Daily Word'}
        </Btn>
      </div>

      {/* Upcoming words */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '28px', border: `1px solid ${C.border}` }}>
        <h2 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, color: C.navy, marginBottom: 18 }}>
          Upcoming Verses ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p style={{ fontFamily: F.body, color: C.muted, fontSize: 14 }}>No upcoming verses loaded yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {upcoming.slice(0, 14).map((w, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                padding: '12px 16px', background: C.parchment, borderRadius: 8
              }}>
                <div style={{
                  background: C.gold, color: C.navy, borderRadius: 6,
                  padding: '3px 10px', fontFamily: F.body, fontSize: 11,
                  fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0
                }}>
                  {new Date(w.posted_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                <div>
                  <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.navy }}>{w.verse_ref}</span>
                  <span style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginLeft: 8 }}>{w.theme}</span>
                  <p style={{ fontFamily: F.body, fontSize: 13, color: C.text, margin: '4px 0 0', lineHeight: 1.5 }}>
                    {w.verse_text.slice(0, 100)}…
                  </p>
                </div>
              </div>
            ))}
            {upcoming.length > 14 && (
              <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, textAlign: 'center', marginTop: 8 }}>
                + {upcoming.length - 14} more verses scheduled
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
