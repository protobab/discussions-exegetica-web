import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { C, F, API } from '../lib/tokens.js'
import { Avatar, Spinner } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

const FB = 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=1200&q=60'

export default function ArmchairPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)
  usePageTitle(post?.title)

  useEffect(() => {
    fetch(`${API}/armchair/feed`).then(r=>r.json()).then(d=>{
      setPost((d.posts||[]).find(p=>String(p.id)===String(id))||null)
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [id])

  const saveEdit = async () => {
    setSaving(true)
    const res = await fetch(`${API}/armchair/manage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: post.id, title: editTitle, body: editBody })
    })
    const data = await res.json()
    if (data.ok) {
      setPost(p => ({ ...p, title: editTitle, body: editBody }))
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) return <div style={{ maxWidth:700, margin:'60px auto' }}><Spinner/></div>
  if (!post) return <div style={{ textAlign:'center', padding:'80px', fontFamily:F.body, color:C.muted }}>Post not found.</div>

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 20px 60px' }}>
      <button onClick={()=>navigate('/armchair')} style={{ background:'none', border:'none', color:C.navyLight, fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:'pointer', marginBottom:22, padding:0 }}>
        ← Back to The Armchair
      </button>
      <div style={{ backgroundImage:`url(${post.cover_image||FB})`, backgroundSize:'cover', backgroundPosition:'center', height:260, borderRadius:14, marginBottom:24 }}/>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:12 }}>
        {editing ? (
          <input value={editTitle} onChange={e=>setEditTitle(e.target.value)}
            style={{ flex:1, fontFamily:F.display, fontSize:24, fontWeight:700, color:'#fff', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:8, padding:'8px 12px', colorScheme:'dark' }}/>
        ) : (
          <h1 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:'#fff', lineHeight:1.3, margin:0 }}>{post.title}</h1>
        )}
        {user && post.author_id === user.id && !editing && (
          <button onClick={()=>{ setEditTitle(post.title); setEditBody(post.body); setEditing(true) }}
            style={{ background:'none', border:'1px solid rgba(255,255,255,0.15)', borderRadius:7, color:'rgba(255,255,255,0.5)', fontFamily:F.body, fontSize:12.5, cursor:'pointer', padding:'6px 12px', whiteSpace:'nowrap', flexShrink:0 }}>
            ✏️ Edit
          </button>
        )}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:26 }}>
        <Avatar name={post.author_name} color={post.author_avatar_color} size={30}/>
        <div>
          <p style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.text }}>{post.author_name}</p>
          <p style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>{new Date(post.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
      </div>
      {editing ? (
        <div>
          <textarea value={editBody} onChange={e=>setEditBody(e.target.value)} rows={12}
            style={{ width:'100%', fontFamily:F.body, fontSize:15, color:'#fff', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:8, padding:'12px', colorScheme:'dark', resize:'vertical', lineHeight:1.8, boxSizing:'border-box', marginBottom:10 }}/>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={saveEdit} disabled={saving}
              style={{ background:C.gold, color:'#0a0f1e', border:'none', borderRadius:8, padding:'9px 22px', fontFamily:F.body, fontSize:13.5, fontWeight:700, cursor:'pointer' }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button onClick={()=>setEditing(false)}
              style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 18px', fontFamily:F.body, fontSize:13.5, cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontFamily:F.body, fontSize:16, color:C.text, lineHeight:1.85, whiteSpace:'pre-wrap' }}>{post.body}</div>
      )}
    </div>
  )
}
