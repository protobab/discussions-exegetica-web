// src/pages/TourPage.jsx
// Full-page version of the tour, reachable at /tour directly, or via
// "View full screen" from the homepage box.
import { F } from '../lib/tokens.js'
import TourPlayer from '../components/TourPlayer.jsx'

export default function TourPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 20 }}>🔥</span>
        <span style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: 'var(--fg-100)' }}>Discussions <span style={{ color: 'var(--c-gold)' }}>Exegetica</span></span>
        <span style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-3)', marginLeft: 4 }}>· Feature Tour</span>
      </div>

      <TourPlayer variant="full" />
    </div>
  )
}
