import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, Spinner, Btn } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import AmbientPlayer from '../components/AmbientPlayer.jsx'

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=800&q=60'

export default function ArmchairPage() {
  usePageTitle('The Armchair')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/armchair/feed`).then(r=>r.json()).then(d=>{ setData(d); setLoading(false) })
  }, [])

  if (loading) return <div style={{ maxWidth:900, margin:'60px auto' }}><Spinner/></div>

  const { featured, pastSessions = [], posts = [] } = data || {}

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
        padding: '56px 24px 64px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily:F.body, fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>
            The Armchair
          </p>
          <h1 style={{ fontFamily:F.display, fontSize:'clamp(28px,4.5vw,42px)', fontWeight:900, color:'#fff', marginBottom:14, lineHeight:1.2 }}>
            Conversations on faith,<br/>from the comfort of a chair.
          </h1>
          <p style={{ fontFamily:F.body, fontSize:15.5, color:'rgba(255,255,255,0.7)', maxWidth:520, margin:'0 auto' }}>
            Live armchair discussions with guests, and reflections in writing — all in one place.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '-40px auto 0', padding: '0 24px 60px', position: 'relative' }}>

        {/* FEATURED SESSION */}
        {featured ? (
          <>
            {featured.status !== 'live' && <AmbientPlayer />}
            <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 36 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)' }} className="armchair-featured-grid">
              <div style={{
                backgroundImage: `url(${featured.cover_image || FALLBACK_COVER})`,
                backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 240
              }}/>
              <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{
                  background: featured.status === 'live' ? '#EF4444' : C.gold,
                  color: featured.status === 'live' ? '#fff' : C.navy,
                  borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  fontFamily: F.body, display: 'inline-block', marginBottom: 12, width: 'fit-content',
                  letterSpacing: '0.05em'
                }}>
                  {featured.status === 'live' ? '🔴 LIVE NOW' : '📅 UPCOMING SESSION'}
                </span>
                <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 8, lineHeight: 1.3 }}>
                  {featured.title}
                </h2>
                {featured.guest_name && (
                  <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.muted, marginBottom: 10 }}>
                    with <strong style={{ color: C.text }}>{featured.guest_name}</strong>
                  </p>
                )}
                <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.text, lineHeight: 1.6, marginBottom: 16 }}>
                  {featured.description}
                </p>
                <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, marginBottom: 18 }}>
                  {new Date(featured.scheduled_at).toLocaleString('en-GB', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                </p>
                <Btn
                  variant="gold"
                  onClick={() => navigate(`/armchair/session/${featured.id}`)}
                  style={{ width: 'fit-content' }}
                >
                  {featured.status === 'live' ? 'Join the Live Conversation →' : 'View Session Details →'}
                </Btn>
              </div>
            </div>
          </Card>
          </>
        ) : (
          <>
            <AmbientPlayer />
            <Card style={{ textAlign: 'center', padding: '36px', marginBottom: 36 }}>
              <p style={{ fontFamily: F.body, color: C.muted }}>No live session scheduled right now — check back soon, or explore past recordings below.</p>
            </Card>
          </>
        )}

        {/* PAST RECORDINGS */}
        {pastSessions.length > 0 && (
          <div style={{ marginBottom: 44 }}>
            <h3 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, color: C.navy, marginBottom: 16 }}>
              Past Conversations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {pastSessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/armchair/session/${s.id}`)}
                  style={{
                    background: '#fff', borderRadius: 12, overflow: 'hidden',
                    border: `1px solid ${C.border}`, cursor: 'pointer'
                  }}
                >
                  <div style={{
                    backgroundImage: `url(${s.cover_image || FALLBACK_COVER})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', height: 110, position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute', bottom: 8, right: 8,
                      background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 4,
                      padding: '2px 7px', fontSize: 10, fontFamily: F.body
                    }}>▶ Recording</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 4, lineHeight: 1.3 }}>
                      {s.title}
                    </p>
                    {s.guest_name && (
                      <p style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>with {s.guest_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOG FEED */}
        <h3 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, color: C.navy, marginBottom: 16 }}>
          Reflections
        </h3>
        {posts.length === 0 ? (
          <p style={{ fontFamily: F.body, color: C.muted, fontSize: 14 }}>No posts published yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {posts.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/armchair/post/${p.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{
                  backgroundImage: `url(${p.cover_image || FALLBACK_COVER})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  height: 160, borderRadius: 12, marginBottom: 12
                }}/>
                <h4 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 6, lineHeight: 1.35 }}>
                  {p.title}
                </h4>
                <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 10 }}>
                  {p.excerpt || ''}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={p.author_name} color={p.author_avatar_color} size={22}/>
                  <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{p.author_name}</span>
                  <span style={{ fontFamily: F.body, fontSize: 11, color: C.muted }}>
                    · {new Date(p.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .armchair-featured-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
