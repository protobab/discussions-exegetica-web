import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'

// Glowing treasure-chest teaser for "The Riches of Christ" — fixed in a
// corner of the homepage. Click opens a small menu: Read, Download, Listen.
export default function TreasureChest() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const go = (path) => { setOpen(false); navigate(path) }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 250 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 72, right: 0,
          background: 'var(--surface-solid-c)', backdropFilter: 'blur(14px)',
          border: `1px solid ${C.gold}66`, borderRadius: 14,
          padding: 10, width: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <p style={{ fontFamily: F.display, fontSize: 13, fontWeight: 700, color: C.gold, padding: '2px 6px 6px', borderBottom: '1px solid rgba(201,168,76,0.25)', marginBottom: 2 }}>
            💎 The Riches of Christ
          </p>
          <button onClick={() => go('/riches-of-christ')} style={chestBtnStyle}>📖 Read Online</button>
          <button onClick={() => go('/riches-of-christ#downloads')} style={chestBtnStyle}>⬇ Download</button>
          <button onClick={() => go('/riches-of-christ?listen=1')} style={chestBtnStyle}>🔊 Listen</button>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        aria-label="The Riches of Christ"
        title="The Riches of Christ — read, download, or listen"
        style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #3a2f12, #0a0f1e 70%)',
          border: `1.5px solid ${C.gold}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, cursor: 'pointer',
          boxShadow: open
            ? `0 0 18px 4px ${C.gold}99`
            : `0 0 14px 3px ${C.gold}55`,
          animation: open ? 'none' : 'chestGlow 2.8s ease-in-out infinite',
          transition: 'box-shadow 0.2s',
        }}
      >
        💰
      </button>

      <style>{`
        @keyframes chestGlow {
          0%, 100% { box-shadow: 0 0 14px 3px rgba(201,168,76,0.45); }
          50% { box-shadow: 0 0 22px 7px rgba(201,168,76,0.8); }
        }
      `}</style>
    </div>
  )
}

const chestBtnStyle = {
  background: 'none', border: 'none', textAlign: 'left',
  color: 'var(--fg-9)', fontFamily: F.body, fontSize: 13.5,
  padding: '8px 8px', borderRadius: 8, cursor: 'pointer',
}
