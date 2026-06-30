import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { useAuth } from '../lib/auth.jsx'

export default function NotificationBell() {
  const { user, token } = useAuth()
  const [notifs, setNotifs] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const load = () => {
    if (!user || !token) return
    fetch(`${API}/notifications`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setNotifs(d.notifications||[]); setUnread(d.unread||0) })
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000) // poll every minute
    return () => clearInterval(interval)
  }, [user, token])

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const openPanel = async () => {
    setOpen(o => !o)
    if (unread > 0) {
      await fetch(`${API}/notifications`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
      setUnread(0)
    }
  }

  if (!user) return null

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={openPanel} style={{
        background:'none', border:'none', cursor:'pointer', position:'relative', padding:6
      }}>
        <span style={{ fontSize:18 }}>🔔</span>
        {unread > 0 && (
          <span style={{
            position:'absolute', top:0, right:0, background:'#EF4444', color:'#fff',
            borderRadius:'50%', width:16, height:16, fontSize:10, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F.body
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'110%', right:0, width:300,
          background:'#fff', borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
          border:`1px solid ${C.border}`, zIndex:200, maxHeight:360, overflowY:'auto'
        }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontFamily:F.display, fontSize:14, fontWeight:700, color:C.navy }}>Notifications</span>
          </div>
          {notifs.length === 0 ? (
            <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, padding:'20px 16px', textAlign:'center' }}>
              Nothing yet — replies to your posts will show up here.
            </p>
          ) : notifs.map(n => (
            <Link
              key={n.id}
              to={n.thread_id ? `/thread/${n.thread_id}` : n.group_id ? `/groups/${n.group_id}` : '#'}
              onClick={() => setOpen(false)}
              style={{
                display:'block', padding:'12px 16px', borderBottom:`1px solid ${C.border}`,
                background: n.is_read ? '#fff' : C.mist
              }}
            >
              <p style={{ fontFamily:F.body, fontSize:13, color:C.text, margin:0, lineHeight:1.5 }}>{n.message}</p>
              <span style={{ fontFamily:F.body, fontSize:11, color:C.muted }}>
                {new Date(n.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
