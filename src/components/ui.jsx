import { C, F, BADGE } from '../lib/tokens.js'

export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16" stroke={C.gold} strokeWidth="2"/>
      <circle cx="18" cy="18" r="9" stroke={C.gold} strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="18" cy="18" r="3.5" fill={C.gold}/>
      <path d="M18 2 A16 16 0 0 1 34 18" stroke={C.goldLight} strokeWidth="2.5" strokeLinecap="round"/>
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
