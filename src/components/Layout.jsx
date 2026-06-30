import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { C, F } from '../lib/tokens.js'
import { Logo } from './ui.jsx'
import NotificationBell from './NotificationBell.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: F.body, background: C.parchment, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        button{cursor:pointer}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-thumb{background:${C.gold}88;border-radius:3px}
        @media (max-width: 560px) {
          .de-username { display: none; }
          .de-nav-links a { padding: 6px 8px !important; font-size: 12px !important; }
        }
      `}</style>

      <nav className="de-nav" style={{
        background: C.navy, minHeight: 60, padding: '8px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)', flexWrap: 'wrap', gap: 8
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={28} />
          <span style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
            Discussions <span style={{ color: C.gold }}>Exegetica</span>
          </span>
        </Link>

        <div className="de-nav-links" style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[['Forum','/forum'],['Groups','/groups'],['Armchair','/armchair'],['Daily Word','/daily-word']].map(([l,t]) => (
            <Link key={l} to={t} style={{
              color: 'rgba(255,255,255,0.75)', fontFamily: F.body,
              fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap'
            }}>{l}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <>
              <NotificationBell />
              <span className="de-username" style={{ color: C.gold, fontFamily: F.body, fontSize: 13, fontWeight: 600 }}>
                {user.display_name}
              </span>
              <button onClick={() => { logout(); navigate('/') }} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', borderRadius: 7, padding: '6px 10px',
                fontFamily: F.body, fontSize: 12
              }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: F.body, fontSize: 13, padding: '6px 10px' }}>
                Sign in
              </Link>
              <Link to="/register" style={{
                background: C.gold, color: C.navy, borderRadius: 8,
                padding: '7px 14px', fontFamily: F.body, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap'
              }}>Join Free</Link>
            </>
          )}
        </div>
      </nav>

      <main><Outlet /></main>

      <footer style={{
        background: C.navy, color: 'rgba(255,255,255,0.45)',
        textAlign: 'center', padding: '24px 32px',
        fontFamily: F.body, fontSize: 13, marginTop: 40
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
          <Logo size={20}/>
          <span style={{ color:'#fff', fontFamily: F.display, fontWeight:600 }}>Discussions Exegetica</span>
        </div>
        <p>A global biblical discussion community · Free · Always open</p>
      </footer>
    </div>
  )
}
