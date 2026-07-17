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
    <div style={{ maxWidth:860, margin:'0 auto', padding:'36px 20px 80px', minHeight:'100vh', background:'#0a0f1e' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Logo size={28}/>
        <h1 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:'#fff' }}>Admin Panel</h1>
      </div>
      <div style={{ display:'flex', gap:7, marginBottom:26, flexWrap:'wrap' }}>
        {[['sessions','Live Sessions'],['posts','Blog Posts'],['daily','Daily Word'],['auto','Auto Content'],['digest','Email Digest'],['announce','Announcements'],['content','Content Manager'],['moderation','Moderation']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ background:tab===k?C.gold:'rgba(255,255,255,0.08)', color:tab===k?C.navy:'rgba(255,255,255,0.75)', border:`1.5px solid ${tab===k?C.gold:'rgba(255,255,255,0.15)'}`, borderRadius:8, padding:'8px 16px', fontFamily:F.body, fontSize:13, fontWeight:600, cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      {tab === 'sessions'    && <SessionsTab token={token}/>}
      {tab === 'posts'       && <PostsTab token={token}/>}
      {tab === 'daily'       && <DailyWordTab token={token}/>}
      {tab === 'auto'        && <AutoContentTab token={token}/>}
      {tab === 'digest'      && <DigestTab token={token}/>}
      {tab === 'announce'    && <AnnouncementTab token={token}/>}
      {tab === 'content'     && <ContentManagerTab token={token}/>}
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
  const [form, setForm] = useState({ title:'', description:'', guest_name:'', guest_bio:'', cover_image:'', scheduled_at:'', zoom_link:'' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [editSession, setEditSession] = useState(null)

  const openEdit = (s) => {
    setEditSession(s)
    setForm({ title:s.title||'', description:s.description||'', guest_name:s.guest_name||'', guest_bio:s.guest_bio||'', cover_image:s.cover_image||'', scheduled_at:s.scheduled_at||'', zoom_link:s.zoom_link||'' })
    setShowForm(true)
  }

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this session and all its messages? This cannot be undone.')) return
    await fetch(`/api/armchair/manage?session_id=${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } })
    setMsg('✅ Session deleted')
    loadSessions()
  }

  const saveEdit = async () => {
    if (!editSession) return
    const res = await fetch('/api/armchair/manage', { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(editSession) })
    const data = await res.json()
    if (data.ok) { setMsg('✅ Session updated'); setEditSession(null); loadSessions() }
    else setMsg(`❌ ${data.error}`)
  }

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
    if (data.id) { setMsg('✅ Session scheduled!'); setShowForm(false); setForm({ title:'', description:'', guest_name:'', guest_bio:'', cover_image:'', scheduled_at:'', zoom_link:'' }); loadSessions() }
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
        <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:'#fff' }}>Live Sessions</h2>
        <Btn variant="gold" onClick={()=>setShowForm(s=>!s)}>{showForm?'Cancel':'+ Schedule New'}</Btn>
      </div>
      <StatusMsg msg={msg}/>

      {/* All sessions list */}
      {sessions.length > 0 && (
        <div style={{ marginBottom: showForm ? 24 : 0 }}>
          <div style={{ display:'grid', gap:10 }}>
            {sessions.map(s=>(
              <div key={s.id} style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'stretch', gap:0, flexWrap:'wrap' }}>
                {s.cover_image && (
                  <div style={{ width:80, minHeight:70, backgroundImage:`url(${s.cover_image})`, backgroundSize:'cover', backgroundPosition:'center', flexShrink:0 }}/>
                )}
                <div style={{ flex:1, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                    <span style={{ background:STATUS_COLOR[s.status]+'22', color:STATUS_COLOR[s.status], border:`1px solid ${STATUS_COLOR[s.status]}55`, borderRadius:4, padding:'1px 8px', fontSize:11, fontFamily:F.body, fontWeight:700 }}>{STATUS_LABEL[s.status]}</span>
                  </div>
                  <p style={{ fontFamily:F.display, fontSize:14.5, fontWeight:700, color:'#fff', marginBottom:2 }}>{s.title}</p>
                  {s.guest_name && <p style={{ fontFamily:F.body, fontSize:12, color:'rgba(255,255,255,0.55)' }}>with {s.guest_name}</p>}
                  {s.scheduled_at && <p style={{ fontFamily:F.body, fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{new Date(s.scheduled_at).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>}
                </div>
                <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
                  {s.status === 'scheduled' && <Btn variant="primary" onClick={()=>updateStatus(s.id,'live')}>🔴 Go Live</Btn>}
                  {s.status === 'live'      && <Btn variant="outline" onClick={()=>updateStatus(s.id,'ended')}>⏹ End Session</Btn>}
                  {s.status === 'ended'     && <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>Complete</span>}
                  <button onClick={()=>navigate(`/armchair/session/${s.id}`)} style={{ background:'none', border:'none', color:C.gold, fontFamily:F.body, fontSize:12.5, fontWeight:600, cursor:'pointer', padding:0 }}>Open →</button>
                  <button onClick={()=>openEdit(s)} style={{ background:'none', border:'1px solid rgba(255,255,255,0.2)', borderRadius:6, color:'rgba(255,255,255,0.7)', fontFamily:F.body, fontSize:12, cursor:'pointer', padding:'3px 9px' }}>Edit</button>
                  <button onClick={()=>deleteSession(s.id)} style={{ background:'none', border:'1px solid #FECACA', borderRadius:6, color:'#DC2626', fontFamily:F.body, fontSize:12, cursor:'pointer', padding:'3px 9px' }}>Delete</button>
                </div>
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
          {editSession ? <h3 style={{ fontFamily:F.display, fontSize:16, fontWeight:700, color:C.gold, marginBottom:14 }}>Edit Session</h3> : <h3 style={{ fontFamily:F.display, fontSize:16, fontWeight:700, color:'#fff', marginBottom:14 }}>New Session</h3>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <Field label="Title *" value={form.title} onChange={set('title')} placeholder="e.g. The Heart of the Gospel"/>
            <Field label="Date & time *" type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')}/>
            <Field label="Guest name" value={form.guest_name} onChange={set('guest_name')} placeholder="Who's joining you?"/>
            <Field label="Zoom / video link (optional)" value={form.zoom_link} onChange={set('zoom_link')} placeholder="https://zoom.us/j/..."/>
          </div>
          <ImagePicker currentImage={form.cover_image} onSelect={url=>setForm(f=>({...f,cover_image:url}))}/>
          <TextArea label="Description" value={form.description} onChange={set('description')} placeholder="What will this conversation cover?"/>
          <TextArea label="Guest bio" value={form.guest_bio} onChange={set('guest_bio')} placeholder="Short bio for the guest"/>
          <Btn variant="gold" onClick={async ()=>{
            if (editSession) {
              setLoading(true)
              const res = await fetch('/api/armchair/manage', { method:'PATCH', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({id:editSession.id,...form}) })
              const data = await res.json()
              if (data.ok) { setMsg('✅ Session updated!'); setShowForm(false); setEditSession(null); setForm({ title:'', description:'', guest_name:'', guest_bio:'', cover_image:'', scheduled_at:'', zoom_link:'' }); loadSessions() }
              else setMsg(`❌ ${data.error}`)
              setLoading(false)
            } else { create() }
          }} disabled={loading}>{loading ? 'Saving…' : editSession ? 'Save Changes' : 'Schedule Session'}</Btn>
          {editSession && <Btn variant="ghost" onClick={()=>{ setEditSession(null); setShowForm(false); setForm({ title:'', description:'', guest_name:'', guest_bio:'', cover_image:'', scheduled_at:'', zoom_link:'' }) }} style={{ marginLeft:8 }}>Cancel Edit</Btn>}
          <p style={{ fontFamily:F.body, fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:12, lineHeight:1.6 }}>
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
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:'#fff', marginBottom:18 }}>Write a Post</h2>
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
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:'#fff', marginBottom:18 }}>Daily Word</h2>
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
          <h3 style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Upcoming ({upcoming.length})</h3>
          <div style={{ display:'grid', gap:8 }}>
            {upcoming.slice(0,10).map((w,i)=>(
              <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 14px', background:'rgba(255,255,255,0.06)', borderRadius:8 }}>
                <span style={{ background:C.gold, color:'#fff', borderRadius:5, padding:'2px 9px', fontFamily:F.body, fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                  {new Date(w.posted_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                </span>
                <div>
                  <span style={{ fontFamily:F.body, fontSize:12.5, fontWeight:700, color:'#fff' }}>{w.verse_ref}</span>
                  <span style={{ fontFamily:F.body, fontSize:11, color:'rgba(255,255,255,0.6)', marginLeft:8 }}>{w.theme}</span>
                  <p style={{ fontFamily:F.body, fontSize:12, color:'#E8E0D0', margin:'3px 0 0', lineHeight:1.5 }}>{w.verse_text.slice(0,90)}…</p>
                </div>
              </div>
            ))}
            {upcoming.length > 10 && <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.55)', textAlign:'center' }}>+{upcoming.length-10} more scheduled</p>}
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
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:'#fff', marginBottom:18 }}>Flagged Messages ({flagged.length})</h2>
      {loading ? <p style={{ fontFamily:F.body, color:C.muted }}>Loading…</p>
        : flagged.length === 0 ? <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted }}>No flagged messages — all clear! ✅</p>
        : <div style={{ display:'grid', gap:10 }}>
            {flagged.map(m=>(
              <div key={m.id} style={{ padding:'12px 16px', background:m.is_hidden?'#FEF2F2':C.parchment, borderRadius:10, border:`1px solid ${m.is_hidden?'#FECACA':C.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
                  <div>
                    <p style={{ fontFamily:F.body, fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>{m.display_name} · {m.flag_count} flag{m.flag_count!==1?'s':''} {m.is_hidden?'· HIDDEN':''}</p>
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

// ── Auto Content ─────────────────────────────────────────────

function AutoContentTab({ token }) {
  const [count, setCount] = useState(3)
  const [category, setCategory] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const CATS = [
    { slug:'', label:'Mix of all categories' },
    { slug:'exegesis', label:'Deep Dive' },
    { slug:'seekers', label:"Seekers' Corner" },
    { slug:'prayer', label:'Prayer & Life' },
    { slug:'theology', label:'Theology' },
    { slug:'prophecy', label:'Prophecy' },
  ]

  const generate = async () => {
    setLoading(true); setMsg(''); setResults([])
    try {
      const res = await fetch(`/api/admin/auto-content`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ count, category: category || null })
      })
      const data = await res.json()
      if (data.ok) {
        setMsg(`✅ Generated ${data.generated} new discussion${data.generated !== 1 ? 's' : ''}`)
        setResults(data.threads || [])
      } else {
        setMsg(`❌ ${data.error}`)
      }
    } catch (e) {
      setMsg(`❌ ${e.message}`)
    }
    setLoading(false)
  }

  return (
    <Panel>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:'#fff', marginBottom:6 }}>Auto Content Engine</h2>
      <p style={{ fontFamily:F.body, fontSize:13.5, color:'rgba(255,255,255,0.6)', marginBottom:20, lineHeight:1.6 }}>
        Uses Claude AI to generate high-quality discussion threads based on the most-searched global faith questions. Runs automatically every week, or trigger it manually here. Each thread is written as a thoughtful opening post that invites real community engagement.
      </p>

      <StatusMsg msg={msg}/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
        <div>
          <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:'#fff', display:'block', marginBottom:6 }}>Number to generate (1–5)</label>
          <input type="number" min={1} max={5} value={count} onChange={e=>setCount(Math.min(5,Math.max(1,parseInt(e.target.value)||1)))}
            style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:14, outline:'none' }}/>
        </div>
        <div>
          <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:'#fff', display:'block', marginBottom:6 }}>Category focus</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:14, outline:'none', background:'#fff' }}>
            {CATS.map(c=><option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <Btn variant="gold" onClick={generate} disabled={loading}>
        {loading ? '✍️ Generating… (this takes 20–30 seconds)' : '✍️ Generate Discussions Now'}
      </Btn>

      {results.length > 0 && (
        <div style={{ marginTop:20 }}>
          <h3 style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:'#fff', marginBottom:10 }}>Just created:</h3>
          <div style={{ display:'grid', gap:8 }}>
            {results.map((t,i)=>(
              <div key={i} style={{ padding:'10px 14px', background:'rgba(255,255,255,0.06)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <span style={{ fontFamily:F.body, fontSize:11, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{t.category}</span>
                  <p style={{ fontFamily:F.display, fontSize:14, fontWeight:700, color:'#fff', margin:'2px 0 0' }}>{t.title}</p>
                </div>
                <a href={`/thread/${t.id}`} target="_blank" rel="noreferrer" style={{ color:C.gold, fontFamily:F.body, fontSize:12.5, fontWeight:600, whiteSpace:'nowrap', marginLeft:12 }}>View →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop:24, padding:'16px', background:'rgba(255,255,255,0.05)', borderRadius:10 }}>
        <p style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:'#fff', marginBottom:8 }}>⚙️ Weekly rotation schedule</p>
        {(() => {
          const DOMAINS = ['exegesis','seekers','prayer','theology','prophecy']
          const LABELS = { exegesis:'Deep Dive', seekers:"Seekers' Corner", prayer:'Prayer & Life', theology:'Theology', prophecy:'Prophecy' }
          const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
          const thisWeek = DOMAINS[weekNum % DOMAINS.length]
          const nextWeek = DOMAINS[(weekNum + 1) % DOMAINS.length]
          return (
            <div>
              <p style={{ fontFamily:F.body, fontSize:12.5, color:'#E8E0D0', marginBottom:6 }}>
                <strong>This week:</strong> <span style={{ color:C.gold, fontWeight:600 }}>{LABELS[thisWeek]}</span> — 3 auto-threads will be generated
              </p>
              <p style={{ fontFamily:F.body, fontSize:12.5, color:'#E8E0D0', marginBottom:10 }}>
                <strong>Next week:</strong> {LABELS[nextWeek]}
              </p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {DOMAINS.map((d,i) => (
                  <span key={d} style={{ background: d===thisWeek ? C.navy : '#fff', color: d===thisWeek ? '#fff' : C.muted, border:`1px solid ${d===thisWeek ? C.navy : C.border}`, borderRadius:6, padding:'3px 10px', fontFamily:F.body, fontSize:11.5, fontWeight: d===thisWeek ? 700 : 400 }}>
                    Week {(weekNum % 5 === i) ? '▶ ' : ''}{LABELS[d]}
                  </span>
                ))}
              </div>
              <p style={{ fontFamily:F.body, fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:10, lineHeight:1.6 }}>
                All auto-generated threads are posted by "Global Discussions (Auto)" and marked transparently at the bottom of each post. The full cycle repeats every 5 weeks.
              </p>
            </div>
          )
        })()}
      </div>
    </Panel>
  )
}

// ── Announcements ─────────────────────────────────────────────

function AnnouncementTab({ token }) {
  const [text, setText] = useState('')
  const [type, setType] = useState('info')
  const [hours, setHours] = useState(24)
  const [current, setCurrent] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => {
    fetch('/api/announcement').then(r=>r.json()).then(d=>setCurrent(d.announcement)).catch(()=>{})
  }
  useEffect(load, [])

  const post = async () => {
    if (!text.trim()) return setMsg('❌ Announcement text required')
    setLoading(true); setMsg('')
    const res = await fetch('/api/announcement', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ text, type, expires_hours: hours }) })
    const data = await res.json()
    if (data.ok) { setMsg('✅ Announcement posted!'); setText(''); load() }
    else setMsg(`❌ ${data.error}`)
    setLoading(false)
  }

  const remove = async () => {
    await fetch('/api/announcement', { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } })
    setMsg('✅ Announcement removed')
    setCurrent(null)
  }

  const TYPE_OPTS = [{ v:'info',l:'ℹ️ Info (blue)' },{ v:'success',l:'✅ Success (green)' },{ v:'warning',l:'⚠️ Warning (amber)' },{ v:'gold',l:'📢 Gold (navy/gold — most prominent)' }]

  return (
    <Panel>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:'#fff', marginBottom:6 }}>Site Announcements</h2>
      <p style={{ fontFamily:F.body, fontSize:13.5, color:'rgba(255,255,255,0.6)', marginBottom:20 }}>Post a banner that appears at the top of every page for all visitors. Users can dismiss it.</p>
      <StatusMsg msg={msg}/>

      {current && (
        <div style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${C.gold}55`, borderRadius:10, padding:'14px 16px', marginBottom:20 }}>
          <p style={{ fontFamily:F.body, fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Currently live</p>
          <p style={{ fontFamily:F.body, fontSize:14, color:'#E8E0D0', marginBottom:8 }}>{current.text}</p>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>Type: {current.type} · Posted: {new Date(current.created_at).toLocaleString('en-GB')}</span>
            {current.expires_at && <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>Expires: {new Date(current.expires_at).toLocaleString('en-GB')}</span>}
            <Btn variant="outline" onClick={remove} style={{ borderColor:'#DC2626', color:'#DC2626', padding:'4px 12px', fontSize:12 }}>Remove</Btn>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gap:12, marginBottom:16 }}>
        <div>
          <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:'#fff', display:'block', marginBottom:6 }}>Announcement text *</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="e.g. 🎙 Our next Armchair session is this Sunday at 7pm — join us live!" rows={3}
            style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none', resize:'vertical', boxSizing:'border-box', background:'rgba(255,255,255,0.08)', color:'#fff', colorScheme:'dark', pointerEvents:'auto', colorScheme:'dark', pointerEvents:'auto' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:'#fff', display:'block', marginBottom:6 }}>Style</label>
            <select value={type} onChange={e=>setType(e.target.value)} style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:13.5, outline:'none', background:'rgba(255,255,255,0.08)', color:'#fff', colorScheme:'dark', pointerEvents:'auto', colorScheme:'dark', pointerEvents:'auto' }}>
              {TYPE_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:'#fff', display:'block', marginBottom:6 }}>Auto-expire after</label>
            <select value={hours} onChange={e=>setHours(parseInt(e.target.value))} style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:13.5, outline:'none', background:'rgba(255,255,255,0.08)', color:'#fff', colorScheme:'dark', pointerEvents:'auto', colorScheme:'dark', pointerEvents:'auto' }}>
              {[[1,'1 hour'],[6,'6 hours'],[12,'12 hours'],[24,'24 hours'],[48,'2 days'],[168,'1 week']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>
      <Btn variant="gold" onClick={post} disabled={loading}>{loading?'Posting…':'Post Announcement'}</Btn>
    </Panel>
  )
}

// ── Email Digest ──────────────────────────────────────────────

function DigestTab({ token }) {
  const [info, setInfo] = useState(null)
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/admin/digest', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setInfo(d)).catch(() => {})
  }, [])

  const sendDigest = async () => {
    setSending(true); setMsg('')
    const res = await fetch('/api/admin/digest', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    const data = await res.json()
    if (data.ok) setMsg(`✅ Sent to ${data.sent} of ${data.total} subscribers`)
    else setMsg(`❌ ${data.error}`)
    setSending(false)
  }

  return (
    <Panel>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:'#fff', marginBottom:6 }}>Weekly Email Digest</h2>
      <p style={{ fontFamily:F.body, fontSize:13.5, color:'rgba(255,255,255,0.6)', marginBottom:20, lineHeight:1.6 }}>
        Sends a beautiful email to all members showing the top discussions from the past week. Run manually here or set up a weekly cron trigger.
      </p>
      <StatusMsg msg={msg}/>

      {info && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'14px 16px' }}>
            <p style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:'#fff', margin:'0 0 2px' }}>{info.subscriberCount}</p>
            <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.55)', margin:0 }}>Email subscribers</p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'14px 16px' }}>
            <p style={{ fontFamily:F.display, fontSize:16, fontWeight:700, color:info.hasEmailProvider?'#15803D':'#DC2626', margin:'0 0 2px' }}>
              {info.hasEmailProvider ? '✅ Connected' : '❌ Not set up'}
            </p>
            <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.55)', margin:0 }}>Email provider: {info.provider}</p>
          </div>
        </div>
      )}

      {info && !info.hasEmailProvider && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'14px 16px', marginBottom:18 }}>
          <p style={{ fontFamily:F.body, fontSize:13.5, color:'#DC2626', fontWeight:600, marginBottom:6 }}>Email provider not configured</p>
          <p style={{ fontFamily:F.body, fontSize:13, color:'#991B1B', lineHeight:1.6, margin:0 }}>
            1. Sign up free at <strong>resend.com</strong> (3,000 emails/month free)<br/>
            2. Add your domain and get an API key<br/>
            3. Add <code style={{ background:'rgba(255,255,255,0.06)', padding:'1px 5px', borderRadius:3 }}>RESEND_API_KEY</code> to Cloudflare environment variables<br/>
            4. Verify <code>noreply@discussionsexegetica.com</code> as your sender
          </p>
        </div>
      )}

      <Btn variant="gold" onClick={sendDigest} disabled={sending || (info && !info.hasEmailProvider)}>
        {sending ? '📨 Sending…' : '📨 Send Weekly Digest Now'}
      </Btn>

      <div style={{ marginTop:24, padding:'14px 16px', background:'rgba(255,255,255,0.05)', borderRadius:10 }}>
        <p style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:'#fff', marginBottom:6 }}>⚙️ Automate weekly sends</p>
        <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
          Add a GitHub Actions scheduled job to send automatically every Sunday at 7am UTC.<br/>
          Cron: <code style={{ background:'rgba(255,255,255,0.06)', padding:'1px 5px', borderRadius:3 }}>0 7 * * 0</code> → POST to <code style={{ background:'rgba(255,255,255,0.06)', padding:'1px 5px', borderRadius:3 }}>/api/admin/digest</code> with header <code>X-Cron-Secret</code>
        </p>
      </div>
    </Panel>
  )
}

// ── Content Manager ───────────────────────────────────────────

function ContentManagerTab({ token }) {
  const [type, setType] = useState('threads')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, type, label }

  const TYPES = [
    { key: 'threads', label: 'Threads' },
    { key: 'replies', label: 'Replies' },
    { key: 'users', label: 'Users' },
    { key: 'armchair_posts', label: 'Blog Posts' },
    { key: 'armchair_session', label: 'Sessions' },
    { key: 'groups', label: 'Groups' },
  ]

  const load = async () => {
    setLoading(true)
    const q = search ? `&q=${encodeURIComponent(search)}` : ''
    const res = await fetch(`/api/admin/content?type=${type}&page=${page}${q}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setItems(data.items || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [type, page])

  const doDelete = async () => {
    if (!confirmDelete) return
    setMsg('')
    const res = await fetch(`/api/admin/content`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: confirmDelete.type, id: confirmDelete.id })
    })
    const data = await res.json()
    setMsg(data.ok ? `✅ ${data.message}` : `❌ ${data.error}`)
    setConfirmDelete(null)
    load()
  }

  const getLabel = item => {
    if (type === 'threads') return item.title
    if (type === 'replies') return item.body?.slice(0, 80) + '…'
    if (type === 'users') return `${item.display_name} (@${item.username})`
    if (type === 'armchair_posts') return item.title
    if (type === 'groups') return item.name
    return item.title || item.name || `#${item.id}`
  }

  const getSingular = t => ({ threads:'thread', replies:'reply', users:'user', armchair_posts:'armchair_post', armchair_session:'armchair_session', groups:'group' }[t] || t)

  return (
    <Panel>
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:'#fff', marginBottom:6 }}>Content Manager</h2>
      <p style={{ fontFamily:F.body, fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:18 }}>Review and delete any content from the platform without touching the database.</p>

      <StatusMsg msg={msg}/>

      {/* Type selector */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {TYPES.map(t => (
          <button key={t.key} onClick={() => { setType(t.key); setPage(1); setSearch('') }}
            style={{ background:type===t.key?C.navy:'#fff', color:type===t.key?'#fff':C.muted, border:`1.5px solid ${type===t.key?C.navy:C.border}`, borderRadius:7, padding:'6px 14px', fontFamily:F.body, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
            {t.label} {type===t.key && total > 0 ? `(${total})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && load()}
          placeholder={`Search ${type}…`}
          style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:8, padding:'8px 12px', fontFamily:F.body, fontSize:13.5, outline:'none' }}/>
        <Btn variant="outline" onClick={load}>Search</Btn>
      </div>

      {/* Confirm dialog */}
      {confirmDelete && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
          <p style={{ fontFamily:F.body, fontSize:13.5, color:'#DC2626', marginBottom:10 }}>
            ⚠️ Delete this {getSingular(type)}? <strong>"{confirmDelete.label.slice(0,60)}"</strong> — this cannot be undone.
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="outline" onClick={doDelete} style={{ borderColor:'#DC2626', color:'#DC2626' }}>Yes, delete</Btn>
            <Btn variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Items list */}
      {loading ? <p style={{ fontFamily:F.body, color:C.muted }}>Loading…</p> : items.length === 0
        ? <p style={{ fontFamily:F.body, color:'rgba(255,255,255,0.6)', fontSize:14 }}>No {type} found.</p>
        : (
          <div style={{ display:'grid', gap:8 }}>
            {items.map(item => (
              <div key={item.id} style={{ padding:'12px 14px', background:'rgba(255,255,255,0.06)', borderRadius:9, border:`1px solid ${C.border}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:F.body, fontSize:13.5, fontWeight:600, color:'#fff', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {getLabel(item)}
                  </p>
                  <p style={{ fontFamily:F.body, fontSize:11.5, color:'rgba(255,255,255,0.6)', margin:0 }}>
                    {item.display_name && `By ${item.display_name} · `}
                    {item.reply_count !== undefined && `${item.reply_count} replies · `}
                    {item.thread_count !== undefined && `${item.thread_count} threads · `}
                    {item.member_count !== undefined && `${item.member_count} members · `}
                    {item.created_at && new Date(item.created_at).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}
                  </p>
                  {type === 'replies' && item.thread_title && (
                    <p style={{ fontFamily:F.body, fontSize:11, color:'rgba(255,255,255,0.6)', margin:'3px 0 0' }}>In: {item.thread_title}</p>
                  )}
                </div>
                <button
                  onClick={() => setConfirmDelete({ id: item.id, type: getSingular(type), label: getLabel(item) })}
                  style={{ background:'none', border:`1px solid #FECACA`, borderRadius:6, padding:'4px 10px', fontFamily:F.body, fontSize:12, color:'#DC2626', cursor:'pointer', flexShrink:0 }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )
      }

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'center' }}>
          <Btn variant="ghost" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>← Prev</Btn>
          <span style={{ fontFamily:F.body, fontSize:13, color:'rgba(255,255,255,0.6)', alignSelf:'center' }}>Page {page}</span>
          <Btn variant="ghost" onClick={() => setPage(p => p+1)} disabled={items.length < 20}>Next →</Btn>
        </div>
      )}
    </Panel>
  )
}

// ── Shared ────────────────────────────────────────────────────

function Panel({ children }) {
  return <div style={{ background:'#1a2035', borderRadius:14, padding:28, border:'1px solid rgba(201,168,76,0.18)', position:'relative', isolation:'isolate', marginBottom:24 }}>{children}</div>
}
