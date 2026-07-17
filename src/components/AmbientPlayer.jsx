import { useState, useRef, useEffect } from 'react'
import { C, F } from '../lib/tokens.js'

const TRACKS = [
  { src:'/ambient/track1.mp3', label:'Reflective Piano' },
  { src:'/ambient/track2.mp3', label:'Gentle Strings' },
  { src:'/ambient/track3.mp3', label:'Quiet Worship Pads' },
]

export default function AmbientPlayer() {
  const [playing, setPlaying] = useState(false)
  const [idx, setIdx] = useState(0)
  const [vol, setVol] = useState(0.4)
  const [visible, setVisible] = useState(false)
  const audioRef = useRef(null)

  // Show player and attempt autoplay after short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
      if (audioRef.current) {
        audioRef.current.volume = vol
        audioRef.current.play()
          .then(() => setPlaying(true))
          .catch(() => {
            // Browser blocked autoplay — player shows, user can click
            setPlaying(false)
          })
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol
  }, [vol])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const next = () => {
    const n = (idx + 1) % TRACKS.length
    setIdx(n)
    setTimeout(() => {
      if (playing && audioRef.current) audioRef.current.play().catch(() => {})
    }, 80)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: 24,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'rgba(10,15,30,0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(201,168,76,0.3)',
      borderRadius: 40,
      padding: '8px 16px 8px 10px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      minWidth: 0,
    }}>
      <audio
        ref={audioRef}
        src={TRACKS[idx].src}
        loop
      />

      {/* Play/Pause */}
      <button onClick={toggle} style={{
        background: C.gold,
        color: '#0a0f1e',
        border: 'none',
        borderRadius: '50%',
        width: 32, height: 32,
        fontSize: 12,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {playing ? '⏸' : '▶'}
      </button>

      {/* Track label */}
      <span style={{
        fontFamily: F.body,
        fontSize: 11.5,
        color: 'rgba(255,255,255,0.7)',
        whiteSpace: 'nowrap',
        maxWidth: 110,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {TRACKS[idx].label}
      </span>

      {/* Next */}
      <button onClick={next} style={{
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        fontSize: 14,
        padding: 0,
        display: 'flex', alignItems: 'center',
      }}>⏭</button>

      {/* Volume */}
      <input
        type="range" min="0" max="1" step="0.05" value={vol}
        onChange={e => setVol(parseFloat(e.target.value))}
        style={{ width: 52, accentColor: C.gold, cursor: 'pointer' }}
      />
    </div>
  )
}
