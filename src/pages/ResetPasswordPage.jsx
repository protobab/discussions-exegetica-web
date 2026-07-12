import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Logo } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

function AuthShell({ title, sub, children }) {
  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:C.navy }}>
      <div style={{ background:'rgba(17,24,39,0.95)', backdropFilter:'blur(16px)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:16, padding:'38px 32px', width:'100%', maxWidth:420, boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}><Logo size={38}/></div>
        <h1 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:'#fff', textAlign:'center', marginBottom:6 }}>{title}</h1>
        {sub && <p style={{ fontFamily:F.body, fontSize:13.5, color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:24 }}>{sub}</p>}
        {children}
      </div>
    </div>
  )
}

const inputStyle = { width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:9, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none', boxSizing:'border-box', background:'rgba(255,255,255,0.06)', color:'#E8E0D0', marginBottom:14 }

export default function ResetPasswordPage() {
  usePageTitle('Reset Password')
  const location = useLocation()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const t = params.get('token')
    if (t) setToken(t)
    else setMsg('❌ Invalid reset link. Please request a new one.')
  }, [location])

  const submit = async () => {
    if (!password || !confirm) return setMsg('Please fill in both fields')
    if (password !== confirm) return setMsg('Passwords do not match')
    setLoading(true); setMsg('')
    const res = await fetch(`${API}/auth/reset?confirm=1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    })
    const data = await res.json()
    if (data.ok) { setDone(true) }
    else setMsg(`❌ ${data.error}`)
    setLoading(false)
  }

  return (
    <AuthShell title="Reset Password" sub={done ? '' : 'Enter your new password below'}>
      {done ? (
        <div style={{ textAlign:'center' }}>
          <p style={{ fontFamily:F.body, fontSize:15, color:'#4ade80', marginBottom:20 }}>✅ Password updated successfully!</p>
          <Link to="/login" style={{ display:'block', background:`linear-gradient(135deg,${C.gold},#E8C97A)`, color:C.navy, borderRadius:10, padding:'12px', fontFamily:F.body, fontSize:14.5, fontWeight:700, textAlign:'center' }}>
            Sign in with new password →
          </Link>
        </div>
      ) : (
        <>
          {msg && <div style={{ background: msg.startsWith('❌') ? 'rgba(220,38,38,0.15)' : 'rgba(201,168,76,0.1)', border:`1px solid ${msg.startsWith('❌')?'rgba(220,38,38,0.4)':'rgba(201,168,76,0.3)'}`, borderRadius:8, padding:'10px 14px', fontFamily:F.body, fontSize:13, color:msg.startsWith('❌')?'#f87171':C.gold, marginBottom:16 }}>{msg}</div>}
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" style={inputStyle}/>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm new password" onKeyDown={e=>e.key==='Enter'&&submit()} style={inputStyle}/>
          <p style={{ fontFamily:F.body, fontSize:11.5, color:'rgba(255,255,255,0.35)', marginBottom:16, lineHeight:1.6 }}>
            At least 8 characters, one capital letter, one number or special character
          </p>
          <button onClick={submit} disabled={loading||!token} style={{ width:'100%', background:`linear-gradient(135deg,${C.gold},#E8C97A)`, color:C.navy, border:'none', borderRadius:10, padding:'12px', fontFamily:F.body, fontSize:14.5, fontWeight:700, cursor:'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Updating…' : 'Set New Password'}
          </button>
          <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.35)', textAlign:'center', marginTop:14 }}>
            <Link to="/login" style={{ color:C.gold }}>← Back to sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}
