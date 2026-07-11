import { C, F, BADGE } from '../lib/tokens.js'

export function Logo({ size = 34 }) {
  // Dove alighting on an open Bible
  // The open Book = Scripture; the descending Dove = Holy Spirit
  // Together: the Spirit breathing life into the Word
  const h = size * 1.15
  return (
    <svg width={size} height={h} viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* ── OPEN BIBLE (bottom) ── */}
      {/* Left page */}
      <path d="M4 32 Q4 28 8 27 L20 25 L20 40 L8 42 Q4 42 4 38 Z" fill="#1B2A4A" stroke="#C9A84C" strokeWidth="1.2"/>
      {/* Right page */}
      <path d="M36 32 Q36 28 32 27 L20 25 L20 40 L32 42 Q36 42 36 38 Z" fill="#1B2A4A" stroke="#C9A84C" strokeWidth="1.2"/>
      {/* Spine centre line */}
      <line x1="20" y1="25" x2="20" y2="40" stroke="#C9A84C" strokeWidth="1"/>
      {/* Left page lines (text suggestion) */}
      <line x1="8" y1="30" x2="17" y2="29.5" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5"/>
      <line x1="8" y1="32.5" x2="17" y2="32" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5"/>
      <line x1="8" y1="35" x2="17" y2="34.5" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5"/>
      {/* Right page lines */}
      <line x1="23" y1="29.5" x2="32" y2="30" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5"/>
      <line x1="23" y1="32" x2="32" y2="32.5" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5"/>
      <line x1="23" y1="34.5" x2="32" y2="35" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5"/>
      {/* Bible cover bottom */}
      <path d="M4 38 Q4 42 8 43 L20 44 L32 43 Q36 42 36 38" stroke="#C9A84C" strokeWidth="1" fill="none"/>

      {/* ── DOVE (alighting on the Bible spine) ── */}
      {/* Body — facing right, wings up as it lands */}
      <ellipse cx="20" cy="22" rx="5.5" ry="3.2" fill="#C9A84C" transform="rotate(-8 20 22)"/>
      {/* Head */}
      <circle cx="25" cy="19.5" r="3" fill="#C9A84C"/>
      {/* Beak — pointed right */}
      <path d="M27.5 19 L31 19.8 L27.5 20.5" fill="#C9A84C"/>
      {/* Eye */}
      <circle cx="26.2" cy="19.2" r="0.7" fill="#1B2A4A"/>
      {/* Left wing — raised up, landing posture */}
      <path d="M17 21 Q8 13 5 17 Q9 22 16 23 Z" fill="#E8C97A" opacity="0.95"/>
      {/* Left wing inner highlight */}
      <path d="M17 21 Q10 15 7 18 Q10 21 16 22 Z" fill="#C9A84C" opacity="0.6"/>
      {/* Right wing — raised up other side */}
      <path d="M20 19.5 Q26 11 32 14 Q29 19 22 21 Z" fill="#E8C97A" opacity="0.95"/>
      {/* Right wing inner */}
      <path d="M20 20 Q25 13 30 16 Q28 19 22 21 Z" fill="#C9A84C" opacity="0.6"/>
      {/* Tail — fanned as it lands */}
      <path d="M14 23 Q10 27 7 25 Q10 29 13 27 Q15 25 15 24 Z" fill="#C9A84C" opacity="0.8"/>
      <path d="M15 24 Q13 28 11 27 Q13 30 15 28 Z" fill="#C9A84C" opacity="0.6"/>
      {/* Feet touching the spine */}
      <line x1="19" y1="25" x2="18" y2="27" stroke="#C9A84C" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="21" y1="25" x2="22" y2="27" stroke="#C9A84C" strokeWidth="0.8" strokeLinecap="round"/>
      {/* Toes */}
      <line x1="18" y1="27" x2="16.5" y2="27.5" stroke="#C9A84C" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="18" y1="27" x2="18" y2="28" stroke="#C9A84C" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="22" y1="27" x2="23.5" y2="27.5" stroke="#C9A84C" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="22" y1="27" x2="22" y2="28" stroke="#C9A84C" strokeWidth="0.7" strokeLinecap="round"/>

      {/* Subtle glow around dove */}
      <ellipse cx="20" cy="20" rx="11" ry="8" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.2"/>
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
  const s = {
    primary:{ background:'linear-gradient(135deg,#1B2A4A,#2E4270)', color:'#fff', border:'1px solid rgba(255,255,255,0.1)' },
    gold:   { background:`linear-gradient(135deg,${C.gold},#E8C97A)`, color:'#0a0f1e', border:'none' },
    outline:{ background:'transparent', color:C.gold, border:`1.5px solid ${C.gold}` },
    ghost:  { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)' }
  }
  return <button onClick={onClick} disabled={disabled} style={{ ...s[variant], borderRadius:9, padding:'9px 20px', fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:disabled?'not-allowed':'pointer', opacity:disabled?.6:1, transition:'all 0.15s', boxShadow: variant==='gold'?'0 4px 14px rgba(201,168,76,0.3)':'none', ...ex }}>{children}</button>
}

export function Card({ children, style:ex={} }) {
  return <div style={{
    background:'rgba(27,42,74,0.6)',
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
    background: active ? `linear-gradient(135deg,${C.gold},#E8C97A)` : 'rgba(255,255,255,0.06)',
    color: active ? '#0a0f1e' : 'rgba(255,255,255,0.6)',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
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
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:9, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', color:'#E8E0D0' }}/>
    </div>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows=4 }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:C.gold, display:'block', marginBottom:5 }}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ width:'100%', border:'1px solid rgba(201,168,76,0.25)', borderRadius:9, padding:'10px 13px', fontFamily:F.body, fontSize:13.5, outline:'none', resize:'vertical', lineHeight:1.6, boxSizing:'border-box', background:'rgba(255,255,255,0.05)', color:'#E8E0D0' }}/>
    </div>
  )
}

export function StatusMsg({ msg }) {
  if (!msg) return null
  const ok = msg.startsWith('✅')
  return <div style={{ background:ok?'rgba(21,128,61,0.15)':'rgba(220,38,38,0.15)', border:`1px solid ${ok?'rgba(21,128,61,0.4)':'rgba(220,38,38,0.4)'}`, borderRadius:9, padding:'10px 14px', fontFamily:F.body, fontSize:13, color:ok?'#4ade80':'#f87171', marginBottom:16 }}>{msg}</div>
}
