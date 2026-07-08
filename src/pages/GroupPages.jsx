import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Avatar, BadgeTag, Spinner, Btn } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

const sage = '#2D6A4F'
const sageBg = '#F0F7F4'
const sageMid = '#52B788'
const sageLight = '#D8F3DC'

export function GroupsPage() {
  usePageTitle('Study Groups')
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', description:'', book_focus:'' })
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [visible, setVisible] = useState(false)

  const load = () => {
    fetch(`${API}/groups`).then(r=>r.json()).then(d=>{ setGroups(d.groups||[]); setLoading(false) })
  }
  useEffect(() => { load(); setTimeout(()=>setVisible(true),60) }, [])

  const create = async () => {
    if (!form.name.trim()) return setError('Group name required')
    setCreating(true); setError('')
    const res = await fetch(`${API}/groups`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.id) navigate(`/groups/${data.id}`)
    else { setError(data.error||'Error'); setCreating(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background: sageBg, opacity: visible?1:0, transition:'opacity 0.5s ease' }}>

      {/* HERO */}
      <div style={{ background:`linear-gradient(135deg, #1E3A2F 0%, ${sage} 100%)`, padding:'52px 24px 44px', textAlign:'center' }}>
        <p style={{ fontFamily:F.body, fontSize:11, fontWeight:700, color:sageMid, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10 }}>Study Groups</p>
        <h1 style={{ fontFamily:F.display, fontSize:'clamp(24px,4vw,38px)', fontWeight:900, color:'#fff', marginBottom:12, lineHeight:1.2 }}>
          Smaller circles,<br/>deeper roots.
        </h1>
        <p style={{ fontFamily:F.body, fontSize:15, color:'rgba(255,255,255,0.7)', maxWidth:420, margin:'0 auto 28px', lineHeight:1.75 }}>
          Book-by-book study communities where everyone knows your name and your questions are welcome.
        </p>
        {user
          ? <button onClick={()=>setShowForm(s=>!s)} style={{ background:sageMid, color:'#fff', border:'none', borderRadius:10, padding:'11px 24px', fontFamily:F.body, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              {showForm ? 'Cancel' : '+ Start a Group'}
            </button>
          : <Link to="/register" style={{ background:sageMid, color:'#fff', borderRadius:10, padding:'11px 24px', fontFamily:F.body, fontSize:14, fontWeight:700 }}>Join to start a group</Link>
        }
      </div>

      <div style={{ maxWidth:880, margin:'0 auto', padding:'32px 20px 60px' }}>

        {/* Create form */}
        {showForm && (
          <div style={{ background:'#fff', borderRadius:14, padding:'24px', marginBottom:24, border:`1px solid ${sageLight}`, boxShadow:'0 4px 20px rgba(45,106,79,0.1)' }}>
            <h3 style={{ fontFamily:F.display, fontSize:17, fontWeight:700, color:sage, marginBottom:16 }}>New Study Group</h3>
            {error && <p style={{ color:'#DC2626', fontFamily:F.body, fontSize:13, marginBottom:10 }}>{error}</p>}
            <div style={{ display:'grid', gap:12 }}>
              <input placeholder="Group name *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                style={{ border:`1.5px solid ${sageLight}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none' }}/>
              <input placeholder="Book or topic focus (e.g. Gospel of John, Psalms, Prayer)" value={form.book_focus} onChange={e=>setForm(f=>({...f,book_focus:e.target.value}))}
                style={{ border:`1.5px solid ${sageLight}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none' }}/>
              <textarea placeholder="Describe the group's purpose and how you'll meet…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3}
                style={{ border:`1.5px solid ${sageLight}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none', resize:'vertical' }}/>
              <button onClick={create} disabled={creating} style={{ background:sage, color:'#fff', border:'none', borderRadius:8, padding:'11px', fontFamily:F.body, fontSize:14, fontWeight:700, cursor:'pointer', opacity:creating?.7:1 }}>
                {creating ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        )}

        {loading ? <Spinner/> : groups.length === 0
          ? (
            <div style={{ textAlign:'center', padding:'52px 24px' }}>
              <p style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:sage, marginBottom:8 }}>No groups yet</p>
              <p style={{ fontFamily:F.body, fontSize:14.5, color:C.muted, marginBottom:20 }}>Be the founder of the first one.</p>
              {user ? <button onClick={()=>setShowForm(true)} style={{ background:sage, color:'#fff', border:'none', borderRadius:10, padding:'11px 24px', fontFamily:F.body, fontSize:14, fontWeight:700, cursor:'pointer' }}>Start a Group</button>
                    : <Link to="/register" style={{ background:sage, color:'#fff', borderRadius:10, padding:'11px 24px', fontFamily:F.body, fontSize:14, fontWeight:700 }}>Join to start one</Link>}
            </div>
          )
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:18 }}>
              {groups.map(g => (
                <div key={g.id} onClick={()=>navigate(`/groups/${g.id}`)} style={{
                  background:'#fff', borderRadius:14, padding:'20px', cursor:'pointer',
                  border:`1px solid ${sageLight}`, transition:'all 0.2s',
                  boxShadow:'0 2px 8px rgba(45,106,79,0.08)'
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(45,106,79,0.15)` }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(45,106,79,0.08)' }}
                >
                  {g.book_focus && (
                    <span style={{ background:sageLight, color:sage, borderRadius:6, padding:'2px 9px', fontSize:11, fontFamily:F.body, fontWeight:600, display:'inline-block', marginBottom:10 }}>
                      📖 {g.book_focus}
                    </span>
                  )}
                  <h3 style={{ fontFamily:F.display, fontSize:17, fontWeight:700, color:'#1E3A2F', margin:'0 0 6px', lineHeight:1.3 }}>{g.name}</h3>
                  {g.description && <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, margin:'0 0 14px', lineHeight:1.6 }}>{g.description.slice(0,100)}{g.description.length>100?'…':''}</p>}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Avatar name={g.display_name} color={g.avatar_color||sage} size={22}/>
                      <span style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>{g.display_name}</span>
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                      <span style={{ fontFamily:F.body, fontSize:12, color:sage, fontWeight:600 }}>👥 {g.member_count}</span>
                      <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>💬 {g.post_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

export function GroupDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [posting, setPosting] = useState(false)
  const [joining, setJoining] = useState(false)
  const [visible, setVisible] = useState(false)

  usePageTitle(group?.name)

  const load = () => {
    fetch(`${API}/groups/${id}`).then(r=>r.json()).then(d=>{ setGroup(d.group); setPosts(d.posts||[]); setLoading(false) })
  }
  useEffect(() => { load(); setTimeout(()=>setVisible(true),60) }, [id])

  const join = async () => {
    setJoining(true)
    const res = await fetch(`${API}/groups/${id}/join`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
    const data = await res.json()
    if (data.ok) load(); else setError(data.error)
    setJoining(false)
  }

  const post = async () => {
    if (!body.trim()) return
    setPosting(true); setError('')
    const res = await fetch(`${API}/groups/${id}/posts`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ body }) })
    const data = await res.json()
    if (data.ok) { setBody(''); load() } else setError(data.error)
    setPosting(false)
  }

  if (loading) return <div style={{ maxWidth:760, margin:'40px auto' }}><Spinner/></div>
  if (!group) return <div style={{ textAlign:'center', padding:'80px', fontFamily:F.body, color:C.muted }}>Group not found.</div>

  return (
    <div style={{ minHeight:'100vh', background:sageBg, opacity:visible?1:0, transition:'opacity 0.5s ease' }}>
      <div style={{ background:`linear-gradient(135deg, #1E3A2F 0%, ${sage} 100%)`, padding:'32px 24px 28px' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <button onClick={()=>navigate('/groups')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.65)', fontFamily:F.body, fontSize:13, cursor:'pointer', marginBottom:14, padding:0 }}>← All Groups</button>
          {group.book_focus && <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', borderRadius:6, padding:'2px 10px', fontSize:11, fontFamily:F.body, fontWeight:600, display:'inline-block', marginBottom:10 }}>📖 {group.book_focus}</span>}
          <h1 style={{ fontFamily:F.display, fontSize:24, fontWeight:700, color:'#fff', marginBottom:8 }}>{group.name}</h1>
          {group.description && <p style={{ fontFamily:F.body, fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.7, marginBottom:14, maxWidth:540 }}>{group.description}</p>}
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <span style={{ fontFamily:F.body, fontSize:13, color:'rgba(255,255,255,0.65)' }}>👥 {group.member_count} members</span>
            <span style={{ fontFamily:F.body, fontSize:13, color:'rgba(255,255,255,0.65)' }}>💬 {group.post_count} posts</span>
            {user && <button onClick={join} disabled={joining} style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, padding:'7px 16px', fontFamily:F.body, fontSize:13, fontWeight:600, cursor:'pointer' }}>{joining?'Joining…':'Join Group'}</button>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'28px 20px 60px' }}>
        <h2 style={{ fontFamily:F.display, fontSize:17, fontWeight:700, color:'#1E3A2F', marginBottom:14 }}>Discussion ({posts.length})</h2>

        {posts.map(p => (
          <div key={p.id} style={{ background:'#fff', borderRadius:10, padding:'16px 18px', marginBottom:10, border:`1px solid ${sageLight}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
              <Avatar name={p.display_name} color={p.avatar_color||sage} size={28}/>
              <span style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:'#1E3A2F' }}>{p.display_name}</span>
              <BadgeTag label={p.badge}/>
              <span style={{ fontFamily:F.body, fontSize:11, color:C.muted, marginLeft:'auto' }}>{new Date(p.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
            </div>
            <p style={{ fontFamily:F.body, fontSize:14, color:C.text, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{p.body}</p>
          </div>
        ))}

        <div style={{ background:'#fff', borderRadius:12, padding:'18px 20px', border:`1px solid ${sageLight}`, marginTop:18 }}>
          {!user
            ? <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted }}><Link to="/login" style={{ color:sage, fontWeight:600 }}>Sign in</Link> to join the conversation.</p>
            : <>
                {error && <p style={{ color:'#DC2626', fontFamily:F.body, fontSize:13, marginBottom:8 }}>{error}</p>}
                <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Share your thoughts with the group…" rows={3}
                  style={{ width:'100%', border:`1.5px solid ${sageLight}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, resize:'vertical', outline:'none', marginBottom:10, boxSizing:'border-box' }}/>
                <button onClick={post} disabled={posting||!body.trim()} style={{ background:posting||!body.trim()?sageLight:sage, color:posting||!body.trim()?C.muted:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontFamily:F.body, fontSize:13.5, fontWeight:700, cursor:posting||!body.trim()?'not-allowed':'pointer' }}>
                  {posting?'Posting…':'Post'}
                </button>
              </>
          }
        </div>
      </div>
    </div>
  )
}
