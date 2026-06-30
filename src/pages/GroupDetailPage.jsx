import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, BadgeTag, Btn, Spinner } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function GroupDetailPage() {
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

  const load = () => {
    fetch(`${API}/groups/${id}`).then(r=>r.json()).then(d=>{
      setGroup(d.group); setPosts(d.posts||[]); setLoading(false)
    })
  }
  useEffect(load, [id])

  const join = async () => {
    setJoining(true)
    const res = await fetch(`${API}/groups/${id}/join`, {
      method:'POST', headers:{ Authorization:`Bearer ${token}` }
    })
    const data = await res.json()
    if (data.ok) load()
    else setError(data.error)
    setJoining(false)
  }

  const post = async () => {
    if (!body.trim()) return
    setPosting(true); setError('')
    const res = await fetch(`${API}/groups/${id}/posts`, {
      method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify({ body })
    })
    const data = await res.json()
    if (data.ok) { setBody(''); load() } else setError(data.error)
    setPosting(false)
  }

  if (loading) return <div style={{ maxWidth:760, margin:'40px auto' }}><Spinner/></div>
  if (!group) return <div style={{ textAlign:'center', padding:'80px', fontFamily:F.body, color:C.muted }}>Group not found.</div>

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'36px 24px 60px' }}>
      <button onClick={() => navigate('/groups')} style={{
        background:'none', border:'none', color:C.navyLight, fontFamily:F.body,
        fontSize:13.5, fontWeight:600, cursor:'pointer', marginBottom:24, padding:0
      }}>← Back to Study Groups</button>

      <Card style={{ marginBottom:20 }}>
        {group.book_focus && (
          <span style={{
            background:C.mist, color:C.navyLight, borderRadius:6, padding:'2px 9px',
            fontSize:11, fontFamily:F.body, fontWeight:600, display:'inline-block', marginBottom:12
          }}>📖 {group.book_focus}</span>
        )}
        <h1 style={{ fontFamily:F.display, fontSize:24, fontWeight:700, color:C.navy, marginBottom:10 }}>
          {group.name}
        </h1>
        {group.description && (
          <p style={{ fontFamily:F.body, fontSize:14.5, color:C.text, lineHeight:1.7, marginBottom:18 }}>
            {group.description}
          </p>
        )}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Avatar name={group.display_name} color={group.avatar_color} size={28}/>
            <span style={{ fontFamily:F.body, fontSize:13, color:C.muted }}>Started by {group.display_name}</span>
          </div>
          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
            <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>👥 {group.member_count} members</span>
            {user && (
              <Btn variant="outline" onClick={join} disabled={joining}>
                {joining ? 'Joining…' : 'Join Group'}
              </Btn>
            )}
          </div>
        </div>
      </Card>

      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, margin:'24px 0 14px' }}>
        Discussion ({posts.length})
      </h2>

      {posts.map(p => (
        <div key={p.id} style={{
          background:'#fff', borderRadius:10, padding:'16px 20px',
          marginBottom:10, border:`1px solid ${C.border}`
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Avatar name={p.display_name} color={p.avatar_color} size={28}/>
            <span style={{ fontFamily:F.body, fontSize:13, fontWeight:600 }}>{p.display_name}</span>
            <BadgeTag label={p.badge}/>
            <span style={{ fontFamily:F.body, fontSize:11, color:C.muted }}>
              {new Date(p.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
            </span>
          </div>
          <p style={{ fontFamily:F.body, fontSize:14, color:C.text, lineHeight:1.65, whiteSpace:'pre-wrap' }}>
            {p.body}
          </p>
        </div>
      ))}

      <div style={{ background:'#fff', borderRadius:12, padding:'20px 22px', border:`1px solid ${C.border}`, marginTop:20 }}>
        {!user ? (
          <p style={{ fontFamily:F.body, fontSize:14, color:C.muted }}>
            <Link to="/login" style={{ color:C.gold, fontWeight:600 }}>Sign in</Link> to join the conversation.
          </p>
        ) : (
          <>
            {error && <p style={{ color:'#DC2626', fontFamily:F.body, fontSize:13, marginBottom:10 }}>{error}</p>}
            <textarea
              value={body}
              onChange={e=>setBody(e.target.value)}
              placeholder="Share your thoughts with the group…"
              rows={3}
              style={{
                width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8,
                padding:'10px 13px', fontFamily:F.body, fontSize:14, resize:'vertical', outline:'none', marginBottom:10
              }}
            />
            <Btn onClick={post} disabled={posting || !body.trim()}>
              {posting ? 'Posting…' : 'Post'}
            </Btn>
          </>
        )}
      </div>
    </div>
  )
}
