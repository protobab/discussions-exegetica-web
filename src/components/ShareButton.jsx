import { useState } from 'react'
import { C, F } from '../lib/tokens.js'

export default function ShareButton({ title, url, excerpt = '' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const encoded = encodeURIComponent(url)
  const text = encodeURIComponent(`"${title}" — join the discussion on Discussions Exegetica`)
  const body = encodeURIComponent(`${title}\n\n${excerpt ? excerpt.slice(0, 120) + '…' : ''}\n\nJoin the conversation: ${url}`)

  const links = [
    {
      label: 'WhatsApp', icon: '💬',
      href: `https://wa.me/?text=${body}`,
      color: '#25D366'
    },
    {
      label: 'X / Twitter', icon: '𝕏',
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      color: '#000'
    },
    {
      label: 'Facebook', icon: 'f',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: '#1877F2'
    },
    {
      label: 'Email', icon: '✉',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${body}`,
      color: C.navy
    },
  ]

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1800)
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: `${title} — Discussions Exegetica`, url }); return } catch {}
    }
    setOpen(o => !o)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={nativeShare} style={{
        background: 'none', border: `1px solid ${C.border}`,
        borderRadius: 8, padding: '6px 13px', fontFamily: F.body,
        fontSize: 12.5, color: C.muted, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.15s'
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.color = C.navy }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
      >
        🔗 Share
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }}/>
          <div style={{
            position: 'absolute', bottom: '110%', right: 0,
            background: '#fff', borderRadius: 12, padding: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
            border: `1px solid ${C.border}`, zIndex: 50,
            minWidth: 200
          }}>
            <p style={{ fontFamily: F.body, fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Share this discussion</p>
            <div style={{ display: 'grid', gap: 6 }}>
              {links.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: l.color + '12',
                    fontFamily: F.body, fontSize: 13, fontWeight: 600,
                    color: l.color, textDecoration: 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = l.color + '22'}
                  onMouseLeave={e => e.currentTarget.style.background = l.color + '12'}
                >
                  <span style={{ width: 22, textAlign: 'center', fontSize: 14 }}>{l.icon}</span>
                  {l.label}
                </a>
              ))}
              <button onClick={copyLink} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: copied ? '#F0FDF4' : C.mist,
                fontFamily: F.body, fontSize: 13, fontWeight: 600,
                color: copied ? '#15803D' : C.muted,
                border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left'
              }}>
                <span style={{ width: 22, textAlign: 'center' }}>{copied ? '✓' : '📋'}</span>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
