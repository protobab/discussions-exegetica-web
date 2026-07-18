import { C, F, BADGE } from '../lib/tokens.js'

export function Logo({ size = 34 }) {
  // Option A — The Flame of Truth
  // A single warm organic flame — light itself, truth revealed
  // "Did not our hearts burn within us?" — Luke 24:32
  const w = size
  const h = size * 1.1
  return (
    <svg width={w} height={h} viewBox="0 0 72 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`glow-${size}`} cx="50%" cy="75%" r="55%">
          <stop offset="0%" stopColor="var(--c-gold-light)" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="var(--c-gold)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Warm glow beneath flame */}
      <ellipse cx="36" cy="62" rx="28" ry="12" fill={`url(#glow-${size})`}/>
      {/* Outer flame — deep gold */}
      <path d="M36 4 Q46 16 48 28 Q53 20 50 10 Q62 24 58 42 Q55 54 36 62 Q17 54 14 42 Q10 24 22 10 Q19 20 24 28 Q26 16 36 4Z" fill="var(--c-gold)"/>
      {/* Mid flame — warm cream */}
      <path d="M36 16 Q42 26 43 36 Q46 28 44 20 Q52 32 49 44 Q47 52 36 58 Q25 52 23 44 Q20 32 28 20 Q26 28 29 36 Q30 26 36 16Z" fill="var(--c-gold-light)" opacity="0.85"/>
      {/* Inner flame — bright white-gold core */}
      <path d="M36 28 Q39 34 39.5 40 Q41 36 40.5 32 Q44 37 42 43 Q40 49 36 51 Q32 49 30 43 Q28 37 31.5 32 Q31 36 32.5 40 Q33 34 36 28Z" fill="#fff" opacity="0.65"/>
      {/* Subtle base line — suggestion of an open page */}
      <path d="M16 66 Q36 63 56 66" stroke="var(--c-gold)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55"/>
      <path d="M22 70 Q36 68 50 70" stroke="var(--c-gold)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
    </svg>
  )
}

export function Avatar({ name = '?', color = C.navy, size = 36 }) {
  const i = (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
  return <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg-100)', fontFamily:F.body, fontSize:size*.35, fontWeight:600, flexShrink:0 }}>{i}</div>
}

export function BadgeTag({ label }) {
  const color = BADGE[label] || C.muted
  return <span style={{ background:color+'22', color, border:`1px solid ${color}55`, borderRadius:4, padding:'1px 7px', fontSize:10, fontFamily:F.body, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>
}

export function Btn({ children, onClick, variant='primary', style:ex={}, disabled }) {
  const s = {
    primary:{ background:'linear-gradient(135deg,#1B2A4A,#2E4270)', color:'var(--fg-100)', border:'1px solid var(--fg-1)' },
    gold:   { background:`linear-gradient(135deg,${C.gold},var(--c-gold-light))`, color:'#0a0f1e', border:'none' },
    outline:{ background:'transparent', color:C.gold, border:`1.5px solid ${C.gold}` },
    ghost:  { background:'var(--fg-06)', color:'var(--fg-6)', border:'1px solid var(--fg-1)' }
  }
  return <button onClick={onClick} disabled={disabled} style={{ ...s[variant], borderRadius:9, padding:'9px 20px', fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:disabled?'not-allowed':'pointer', opacity:disabled?.6:1, transition:'all 0.15s', boxShadow: variant==='gold'?'0 4px 14px rgba(201,168,76,0.3)':'none', ...ex }}>{children}</button>
}

export function Card({ children, style:ex={} }) {
  return <div style={{
    background:'var(--surface-card)',
    backdropFilter:'blur(8px)',
    border:'1px solid rgba(201,168,76,0.15)',
    borderRadius:14,
    padding:'20px 22px',
    boxShadow:'0 4px 24px rgba(0,0,0,0.3)',
    ...ex
  }}>{children}</div>
}

export function Spinner() {
  return (
    <div style={{ textAlign:'center', padding:'60px 0', fontFamily:F.body }}>
      <div style={{ display:'inline-flex', gap:6 }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:C.gold, animation:`spin-dot 1s ${i*0.2}s infinite` }}/>
        ))}
      </div>
      <style>{`@keyframes spin-dot{0%,100%{opacity:0.2;transform:scale(0.8)}50%{opacity:1;transform:scale(1.1)}}`}</style>
    </div>
  )
}

export function CategoryPill({ label, icon, active, onClick }) {
  return <button onClick={onClick} style={{
    background: active ? `linear-gradient(135deg,${C.gold},var(--c-gold-light))` : 'var(--fg-06)',
    color: active ? '#0a0f1e' : 'var(--fg-6)',
    border: active ? 'none' : '1px solid var(--fg-1)',
    borderRadius:20, padding:'6px 16px', fontFamily:F.body, fontSize:13,
    fontWeight: active?700:500, cursor:'pointer', whiteSpace:'nowrap',
    transition:'all 0.15s',
    boxShadow: active ? '0 4px 12px rgba(201,168,76,0.3)' : 'none'
  }}>{icon} {label}</button>
}

export function Field({ label, type='text', value, onChange, placeholder, style:ex={} }) {
  return (
    <div style={{ marginBottom:14, ...ex }}>
      {label && <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:C.gold, display:'block', marginBottom:5 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:9, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none', boxSizing:'border-box', background:'var(--fg-08)', color:'var(--c-text)', colorScheme:'dark', pointerEvents:'auto', position:'relative', zIndex:1 }}/>
    </div>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows=4 }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:C.gold, display:'block', marginBottom:5 }}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:9, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none', resize:'vertical', lineHeight:1.6, boxSizing:'border-box', background:'var(--fg-08)', color:'var(--c-text)', colorScheme:'dark', pointerEvents:'auto', position:'relative', zIndex:1 }}/>
    </div>
  )
}

export function StatusMsg({ msg }) {
  if (!msg) return null
  const ok = msg.startsWith('✅')
  return <div style={{ background:ok?'rgba(21,128,61,0.15)':'rgba(220,38,38,0.15)', border:`1px solid ${ok?'rgba(21,128,61,0.4)':'rgba(220,38,38,0.4)'}`, borderRadius:9, padding:'10px 14px', fontFamily:F.body, fontSize:13, color:ok?'#4ade80':'#f87171', marginBottom:16 }}>{msg}</div>
}
