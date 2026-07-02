import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, F, API, ADMIN_USERS } from '../lib/tokens.js'
import { Logo, Btn, StatusMsg, Field, TextArea } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import ImagePicker from '../components/ImagePicker.jsx'

export default function AdminPage() {
  usePageTitle('Admin')
  const { user, token } = useAuth()
  const [tab, setTab] = useState('sessions')
  const isAdmin = user && ADMIN_USERS.includes(user.username)

  if (!user) return <Center>Please sign in to access this page.</Center>
  if (!isAdmin) return <Center>You do not have permission to view this page.</Center>

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'36px 20px 80px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Logo size={28}/>
        <h1 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:C.navy }}>Admin Panel</h1>
      </div>
      <div style={{ display:'flex', gap:7, marginBottom:26, flexWrap:'wrap' }}>
        {[['sessions','Live Sessions'],['posts','Blog Posts'],['daily','Daily Word'],['moderation','Moderation']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ background:tab===k?C.navy:'#fff', color:tab===k?'#fff':C.muted, border:`1.5px solid ${tab===k?C.navy:C.border}`, borderRadius:8, padding:'8px 16px', fontFamily:F.body, fontSize:13, fontWeight:600, cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      {tab === 'sessions'    && <SessionsTab token={token}/>}
      {tab === 'posts'       && <PostsTab token={token}/>}
      {tab === 'daily'       && <DailyWordTab token={token}/>}
      {tab === 'moderation'  && <ModerationTab token={token}/>}
    </div>
  )
}

function Center({ children }) {
  return <div style={{ textAlign:'center', padding:'80px 20px', fontFamily:F.body, color:C.muted }}>{children}</div>
}

// ── Sessions ─────────────────────────────────────────────────

function SessionsTab({ token }) {
  const [sessions, setSessions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', guest_name:'', guest_bio:'', cover_image:'', scheduled_at:'' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))
  const navigate = useNavigate()

  const loadSessions = () => {
    fetch(`${API}/armchair/manage`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>setSessions(d.sessions||[])).catch(()=>{})
  }
  useEffect(loadSessions, [])

  const create = async () => {
    if (!form.title.trim()||!form.scheduled_at) return setMsg('❌ Title and date/time required')
    setLoading(true); setMsg('')
    const res = await fetch(`${API}/armchair/manage?type=session`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.id) { setMsg('✅ Session scheduled!'); setShowForm(false); setForm({ title:'', description:'', guest_name:'', guest_bio:'', cover_image:'', scheduled_at:'' }); loadSessions() }
    else setMsg(`❌ ${data.error}`)
    setLoading(false)
  }

  const updateStatus = async (session_id, status) => {
    await fetch(`${API}/armchair/manage`, { method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ session_id, status }) })
    setMsg(`✅ Session marked as "${status}"`)
    loadSessions()
    // Navigate straight to the live session so you can broadcast immediately
    if (status === 'live') {
      setTimeout(() => navigate(`/armchair/session/${session_id}`), 800)
    }
  }

  const STATUS_COLOR = { scheduled:C.gold, live:'#EF4444', ended:C.muted }
  const STATUS_LABEL = { scheduled:'📅 Scheduled', live:'🔴 Live', ended:'✅ Ended' }

  return (
    <Panel>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy }}>Live Sessions</h2>
        <Btn variant="gold" onClick={()=>setShowForm(s=>!s)}>{showForm?'Cancel':'+ Schedule New'}</Btn>
      </div>
      <StatusMsg msg={msg}/>

      {/* All sessions list */}
      {sessions.length > 0 && (
        <div style={{ marginBottom: showForm ? 24 : 0 }}>
          <div style={{ display:'grid', gap:10 }}>
            {sessions.map(s=>(
              <div key={s.id} style={{ padding:'14px 16px', background:C.parchment, borderRadius:10, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                    <span style={{ background:STATUS_COLOR[s.status]+'22', color:STATUS_COLOR[s.status], border:`1px solid ${STATUS_COLOR[s.status]}55`, borderRadius:4, padding:'1px 8px', fontSize:11, fontFamily:F.body, fontWeight:700 }}>{STATUS_LABEL[s.status]}</span>
                  </div>
                  <p style={{ fontFamily:F.display, fontSize:14.5, fontWeight:700, color:C.navy, marginBottom:2 }}>{s.title}</p>
                  {s.guest_name && <p style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>with {s.guest_name}</p>}
                </div>
                <div style={{ display:'flex', gap:7, alignItems:'center' }}>
                  {s.status === 'scheduled' && <Btn variant="primary" onClick={()=>updateStatus(s.id,'live')}>🔴 Go Live</Btn>}
                  {s.status === 'live'      && <Btn variant="outline" onClick={()=>updateStatus(s.id,'ended')}>⏹ End Session</Btn>}
                  {s.status === 'ended'     && <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>Complete</span>}
                  <button onClick={()=>navigate(`/armchair/session/${s.id}`)} style={{ background:'none', border:'none', color:C.gold, fontFamily:F.body, fontSize:12.5, fontWeight:600, cursor:'pointer', padding:0 }}>
                    Open session →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && !showForm && (
        <p style={{ fontFamily:F.body, fontSize:14, color:C.muted }}>No sessions yet. Click "+ Schedule New" to create your first one.</p>
      )}

      {/* Create form */}
      {showForm && (
        <div style={{ borderTop: sessions.length > 0 ? `1px solid ${C.border}` : 'none', paddingTop: sessions.length > 0 ? 22 : 0 }}>
          <h3 style={{ fontFamily:F.display, fontSize:16, fontWeight:700, color:C.navy, marginBottom:14 }}>New Session</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <Field label="Title *" value={form.title} onChange={set('title')} placeholder="e.g. The Heart of the Gospel"/>
            <Field label="Date & time *" type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')}/>
            <Field label="Guest name" value={form.guest_name} onChange={set('guest_name')} placeholder="Who's joining you?"/>
          </div>
          <ImagePicker currentImage={form.cover_image} onSelect={url=>setForm(f=>({...f,cover_image:url}))}/>
          <TextArea label="Description" value={form.description} onChange={set('description')} placeholder="What will this conversation cover?"/>
          <TextArea label="Guest bio" value={form.guest_bio} onChange={set('guest_bio')} placeholder="Short bio for the guest"/>
          <Btn variant="gold" onClick={create} disabled={loading}>{loading?'Scheduling…':'Schedule Session'}</Btn>
          <p style={{ fontFamily:F.body, fontSize:12, color:C.muted, marginTop:12, lineHeight:1.6 }}>
            Tip: run your audio via this platform's live streaming. Guests can join via browser. The session page handles everything — live chat, Q&amp;A, and auto-recording.
          </p>
        </div>
      )}
    </Panel>
  )
}

// ── Blog Posts ────────────────────────────────────────────────

function PostsTab({ token }) {
  const [form, setForm] = useState({ title:'', excerpt:'', body:'', cover_image:'' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))

  const publish = async () => {
    if (!form.title.trim()||!form.body.trim()) return setMsg('❌ Title and content required')
    setLoading(true); setMsg('')
    const res = await fetch(`${API}/armchair/manage?type=post`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.id) { setMsg('✅ Post published!'); setForm({ title:'', excerpt:'', body:'', cover_image:'' }) }
    else setMsg(`❌ ${data.error}`)
    setLoading(false)
  }

  return (
    <Panel>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:18 }}>Write a Post</h2>
      <StatusMsg msg={msg}/>
      <Field label="Title *" value={form.title} onChange={set('title')} placeholder="Post title"/>
      <ImagePicker currentImage={form.cover_image} onSelect={url=>setForm(f=>({...f,cover_image:url}))}/>
      <TextArea label="Short excerpt" value={form.excerpt} onChange={set('excerpt')} placeholder="1–2 sentences shown in the feed…" rows={2}/>
      <TextArea label="Full post *" value={form.body} onChange={set('body')} placeholder="Write your reflection…" rows={10}/>
      <Btn variant="gold" onClick={publish} disabled={loading}>{loading?'Publishing…':'Publish Post'}</Btn>
    </Panel>
  )
}

// ── Daily Word ────────────────────────────────────────────────

function DailyWordTab({ token }) {
  const [form, setForm] = useState({ verse_ref:'', verse_text:'', theme:'', posted_date:'' })
  const [upcoming, setUpcoming] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))

  const loadUpcoming = () => {
    fetch(`${API}/admin/daily-words`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>setUpcoming(d.words||[])).catch(()=>{})
  }
  useEffect(loadUpcoming, [])

  const add = async () => {
    if (!form.verse_ref||!form.verse_text||!form.posted_date) return setMsg('❌ Reference, text, and date required')
    setLoading(true); setMsg('')
    const res = await fetch(`${API}/admin/daily-words`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.ok) { setMsg('✅ Verse added!'); setForm({ verse_ref:'', verse_text:'', theme:'', posted_date:'' }); loadUpcoming() }
    else setMsg(`❌ ${data.error}`)
    setLoading(false)
  }

  return (
    <Panel>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:18 }}>Daily Word</h2>
      <StatusMsg msg={msg}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <Field label="Verse reference *" value={form.verse_ref} onChange={set('verse_ref')} placeholder="e.g. John 3:16"/>
        <Field label="Date *" type="date" value={form.posted_date} onChange={set('posted_date')}/>
      </div>
      <TextArea label="Verse text *" value={form.verse_text} onChange={set('verse_text')} placeholder="The full verse text…" rows={3}/>
      <Field label="Theme / topic" value={form.theme} onChange={set('theme')} placeholder="e.g. The Nature of Christ"/>
      <Btn variant="gold" onClick={add} disabled={loading} style={{ marginTop:4 }}>{loading?'Saving…':'Add Verse'}</Btn>

      {upcoming.length > 0 && (
        <div style={{ marginTop:24 }}>
          <h3 style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Upcoming ({upcoming.length})</h3>
          <div style={{ display:'grid', gap:8 }}>
            {upcoming.slice(0,10).map((w,i)=>(
              <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 14px', background:C.parchment, borderRadius:8 }}>
                <span style={{ background:C.gold, color:C.navy, borderRadius:5, padding:'2px 9px', fontFamily:F.body, fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                  {new Date(w.posted_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                </span>
                <div>
                  <span style={{ fontFamily:F.body, fontSize:12.5, fontWeight:700, color:C.navy }}>{w.verse_ref}</span>
                  <span style={{ fontFamily:F.body, fontSize:11, color:C.muted, marginLeft:8 }}>{w.theme}</span>
                  <p style={{ fontFamily:F.body, fontSize:12, color:C.text, margin:'3px 0 0', lineHeight:1.5 }}>{w.verse_text.slice(0,90)}…</p>
                </div>
              </div>
            ))}
            {upcoming.length > 10 && <p style={{ fontFamily:F.body, fontSize:12.5, color:C.muted, textAlign:'center' }}>+{upcoming.length-10} more scheduled</p>}
          </div>
        </div>
      )}
    </Panel>
  )
}

// ── Moderation ────────────────────────────────────────────────

function ModerationTab({ token }) {
  const [flagged, setFlagged] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch(`${API}/armchair/moderation`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setFlagged(d.flagged||[]); setLoading(false) }).catch(()=>setLoading(false))
  }
  useEffect(load, [])

  const act = async (message_id, action) => {
    await fetch(`${API}/armchair/moderation`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ message_id, action }) })
    load()
  }

  return (
    <Panel>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:18 }}>Flagged Messages ({flagged.length})</h2>
      {loading ? <p style={{ fontFamily:F.body, color:C.muted }}>Loading…</p>
        : flagged.length === 0 ? <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted }}>No flagged messages — all clear! ✅</p>
        : <div style={{ display:'grid', gap:10 }}>
            {flagged.map(m=>(
              <div key={m.id} style={{ padding:'12px 16px', background:m.is_hidden?'#FEF2F2':C.parchment, borderRadius:10, border:`1px solid ${m.is_hidden?'#FECACA':C.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
                  <div>
                    <p style={{ fontFamily:F.body, fontSize:12, color:C.muted, marginBottom:4 }}>{m.display_name} · {m.flag_count} flag{m.flag_count!==1?'s':''} {m.is_hidden?'· HIDDEN':''}</p>
                    <p style={{ fontFamily:F.body, fontSize:13.5, color:C.text }}>{m.body}</p>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {m.is_hidden ? <Btn variant="outline" onClick={()=>act(m.id,'restore')}>Restore</Btn>
                                 : <Btn variant="outline" onClick={()=>act(m.id,'remove')}>Hide</Btn>}
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </Panel>
  )
}

// ── Shared ────────────────────────────────────────────────────

function Panel({ children }) {
  return <div style={{ background:'#fff', borderRadius:14, padding:28, border:`1px solid ${C.border}` }}>{children}</div>
}
