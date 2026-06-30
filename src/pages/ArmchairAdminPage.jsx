import { useEffect, useState } from 'react'
import { C, F, API } from '../lib/tokens.js'
import { Btn, Logo } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import ImagePicker from '../components/ImagePicker.jsx'

const ADMIN_USERS = ['eki']

export default function ArmchairAdminPage() {
  const { user, token } = useAuth()
  const isAdmin = user && ADMIN_USERS.includes(user.username)
  const [tab, setTab] = useState('sessions')

  if (!user) return <Center>Please sign in.</Center>
  if (!isAdmin) return <Center>You do not have permission to view this page.</Center>

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Logo size={30} />
        <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.navy }}>The Armchair — Admin</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[['sessions','Live Sessions'],['posts','Blog Posts'],['moderation','Moderation']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: tab===k ? C.navy : '#fff', color: tab===k ? '#fff' : C.muted,
            border: `1.5px solid ${tab===k ? C.navy : C.border}`, borderRadius: 8,
            padding: '8px 18px', fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>{l}</button>
        ))}
      </div>

      {tab === 'sessions' && <SessionsTab token={token} />}
      {tab === 'posts' && <PostsTab token={token} />}
      {tab === 'moderation' && <ModerationTab token={token} />}
    </div>
  )
}

function Center({ children }) {
  return <div style={{ textAlign:'center', padding:'80px 24px', fontFamily:F.body, color:C.muted }}>{children}</div>
}

// ── SESSIONS TAB ─────────────────────────────────────────────

function SessionsTab({ token }) {
  const [form, setForm] = useState({ title:'', description:'', guest_name:'', guest_bio:'', cover_image:'', scheduled_at:'' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdSession, setCreatedSession] = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const create = async () => {
    if (!form.title.trim() || !form.scheduled_at) return setStatus('❌ Title and date/time required')
    setLoading(true); setStatus('')
    const res = await fetch(`${API}/armchair/manage?type=session`, {
      method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.id) {
      setStatus('✅ Session scheduled!')
      setCreatedSession(data)
      setForm({ title:'', description:'', guest_name:'', guest_bio:'', cover_image:'', scheduled_at:'' })
    } else setStatus(`❌ ${data.error}`)
    setLoading(false)
  }

  const setSessionStatus = async (session_id, newStatus) => {
    await fetch(`${API}/armchair/manage`, {
      method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify({ session_id, status: newStatus })
    })
    setStatus(`✅ Session marked as ${newStatus}`)
  }

  return (
    <div style={{ background:'#fff', borderRadius:14, padding:28, border:`1px solid ${C.border}` }}>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:18 }}>Schedule a Live Session</h2>

      {status && <StatusBox status={status} />}

      <Grid2>
        <Field label="Session title *" value={form.title} onChange={set('title')} placeholder="e.g. The Heart of the Gospel" />
        <Field label="Date & time *" type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} />
        <Field label="Guest name" value={form.guest_name} onChange={set('guest_name')} placeholder="Who's joining you?" />
      </Grid2>
      <ImagePicker currentImage={form.cover_image} onSelect={url => setForm(f => ({ ...f, cover_image: url }))} />
      <TextField label="Description" value={form.description} onChange={set('description')} placeholder="What will this conversation cover?" />
      <TextField label="Guest bio" value={form.guest_bio} onChange={set('guest_bio')} placeholder="A short bio for the guest" />

      <Btn variant="gold" onClick={create} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? 'Scheduling…' : 'Schedule Session'}
      </Btn>

      {createdSession && (
        <div style={{ marginTop: 20, padding: '16px 18px', background: C.parchment, borderRadius: 10 }}>
          <p style={{ fontFamily:F.body, fontSize:13.5, color:C.text, marginBottom: 10 }}>
            Session created. Use these controls when you're ready to start:
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="primary" onClick={() => setSessionStatus(createdSession.id, 'live')}>🔴 Go Live</Btn>
            <Btn variant="outline" onClick={() => setSessionStatus(createdSession.id, 'ended')}>End Session</Btn>
          </div>
        </div>
      )}

      <p style={{ fontFamily:F.body, fontSize:12.5, color:C.muted, marginTop:18, lineHeight:1.6 }}>
        Tip: stream your video via Zoom, Google Meet, or YouTube Live in a separate tab/app, and share that link with guests directly. This page powers the live chat and Q&A that runs alongside it on the site.
      </p>
    </div>
  )
}

// ── POSTS TAB ────────────────────────────────────────────────

function PostsTab({ token }) {
  const [form, setForm] = useState({ title:'', excerpt:'', body:'', cover_image:'' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const publish = async () => {
    if (!form.title.trim() || !form.body.trim()) return setStatus('❌ Title and content required')
    setLoading(true); setStatus('')
    const res = await fetch(`${API}/armchair/manage?type=post`, {
      method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.id) { setStatus('✅ Post published!'); setForm({ title:'', excerpt:'', body:'', cover_image:'' }) }
    else setStatus(`❌ ${data.error}`)
    setLoading(false)
  }

  return (
    <div style={{ background:'#fff', borderRadius:14, padding:28, border:`1px solid ${C.border}` }}>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:18 }}>Write a Post</h2>
      {status && <StatusBox status={status} />}
      <Field label="Title *" value={form.title} onChange={set('title')} placeholder="Post title" />
      <ImagePicker currentImage={form.cover_image} onSelect={url => setForm(f => ({ ...f, cover_image: url }))} />
      <TextField label="Excerpt (short summary)" value={form.excerpt} onChange={set('excerpt')} placeholder="One or two sentences shown on the feed…" rows={2} />
      <TextField label="Full post *" value={form.body} onChange={set('body')} placeholder="Write your reflection…" rows={10} />
      <Btn variant="gold" onClick={publish} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? 'Publishing…' : 'Publish Post'}
      </Btn>
    </div>
  )
}

// ── MODERATION TAB ───────────────────────────────────────────

function ModerationTab({ token }) {
  const [flagged, setFlagged] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch(`${API}/armchair/moderation`, { headers: { Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(d => { setFlagged(d.flagged || []); setLoading(false) })
  }
  useEffect(load, [])

  const act = async (message_id, action) => {
    await fetch(`${API}/armchair/moderation`, {
      method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify({ message_id, action })
    })
    load()
  }

  if (loading) return <p style={{ fontFamily:F.body, color:C.muted }}>Loading…</p>

  return (
    <div style={{ background:'#fff', borderRadius:14, padding:28, border:`1px solid ${C.border}` }}>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:18 }}>
        Flagged Messages ({flagged.length})
      </h2>
      {flagged.length === 0 ? (
        <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted }}>No flagged messages — all clear!</p>
      ) : (
        <div style={{ display:'grid', gap:12 }}>
          {flagged.map(m => (
            <div key={m.id} style={{
              padding:'14px 16px', background: m.is_hidden ? '#FEF2F2' : C.parchment,
              borderRadius:10, border:`1px solid ${m.is_hidden ? '#FECACA' : C.border}`
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
                <div>
                  <p style={{ fontFamily:F.body, fontSize:12.5, color:C.muted, marginBottom:4 }}>
                    {m.display_name} (@{m.username}) in "{m.session_title}" · {m.flag_count} flag{m.flag_count!==1?'s':''}
                    {m.is_hidden ? ' · HIDDEN' : ''}
                  </p>
                  <p style={{ fontFamily:F.body, fontSize:14, color:C.text }}>{m.body}</p>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {m.is_hidden ? (
                    <Btn variant="outline" onClick={() => act(m.id, 'restore')}>Restore</Btn>
                  ) : (
                    <Btn variant="outline" onClick={() => act(m.id, 'remove')}>Hide</Btn>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── shared small components ──────────────────────────────────

function Grid2({ children }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>{children}</div>
}

function Field({ label, type='text', value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:C.navy, display:'block', marginBottom:5 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
        width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8,
        padding:'9px 12px', fontFamily:F.body, fontSize:13.5, outline:'none'
      }}/>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:C.navy, display:'block', marginBottom:5 }}>{label}</label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{
        width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8,
        padding:'9px 12px', fontFamily:F.body, fontSize:13.5, outline:'none', resize:'vertical', lineHeight:1.6
      }}/>
    </div>
  )
}

function StatusBox({ status }) {
  const ok = status.startsWith('✅')
  return (
    <div style={{
      background: ok ? '#F0FDF4' : '#FEF2F2', border:`1px solid ${ok?'#BBF7D0':'#FECACA'}`,
      borderRadius:8, padding:'10px 14px', fontFamily:F.body, fontSize:13,
      color: ok ? '#15803D':'#DC2626', marginBottom:16
    }}>{status}</div>
  )
}
