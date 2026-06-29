import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, BadgeTag, Btn, Spinner } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function ThreadPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [thread, setThread]   = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody]       = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    // fetch thread
    fetch(`${API}/threads`).then(r=>r.json()).then(d=>{
      const t = (d.threads||[]).find(t=>String(t.id)===String(id))
      setThread(t||null)
    })
    // fetch replies (also increments view count)
    fetch(`${API}/threads/${id}/replies`)
      .then(r=>r.json())
      .then(d=>{ setReplies(d.replies||[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [id])

  const postReply = async () => {
    if (!body.trim()) return
    setPosting(true); setError('')
    const res = await fetch(`${API}/threads/${id}/replies`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify({ body })
    })
    const data = await res.json()
    if (data.ok) {
      setBody('')
      // reload replies
      const r2 = await fetch(`${API}/threads/${id}/replies`)
      const d2 = await r2.json()
      setReplies(d2.replies||[])
    } else {
      setError(data.error || 'Something went wrong')
    }
    setPosting(false)
  }

  if (loading) return <div style={{ maxWidth:800, margin:'40px auto', padding:'0 24px' }}><Spinner/></div>
  if (!thread) return (
    <div style={{ maxWidth:800, margin:'80px auto', padding:'0 24px', textAlign:'center', fontFamily:F.body, color:C.muted }}>
      Discussion not found. <Link to="/forum" style={{ color:C.gold }}>Back to forum</Link>
    </div>
  )

  return (
    <div style={{ maxWidth:820, margin:'0 auto', padding:'36px 24px 60px' }}>
      <button onClick={() => navigate('/forum')} style={{
        background:'none', border:'none', color:C.navyLight,
        fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:'pointer',
        display:'flex', alignItems:'center', gap:6, marginBottom:24, padding:0
      }}>← Back to Forum</button>

      {/* Thread body */}
      <Card style={{ marginBottom:20 }}>
        <span style={{
          background:C.mist, color:C.navyLight, borderRadius:6,
          padding:'2px 9px', fontSize:11, fontFamily:F.body, fontWeight:600,
          display:'inline-block', marginBottom:14
        }}>{thread.cat_label}</span>

        <h1 style={{ fontFamily:F.display, fontSize:24, fontWeight:700, color:C.navy, margin:'0 0 16px', lineHeight:1.3 }}>
          {thread.title}
        </h1>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <Avatar name={thread.display_name} color={thread.avatar_color} size={38}/>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:F.body, fontSize:13.5, fontWeight:600 }}>{thread.display_name}</span>
              <BadgeTag label={thread.badge}/>
            </div>
            <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>
              {new Date(thread.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
            </span>
          </div>
        </div>

        <p style={{ fontFamily:F.body, fontSize:15.5, color:C.text, lineHeight:1.8, whiteSpace:'pre-wrap' }}>
          {thread.body}
        </p>
      </Card>

      {/* Replies */}
      <h2 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, margin:'28px 0 16px' }}>
        {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
      </h2>

      {replies.map(r => (
        <div key={r.id} style={{
          background:'#fff', borderRadius:10, padding:'18px 22px',
          marginBottom:12, border:`1px solid ${C.border}`
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <Avatar name={r.display_name} color={r.avatar_color} size={30}/>
            <span style={{ fontFamily:F.body, fontSize:13, fontWeight:600 }}>{r.display_name}</span>
            <BadgeTag label={r.badge}/>
            <span style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>
              {new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
            </span>
          </div>
          <p style={{ fontFamily:F.body, fontSize:14.5, color:C.text, lineHeight:1.7, whiteSpace:'pre-wrap' }}>
            {r.body}
          </p>
        </div>
      ))}

      {/* Reply box */}
      <div style={{
        background:'#fff', borderRadius:12, padding:'22px 24px',
        border:`1px solid ${C.border}`, marginTop:24
      }}>
        <p style={{ fontFamily:F.display, fontSize:16, fontWeight:700, color:C.navy, marginBottom:14 }}>
          Add your voice
        </p>

        {!user ? (
          <p style={{ fontFamily:F.body, fontSize:14, color:C.muted }}>
            <Link to="/login" style={{ color:C.gold, fontWeight:600 }}>Sign in</Link> or{' '}
            <Link to="/register" style={{ color:C.gold, fontWeight:600 }}>join free</Link> to reply.
          </p>
        ) : (
          <>
            {error && <p style={{ color:'#EF4444', fontFamily:F.body, fontSize:13, marginBottom:10 }}>{error}</p>}
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share your reflection, question, or insight…"
              rows={4}
              style={{
                width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8,
                padding:'12px 14px', fontFamily:F.body, fontSize:14, color:C.text,
                resize:'vertical', outline:'none', marginBottom:10
              }}
            />
            <Btn onClick={postReply} disabled={posting || !body.trim()}>
              {posting ? 'Posting…' : 'Post Reply'}
            </Btn>
          </>
        )}
      </div>
    </div>
  )
}
