import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Btn, Logo } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

function AuthShell({ title, sub, children }) {
  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:'#0a0f1e' }}>
      <div style={{ background:'rgba(17,24,39,0.95)', backdropFilter:'blur(16px)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:16, padding:'38px 32px', width:'100%', maxWidth:420, boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}><Logo size={38}/></div>
        <h1 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:'#fff', textAlign:'center', marginBottom:6 }}>{title}</h1>
        <p style={{ fontFamily:F.body, fontSize:13.5, color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:24 }}>{sub}</p>
        {children}
      </div>
    </div>
  )
}

function Field({ label, type='text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, display:'block', marginBottom:5 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:9, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none', boxSizing:'border-box', background:'rgba(255,255,255,0.06)', color:'#E8E0D0' }}/>
    </div>
  )
}

export function RegisterPage() {
  usePageTitle('Join')
  const { login } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ username:'', email:'', password:'', display_name:'' })
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const inviteCode = sessionStorage.getItem('de_invite_code') || ''
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))
  const submit = async () => {
    setLoading(true); setError('')
    const res = await fetch(`${API}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.token) {
      login(data.user, data.token)
      // Report invite code usage
      if (inviteCode) {
        fetch(`${API}/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: inviteCode, new_user_id: data.user.id })
        }).catch(() => {})
        sessionStorage.removeItem('de_invite_code')
      }
      navigate('/forum')
    }
    else { setError(data.error||'Registration failed'); setLoading(false) }
  }
  return (
    <AuthShell title="Join Discussions Exegetica" sub={inviteCode ? '🎉 You were invited — welcome!' : 'Free forever · Open to all'}>
      {inviteCode && (
        <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'9px 13px', fontFamily:F.body, fontSize:13, color:'#15803D', marginBottom:14 }}>
          ✅ Invite code applied — your inviter will earn reputation when you join!
        </div>
      )}
      {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'9px 13px', fontFamily:F.body, fontSize:13, color:'#DC2626', marginBottom:14 }}>{error}</div>}
      <Field label="Display name" value={form.display_name} onChange={set('display_name')} placeholder="How others will see you"/>
      <Field label="Username" value={form.username} onChange={set('username')} placeholder="lowercase, no spaces"/>
      <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"/>
      <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters"/>
      <Btn variant="gold" onClick={submit} disabled={loading} style={{ width:'100%', padding:'12px', fontSize:15, marginTop:6 }}>{loading?'Creating account…':'Create free account'}</Btn>
      <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, textAlign:'center', marginTop:14 }}>Already a member? <Link to="/login" style={{ color:C.gold, fontWeight:600 }}>Sign in</Link></p>
      <p style={{ fontFamily:F.body, fontSize:11.5, color:'rgba(255,255,255,0.3)', textAlign:'center', marginTop:12, lineHeight:1.6 }}>By joining you agree to our <Link to="/terms" style={{ color:C.gold }}>Terms of Use</Link> and <Link to="/privacy" style={{ color:C.gold }}>Privacy Policy</Link></p>
    </AuthShell>
  )
}

export function LoginPage() {
  usePageTitle('Sign In')
  const { login } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))
  const submit = async () => {
    setLoading(true); setError('')
    const res = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.token) { login(data.user, data.token); navigate('/forum') }
    else { setError(data.error||'Sign in failed'); setLoading(false) }
  }
  return (
    <AuthShell title="Welcome back" sub="Sign in to your account">
      {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'9px 13px', fontFamily:F.body, fontSize:13, color:'#DC2626', marginBottom:14 }}>{error}</div>}
      <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"/>
      <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Your password"/>
      <Btn variant="gold" onClick={submit} disabled={loading} style={{ width:'100%', padding:'12px', fontSize:15, marginTop:6 }}>{loading?'Signing in…':'Sign in'}</Btn>
      <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, textAlign:'center', marginTop:14 }}>New here? <Link to="/register" style={{ color:C.gold, fontWeight:600 }}>Join free</Link></p>
    </AuthShell>
  )
}


export function ForgotPasswordPage() {
  usePageTitle('Forgot Password')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async () => {
    if (!email.trim()) return setMsg('Please enter your email address')
    setLoading(true); setMsg('')
    const res = await fetch(`${API}/auth/reset`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (data.ok) setSent(true)
    else setMsg(`❌ ${data.error}`)
    setLoading(false)
  }

  return (
    <AuthShell title="Forgot Password" sub="Enter your email and we'll send a reset link">
      {sent ? (
        <div style={{ textAlign:'center' }}>
          <p style={{ fontFamily:F.body, fontSize:32, marginBottom:12 }}>📨</p>
          <p style={{ fontFamily:F.body, fontSize:15, color:'#4ade80', marginBottom:8 }}>Reset link sent!</p>
          <p style={{ fontFamily:F.body, fontSize:13.5, color:'rgba(255,255,255,0.5)', marginBottom:20, lineHeight:1.6 }}>
            Check your inbox for a link from noreply@discussionsexegetica.com — it expires in 1 hour.
          </p>
          <Link to="/login" style={{ color:C.gold, fontFamily:F.body, fontSize:13.5, fontWeight:600 }}>← Back to sign in</Link>
        </div>
      ) : (
        <>
          {msg && <div style={{ background:'rgba(220,38,38,0.15)', border:'1px solid rgba(220,38,38,0.4)', borderRadius:8, padding:'10px 14px', fontFamily:F.body, fontSize:13, color:'#f87171', marginBottom:14 }}>{msg}</div>}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="Your email address"
            style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:9, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none', boxSizing:'border-box', background:'rgba(255,255,255,0.06)', color:'#E8E0D0', marginBottom:14 }}/>
          <button onClick={submit} disabled={loading} style={{ width:'100%', background:`linear-gradient(135deg,${C.gold},#E8C97A)`, color:C.navy, border:'none', borderRadius:10, padding:'12px', fontFamily:F.body, fontSize:14.5, fontWeight:700, cursor:'pointer', opacity:loading?0.7:1, marginBottom:14 }}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
          <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.35)', textAlign:'center' }}>
            <Link to="/login" style={{ color:C.gold }}>← Back to sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}

export function ChangePasswordPage() {
  usePageTitle('Change Password')
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ current:'', next:'', confirm:'' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.current || !form.next || !form.confirm) return setMsg('❌ Please fill in all fields')
    if (form.next !== form.confirm) return setMsg('❌ New passwords do not match')
    setLoading(true); setMsg('')
    const res = await fetch(`${API}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ current_password: form.current, new_password: form.next })
    })
    const data = await res.json()
    if (data.ok) { setMsg('✅ Password changed! Redirecting…'); setTimeout(()=>navigate(-1), 2000) }
    else setMsg(`❌ ${data.error}`)
    setLoading(false)
  }

  return (
    <AuthShell title="Change Password" sub="Enter your current password then choose a new one">
      {msg && <div style={{ background: msg.startsWith('✅') ? 'rgba(21,128,61,0.15)' : 'rgba(220,38,38,0.15)', border:`1px solid ${msg.startsWith('✅')?'rgba(21,128,61,0.4)':'rgba(220,38,38,0.4)'}`, borderRadius:8, padding:'10px 14px', fontFamily:F.body, fontSize:13, color:msg.startsWith('✅')?'#4ade80':'#f87171', marginBottom:14 }}>{msg}</div>}
      {['current','next','confirm'].map((k,i)=>(
        <input key={k} type="password" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
          placeholder={['Current password','New password','Confirm new password'][i]}
          style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:9, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none', boxSizing:'border-box', background:'rgba(255,255,255,0.06)', color:'#E8E0D0', marginBottom:12 }}/>
      ))}
      <p style={{ fontFamily:F.body, fontSize:11.5, color:'rgba(255,255,255,0.35)', marginBottom:16, lineHeight:1.6 }}>
        At least 8 characters, one capital letter, one number or special character
      </p>
      <button onClick={submit} disabled={loading} style={{ width:'100%', background:`linear-gradient(135deg,${C.gold},#E8C97A)`, color:C.navy, border:'none', borderRadius:10, padding:'12px', fontFamily:F.body, fontSize:14.5, fontWeight:700, cursor:'pointer', opacity:loading?0.7:1, marginBottom:14 }}>
        {loading ? 'Updating…' : 'Change Password'}
      </button>
      <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.35)', textAlign:'center' }}>
        <button onClick={()=>navigate(-1)} style={{ background:'none', border:'none', color:C.gold, fontFamily:F.body, fontSize:12.5, cursor:'pointer' }}>← Cancel</button>
      </p>
    </AuthShell>
  )
}