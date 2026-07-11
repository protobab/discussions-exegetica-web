import { C, F, BADGE } from '../lib/tokens.js'

export function Logo({ size = 34 }) {
  // Option B — Dove descending into concentric circles
  // Echoes Matthew 3:16: the Spirit of God descending like a dove
  const s = size / 44  // scale factor from 44px base
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 44 48" fill="none">
      {/* Concentric rings */}
      <circle cx="22" cy="30" r="17" stroke={C.gold} strokeWidth="1.4" opacity="0.4"/>
      <circle cx="22" cy="30" r="11" stroke={C.gold} strokeWidth="1" strokeDasharray="2.5 2" opacity="0.5"/>
      {/* Descending light rays above */}
      <line x1="22" y1="2" x2="22" y2="10" stroke={C.gold} strokeWidth="0.8" opacity="0.35" strokeDasharray="1.5 1.5"/>
      <line x1="18" y1="3" x2="20" y2="10" stroke={C.gold} strokeWidth="0.6" opacity="0.2"/>
      <line x1="26" y1="3" x2="24" y2="10" stroke={C.gold} strokeWidth="0.6" opacity="0.2"/>
      {/* Dove body — descending posture, angled down */}
      <g transform="translate(22,15) rotate(15)">
        {/* Body */}
        <ellipse cx="0" cy="0" rx="5" ry="3.5" fill={C.gold}/>
        {/* Head */}
        <circle cx="4.5" cy="-2" r="2.8" fill={C.gold}/>
        {/* Beak */}
        <path d="M7 -2.3 L9.5 -1.5 L7 -1" fill={C.gold}/>
        {/* Eye */}
        <circle cx="5.5" cy="-2.2" r="0.7" fill="#1B2A4A"/>
        {/* Left wing spread */}
        <path d="M-2 -1 Q-11 -9 -13 -3 Q-9 1 -2 1Z" fill={C.goldLight} opacity="0.9"/>
        {/* Right wing spread */}
        <path d="M2 -2 Q9 -10 13 -6 Q10 -1 3 0Z" fill={C.goldLight} opacity="0.9"/>
        {/* Tail feathers (pointing up as dove descends) */}
        <path d="M-5 2 Q-7 6 -9 5 Q-7 8 -5 6 Q-3 4 -4 3Z" fill={C.gold} opacity="0.75"/>
        <path d="M-3 3 Q-3 7 -5 7 Q-2 8 -2 5Z" fill={C.gold} opacity="0.6"/>
      </g>
      {/* Small glow dot at centre where dove is heading */}
      <circle cx="22" cy="30" r="2" fill={C.gold} opacity="0.5"/>
    </svg>
  )
}

export function Avatar({ name = '?', color = C.navy, size = 36 }) {
  const i = (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
  return <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:F.body, fontSize:size*.35, fontWeight:600, flexShrink:0 }}>{i}</div>
}

export function BadgeTag({ label }) {
  const color = BADGE[label] || C.muted
  return <span style={{ background:color+'22', color, border:`1px solid ${color}55`, borderRadius:4, padding:'1px 7px', fontSize:10, fontFamily:F.body, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>
}

export function Btn({ children, onClick, variant='primary', style:ex={}, disabled }) {
  const s = { primary:{background:C.navy,color:'#fff',border:'none'}, gold:{background:C.gold,color:C.navy,border:'none'}, outline:{background:'transparent',color:C.navy,border:`1.5px solid ${C.navy}`}, ghost:{background:'transparent',color:C.muted,border:`1px solid ${C.border}`} }
  return <button onClick={onClick} disabled={disabled} style={{ ...s[variant], borderRadius:8, padding:'9px 20px', fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:disabled?'not-allowed':'pointer', opacity:disabled?.6:1, transition:'opacity 0.15s', ...ex }}>{children}</button>
}

export function Card({ children, style:ex={} }) {
  return <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:12, padding:'20px 22px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', ...ex }}>{children}</div>
}

export function Spinner() {
  return <div style={{ textAlign:'center', padding:'60px 0', color:C.muted, fontFamily:F.body }}>Loading…</div>
}

export function CategoryPill({ label, icon, active, onClick }) {
  return <button onClick={onClick} style={{ background:active?C.navy:'#fff', color:active?'#fff':C.muted, border:`1.5px solid ${active?C.navy:C.border}`, borderRadius:20, padding:'6px 16px', fontFamily:F.body, fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' }}>{icon} {label}</button>
}

export function Field({ label, type='text', value, onChange, placeholder, style:ex={} }) {
  return (
    <div style={{ marginBottom:14, ...ex }}>
      {label && <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:C.navy, display:'block', marginBottom:5 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none', boxSizing:'border-box' }}/>
    </div>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows=4 }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:C.navy, display:'block', marginBottom:5 }}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none', resize:'vertical', lineHeight:1.6, boxSizing:'border-box' }}/>
    </div>
  )
}

export function StatusMsg({ msg }) {
  if (!msg) return null
  const ok = msg.startsWith('✅')
  return <div style={{ background:ok?'#F0FDF4':'#FEF2F2', border:`1px solid ${ok?'#BBF7D0':'#FECACA'}`, borderRadius:8, padding:'10px 14px', fontFamily:F.body, fontSize:13, color:ok?'#15803D':'#DC2626', marginBottom:16 }}>{msg}</div>
}
