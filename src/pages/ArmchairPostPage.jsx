import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Avatar, Spinner } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

const FB = 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=1200&q=60'

export default function ArmchairPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  usePageTitle(post?.title)

  useEffect(() => {
    fetch(`${API}/armchair/feed`).then(r=>r.json()).then(d=>{
      setPost((d.posts||[]).find(p=>String(p.id)===String(id))||null)
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [id])

  if (loading) return <div style={{ maxWidth:700, margin:'60px auto' }}><Spinner/></div>
  if (!post) return <div style={{ textAlign:'center', padding:'80px', fontFamily:F.body, color:C.muted }}>Post not found.</div>

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 20px 60px' }}>
      <button onClick={()=>navigate('/armchair')} style={{ background:'none', border:'none', color:C.navyLight, fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:'pointer', marginBottom:22, padding:0 }}>
        ← Back to The Armchair
      </button>
      <div style={{ backgroundImage:`url(${post.cover_image||FB})`, backgroundSize:'cover', backgroundPosition:'center', height:260, borderRadius:14, marginBottom:24 }}/>
      <h1 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.navy, marginBottom:12, lineHeight:1.3 }}>{post.title}</h1>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:26 }}>
        <Avatar name={post.author_name} color={post.author_avatar_color} size={30}/>
        <div>
          <p style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.text }}>{post.author_name}</p>
          <p style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>{new Date(post.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
      </div>
      <div style={{ fontFamily:F.body, fontSize:16, color:C.text, lineHeight:1.85, whiteSpace:'pre-wrap' }}>{post.body}</div>
    </div>
  )
}
