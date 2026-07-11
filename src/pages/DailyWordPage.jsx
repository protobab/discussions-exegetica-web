import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Logo } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { useAuth } from '../lib/auth.jsx'
import { useStreak } from '../lib/useStreak.js'
import { IMAGES } from '../lib/images.js'

function RevealText({ text }) {
  const [shown, setShown] = useState(0)
  const words = text.split(' ')
  useEffect(() => {
    if (shown >= words.length) return
    const t = setTimeout(() => setShown(s => s + 1), 90)
    return () => clearTimeout(t)
  }, [shown, words.length])
  return (
    <>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < shown ? 1 : 0, transition: 'opacity 0.4s', marginRight: 4, display: 'inline-block' }}>{w}</span>
      ))}
    </>
  )
}

export default function DailyWordPage() {
  usePageTitle("Today's Word")
  const [word, setWord] = useState(null)
  const [meditate, setMeditate] = useState(false)
  const [visible, setVisible] = useState(false)
  const { user } = useAuth()
  const { recordActivity } = useStreak()

  useEffect(() => {
    fetch(`${API}/daily-word`).then(r=>r.json()).then(d => {
      setWord(d.word)
      setTimeout(() => setVisible(true), 100)
    }).catch(()=>{})
    if (user) recordActivity('daily-word', null)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundImage: `linear-gradient(to bottom, rgba(27,42,74,0.88) 0%, rgba(10,20,45,0.94) 100%), url(${IMAGES.dailyHero})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative circles */}
      {[300, 500, 700].map((r, i) => (
        <div key={i} style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: r, height: r, borderRadius: '50%',
          border: `1px solid ${C.gold}${['10','08','05'][i]}`,
          pointerEvents: 'none',
          animation: `breathe ${4+i}s ease-in-out infinite`
        }}/>
      ))}

      {/* MEDITATE OVERLAY */}
      {meditate && word && (
        <div onClick={() => setMeditate(false)} style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(10,15,30,0.98)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', padding: 40, cursor: 'pointer'
        }}>
          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 40 }}>
            Be still · Know · Rest
          </p>
          <blockquote style={{
            fontFamily: F.display, fontSize: 'clamp(20px,4vw,36px)',
            fontWeight: 700, color: '#fff', textAlign: 'center',
            lineHeight: 1.65, maxWidth: 680, margin: '0 0 28px',
            animation: 'fadeInUp 1.4s ease'
          }}>
            "{word.verse_text}"
          </blockquote>
          <p style={{ fontFamily: F.body, fontSize: 18, color: C.gold, fontWeight: 700 }}>— {word.verse_ref}</p>
          <p style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 60 }}>Tap anywhere to return</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center', opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><Logo size={44}/></div>

        <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
          Today's Word
        </p>

        {word ? (
          <>
            {word.theme && (
              <p style={{ fontFamily: F.body, fontSize: 13.5, color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontStyle: 'italic' }}>
                Theme: {word.theme}
              </p>
            )}

            <blockquote style={{
              fontFamily: F.display,
              fontSize: 'clamp(20px,4vw,30px)',
              fontWeight: 700, color: '#fff',
              lineHeight: 1.65, margin: '0 0 22px',
              borderLeft: `3px solid ${C.gold}`,
              paddingLeft: 24, textAlign: 'left',
              animation: 'fadeInUp 0.8s ease'
            }}>
              <RevealText text={`"${word.verse_text}"`}/>
            </blockquote>

            <p style={{ fontFamily: F.body, fontSize: 17, fontWeight: 700, color: C.gold, marginBottom: 36 }}>
              — {word.verse_ref}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
              <button onClick={() => setMeditate(true)} style={{
                background: 'rgba(201,168,76,0.12)', color: C.gold,
                border: `1px solid ${C.gold}55`, borderRadius: 10,
                padding: '12px 24px', fontFamily: F.body, fontSize: 14.5,
                fontWeight: 600, cursor: 'pointer'
              }}>
                🧘 Meditate on this verse
              </button>
              <Link to="/forum/exegesis" style={{
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                padding: '12px 24px', fontFamily: F.body, fontSize: 14.5
              }}>
                Discuss in forum →
              </Link>
            </div>

            {/* Daily reflection prompt */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '24px' }}>
              <p style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                A question for today
              </p>
              <p style={{ fontFamily: F.body, fontSize: 14.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 0 18px' }}>
                As you carry <em style={{ color: C.goldLight }}>{word.verse_ref}</em> through your day — where in your life does this truth most need to land?
              </p>
              <Link to="/forum/prayer" style={{ color: C.gold, fontFamily: F.body, fontSize: 13.5, fontWeight: 600 }}>
                Share your reflection in Prayer &amp; Life →
              </Link>
            </div>
          </>
        ) : (
          <p style={{ fontFamily: F.body, color: 'rgba(255,255,255,0.5)' }}>Loading today's word…</p>
        )}
      </div>

      <style>{`
        @keyframes breathe { 0%,100%{opacity:0.6} 50%{opacity:0.3} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
