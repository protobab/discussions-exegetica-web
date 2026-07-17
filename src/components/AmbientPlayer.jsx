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
  const [ready, setReady] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol
  }, [vol])

  const toggle = () => {
    if (!audioRef.current || !ready) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
  }

  const next = () => {
    const n = (idx + 1) % TRACKS.length
    setIdx(n)
    setTimeout(() => {
      if (playing && audioRef.current) audioRef.current.play().catch(() => {})
    }, 80)
  }

  return (
    <div style={{
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      minHeight: 220,
      backgroundImage: `url(/ambient/bg-loop.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#1a2a4a',
      marginBottom: 32,
    }}>
      {/* Dark overlay so controls are readable */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,20,40,0.35) 0%, rgba(10,20,40,0.65) 100%)',
      }}/>

      <audio
        ref={audioRef}
        src={TRACKS[idx].src}
        loop
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
      />

      {/* Controls */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, padding: '36px 24px',
        minHeight: 220,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Play/Pause */}
          <button
            onClick={toggle}
            style={{
              background: playing ? 'rgba(201,168,76,0.9)' : C.gold,
              color: '#0a0f1e',
              border: 'none',
              borderRadius: '50%',
              width: 56, height: 56,
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              transition: 'transform 0.15s',
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>

          {/* Next track */}
          <button
            onClick={next}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 10,
              padding: '8px 14px',
              fontFamily: F.body,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >⏭ Next</button>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>🔈</span>
            <input
              type="range" min="0" max="1" step="0.05" value={vol}
              onChange={e => setVol(parseFloat(e.target.value))}
              style={{ width: 72, accentColor: C.gold }}
            />
          </div>
        </div>

        {/* Track name */}
        <p style={{
          fontFamily: F.body, fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          margin: 0, letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {playing ? '♪ ' : ''}{TRACKS[idx].label}
        </p>
      </div>
    </div>
  )
}
