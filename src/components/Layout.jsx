import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { C, F } from '../lib/tokens.js'
import { Logo } from './ui.jsx'
import NotificationBell from './NotificationBell.jsx'
import AnnouncementBanner from './AnnouncementBanner.jsx'
import { useState, useEffect } from 'react'
import AmbientPlayer from './AmbientPlayer.jsx'

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
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    let saved = 'dark'
    try { saved = localStorage.getItem('de_theme') || 'dark' } catch {}
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('de_theme', next) } catch {}
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <div style={{ fontFamily: F.body, minHeight: '100vh', background: 'var(--bg-page)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${C.gold}66; border-radius: 3px; }

        /* ── THEME VARIABLES ── */
        /* Dark (default) — the original cinematic navy theme, unchanged */
        :root, [data-theme="dark"] {
          --bg-page: #0a0f1e;
          --fg-100: #fff; --fg-85: rgba(255,255,255,0.85); --fg-8: rgba(255,255,255,0.8);
          --fg-78: rgba(255,255,255,0.78); --fg-75: rgba(255,255,255,0.75); --fg-72: rgba(255,255,255,0.72);
          --fg-7: rgba(255,255,255,0.7); --fg-65: rgba(255,255,255,0.65); --fg-62: rgba(255,255,255,0.62);
          --fg-6: rgba(255,255,255,0.6); --fg-55: rgba(255,255,255,0.55); --fg-5: rgba(255,255,255,0.5);
          --fg-45: rgba(255,255,255,0.45); --fg-4: rgba(255,255,255,0.4); --fg-35: rgba(255,255,255,0.35);
          --fg-3: rgba(255,255,255,0.3); --fg-25: rgba(255,255,255,0.25); --fg-2: rgba(255,255,255,0.2);
          --fg-18: rgba(255,255,255,0.18); --fg-15: rgba(255,255,255,0.15); --fg-14: rgba(255,255,255,0.14);
          --fg-12: rgba(255,255,255,0.12); --fg-1: rgba(255,255,255,0.1); --fg-08: rgba(255,255,255,0.08);
          --fg-07: rgba(255,255,255,0.07); --fg-06: rgba(255,255,255,0.06); --fg-05: rgba(255,255,255,0.05);
          --fg-04: rgba(255,255,255,0.04); --fg-03: rgba(255,255,255,0.03); --fg-02: rgba(255,255,255,0.02);
          --surface-nav: rgba(10,15,30,0.95); --surface-mobilenav: rgba(8,12,24,0.97);
          --surface-authcard: rgba(17,24,39,0.95); --surface-tourpanel: rgba(17,28,52,0.95);
          --surface-modalbackdrop: rgba(4,7,15,0.86); --surface-solid-a: rgba(10,15,30,0.98);
          --surface-solid-b: rgba(10,15,30,0.9); --surface-solid-c: rgba(10,15,30,0.88);
          --surface-elevated-b: rgba(27,42,74,0.8); --surface-solid-h: rgba(6,10,20,0.98);
          --c-gold: #C9A84C; --c-gold-light: #E8C97A; --c-gold-dim: rgba(201,168,76,0.15);
          --c-text: #E8E0D0;
          --ov-25: rgba(10,15,30,0.25); --ov-45: rgba(10,15,30,0.45); --ov-55: rgba(10,15,30,0.55);
          --ov-65: rgba(10,15,30,0.65); --ov-7: rgba(10,15,30,0.7); --ov-72: rgba(10,15,30,0.72);
          --ov-78: rgba(10,15,30,0.78); --ov-8: rgba(10,15,30,0.8); --ov-82: rgba(10,15,30,0.82);
          --ov-85: rgba(10,15,30,0.85); --ov-86: rgba(10,15,30,0.86); --ov-88: rgba(10,15,30,0.88);
          --ov-9: rgba(10,15,30,0.9); --ov-92: rgba(10,15,30,0.92); --ov-93: rgba(10,15,30,0.93);
          --ov-94: rgba(10,15,30,0.94); --ov-96: rgba(10,15,30,0.96); --ov-98: rgba(10,15,30,0.98);
          --surface-card: rgba(27,42,74,0.6);
        }
        /* Light — parchment & ink, same visual hierarchy, same brand gold */
        [data-theme="light"] {
          --bg-page: #F7F3EB;
          --fg-100: #0a0f1e; --fg-85: rgba(10,15,30,0.85); --fg-8: rgba(10,15,30,0.8);
          --fg-78: rgba(10,15,30,0.78); --fg-75: rgba(10,15,30,0.75); --fg-72: rgba(10,15,30,0.72);
          --fg-7: rgba(10,15,30,0.7); --fg-65: rgba(10,15,30,0.65); --fg-62: rgba(10,15,30,0.62);
          --fg-6: rgba(10,15,30,0.6); --fg-55: rgba(10,15,30,0.55); --fg-5: rgba(10,15,30,0.5);
          --fg-45: rgba(10,15,30,0.45); --fg-4: rgba(10,15,30,0.4); --fg-35: rgba(10,15,30,0.35);
          --fg-3: rgba(10,15,30,0.3); --fg-25: rgba(10,15,30,0.25); --fg-2: rgba(10,15,30,0.2);
          --fg-18: rgba(10,15,30,0.18); --fg-15: rgba(10,15,30,0.15); --fg-14: rgba(10,15,30,0.14);
          --fg-12: rgba(10,15,30,0.12); --fg-1: rgba(10,15,30,0.1); --fg-08: rgba(10,15,30,0.08);
          --fg-07: rgba(10,15,30,0.07); --fg-06: rgba(10,15,30,0.06); --fg-05: rgba(10,15,30,0.05);
          --fg-04: rgba(10,15,30,0.04); --fg-03: rgba(10,15,30,0.03); --fg-02: rgba(10,15,30,0.02);
          --surface-nav: rgba(255,255,255,0.92); --surface-mobilenav: rgba(255,255,255,0.95);
          --surface-authcard: rgba(255,255,255,0.96); --surface-tourpanel: rgba(255,255,255,0.97);
          --surface-modalbackdrop: rgba(20,15,5,0.45); --surface-solid-a: #FFFFFF;
          --surface-solid-b: rgba(255,255,255,0.94); --surface-solid-c: rgba(255,255,255,0.93);
          --surface-elevated-b: rgba(255,255,255,0.9); --surface-solid-h: rgba(247,243,235,0.97);
          --c-gold: #8B6914; --c-gold-light: #A67D1F; --c-gold-dim: rgba(139,105,20,0.12);
          --c-text: #2C2416;
          --ov-25: rgba(247,243,235,0.25); --ov-45: rgba(247,243,235,0.45); --ov-55: rgba(247,243,235,0.55);
          --ov-65: rgba(247,243,235,0.65); --ov-7: rgba(247,243,235,0.7); --ov-72: rgba(247,243,235,0.72);
          --ov-78: rgba(247,243,235,0.78); --ov-8: rgba(247,243,235,0.8); --ov-82: rgba(247,243,235,0.82);
          --ov-85: rgba(247,243,235,0.85); --ov-86: rgba(247,243,235,0.86); --ov-88: rgba(247,243,235,0.88);
          --ov-9: rgba(247,243,235,0.9); --ov-92: rgba(247,243,235,0.92); --ov-93: rgba(247,243,235,0.93);
          --ov-94: rgba(247,243,235,0.94); --ov-96: rgba(247,243,235,0.96); --ov-98: rgba(247,243,235,0.98);
          --surface-card: rgba(255,255,255,0.85);
        }
        body { background: var(--bg-page); transition: background 0.25s ease; }

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
        background: 'var(--surface-nav)',
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
            <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: 'var(--fg-100)' }}>
              Discussions <span style={{ color: C.gold }}>Exegetica</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="de-desktop-nav" style={{ gap: 2, alignItems: 'center' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path} style={{
              color: isActive(item.path) ? C.gold : 'var(--fg-65)',
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
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light background' : 'Switch to dark background'}
            title={theme === 'dark' ? 'Switch to light background' : 'Switch to dark background'}
            style={{
              background: 'var(--fg-07)', border: '1px solid var(--fg-15)',
              color: 'var(--fg-8)', borderRadius: 20, height: 32,
              padding: '0 12px 0 4px',
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              fontFamily: F.body, fontSize: 12, fontWeight: 600
            }}
          >
            <span style={{
              width: 24, height: 24, borderRadius: '50%', background: C.gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
            }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          {user ? (
            <>
              <NotificationBell/>
              <Link to={`/profile/${user.username}`} style={{
                color: C.gold, fontFamily: F.body, fontSize: 12.5, fontWeight: 600,
                maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{user.display_name}</Link>
              <button onClick={() => { logout(); navigate('/') }} style={{
                background: 'var(--fg-07)', border: '1px solid var(--fg-15)',
                color: 'var(--fg-65)', borderRadius: 7, padding: '6px 11px',
                fontFamily: F.body, fontSize: 12
              }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--fg-65)', fontFamily: F.body, fontSize: 13, padding: '6px 10px' }}>Sign in</Link>
              <Link to="/register" style={{
                background: `linear-gradient(135deg, ${C.gold} 0%, var(--c-gold-light) 100%)`,
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
      <main className="de-main" style={{ paddingTop: import.meta.env.VITE_PREVIEW === 'true' ? 28 : 0 }}>
        <Outlet/>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        background: 'linear-gradient(to bottom, var(--bg-page), var(--surface-solid-h))',
        borderTop: '1px solid rgba(201,168,76,0.1)',
        padding: '36px 24px 28px', fontFamily: F.body, fontSize: 13,
        color: 'var(--fg-35)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <Logo size={28}/>
            <span style={{ color: 'var(--fg-8)', fontFamily: F.display, fontSize: 16, fontWeight: 700 }}>
              Discussions <span style={{ color: C.gold }}>Exegetica</span>
            </span>
          </div>
          <p style={{ textAlign: 'center', marginBottom: 16, color: 'var(--fg-4)', lineHeight: 1.6 }}>
            Where Scripture is opened together · A global biblical discussion community · Free · Always open
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['Forum','/forum'],['Armchair','/armchair'],['Bible','/bible'],
              ['Groups','/groups'],['Daily Word','/daily-word'],
              ['Prayer of Salvation','/salvation'],['Contact','/contact'],
              ['Privacy Policy','/privacy'],['Terms of Use','/terms']].map(([l,t]) => (
              <Link key={l} to={t} style={{ color: 'var(--fg-35)', fontSize: 12 }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="de-mobile-bottom" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'var(--surface-mobilenav)',
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
            color: isActive(item.path) ? C.gold : 'var(--fg-45)',
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
            color: menuOpen ? C.gold : 'var(--fg-45)'
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
              background: 'var(--surface-solid-a)', backdropFilter: 'blur(16px)',
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
                    padding: '10px 12px', background: 'var(--fg-06)',
                    borderRadius: 10, fontFamily: F.body, fontSize: 13.5,
                    color: 'var(--fg-100)', border: '1px solid var(--fg-08)'
                  }}>{l}</Link>
                ))}
                <button onClick={toggleTheme} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', background: 'rgba(201,168,76,0.08)',
                  borderRadius: 10, fontFamily: F.body, fontSize: 13.5, fontWeight: 600,
                  color: 'var(--fg-100)', border: `1px solid ${C.gold}44`
                }}>{theme === 'dark' ? '☀️ Switch to light background' : '🌙 Switch to dark background'}</button>
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
