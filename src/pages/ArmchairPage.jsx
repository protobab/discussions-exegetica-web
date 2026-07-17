import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, Spinner, Btn } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { IMAGES } from '../lib/images.js'

const TRACKS = [
  { src: '/ambient/track1.mp3', label: 'Reflective Piano' },
  { src: '/ambient/track2.mp3', label: 'Gentle Strings' },
  { src: '/ambient/track3.mp3', label: 'Quiet Worship Pads' },
]
const FB = 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=800&q=60'

export default function ArmchairPage() {
  usePageTitle('The Armchair')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [trackIdx, setTrackIdx] = useState(0)
  const [vol, setVol] = useState(0.35)
  const [showPlayer, setShowPlayer] = useState(false)
  const [hasFiles, setHasFiles] = useState(true)
  const audioRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/armchair/feed`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])









  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>

  const { featured, pastSessions = [], posts = [] } = data || {}
  const isLive = featured?.status === 'live'

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

      {/* FULL-SCREEN BACKGROUND — deep blue gradient always shows, bg-loop.jpg overlays it */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, #0a1628 0%, #1a2a4a 35%, #2a4a6a 65%, #0a1020 100%)' }}/>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, backgroundImage: `url(/ambient/bg-loop.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.45)' }}/>

      {/* OVERLAY GRADIENT */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2,
        background: `linear-gradient(to bottom, rgba(10,20,40,0.45) 0%, rgba(10,20,40,0.25) 40%, rgba(10,20,40,0.65) 100%)`,
      }}/>



      {/* MAIN CONTENT — scrollable over background */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '80px 24px 52px' }}>
          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
            The Armchair
          </p>
          <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.12 }}>
            Conversations on faith,<br/>from the comfort of a chair.
          </h1>
          <p style={{ fontFamily: F.body, fontSize: 16, color: 'rgba(255,255,255,0.72)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.75 }}>
            Live audio conversations with guests, auto-saved recordings, and reflections in writing — all in one place.
          </p>

        </div>

        {/* FEATURED SESSION or NO SESSION card */}
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px 60px' }}>

          {/* Ambient player shown when no live session */}
          {!isLive && <AmbientPlayer />}

          {featured ? (
            <div style={{
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 18,
              overflow: 'hidden', marginBottom: 40
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }} className="ac-grid">
                <div style={{ backgroundImage: `url(${featured.cover_image || FB})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 220 }}/>
                <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{
                    background: isLive ? '#EF4444' : C.gold, color: isLive ? '#fff' : C.navy,
                    borderRadius: 6, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                    fontFamily: F.body, display: 'inline-block', marginBottom: 12, width: 'fit-content'
                  }}>{isLive ? '🔴 LIVE NOW' : '📅 UPCOMING'}</span>
                  <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{featured.title}</h2>
                  {featured.guest_name && <p style={{ fontFamily: F.body, fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>with <strong style={{ color: '#fff' }}>{featured.guest_name}</strong></p>}
                  <p style={{ fontFamily: F.body, fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 16 }}>{featured.description}</p>
                  <p style={{ fontFamily: F.body, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>
                    {new Date(featured.scheduled_at).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <button onClick={() => navigate(`/armchair/session/${featured.id}`)} style={{
                    background: C.gold, color: '#E8E0D0', border: 'none', borderRadius: 10,
                    padding: '11px 22px', fontFamily: F.body, fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', width: 'fit-content'
                  }}>
                    {isLive ? '🎧 Join Live Conversation →' : 'View Session →'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14, padding: '28px', textAlign: 'center', marginBottom: 40
            }}>
              <p style={{ fontFamily: F.body, color: 'rgba(255,255,255,0.6)' }}>
                No live session right now — explore past recordings below, or settle in with the music.
              </p>
            </div>
          )}

          {/* PAST RECORDINGS */}
          {pastSessions.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Past Conversations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {pastSessions.map(s => (
                  <div key={s.id} onClick={() => navigate(`/armchair/session/${s.id}`)} style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    <div style={{ backgroundImage: `url(${s.cover_image || FB})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 110, position: 'relative' }}>
                      <span style={{ position: 'absolute', bottom: 7, right: 7, background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 4, padding: '2px 7px', fontSize: 10, fontFamily: F.body }}>▶ Recording</span>
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontFamily: F.display, fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 3, lineHeight: 1.3 }}>{s.title}</p>
                      {s.guest_name && <p style={{ fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>with {s.guest_name}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLOG FEED */}
          <h3 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Reflections</h3>
          {posts.length === 0 ? (
            <p style={{ fontFamily: F.body, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No posts yet — check back soon.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 22 }}>
              {posts.map(p => (
                <div key={p.id} onClick={() => navigate(`/armchair/post/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ backgroundImage: `url(${p.cover_image || FB})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 155, borderRadius: 12, marginBottom: 11 }}/>
                  <h4 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 5, lineHeight: 1.35 }}>{p.title}</h4>
                  {p.excerpt && <p style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.6, marginBottom: 8 }}>{p.excerpt}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Avatar name={p.author_name} color={p.author_avatar_color} size={20}/>
                    <span style={{ fontFamily: F.body, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                      {p.author_name} · {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:640px){ .ac-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  )
}
