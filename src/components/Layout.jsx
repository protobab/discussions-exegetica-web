import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { C, F } from '../lib/tokens.js'
import { Logo } from './ui.jsx'
import NotificationBell from './NotificationBell.jsx'
import AnnouncementBanner from './AnnouncementBanner.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Per-route nav accent colours
  const navAccent = location.pathname.startsWith('/armchair') ? 'rgba(201,168,76,0.15)'
    : location.pathname.startsWith('/groups') ? 'rgba(45,106,79,0.15)'
    : location.pathname.startsWith('/bible') ? 'rgba(13,27,42,0.5)'
    : 'transparent'

  return (
    <div style={{ fontFamily:F.body, minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} a{text-decoration:none;color:inherit} button{cursor:pointer}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:${C.gold}66;border-radius:3px}
        @media(max-width:640px){.de-nav-links{display:none!important}}
        .nav-link{color:rgba(255,255,255,0.72);font-family:${F.body};font-size:13px;font-weight:500;padding:6px 10px;border-radius:6px;transition:all 0.15s;white-space:nowrap}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,0.1)}
        .nav-link.active{color:${C.gold};font-weight:700}
      `}</style>

      <nav style={{ background:C.navy, minHeight:58, padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 16px rgba(0,0,0,0.22)', gap:8 }}>

        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <Logo size={28}/>
          <span style={{ fontFamily:F.display, fontSize:15.5, fontWeight:700, color:'#fff', whiteSpace:'nowrap' }}>
            Discussions <span style={{ color:C.gold }}>Exegetica</span>
          </span>
        </Link>

        <div className="de-nav-links" style={{ display:'flex', gap:2, alignItems:'center' }}>
          {[
            ['Forum','/forum'],
            ['Groups','/groups'],
            ['Bible','/bible'],
            ['Armchair','/armchair'],
            ['Daily Word','/daily-word'],
          ].map(([l,t]) => (
            <Link key={l} to={t} className={`nav-link${location.pathname.startsWith(t)?' active':''}`}>{l}</Link>
          ))}
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          {user ? (
            <>
              <NotificationBell/>
              <Link to={`/profile/${user.username}`} style={{ color:C.gold, fontFamily:F.body, fontSize:12.5, fontWeight:600, maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user.display_name}
              </Link>
              <button onClick={()=>{ logout(); navigate('/') }} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.75)', borderRadius:7, padding:'6px 11px', fontFamily:F.body, fontSize:12 }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color:'rgba(255,255,255,0.72)', fontFamily:F.body, fontSize:13, padding:'6px 10px' }}>Sign in</Link>
              <Link to="/register" style={{ background:C.gold, color:C.navy, borderRadius:8, padding:'7px 15px', fontFamily:F.body, fontSize:12.5, fontWeight:700, whiteSpace:'nowrap' }}>Join Free</Link>
            </>
          )}
        </div>
      </nav>

      <main>
        <AnnouncementBanner/>
        <Outlet/>
      </main>

      <footer style={{ background:C.navy, color:'rgba(255,255,255,0.4)', textAlign:'center', padding:'28px 24px', fontFamily:F.body, fontSize:13, marginTop:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
          <Logo size={20}/>
          <span style={{ color:'rgba(255,255,255,0.8)', fontFamily:F.display, fontWeight:600 }}>Discussions Exegetica</span>
        </div>
        <p style={{ marginBottom:10 }}>A global biblical discussion community · Free · Always open</p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          {[['Forum','/forum'],['Armchair','/armchair'],['Bible','/bible'],['Groups','/groups'],['Daily Word','/daily-word'],['Contact','/contact']].map(([l,t])=>(
            <Link key={l} to={t} style={{ color:'rgba(255,255,255,0.45)', fontFamily:F.body, fontSize:12 }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
