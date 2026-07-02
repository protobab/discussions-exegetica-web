import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, BadgeTag, Btn, Spinner } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export function GroupsPage() {
  usePageTitle('Study Groups')
  const { user, token } = useAuth(); const navigate = useNavigate()
  const [groups, setGroups] = useState([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', description:'', book_focus:'' })
  const [error, setError] = useState(''); const [creating, setCreating] = useState(false)

  const load = () => { fetch(`${API}/groups`).then(r=>r.json()).then(d=>{ setGroups(d.groups||[]); setLoading(false) }) }
  useEffect(load, [])

  const create = async () => {
    if (!form.name.trim()) return setError('Group name required')
    setCreating(true); setError('')
    const res = await fetch(`${API}/groups`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.id) navigate(`/groups/${data.id}`)
    else { setError(data.error||'Error'); setCreating(false) }
  }

  return (
    <div style={{ maxWidth:880, margin:'0 auto', padding:'36px 20px 60px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.navy, marginBottom:4 }}>Study Groups</h1>
          <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted }}>Small communities studying Scripture together, book by book</p>
        </div>
        {user && <Btn variant="gold" onClick={()=>setShowForm(s=>!s)}>{showForm?'Cancel':'+ Start a Group'}</Btn>}
      </div>

      {showForm && (
        <Card style={{ marginBottom:22 }}>
          {error && <p style={{ color:'#DC2626', fontFamily:F.body, fontSize:13, marginBottom:10 }}>{error}</p>}
          <div style={{ display:'grid', gap:10 }}>
            <input placeholder="Group name *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{ border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:13.5, outline:'none' }}/>
            <input placeholder="Book or topic focus (optional)" value={form.book_focus} onChange={e=>setForm(f=>({...f,book_focus:e.target.value}))} style={{ border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:13.5, outline:'none' }}/>
            <textarea placeholder="Describe the group's purpose…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{ border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:13.5, outline:'none', resize:'vertical' }}/>
            <Btn variant="gold" onClick={create} disabled={creating} style={{ width:'fit-content' }}>{creating?'Creating…':'Create Group'}</Btn>
          </div>
        </Card>
      )}

      {loading ? <Spinner/> : groups.length === 0
        ? <Card><p style={{ textAlign:'center', fontFamily:F.body, color:C.muted, padding:'28px 0' }}>No groups yet. {user?'Start the first one!':'Sign in to start one.'}</p></Card>
        : <div style={{ display:'grid', gap:12 }}>{groups.map(g=>(
            <Card key={g.id} style={{ cursor:'pointer' }}>
              <div onClick={()=>navigate(`/groups/${g.id}`)}>
                {g.book_focus && <span style={{ background:C.mist, color:C.navyLight, borderRadius:6, padding:'2px 9px', fontSize:11, fontFamily:F.body, fontWeight:600, marginBottom:8, display:'inline-block' }}>📖 {g.book_focus}</span>}
                <h3 style={{ fontFamily:F.display, fontSize:17, fontWeight:700, color:C.navy, margin:'0 0 5px' }}>{g.name}</h3>
                {g.description && <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, margin:'0 0 12px', lineHeight:1.6 }}>{g.description}</p>}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <Avatar name={g.display_name} color={g.avatar_color} size={22}/>
                    <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>Started by {g.display_name}</span>
                  </div>
                  <div style={{ display:'flex', gap:12 }}>
                    <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>👥 {g.member_count}</span>
                    <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>💬 {g.post_count}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}</div>
      }
    </div>
  )
}

export function GroupDetailPage() {
  const { id } = useParams(); const { user, token } = useAuth(); const navigate = useNavigate()
  const [group, setGroup] = useState(null); const [posts, setPosts] = useState([]); const [loading, setLoading] = useState(true)
  const [body, setBody] = useState(''); const [error, setError] = useState(''); const [posting, setPosting] = useState(false); const [joining, setJoining] = useState(false)

  usePageTitle(group?.name)

  const load = () => { fetch(`${API}/groups/${id}`).then(r=>r.json()).then(d=>{ setGroup(d.group); setPosts(d.posts||[]); setLoading(false) }) }
  useEffect(load, [id])

  const join = async () => {
    setJoining(true)
    const res = await fetch(`${API}/groups/${id}/join`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
    const data = await res.json()
    if (data.ok) load(); else setError(data.error)
    setJoining(false)
  }

  const post = async () => {
    if (!body.trim()) return; setPosting(true); setError('')
    const res = await fetch(`${API}/groups/${id}/posts`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ body }) })
    const data = await res.json()
    if (data.ok) { setBody(''); load() } else setError(data.error)
    setPosting(false)
  }

  if (loading) return <div style={{ maxWidth:760, margin:'40px auto' }}><Spinner/></div>
  if (!group) return <div style={{ textAlign:'center', padding:'80px', fontFamily:F.body, color:C.muted }}>Group not found.</div>

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'32px 20px 60px' }}>
      <button onClick={()=>navigate('/groups')} style={{ background:'none', border:'none', color:C.navyLight, fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:'pointer', marginBottom:20, padding:0 }}>← Back to Study Groups</button>
      <Card style={{ marginBottom:18 }}>
        {group.book_focus && <span style={{ background:C.mist, color:C.navyLight, borderRadius:6, padding:'2px 9px', fontSize:11, fontFamily:F.body, fontWeight:600, display:'inline-block', marginBottom:10 }}>📖 {group.book_focus}</span>}
        <h1 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:C.navy, marginBottom:8 }}>{group.name}</h1>
        {group.description && <p style={{ fontFamily:F.body, fontSize:14, color:C.text, lineHeight:1.7, marginBottom:14 }}>{group.description}</p>}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Avatar name={group.display_name} color={group.avatar_color} size={26}/>
            <span style={{ fontFamily:F.body, fontSize:12.5, color:C.muted }}>Started by {group.display_name}</span>
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>👥 {group.member_count} members</span>
            {user && <Btn variant="outline" onClick={join} disabled={joining}>{joining?'Joining…':'Join Group'}</Btn>}
          </div>
        </div>
      </Card>

      <h2 style={{ fontFamily:F.display, fontSize:17, fontWeight:700, color:C.navy, margin:'20px 0 12px' }}>Discussion ({posts.length})</h2>
      {posts.map(p=>(
        <div key={p.id} style={{ background:'#fff', borderRadius:10, padding:'14px 18px', marginBottom:10, border:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
            <Avatar name={p.display_name} color={p.avatar_color} size={26}/>
            <span style={{ fontFamily:F.body, fontSize:13, fontWeight:600 }}>{p.display_name}</span>
            <BadgeTag label={p.badge}/>
            <span style={{ fontFamily:F.body, fontSize:11, color:C.muted }}>{new Date(p.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
          </div>
          <p style={{ fontFamily:F.body, fontSize:14, color:C.text, lineHeight:1.65, whiteSpace:'pre-wrap' }}>{p.body}</p>
        </div>
      ))}

      <div style={{ background:'#fff', borderRadius:12, padding:'18px 20px', border:`1px solid ${C.border}`, marginTop:18 }}>
        {!user ? <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted }}><Link to="/login" style={{ color:C.gold, fontWeight:600 }}>Sign in</Link> to join the conversation.</p>
          : <>
              {error && <p style={{ color:'#DC2626', fontFamily:F.body, fontSize:13, marginBottom:8 }}>{error}</p>}
              <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Share your thoughts with the group…" rows={3} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:13.5, resize:'vertical', outline:'none', marginBottom:8, boxSizing:'border-box' }}/>
              <Btn onClick={post} disabled={posting||!body.trim()}>{posting?'Posting…':'Post'}</Btn>
            </>
        }
      </div>
    </div>
  )
}
