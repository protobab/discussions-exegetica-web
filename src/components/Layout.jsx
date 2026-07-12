import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { C, F } from '../lib/tokens.js'
import { Logo } from './ui.jsx'
import NotificationBell from './NotificationBell.jsx'
import AnnouncementBanner from './AnnouncementBanner.jsx'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Home',       path: '/',           icon: '⌂' },
  { label: 'Forum',      path: '/forum',       icon: '💬' },
  { label: 'Groups',     path: '/groups',      icon: '👥' },
  { label: 'Bible',      path: '/bible',       icon: '📖' },
  { label: 'Armchair',   path: '/armchair',    icon: '🎙️' },
  { label: 'Daily Word', path: '/daily-word',  icon: '✦' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <div style={{ fontFamily: F.body, minHeight: '100vh', background: '#0a0f1e' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${C.gold}66; border-radius: 3px; }

        /* Desktop nav */
        .de-desktop-nav { display: flex; }
        .de-mobile-bottom { display: none; }
        .de-user-desktop { display: flex; }

        /* Mobile */
        @media(max-width: 768px) {
          .de-desktop-nav { display: none !important; }
          .de-mobile-bottom { display: flex !important; }
          .de-user-desktop { display: none !important; }
          .de-main { padding-bottom: 64px; }
        }
      `}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        minHeight: 58, padding: '0 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 24px rgba(0,0,0,0.4)',
        gap: 8
      }}>
        {/* Logo + wordmark */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Logo size={30}/>
          <div>
            <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: '#fff' }}>
              Discussions <span style={{ color: C.gold }}>Exegetica</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="de-desktop-nav" style={{ gap: 2, alignItems: 'center' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path} style={{
              color: isActive(item.path) ? C.gold : 'rgba(255,255,255,0.65)',
              fontFamily: F.body, fontSize: 13, fontWeight: isActive(item.path) ? 700 : 500,
              padding: '6px 11px', borderRadius: 7, whiteSpace: 'nowrap',
              borderBottom: isActive(item.path) ? `2px solid ${C.gold}` : '2px solid transparent',
              transition: 'all 0.15s'
            }}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop user area */}
        <div className="de-user-desktop" style={{ gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {user ? (
            <>
              <NotificationBell/>
              <Link to={`/profile/${user.username}`} style={{
                color: C.gold, fontFamily: F.body, fontSize: 12.5, fontWeight: 600,
                maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{user.display_name}</Link>
              <button onClick={() => { logout(); navigate('/') }} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.65)', borderRadius: 7, padding: '6px 11px',
                fontFamily: F.body, fontSize: 12
              }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: F.body, fontSize: 13, padding: '6px 10px' }}>Sign in</Link>
              <Link to="/register" style={{
                background: `linear-gradient(135deg, ${C.gold} 0%, #E8C97A 100%)`,
                color: C.navy, borderRadius: 8, padding: '7px 16px',
                fontFamily: F.body, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap'
              }}>Join Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── ANNOUNCEMENT BANNER ── */}
      <AnnouncementBanner/>

      {/* ── MAIN CONTENT ── */}
      <main className="de-main">
        <Outlet/>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        background: 'linear-gradient(to bottom, #0a0f1e, #060a14)',
        borderTop: '1px solid rgba(201,168,76,0.1)',
        padding: '36px 24px 28px', fontFamily: F.body, fontSize: 13,
        color: 'rgba(255,255,255,0.35)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <Logo size={28}/>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontFamily: F.display, fontSize: 16, fontWeight: 700 }}>
              Discussions <span style={{ color: C.gold }}>Exegetica</span>
            </span>
          </div>
          <p style={{ textAlign: 'center', marginBottom: 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Where Scripture is opened together · A global biblical discussion community · Free · Always open
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['Forum','/forum'],['Armchair','/armchair'],['Bible','/bible'],
              ['Groups','/groups'],['Daily Word','/daily-word'],
              ['Prayer of Salvation','/salvation'],['Contact','/contact'],
              ['Privacy Policy','/privacy'],['Terms of Use','/terms']].map(([l,t]) => (
              <Link key={l} to={t} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="de-mobile-bottom" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(8,12,24,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(201,168,76,0.2)',
        display: 'none', // overridden by CSS media query
        alignItems: 'center', justifyContent: 'space-around',
        padding: '6px 0 env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)'
      }}>
        {[
          { label: 'Home',     path: '/',          icon: '⌂' },
          { label: 'Forum',    path: '/forum',      icon: '💬' },
          { label: 'Bible',    path: '/bible',      icon: '📖' },
          { label: 'Armchair', path: '/armchair',   icon: '🎙️' },
          { label: 'More',     path: null,          icon: '☰' },
        ].map(item => item.path ? (
          <Link key={item.path} to={item.path} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, padding: '6px 12px', borderRadius: 8, minWidth: 52,
            color: isActive(item.path) ? C.gold : 'rgba(255,255,255,0.45)',
            transition: 'color 0.15s'
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontFamily: F.body, fontSize: 10, fontWeight: isActive(item.path) ? 700 : 400 }}>
              {item.label}
            </span>
          </Link>
        ) : (
          <button key="more" onClick={() => setMenuOpen(o => !o)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, padding: '6px 12px', borderRadius: 8, minWidth: 52,
            background: 'none', border: 'none',
            color: menuOpen ? C.gold : 'rgba(255,255,255,0.45)'
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontFamily: F.body, fontSize: 10 }}>More</span>
          </button>
        ))}

        {/* Mobile more menu */}
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 190 }}/>
            <div style={{
              position: 'fixed', bottom: 64, left: 12, right: 12, zIndex: 201,
              background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(16px)',
              borderRadius: 16, border: '1px solid rgba(201,168,76,0.2)',
              padding: '16px', boxShadow: '0 -8px 32px rgba(0,0,0,0.6)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  ['👥 Groups', '/groups'],
                  ['✦ Daily Word', '/daily-word'],
                  ['🙏 Salvation', '/salvation'],
                  ['✉ Contact', '/contact'],
                  ...(user ? [[`👤 ${user.display_name}`, `/profile/${user.username}`]] : [['🌱 Register', '/register']]),
                ].map(([l, t]) => (
                  <Link key={t} to={t} onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                    borderRadius: 10, fontFamily: F.body, fontSize: 13.5,
                    color: '#fff', border: '1px solid rgba(255,255,255,0.08)'
                  }}>{l}</Link>
                ))}
              </div>
              {user ? (
                <button onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} style={{
                  width: '100%', background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
                  padding: '10px', fontFamily: F.body, fontSize: 13.5,
                  color: '#EF4444', fontWeight: 600
                }}>Sign out</button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  display: 'block', width: '100%', background: C.gold,
                  borderRadius: 10, padding: '10px', fontFamily: F.body,
                  fontSize: 13.5, fontWeight: 700, color: C.navy, textAlign: 'center'
                }}>Sign in</Link>
              )}
            </div>
          </>
        )}
      </nav>
    </div>
  )
}
