// src/components/TourModal.jsx
// The "box" version of the tour, launched from the homepage.
// Plays inline over the page; visitors can close it or pop out to the
// full-screen /tour page at any time.
import { useEffect } from 'react'
import { F } from '../lib/tokens.js'
import TourPlayer from './TourPlayer.jsx'

export default function TourModal({ isOpen, onClose }) {
  // Lock background scroll while open; close on Escape.
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--surface-modalbackdrop)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        animation: 'tourModalFade 0.2s ease',
      }}
    >
      <style>{`@keyframes tourModalFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto',
          borderRadius: 22, position: 'relative',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 4px' }}>
          <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: 'var(--fg-100)' }}>
            🔥 Discussions <span style={{ color: 'var(--c-gold)' }}>Exegetica</span>
            <span style={{ fontFamily: F.body, fontSize: 11.5, color: 'var(--fg-35)', marginLeft: 6, fontWeight: 400 }}>· Quick Tour</span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close tour"
            style={{
              background: 'var(--fg-08)', border: '1px solid var(--fg-15)',
              color: 'var(--fg-7)', borderRadius: '50%', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 15, flexShrink: 0,
            }}
          >✕</button>
        </div>

        <TourPlayer variant="box" onClose={onClose} fullScreenLink />
      </div>
    </div>
  )
}
