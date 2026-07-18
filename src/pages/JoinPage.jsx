import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { Logo } from '../components/ui.jsx'

export default function JoinPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [inviter, setInviter] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Store invite code in sessionStorage so register page can pick it up
    if (code) sessionStorage.setItem('de_invite_code', code)
    setTimeout(() => setVisible(true), 60)

    // Try to get inviter name from the code
    if (code) {
      const username = code.split('-').slice(0, -1).join('-')
      if (username) setInviter(username)
    }
  }, [code])

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${C.navy} 0%, #1a3a5c 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease'
    }}>
      {/* Decorative rings */}
      {[200, 360, 520].map((r, i) => (
        <div key={i} style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: r, height: r, borderRadius: '50%',
          border: `1px solid ${C.gold}${['12','0a','06'][i]}`,
          pointerEvents: 'none'
        }}/>
      ))}

      <div style={{
        background: '#fff', borderRadius: 20, padding: '44px 36px',
        maxWidth: 460, width: '100%', textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        position: 'relative', zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Logo size={48}/>
        </div>

        <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.navy, marginBottom: 10, lineHeight: 1.2 }}>
          You've been invited to<br/>
          <span style={{ color: C.gold }}>Discussions Exegetica</span>
        </h1>

        {inviter && (
          <div style={{ background: C.mist, borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'inline-block' }}>
            <span style={{ fontFamily: F.body, fontSize: 13.5, color: C.navyLight }}>
              Invited by <strong style={{ color: C.navy }}>@{inviter}</strong>
            </span>
          </div>
        )}

        <p style={{ fontFamily: F.body, fontSize: 15, color: '#5a5346', lineHeight: 1.75, marginBottom: 28 }}>
          A global community where Scripture is opened together — honest questions welcome, all backgrounds respected.
        </p>

        <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
          {[
            { icon: '💬', text: 'Join thousands of Bible discussions' },
            { icon: '🎙️', text: 'Listen to live audio conversations' },
            { icon: '📖', text: 'Study with an AI-powered Bible helper' },
            { icon: '🔥', text: 'Build a daily reading streak' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: C.parchment, borderRadius: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontFamily: F.body, fontSize: 13.5, color: '#2C2416' }}>{item.text}</span>
            </div>
          ))}
        </div>

        <Link to="/register" style={{
          display: 'block', background: C.gold, color: C.navy,
          borderRadius: 12, padding: '14px', fontFamily: F.body,
          fontSize: 16, fontWeight: 700, marginBottom: 12,
          transition: 'opacity 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Join Free — Create Your Account →
        </Link>

        <p style={{ fontFamily: F.body, fontSize: 13, color: '#5a5346' }}>
          Already a member? <Link to="/login" style={{ color: C.gold, fontWeight: 600 }}>Sign in</Link>
        </p>

        <p style={{ fontFamily: F.body, fontSize: 11.5, color: '#5a5346', marginTop: 20 }}>
          Free forever · No spam · Cancel anytime
        </p>
      </div>
    </div>
  )
}
