import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Btn, Logo } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

function AuthShell({ title, sub, children }) {
  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'38px 32px', width:'100%', maxWidth:420, boxShadow:'0 4px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}><Logo size={38}/></div>
        <h1 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:C.navy, textAlign:'center', marginBottom:6 }}>{title}</h1>
        <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted, textAlign:'center', marginBottom:24 }}>{sub}</p>
        {children}
      </div>
    </div>
  )
}

function Field({ label, type='text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, display:'block', marginBottom:5 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none', boxSizing:'border-box' }}/>
    </div>
  )
}

export function RegisterPage() {
  usePageTitle('Join')
  const { login } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ username:'', email:'', password:'', display_name:'' })
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))
  const submit = async () => {
    setLoading(true); setError('')
    const res = await fetch(`${API}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const data = await res.json()
    if (data.token) { login(data.user, data.token); navigate('/forum') }
    else { setError(data.error||'Registration failed'); setLoading(false) }
  }
  return (
    <AuthShell title="Join Discussions Exegetica" sub="Free forever · Open to all">
      {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'9px 13px', fontFamily:F.body, fontSize:13, color:'#DC2626', marginBottom:14 }}>{error}</div>}
      <Field label="Display name" value={form.display_name} onChange={set('display_name')} placeholder="How others will see you"/>
      <Field label="Username" value={form.username} onChange={set('username')} placeholder="lowercase, no spaces"/>
      <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"/>
      <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters"/>
      <Btn variant="gold" onClick={submit} disabled={loading} style={{ width:'100%', padding:'12px', fontSize:15, marginTop:6 }}>{loading?'Creating account…':'Create free account'}</Btn>
      <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, textAlign:'center', marginTop:14 }}>Already a member? <Link to="/login" style={{ color:C.gold, fontWeight:600 }}>Sign in</Link></p>
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
