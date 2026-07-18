import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Logo, Avatar, BadgeTag } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { useAuth } from '../lib/auth.jsx'
import { useStreak } from '../lib/useStreak.js'
import { IMAGES } from '../lib/images.js'
import TourModal from '../components/TourModal.jsx'

// Word-by-word verse reveal
function RevealText({ text }) {
  const [shown, setShown] = useState(0)
  const words = text.split(' ')
  useEffect(() => {
    if (shown >= words.length) return
    const t = setTimeout(() => setShown(s => s + 1), 100)
    return () => clearTimeout(t)
  }, [shown, words.length])
  return (
    <>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < shown ? 1 : 0, transition: 'opacity 0.35s', marginRight: 4, display: 'inline-block' }}>{w}</span>
      ))}
    </>
  )
}

export default function HomePage() {
  usePageTitle(null)
  const { user } = useAuth()
  const { streak, lastThread, lastBibleRef, recordActivity } = useStreak()
  const [dailyWord, setDailyWord] = useState(null)
  const [threads, setThreads] = useState([])
  const [pulse, setPulse] = useState(null)
  const [armchair, setArmchair] = useState(null)
  const [meditate, setMeditate] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const navigate = useNavigate()
  const discoverRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/daily-word`).then(r=>r.json()).then(d=>setDailyWord(d.word)).catch(()=>{})
    fetch(`${API}/threads`).then(r=>r.json()).then(d=>setThreads(d.threads||[])).catch(()=>{})
    fetch(`${API}/pulse`).then(r=>r.json()).then(d=>setPulse(d)).catch(()=>{})
    fetch(`${API}/armchair/feed`).then(r=>r.json()).then(d=>setArmchair(d)).catch(()=>{})
    if (user) recordActivity('visit', null)
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [user])

  const isLive = armchair?.featured?.status === 'live'

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* MEDITATE OVERLAY */}
      {meditate && dailyWord && (
        <div onClick={() => setMeditate(false)} style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'var(--surface-solid-h)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', padding: '40px 24px', cursor: 'pointer'
        }}>
          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 40 }}>Be still · Know · Rest</p>
          <blockquote style={{ fontFamily: F.display, fontSize: 'clamp(20px,4vw,34px)', fontWeight: 700, color: 'var(--fg-100)', textAlign: 'center', lineHeight: 1.7, maxWidth: 680, margin: '0 0 24px', fontStyle: 'italic' }}>
            "{dailyWord.verse_text}"
          </blockquote>
          <p style={{ fontFamily: F.body, fontSize: 18, color: C.gold, fontWeight: 700 }}>— {dailyWord.verse_ref}</p>
          <p style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-25)', marginTop: 56 }}>Tap anywhere to return</p>
          <style>{`@keyframes fi{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}

      {/* ── SECTION 1: FULL-SCREEN HERO ── */}
      <section style={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(to bottom, var(--ov-55) 0%, var(--ov-7) 60%, var(--ov-98) 100%), url(${IMAGES.homeHero})`,
        backgroundSize: 'cover', backgroundPosition: 'center top',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 24px 60px',
        position: 'relative',
      }}>
        {/* Live session badge */}
        {isLive && (
          <Link to={`/armchair/session/${armchair.featured.id}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)',
            borderRadius: 30, padding: '6px 18px', marginBottom: 28,
            fontFamily: F.body, fontSize: 13, fontWeight: 700, color: 'var(--fg-100)',
            textDecoration: 'none'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse-dot 1.2s infinite' }}/>
            Live now — {armchair.featured.title} →
          </Link>
        )}

        {/* Welcome back for returning users */}
        {user && (streak > 0 || lastThread) && (
          <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontFamily: F.body, fontSize: 14, color: 'var(--fg-6)' }}>
              Welcome back, <strong style={{ color: C.gold }}>{user.display_name}</strong>
            </span>
            {streak > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(201,168,76,0.12)', border: `1px solid ${C.gold}33`, borderRadius: 20, padding: '3px 12px', fontFamily: F.body, fontSize: 12.5, fontWeight: 700, color: C.gold }}>
                🔥 {streak} day{streak !== 1 ? 's' : ''}
              </span>
            )}
            {lastThread && (
              <Link to={`/thread/${lastThread.id}`} style={{ fontFamily: F.body, fontSize: 12.5, color: 'var(--fg-5)', borderLeft: '1px solid var(--fg-15)', paddingLeft: 12 }}>
                ↩ {lastThread.title.slice(0, 35)}…
              </Link>
            )}
          </div>
        )}

        {/* Main headline */}
        <h1 style={{
          fontFamily: F.display,
          fontSize: 'clamp(36px,6vw,72px)',
          fontWeight: 900, color: 'var(--fg-100)',
          lineHeight: 1.08, margin: '0 0 20px',
          maxWidth: 800, letterSpacing: '-0.02em',
          textShadow: '0 4px 32px rgba(0,0,0,0.4)'
        }}>
          Where Scripture is<br/>
          <span style={{ color: C.gold, display: 'inline-block' }}>opened together.</span>
        </h1>

        <p style={{
          fontFamily: F.body, fontSize: 'clamp(16px,2vw,20px)',
          color: 'var(--fg-65)',
          maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.75,
          fontWeight: 400
        }}>
          A global community for honest seekers and devoted believers — asking real questions, studying Scripture deeply, walking in the light of Christ.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          {user ? (
            <Link to="/forum" style={{
              background: `linear-gradient(135deg, ${C.gold}, var(--c-gold-light))`,
              color: C.navy, borderRadius: 12, padding: '14px 32px',
              fontFamily: F.body, fontSize: 16, fontWeight: 700,
              boxShadow: '0 8px 24px rgba(201,168,76,0.35)'
            }}>Enter the Forum →</Link>
          ) : (
            <>
              <Link to="/register" style={{
                background: `linear-gradient(135deg, ${C.gold}, var(--c-gold-light))`,
                color: C.navy, borderRadius: 12, padding: '14px 32px',
                fontFamily: F.body, fontSize: 16, fontWeight: 700,
                boxShadow: '0 8px 24px rgba(201,168,76,0.35)'
              }}>Join Free →</Link>
              <Link to="/forum" style={{
                background: 'var(--fg-08)', color: 'var(--fg-100)',
                border: '1px solid var(--fg-2)', borderRadius: 12,
                padding: '14px 32px', fontFamily: F.body, fontSize: 16, fontWeight: 500
              }}>Explore the Forum</Link>
            </>
          )}
          <Link to="/salvation" style={{
            background: 'rgba(201,168,76,0.1)', color: C.gold,
            border: `1px solid ${C.gold}44`, borderRadius: 12,
            padding: '14px 24px', fontFamily: F.body, fontSize: 15, fontWeight: 600
          }}>🙏 Prayer of Salvation</Link>
        </div>

        {/* Take the Tour — obvious entry point for first-time visitors */}
        <button onClick={() => setShowTour(true)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--fg-06)', color: 'var(--fg-100)',
          border: '1px solid var(--fg-18)', borderRadius: 30,
          padding: '10px 22px', fontFamily: F.body, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', marginBottom: 40, backdropFilter: 'blur(4px)'
        }}>
          <span style={{ color: C.gold }}>▶</span> New here? Take the 60-second tour
        </button>

        {/* Daily Word inline */}
        {dailyWord && (
          <div style={{
            maxWidth: 640, margin: '0 auto',
            background: 'rgba(201,168,76,0.07)',
            border: `1px solid ${C.gold}22`,
            borderRadius: 16, padding: '22px 28px',
          }}>
            <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
              Today's Word · {dailyWord.verse_ref}
            </p>
            <p style={{ fontFamily: F.display, fontSize: 'clamp(15px,2.2vw,19px)', fontWeight: 600, color: 'var(--fg-100)', lineHeight: 1.7, margin: '0 0 16px', fontStyle: 'italic' }}>
              "<RevealText text={dailyWord.verse_text}/>"
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setMeditate(true)} style={{ background: 'none', border: `1px solid ${C.gold}44`, borderRadius: 8, padding: '7px 16px', fontFamily: F.body, fontSize: 13, color: C.gold, cursor: 'pointer' }}>
                🧘 Meditate
              </button>
              <Link to="/forum/exegesis" style={{ fontFamily: F.body, fontSize: 13, color: 'var(--fg-5)', padding: '7px 0' }}>
                Discuss in forum →
              </Link>
            </div>
          </div>
        )}

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          opacity: scrolled ? 0 : 0.5, transition: 'opacity 0.4s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
        }}>
          <span style={{ fontFamily: F.body, fontSize: 11, color: 'var(--fg-100)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Explore</span>
          <span style={{ color: 'var(--fg-100)', fontSize: 18, animation: 'bounce-y 1.5s infinite' }}>↓</span>
        </div>

        <style>{`
          @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}
          @keyframes bounce-y{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
        `}</style>
      </section>

      {/* ── SECTION 2: COMMUNITY PULSE ── */}
      {pulse && (
        <section style={{
          background: 'var(--fg-03)',
          borderTop: '1px solid var(--fg-06)',
          borderBottom: '1px solid var(--fg-06)',
          padding: '18px 24px'
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>This week</span>
            {[
              { val: pulse.total?.members, label: 'members' },
              { val: pulse.week?.newThreads, label: 'new discussions' },
              { val: pulse.week?.newReplies, label: 'replies' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: 'var(--fg-100)' }}>{s.val ?? '—'}</span>
                <span style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-4)' }}>{s.label}</span>
              </div>
            ))}
            {pulse.week?.topThread && (
              <Link to={`/thread/${pulse.week.topThread.id}`} style={{ fontFamily: F.body, fontSize: 13, color: 'var(--fg-5)', borderLeft: '1px solid var(--fg-1)', paddingLeft: 20 }}>
                🔥 <strong style={{ color: 'var(--fg-75)' }}>{pulse.week.topThread.title.slice(0, 42)}…</strong>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── SECTION 3: ARMCHAIR FEATURE ── */}
      <section style={{
        backgroundImage: `linear-gradient(var(--ov-82), var(--ov-9)), url(/ambient/bg-loop.jpg)`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        padding: '64px 24px'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 48, alignItems: 'center' }} className="armchair-grid">
          <div>
            <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>🎙 The Armchair</p>
            <h2 style={{ fontFamily: F.display, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: 'var(--fg-100)', marginBottom: 16, lineHeight: 1.15 }}>
              Live conversations.<br/>Ambient music.<br/>Reflections in writing.
            </h2>
            <p style={{ fontFamily: F.body, fontSize: 15.5, color: 'var(--fg-62)', lineHeight: 1.8, marginBottom: 28 }}>
              Join live audio discussions with guests, listen back to past sessions, and read written reflections between broadcasts.
            </p>
            {isLive && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse-dot 1.2s infinite', display: 'inline-block' }}/>
                <span style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 700, color: 'var(--fg-100)' }}>Live right now</span>
              </div>
            )}
            <Link to="/armchair" style={{
              display: 'inline-block',
              background: `linear-gradient(135deg, ${C.gold}, var(--c-gold-light))`,
              color: C.navy, borderRadius: 10, padding: '12px 26px',
              fontFamily: F.body, fontSize: 14.5, fontWeight: 700,
              boxShadow: '0 6px 20px rgba(201,168,76,0.3)'
            }}>
              {isLive ? '🎧 Join Live →' : 'Enter The Armchair →'}
            </Link>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {armchair?.posts?.slice(0, 2).map(p => (
              <Link key={p.id} to="/armchair" style={{
                display: 'grid', gridTemplateColumns: '70px 1fr',
                background: 'var(--fg-06)', border: '1px solid var(--fg-1)',
                borderRadius: 12, overflow: 'hidden', textDecoration: 'none',
                transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--fg-1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--fg-06)'}
              >
                <div style={{ backgroundImage: `url(${p.cover_image || IMAGES.armchairHero})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ fontFamily: F.display, fontSize: 13.5, fontWeight: 700, color: 'var(--fg-100)', margin: '0 0 4px', lineHeight: 1.3 }}>{p.title}</p>
                  {p.excerpt && <p style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-5)', margin: 0 }}>{p.excerpt.slice(0, 65)}…</p>}
                </div>
              </Link>
            ))}
            {!armchair?.posts?.length && (
              <div style={{ background: 'var(--fg-05)', border: '1px solid var(--fg-08)', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
                <p style={{ fontFamily: F.body, fontSize: 13.5, color: 'var(--fg-4)', marginBottom: 12 }}>Live conversations and recorded sessions — all in one place.</p>
                <Link to="/armchair" style={{ color: C.gold, fontFamily: F.body, fontSize: 13, fontWeight: 600 }}>Enter The Armchair →</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: LIVE DISCUSSIONS ── */}
      <section style={{ padding: '64px 24px', maxWidth: 900, margin: '0 auto' }} ref={discoverRef}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: 'var(--fg-100)' }}>Active Discussions</h2>
          <Link to="/forum" style={{ fontFamily: F.body, fontSize: 13.5, color: C.gold, fontWeight: 600 }}>See all →</Link>
        </div>
        {threads.length === 0 ? (
          <p style={{ fontFamily: F.body, color: 'var(--fg-4)', textAlign: 'center', padding: '32px 0' }}>
            No discussions yet — <Link to="/new-thread" style={{ color: C.gold }}>be the first!</Link>
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {threads.slice(0, 5).map(t => (
              <div key={t.id} onClick={() => { recordActivity('thread', t.id); navigate(`/thread/${t.id}`) }} style={{
                background: 'var(--surface-card)', backdropFilter: 'blur(8px)',
                border: '1px solid var(--fg-07)', borderRadius: 12,
                padding: '16px 20px', cursor: 'pointer', transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated-b)'; e.currentTarget.style.borderColor = `${C.gold}44` }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.borderColor = 'var(--fg-07)' }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                  <span style={{ background: 'rgba(201,168,76,0.12)', color: C.gold, borderRadius: 5, padding: '2px 9px', fontSize: 11, fontFamily: F.body, fontWeight: 600 }}>{t.cat_label}</span>
                  <span style={{ fontFamily: F.body, fontSize: 11, color: 'var(--fg-3)', marginLeft: 'auto' }}>
                    {Math.floor((Date.now() - new Date(t.created_at+'Z').getTime()) / 3600000)}h ago
                  </span>
                </div>
                <h3 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: 'var(--fg-100)', margin: '0 0 6px', lineHeight: 1.35 }}>{t.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar name={t.display_name} color={t.avatar_color} size={20}/>
                    <span style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-45)' }}>{t.display_name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontFamily: F.body, fontSize: 11.5, color: 'var(--fg-35)' }}>💬 {t.reply_count}</span>
                    <span style={{ fontFamily: F.body, fontSize: 11.5, color: 'var(--fg-35)' }}>👁 {t.view_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/forum" style={{
            display: 'inline-block',
            background: 'var(--fg-06)', color: 'var(--fg-7)',
            border: '1px solid var(--fg-1)', borderRadius: 10,
            padding: '12px 28px', fontFamily: F.body, fontSize: 14
          }}>View all discussions →</Link>
        </div>
      </section>

      {/* ── SECTION 5: EXPLORE PATHWAYS ── */}
      <section style={{ background: 'var(--fg-02)', borderTop: '1px solid var(--fg-05)', padding: '56px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: 'var(--fg-100)', textAlign: 'center', marginBottom: 8 }}>Where would you like to go?</h2>
          <p style={{ fontFamily: F.body, fontSize: 14.5, color: 'var(--fg-4)', textAlign: 'center', marginBottom: 32 }}>Every door leads deeper into the Word</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14 }}>
            {[
              { icon:'🌱', label:"Seekers' Corner", sub:'No wrong questions', to:'/forum/seekers', gold:false },
              { icon:'📖', label:'Bible Study Hub', sub:'Read with AI insights', to:'/bible', gold:false },
              { icon:'⚡', label:'Theology', sub:'Doctrine & apologetics', to:'/forum/theology', gold:false },
              { icon:'🕊️', label:'Prophecy', sub:'Messianic & end times', to:'/forum/prophecy', gold:false },
              { icon:'🙏', label:'Prayer & Life', sub:'Faith in daily life', to:'/forum/prayer', gold:false },
              { icon:'🙏', label:'Prayer of Salvation', sub:'Come as you are', to:'/salvation', gold:true },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '16px', borderRadius: 12, textDecoration: 'none',
                background: item.gold ? `rgba(201,168,76,0.1)` : 'var(--fg-04)',
                border: `1px solid ${item.gold ? C.gold + '44' : 'var(--fg-07)'}`,
                transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = item.gold ? 'rgba(201,168,76,0.15)' : 'var(--fg-08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = item.gold ? 'rgba(201,168,76,0.1)' : 'var(--fg-04)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <span style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</span>
                <p style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 700, color: item.gold ? C.gold : 'var(--fg-100)', margin: '0 0 3px' }}>{item.label}</p>
                <p style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-4)', margin: 0 }}>{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:700px){ .armchair-grid{ grid-template-columns:1fr !important } }
      `}</style>

      <TourModal isOpen={showTour} onClose={() => setShowTour(false)} />
    </div>
  )
}
