import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Btn } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'

const CATS = [
  { slug:'exegesis',  label:'Deep Dive',       icon:'📖' },
  { slug:'seekers',   label:"Seekers' Corner",  icon:'🌱' },
  { slug:'prayer',    label:'Prayer & Life',    icon:'🙏' },
  { slug:'prophecy',  label:'Prophecy',         icon:'🕊️' },
  { slug:'theology',  label:'Theology',         icon:'⚡' },
  { slug:'resources', label:'Resources',        icon:'📚' },
]

export default function NewThreadPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ title:'', body:'', category_slug:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return (
    <div style={{ maxWidth:600, margin:'80px auto', textAlign:'center', fontFamily:F.body, color:C.muted, padding:'0 24px' }}>
      <p>Please <Link to="/login" style={{ color:C.gold, fontWeight:600 }}>sign in</Link> to start a discussion.</p>
    </div>
  )

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.category_slug)
      return setError('Please fill in all fields and choose a category.')
    setLoading(true); setError('')
    const res = await fetch(`${API}/threads`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.id) navigate(`/thread/${data.id}`)
    else { setError(data.error || 'Something went wrong'); setLoading(false) }
  }

  return (
    <div style={{ maxWidth:720, margin:'40px auto', padding:'0 24px 60px' }}>
      <button onClick={() => navigate('/forum')} style={{
        background:'none', border:'none', color:C.navyLight,
        fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:'pointer',
        display:'flex', alignItems:'center', gap:6, marginBottom:28, padding:0
      }}>← Back to Forum</button>

      <h1 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.navy, marginBottom:6 }}>
        Start a Discussion
      </h1>
      <p style={{ fontFamily:F.body, fontSize:14, color:C.muted, marginBottom:28 }}>
        Ask a question, share an insight, or open a passage for study. All perspectives welcome.
      </p>

      {error && (
        <div style={{
          background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8,
          padding:'12px 16px', fontFamily:F.body, fontSize:13.5, color:'#DC2626', marginBottom:20
        }}>{error}</div>
      )}

      {/* Category picker */}
      <div style={{ marginBottom:22 }}>
        <label style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, display:'block', marginBottom:10 }}>
          Choose a category *
        </label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {CATS.map(cat => (
            <button key={cat.slug} onClick={() => setForm(f=>({...f, category_slug:cat.slug}))} style={{
              background: form.category_slug===cat.slug ? C.navy : '#fff',
              color: form.category_slug===cat.slug ? '#fff' : C.muted,
              border: `1.5px solid ${form.category_slug===cat.slug ? C.navy : C.border}`,
              borderRadius:20, padding:'7px 16px', fontFamily:F.body, fontSize:13,
              cursor:'pointer', transition:'all 0.15s'
            }}>{cat.icon} {cat.label}</button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom:18 }}>
        <label style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, display:'block', marginBottom:8 }}>
          Title *
        </label>
        <input
          value={form.title}
          onChange={e => setForm(f=>({...f, title:e.target.value}))}
          placeholder="e.g. What does 'logos' really mean in John 1:1?"
          maxLength={200}
          style={{
            width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8,
            padding:'11px 14px', fontFamily:F.body, fontSize:14.5, color:C.text, outline:'none'
          }}
        />
      </div>

      {/* Body */}
      <div style={{ marginBottom:24 }}>
        <label style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, display:'block', marginBottom:8 }}>
          Your opening post *
        </label>
        <textarea
          value={form.body}
          onChange={e => setForm(f=>({...f, body:e.target.value}))}
          placeholder="Share your question, reflection, or insight…"
          rows={8}
          style={{
            width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8,
            padding:'12px 14px', fontFamily:F.body, fontSize:14.5, color:C.text,
            resize:'vertical', outline:'none', lineHeight:1.7
          }}
        />
      </div>

      <Btn variant="gold" onClick={submit} disabled={loading} style={{ fontSize:15, padding:'11px 28px' }}>
        {loading ? 'Posting…' : 'Post Discussion'}
      </Btn>
    </div>
  )
}
