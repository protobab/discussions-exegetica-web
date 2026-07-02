import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, Spinner, Btn } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import AmbientPlayer from '../components/AmbientPlayer.jsx'

const FB = 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=800&q=60'

export default function ArmchairPage() {
  usePageTitle('The Armchair')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/armchair/feed`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ maxWidth:900, margin:'60px auto' }}><Spinner/></div>
  const { featured, pastSessions = [], posts = [] } = data || {}
  const isLive = featured?.status === 'live'

  return (
    <div>
      {/* HERO */}
      <div style={{ background:`linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`, padding:'52px 20px 60px', textAlign:'center' }}>
        <p style={{ fontFamily:F.body, fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>The Armchair</p>
        <h1 style={{ fontFamily:F.display, fontSize:'clamp(26px,4.5vw,40px)', fontWeight:900, color:'#fff', marginBottom:12, lineHeight:1.2 }}>
          Conversations on faith,<br/>from the comfort of a chair.
        </h1>
        <p style={{ fontFamily:F.body, fontSize:15, color:'rgba(255,255,255,0.68)', maxWidth:480, margin:'0 auto' }}>
          Live audio conversations with guests, auto-saved recordings, and reflections in writing — all in one place.
        </p>
      </div>

      <div style={{ maxWidth:980, margin:'-36px auto 0', padding:'0 20px 60px', position:'relative' }}>

        {/* AMBIENT PLAYER — shown when nothing is live */}
        {!isLive && <AmbientPlayer />}

        {/* FEATURED SESSION */}
        {featured ? (
          <Card style={{ padding:0, overflow:'hidden', marginBottom:32 }}>
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)' }} className="ac-grid">
              <div style={{ backgroundImage:`url(${featured.cover_image||FB})`, backgroundSize:'cover', backgroundPosition:'center', minHeight:220 }}/>
              <div style={{ padding:'26px 28px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <span style={{ background:isLive?'#EF4444':C.gold, color:isLive?'#fff':C.navy, borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:700, fontFamily:F.body, display:'inline-block', marginBottom:10, width:'fit-content' }}>
                  {isLive ? '🔴 LIVE NOW' : '📅 UPCOMING'}
                </span>
                <h2 style={{ fontFamily:F.display, fontSize:20, fontWeight:700, color:C.navy, marginBottom:6, lineHeight:1.3 }}>{featured.title}</h2>
                {featured.guest_name && <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, marginBottom:8 }}>with <strong style={{ color:C.text }}>{featured.guest_name}</strong></p>}
                <p style={{ fontFamily:F.body, fontSize:13, color:C.text, lineHeight:1.6, marginBottom:14 }}>{featured.description}</p>
                <p style={{ fontFamily:F.body, fontSize:12.5, color:C.muted, marginBottom:16 }}>
                  {new Date(featured.scheduled_at).toLocaleString('en-GB',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}
                </p>
                <Btn variant="gold" onClick={()=>navigate(`/armchair/session/${featured.id}`)} style={{ width:'fit-content' }}>
                  {isLive ? '🎧 Join Live Conversation →' : 'View Session →'}
                </Btn>
              </div>
            </div>
          </Card>
        ) : (
          <Card style={{ textAlign:'center', padding:'28px', marginBottom:32 }}>
            <p style={{ fontFamily:F.body, color:C.muted }}>No live session right now — check back soon, or explore past recordings below.</p>
          </Card>
        )}

        {/* PAST RECORDINGS */}
        {pastSessions.length > 0 && (
          <div style={{ marginBottom:40 }}>
            <h3 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:14 }}>Past Conversations</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
              {pastSessions.map(s => (
                <div key={s.id} onClick={()=>navigate(`/armchair/session/${s.id}`)} style={{ background:'#fff', borderRadius:12, overflow:'hidden', border:`1px solid ${C.border}`, cursor:'pointer' }}>
                  <div style={{ backgroundImage:`url(${s.cover_image||FB})`, backgroundSize:'cover', backgroundPosition:'center', height:100, position:'relative' }}>
                    <span style={{ position:'absolute', bottom:7, right:7, background:'rgba(0,0,0,0.6)', color:'#fff', borderRadius:4, padding:'2px 7px', fontSize:10, fontFamily:F.body }}>▶ Recording</span>
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <p style={{ fontFamily:F.display, fontSize:13.5, fontWeight:700, color:C.navy, marginBottom:3, lineHeight:1.3 }}>{s.title}</p>
                    {s.guest_name && <p style={{ fontFamily:F.body, fontSize:11, color:C.muted }}>with {s.guest_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOG FEED */}
        <h3 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:14 }}>Reflections</h3>
        {posts.length === 0
          ? <p style={{ fontFamily:F.body, color:C.muted, fontSize:14 }}>No posts yet.</p>
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
              {posts.map(p => (
                <div key={p.id} onClick={()=>navigate(`/armchair/post/${p.id}`)} style={{ cursor:'pointer' }}>
                  <div style={{ backgroundImage:`url(${p.cover_image||FB})`, backgroundSize:'cover', backgroundPosition:'center', height:150, borderRadius:12, marginBottom:10 }}/>
                  <h4 style={{ fontFamily:F.display, fontSize:15.5, fontWeight:700, color:C.navy, marginBottom:5, lineHeight:1.35 }}>{p.title}</h4>
                  {p.excerpt && <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:8 }}>{p.excerpt}</p>}
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <Avatar name={p.author_name} color={p.author_avatar_color} size={20}/>
                    <span style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>{p.author_name} · {new Date(p.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      <style>{`
        @media(max-width:640px){ .ac-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  )
}
