// ─── ForumPage ───────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, BadgeTag, CategoryPill, Spinner, Btn } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

const ALL_CATS = [
  {slug:'all',label:'All Topics',icon:'✦'},{slug:'exegesis',label:'Deep Dive',icon:'📖'},
  {slug:'seekers',label:"Seekers' Corner",icon:'🌱'},{slug:'prayer',label:'Prayer & Life',icon:'🙏'},
  {slug:'prophecy',label:'Prophecy',icon:'🕊️'},{slug:'theology',label:'Theology',icon:'⚡'},
  {slug:'resources',label:'Resources',icon:'📚'},
]

export function ForumPage() {
  usePageTitle('Forum')
  const { category='all' } = useParams()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    const q = category !== 'all' ? `?category=${category}` : ''
    fetch(`${API}/threads${q}`).then(r=>r.json()).then(d=>{ setThreads(d.threads||[]); setLoading(false) }).catch(()=>setLoading(false))
  }, [category])

  const filtered = threads.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'36px 20px 60px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.navy, marginBottom:4 }}>The Forum</h1>
          <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted }}>{filtered.length} discussion{filtered.length!==1?'s':''} · Join in, ask freely, share deeply</p>
        </div>
        {user ? <Btn variant="gold" onClick={()=>navigate('/new-thread')}>+ Start a Discussion</Btn>
               : <Link to="/register" style={{ background:C.gold, color:C.navy, borderRadius:8, padding:'9px 18px', fontFamily:F.body, fontSize:13, fontWeight:700 }}>Join to Post</Link>}
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search discussions…" style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontFamily:F.body, fontSize:14, outline:'none', background:'#fff', marginBottom:14, boxSizing:'border-box' }}/>

      <div style={{ display:'flex', gap:7, marginBottom:22, overflowX:'auto', paddingBottom:4 }}>
        {ALL_CATS.map(cat=>(
          <CategoryPill key={cat.slug} label={cat.label} icon={cat.icon} active={category===cat.slug}
            onClick={()=>navigate(cat.slug==='all'?'/forum':`/forum/${cat.slug}`)}/>
        ))}
      </div>

      {loading ? <Spinner/> : (
        <div style={{ display:'grid', gap:12 }}>
          {filtered.length > 0 ? filtered.map(t=><ThreadCard key={t.id} thread={t} onClick={()=>navigate(`/thread/${t.id}`)}/>)
            : <div style={{ textAlign:'center', padding:'52px 0', color:C.muted, fontFamily:F.body }}>
                No discussions found. {user ? <Link to="/new-thread" style={{ color:C.gold, fontWeight:600 }}>Start one →</Link> : <Link to="/register" style={{ color:C.gold, fontWeight:600 }}>Join and start one →</Link>}
              </div>
          }
        </div>
      )}
    </div>
  )
}

function ThreadCard({ thread, onClick }) {
  return (
    <Card style={{ cursor:'pointer', border:`1px solid ${thread.is_pinned?C.gold+'55':C.border}` }}>
      <div onClick={onClick}>
        <div style={{ display:'flex', gap:8, marginBottom:7 }}>
          <span style={{ background:C.mist, color:C.navyLight, borderRadius:6, padding:'2px 9px', fontSize:11, fontFamily:F.body, fontWeight:600 }}>{thread.cat_label}</span>
          {thread.is_pinned===1 && <span style={{ fontSize:11, color:C.gold, fontWeight:700 }}>📌 Featured</span>}
        </div>
        <h3 style={{ fontFamily:F.display, fontSize:16.5, fontWeight:700, color:C.navy, margin:'0 0 6px', lineHeight:1.35 }}>{thread.title}</h3>
        <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, margin:'0 0 12px', lineHeight:1.6 }}>{thread.body?.slice(0,180)}…</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Avatar name={thread.display_name} color={thread.avatar_color} size={24}/>
            <span style={{ fontFamily:F.body, fontSize:12, fontWeight:500 }}>{thread.display_name}</span>
            <BadgeTag label={thread.badge}/>
            <span style={{ fontFamily:F.body, fontSize:11, color:C.muted }}>{new Date(thread.created_at).toLocaleDateString('en-GB')}</span>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <span style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>💬 {thread.reply_count}</span>
            <span style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>👁 {thread.view_count}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── ThreadPage ──────────────────────────────────────────────

export function ThreadPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [copied, setCopied] = useState(false)

  usePageTitle(thread?.title)

  const load = () => {
    fetch(`${API}/threads/${id}/replies`).then(r=>r.json()).then(d=>{ setReplies(d.replies||[]); setThread(d.thread||null); setLoading(false) }).catch(()=>setLoading(false))
  }
  useEffect(load, [id])

  const post = async () => {
    if (!body.trim()) return
    setPosting(true)
    const res = await fetch(`${API}/threads/${id}/replies`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ body }) })
    const data = await res.json()
    if (data.ok) { setBody(''); load() }
    setPosting(false)
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) { try { await navigator.share({ title: thread?.title, url }) } catch {} }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  }

  if (loading) return <div style={{ maxWidth:800, margin:'40px auto' }}><Spinner/></div>
  if (!thread) return <div style={{ textAlign:'center', padding:'80px', fontFamily:F.body, color:C.muted }}>Not found. <Link to="/forum" style={{ color:C.gold }}>Back to forum</Link></div>

  return (
    <div style={{ maxWidth:820, margin:'0 auto', padding:'32px 20px 60px' }}>
      <button onClick={()=>navigate('/forum')} style={{ background:'none', border:'none', color:C.navyLight, fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:'pointer', marginBottom:22, padding:0 }}>← Back to Forum</button>

      <Card style={{ marginBottom:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <span style={{ background:C.mist, color:C.navyLight, borderRadius:6, padding:'2px 9px', fontSize:11, fontFamily:F.body, fontWeight:600 }}>{thread.cat_label}</span>
          <button onClick={share} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 12px', fontFamily:F.body, fontSize:12, color:C.muted, cursor:'pointer' }}>{copied?'✓ Copied!':'🔗 Share'}</button>
        </div>
        <h1 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:C.navy, margin:'0 0 14px', lineHeight:1.3 }}>{thread.title}</h1>
        <p style={{ fontFamily:F.body, fontSize:15, color:C.text, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{thread.body}</p>
      </Card>

      <h2 style={{ fontFamily:F.display, fontSize:17, fontWeight:700, color:C.navy, margin:'24px 0 14px' }}>{replies.length} {replies.length===1?'Reply':'Replies'}</h2>

      {replies.map(r=>(
        <div key={r.id} style={{ background:'#fff', borderRadius:10, padding:'16px 18px', marginBottom:10, border:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
            <Avatar name={r.display_name} color={r.avatar_color} size={28}/>
            <span style={{ fontFamily:F.body, fontSize:13, fontWeight:600 }}>{r.display_name}</span>
            <BadgeTag label={r.badge}/>
            <span style={{ fontFamily:F.body, fontSize:11, color:C.muted }}>{new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
          </div>
          <p style={{ fontFamily:F.body, fontSize:14.5, color:C.text, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{r.body}</p>
        </div>
      ))}

      <div style={{ background:'#fff', borderRadius:12, padding:'20px 20px', border:`1px solid ${C.border}`, marginTop:20 }}>
        <p style={{ fontFamily:F.display, fontSize:15, fontWeight:700, color:C.navy, marginBottom:12 }}>Add your voice</p>
        {!user ? <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted }}><Link to="/login" style={{ color:C.gold, fontWeight:600 }}>Sign in</Link> or <Link to="/register" style={{ color:C.gold, fontWeight:600 }}>join free</Link> to reply.</p>
          : <>
              <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Share your reflection, question, or insight…" rows={4} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:14, resize:'vertical', outline:'none', marginBottom:10, boxSizing:'border-box' }}/>
              <Btn onClick={post} disabled={posting||!body.trim()}>{posting?'Posting…':'Post Reply'}</Btn>
            </>
        }
      </div>
    </div>
  )
}

// ─── NewThreadPage ───────────────────────────────────────────

export function NewThreadPage() {
  usePageTitle('Start a Discussion')
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title:'', body:'', category_slug:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return <div style={{ textAlign:'center', padding:'80px 24px', fontFamily:F.body, color:C.muted }}>Please <Link to="/login" style={{ color:C.gold, fontWeight:600 }}>sign in</Link> to start a discussion.</div>

  const submit = async () => {
    if (!form.title.trim()||!form.body.trim()||!form.category_slug) return setError('Please fill in all fields and choose a category.')
    setLoading(true); setError('')
    const res = await fetch(`${API}/threads`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.id) navigate(`/thread/${data.id}`)
    else { setError(data.error||'Something went wrong'); setLoading(false) }
  }

  return (
    <div style={{ maxWidth:720, margin:'36px auto', padding:'0 20px 60px' }}>
      <button onClick={()=>navigate('/forum')} style={{ background:'none', border:'none', color:C.navyLight, fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:'pointer', marginBottom:24, padding:0 }}>← Back to Forum</button>
      <h1 style={{ fontFamily:F.display, fontSize:24, fontWeight:700, color:C.navy, marginBottom:6 }}>Start a Discussion</h1>
      <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted, marginBottom:24 }}>Ask a question, share an insight, or open a passage for study. All perspectives welcome.</p>
      {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px', fontFamily:F.body, fontSize:13, color:'#DC2626', marginBottom:16 }}>{error}</div>}
      <div style={{ marginBottom:18 }}>
        <label style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, display:'block', marginBottom:8 }}>Category *</label>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {ALL_CATS.filter(c=>c.slug!=='all').map(cat=>(
            <button key={cat.slug} onClick={()=>setForm(f=>({...f,category_slug:cat.slug}))} style={{ background:form.category_slug===cat.slug?C.navy:'#fff', color:form.category_slug===cat.slug?'#fff':C.muted, border:`1.5px solid ${form.category_slug===cat.slug?C.navy:C.border}`, borderRadius:20, padding:'6px 14px', fontFamily:F.body, fontSize:12.5, cursor:'pointer' }}>{cat.icon} {cat.label}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, display:'block', marginBottom:6 }}>Title *</label>
        <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. What does 'logos' really mean in John 1:1?" maxLength={200} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none', boxSizing:'border-box' }}/>
      </div>
      <div style={{ marginBottom:22 }}>
        <label style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, display:'block', marginBottom:6 }}>Your opening post *</label>
        <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Share your question, reflection, or insight…" rows={8} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:14, resize:'vertical', outline:'none', lineHeight:1.7, boxSizing:'border-box' }}/>
      </div>
      <Btn variant="gold" onClick={submit} disabled={loading} style={{ fontSize:14.5, padding:'11px 26px' }}>{loading?'Posting…':'Post Discussion'}</Btn>
    </div>
  )
}
