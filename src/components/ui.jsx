import { C, F, BADGE } from '../lib/tokens.js'

export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16" stroke={C.gold} strokeWidth="2"/>
      <circle cx="18" cy="18" r="9"  stroke={C.gold} strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="18" cy="18" r="3.5" fill={C.gold}/>
      <path d="M18 2 A16 16 0 0 1 34 18" stroke={C.goldLight} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function Avatar({ name = '?', color = C.navy, size = 36 }) {
  const initials = name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: F.body, fontSize: size * 0.35, fontWeight: 600, flexShrink: 0
    }}>{initials}</div>
  )
}

export function BadgeTag({ label }) {
  const color = BADGE[label] || C.muted
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}55`,
      borderRadius: 4, padding: '1px 7px', fontSize: 10,
      fontFamily: F.body, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase'
    }}>{label}</span>
  )
}

export function Btn({ children, onClick, variant = 'primary', style: extra = {}, disabled }) {
  const styles = {
    primary:  { background: C.navy,  color: '#fff', border: 'none' },
    gold:     { background: C.gold,  color: C.navy, border: 'none' },
    outline:  { background: 'transparent', color: C.navy, border: `1.5px solid ${C.navy}` },
    ghost:    { background: 'transparent', color: C.muted, border: `1px solid ${C.border}` },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        borderRadius: 8, padding: '9px 20px',
        fontFamily: F.body, fontSize: 13.5, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s', ...extra
      }}
    >{children}</button>
  )
}

export function CategoryPill({ label, icon, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.navy : '#fff',
      color: active ? '#fff' : C.muted,
      border: `1.5px solid ${active ? C.navy : C.border}`,
      borderRadius: 20, padding: '6px 16px',
      fontFamily: F.body, fontSize: 13, fontWeight: 500,
      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
    }}>{icon} {label}</button>
  )
}

export function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted, fontFamily: F.body }}>
      Loading…
    </div>
  )
}

export function Card({ children, pinned, style: extra = {} }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${pinned ? C.gold + '66' : C.border}`,
      borderRadius: 12, padding: '20px 22px',
      boxShadow: pinned ? `0 0 0 1px ${C.gold}22` : '0 1px 4px rgba(0,0,0,0.05)',
      ...extra
    }}>{children}</div>
  )
}
