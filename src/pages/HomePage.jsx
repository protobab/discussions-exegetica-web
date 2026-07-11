import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Logo, Card, Avatar, BadgeTag } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { useAuth } from '../lib/auth.jsx'
import { useStreak } from '../lib/useStreak.js'
import { IMAGES, OVERLAY } from '../lib/images.js'

// Animated word-by-word text reveal
function RevealText({ text, style = {} }) {
  const [shown, setShown] = useState(0)
  const words = text.split(' ')
  useEffect(() => {
    if (shown >= words.length) return
    const t = setTimeout(() => setShown(s => s + 1), 80)
    return () => clearTimeout(t)
  }, [shown, words.length])
  return (
    <span style={style}>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < shown ? 1 : 0, transition: 'opacity 0.3s', marginRight: 4, display: 'inline-block' }}>{w}</span>
      ))}
    </span>
  )
}

// Streak flame badge
function StreakBadge({ streak }) {
  if (!streak || streak < 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.12)', border: `1px solid ${C.gold}44`, borderRadius: 20, padding: '4px 12px' }}>
      <span style={{ fontSize: 16 }}>🔥</span>
      <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.gold }}>{streak} day{streak !== 1 ? 's' : ''}</span>
    </div>
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
  const [pageVisible, setPageVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setPageVisible(true), 50)
    fetch(`${API}/daily-word`).then(r=>r.json()).then(d=>setDailyWord(d.word)).catch(()=>{})
    fetch(`${API}/threads`).then(r=>r.json()).then(d=>setThreads(d.threads||[])).catch(()=>{})
    fetch(`${API}/pulse`).then(r=>r.json()).then(d=>setPulse(d)).catch(()=>{})
    fetch(`${API}/armchair/feed`).then(r=>r.json()).then(d=>setArmchair(d)).catch(()=>{})
    if (user) recordActivity('visit', null)
  }, [user])

  const isLive = armchair?.featured?.status === 'live'

  return (
    <div style={{ opacity: pageVisible ? 1 : 0, transition: 'opacity 0.5s ease', background: C.parchment, minHeight: '100vh' }}>

      {/* MEDITATE OVERLAY */}
      {meditate && dailyWord && (
        <div onClick={() => setMeditate(false)} style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(27,42,74,0.97)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', padding: 40, cursor: 'pointer'
        }}>
          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 32 }}>
            Meditate · Be still · Know
          </p>
          <blockquote style={{
            fontFamily: F.display, fontSize: 'clamp(22px,4vw,38px)', fontWeight: 700,
            color: '#fff', textAlign: 'center', lineHeight: 1.6,
            maxWidth: 680, margin: '0 0 28px',
            animation: 'fadeInUp 1.2s ease'
          }}>
            "{dailyWord.verse_text}"
          </blockquote>
          <p style={{ fontFamily: F.body, fontSize: 18, color: C.gold, fontWeight: 700 }}>— {dailyWord.verse_ref}</p>
          <p style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 48 }}>Tap anywhere to return</p>
          <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}

      {/* HERO — bold photography */}
      <div style={{
        backgroundImage: `linear-gradient(135deg, rgba(27,42,74,0.78) 0%, rgba(46,66,112,0.82) 100%), url(${IMAGES.homeHero})`,
        backgroundSize: 'cover', backgroundPosition: 'center top',
        padding: '80px 24px 72px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {[200, 360, 520].map((r, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: r, height: r, borderRadius: '50%',
            border: `1px solid ${C.gold}${['14','0c','08'][i]}`,
            pointerEvents: 'none',
            animation: `pulse-ring ${3 + i}s ease-in-out infinite`,
          }}/>
        ))}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><Logo size={52}/></div>
        <h1 style={{
          fontFamily: F.display, fontSize: 'clamp(28px,5vw,52px)',
          fontWeight: 900, color: '#fff', margin: '0 0 14px', lineHeight: 1.12,
          position: 'relative'
        }}>
          Where Scripture is<br/><span style={{ color: C.gold }}>opened together.</span>
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 16.5, color: 'rgba(255,255,255,0.7)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.75 }}>
          A global community for honest seekers and devoted believers — asking real questions, studying Scripture deeply, and walking in the light of Christ.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/forum" style={{ background: C.gold, color: C.navy, borderRadius: 10, padding: '13px 26px', fontFamily: F.body, fontSize: 15, fontWeight: 700, transition: 'transform 0.15s' }}>Enter the Forum</Link>
          <Link to="/register" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '13px 26px', fontFamily: F.body, fontSize: 15, fontWeight: 600 }}>I'm new — start here 🌱</Link>
        </div>
        <style>{`@keyframes pulse-ring{0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)}50%{opacity:0.3;transform:translate(-50%,-50%) scale(1.04)}}`}</style>
      </div>

      {/* WELCOME BACK BANNER — personalised for returning users */}
      {user && (streak > 0 || lastThread) && (
        <div style={{ background: C.navy, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: F.body, fontSize: 13.5, color: '#fff' }}>
            Welcome back, <strong style={{ color: C.gold }}>{user.display_name}</strong>
          </span>
          {streak > 0 && <StreakBadge streak={streak}/>}
          {lastThread && (
            <Link to={`/thread/${lastThread.id}`} style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.7)', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 20 }}>
              ↩ Continue reading: <span style={{ color: C.goldLight }}>{lastThread.title.slice(0, 40)}…</span>
            </Link>
          )}
          {lastBibleRef && !lastThread && (
            <Link to={`/bible?ref=${lastBibleRef}`} style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.7)', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 20 }}>
              ↩ Return to <span style={{ color: C.goldLight }}>{lastBibleRef}</span> in Bible Study
            </Link>
          )}
        </div>
      )}

      {/* LIVE INDICATOR — if armchair session is live */}
      {isLive && (
        <div style={{ background: '#DC2626', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse-dot 1.2s infinite' }}/>
          <span style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 700, color: '#fff' }}>
            Live now: {armchair.featured.title}
          </span>
          <Link to={`/armchair/session/${armchair.featured.id}`} style={{ background: '#fff', color: '#DC2626', borderRadius: 6, padding: '4px 12px', fontFamily: F.body, fontSize: 12.5, fontWeight: 700 }}>
            Join →
          </Link>
          <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        </div>
      )}

      {/* DAILY WORD — immersive with meditate button */}
      {dailyWord && (
        <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1a3a5c 100%)`, padding: '36px 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16 }}>
              Today's Word · {dailyWord.theme}
            </p>
            <blockquote style={{ fontFamily: F.display, fontSize: 'clamp(17px,3vw,24px)', fontWeight: 700, color: '#fff', lineHeight: 1.6, margin: '0 0 18px', borderLeft: `3px solid ${C.gold}`, paddingLeft: 20, textAlign: 'left' }}>
              <RevealText text={`"${dailyWord.verse_text}"`}/>
            </blockquote>
            <p style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 20 }}>— {dailyWord.verse_ref}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setMeditate(true)} style={{ background: 'rgba(201,168,76,0.15)', color: C.gold, border: `1px solid ${C.gold}44`, borderRadius: 8, padding: '9px 20px', fontFamily: F.body, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                🧘 Meditate on this
              </button>
              <Link to="/forum/exegesis" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '9px 20px', fontFamily: F.body, fontSize: 13.5 }}>
                Discuss in forum →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY PULSE */}
      {pulse && (
        <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}`, padding: '14px 24px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontFamily: F.body, fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>This week</span>
            {[
              { val: pulse.week?.newMembers, label: 'new members' },
              { val: pulse.week?.newThreads, label: 'discussions' },
              { val: pulse.week?.newReplies, label: 'replies' },
              { val: pulse.total?.members, label: 'total members' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.navy }}>{s.val ?? '—'}</span>
                <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{s.label}</span>
              </div>
            ))}
            {pulse.week?.topThread && (
              <Link to={`/thread/${pulse.week.topThread.id}`} style={{ fontFamily: F.body, fontSize: 12.5, color: C.navyLight, borderLeft: `1px solid ${C.border}`, paddingLeft: 16 }}>
                🔥 Most loved: <strong>{pulse.week.topThread.title.slice(0, 45)}…</strong>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ARMCHAIR FEATURE */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        backgroundImage: `linear-gradient(rgba(27,42,74,0.78), rgba(27,42,74,0.88)), url(/ambient/bg-loop.jpg), url(${IMAGES.homeHero})`,
        backgroundSize: 'cover, cover, cover',
        backgroundPosition: 'center, center, center',
        padding: '52px 24px',
      }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 40, alignItems: 'center' }} className="armchair-home-grid">
            <div>
              <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>🎙 The Armchair</p>
              <h2 style={{ fontFamily: F.display, fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.2 }}>
                Live conversations,<br/>ambient music &amp; reflections.
              </h2>
              <p style={{ fontFamily: F.body, fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: 22, maxWidth: 420 }}>
                Join Eki and guests for live audio armchair discussions on faith, Scripture and life. Past sessions recorded and available to listen back.
              </p>
              {isLive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '10px 16px', width: 'fit-content' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse-dot 1.2s infinite' }}/>
                  <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: '#fff' }}>Live now</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/armchair" style={{ background: C.gold, color: C.navy, borderRadius: 10, padding: '11px 22px', fontFamily: F.body, fontSize: 14, fontWeight: 700 }}>
                  {isLive ? '🎧 Join Live →' : 'Enter The Armchair →'}
                </Link>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {armchair?.posts?.slice(0, 2).map(p => (
                <Link key={p.id} to="/armchair" style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden', textDecoration: 'none', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.13)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                >
                  <div style={{ backgroundImage: `url(${p.cover_image||'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=200&q=50'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
                  <div style={{ padding: '10px 10px 10px 0' }}>
                    <p style={{ fontFamily: F.display, fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 3px', lineHeight: 1.3 }}>{p.title}</p>
                    {p.excerpt && <p style={{ fontFamily: F.body, fontSize: 11.5, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{p.excerpt.slice(0, 60)}…</p>}
                  </div>
                </Link>
              ))}
              {!armchair?.posts?.length && (
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '18px', textAlign: 'center' }}>
                  <p style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>🎵 Ambient worship music playing now</p>
                  <Link to="/armchair" style={{ color: C.gold, fontFamily: F.body, fontSize: 13, fontWeight: 600 }}>Enter the Armchair →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE DISCUSSIONS FEED */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '44px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 28, alignItems: 'start' }} className="home-feed-grid">

          {/* Main feed */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.navy }}>Active Discussions</h2>
              <Link to="/forum" style={{ border: `1.5px solid ${C.navy}`, color: C.navy, borderRadius: 8, padding: '6px 14px', fontFamily: F.body, fontSize: 12.5, fontWeight: 600 }}>See all →</Link>
            </div>
            {threads.length === 0
              ? <Card><p style={{ fontFamily: F.body, color: C.muted, textAlign: 'center', padding: '24px 0' }}>No discussions yet — <Link to="/new-thread" style={{ color: C.gold, fontWeight: 600 }}>be the first!</Link></p></Card>
              : <div style={{ display: 'grid', gap: 10 }}>
                  {threads.slice(0, 6).map(t => <HomeThreadCard key={t.id} thread={t} onClick={() => { recordActivity('thread', t.id); navigate(`/thread/${t.id}`) }}/>)}
                </div>
            }
          </div>

          {/* Sidebar */}
          <div style={{ display: 'grid', gap: 16 }}>

            {/* Streak card */}
            {user && streak > 0 && (
              <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, borderRadius: 14, padding: '20px' }}>
                <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Your Streak</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>🔥</span>
                  <div>
                    <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: '#fff' }}>{streak}</span>
                    <span style={{ fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 6 }}>day{streak !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <p style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Keep coming back daily to maintain your streak. Longest: {streak} day{streak !== 1 ? 's' : ''}.</p>
              </div>
            )}

            {/* Quick navigate */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '18px', border: `1px solid ${C.border}` }}>
              <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>Explore</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { icon: '🌱', label: "Seekers' Corner", sub: 'No wrong questions here', to: '/forum/seekers', bg: '#F0F7F4' },
                  { icon: '📖', label: 'Bible Study Hub', sub: 'Read with AI insights', to: '/bible', bg: '#F0F5FF' },
                  { icon: '👥', label: 'Study Groups', sub: 'Book-by-book community', to: '/groups', bg: '#FFF8E7' },
                  { icon: '🕊️', label: 'Prophecy', sub: 'Messianic & end times', to: '/forum/prophecy', bg: '#F5F0FF' },
                ].map(item => (
                  <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: item.bg, borderRadius: 10, textDecoration: 'none', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.navy, margin: 0 }}>{item.label}</p>
                      <p style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted, margin: 0 }}>{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Badge journey */}
            <div style={{ background: C.navy, borderRadius: 14, padding: '18px' }}>
              <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>The Journey</p>
              {[{l:'Seeker',c:'#A78BFA',d:'Asking honest questions'},{l:'Disciple',c:'#3B82F6',d:'Consistent learner'},{l:'Elder',c:C.gold,d:'Trusted voice'},{l:'Teacher',c:'#EF4444',d:'Guiding others'}].map((b, i) => (
                <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                  <span style={{ background: b.c+'22', color: b.c, border: `1px solid ${b.c}55`, borderRadius: 4, padding: '1px 7px', fontSize: 10, fontFamily: F.body, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>{b.l}</span>
                  <span style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{b.d}</span>
                </div>
              ))}
              {!user && <Link to="/register" style={{ display: 'block', marginTop: 14, background: C.gold, color: C.navy, borderRadius: 8, padding: '9px', textAlign: 'center', fontFamily: F.body, fontSize: 13, fontWeight: 700 }}>Start your journey →</Link>}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:700px){ .armchair-home-grid,.home-feed-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  )
}

function HomeThreadCard({ thread, onClick }) {
  const timeAgo = ts => {
    const s = Math.floor((Date.now() - new Date(ts+'Z').getTime()) / 1000)
    if (s < 3600) return `${Math.floor(s/60)}m ago`
    if (s < 86400) return `${Math.floor(s/3600)}h ago`
    return `${Math.floor(s/86400)}d ago`
  }
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 10, padding: '13px 16px', border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.09)'; e.currentTarget.style.transform='translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)' }}
    >
      <div style={{ display: 'flex', gap: 7, marginBottom: 5, alignItems: 'center' }}>
        <span style={{ background: C.mist, color: C.navyLight, borderRadius: 5, padding: '1px 7px', fontSize: 10.5, fontFamily: F.body, fontWeight: 600 }}>{thread.cat_label}</span>
        <span style={{ fontFamily: F.body, fontSize: 10.5, color: C.muted, marginLeft: 'auto' }}>{timeAgo(thread.created_at)}</span>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 14.5, fontWeight: 700, color: C.navy, margin: '0 0 4px', lineHeight: 1.35 }}>{thread.title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Avatar name={thread.display_name} color={thread.avatar_color} size={18}/>
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>{thread.display_name}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontFamily: F.body, fontSize: 11, color: C.muted }}>💬 {thread.reply_count}</span>
          <span style={{ fontFamily: F.body, fontSize: 11, color: C.muted }}>👁 {thread.view_count}</span>
        </div>
      </div>
    </div>
  )
}
