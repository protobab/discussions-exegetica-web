import { useState, useRef, useEffect } from 'react'
import { C, F } from '../lib/tokens.js'

// These point to files YOU upload to /public/ambient/ — see README-ambient.md for sourcing instructions
const TRACKS = [
  { src: '/ambient/track1.mp3', label: 'Reflective Piano' },
  { src: '/ambient/track2.mp3', label: 'Gentle Strings' },
  { src: '/ambient/track3.mp3', label: 'Quiet Worship Pads' },
]

const BG_IMAGE = '/ambient/bg-loop.jpg' // fallback static image; can be swapped for a looping video later

export default function AmbientPlayer() {
  const [playing, setPlaying] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [volume, setVolume] = useState(0.4)
  const [ready, setReady] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => setReady(false))
    }
    setPlaying(p => !p)
  }

  const nextTrack = () => {
    const next = (trackIndex + 1) % TRACKS.length
    setTrackIndex(next)
    setTimeout(() => { if (playing) audioRef.current?.play().catch(()=>{}) }, 100)
  }

  return (
    <div style={{
      position: 'relative', borderRadius: 16, overflow: 'hidden',
      backgroundImage: `linear-gradient(rgba(27,42,74,0.55), rgba(27,42,74,0.75)), url(${BG_IMAGE})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', marginBottom: 36
    }}>
      <audio
        ref={audioRef}
        src={TRACKS[trackIndex].src}
        loop
        onError={() => setReady(false)}
      />

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
          While you wait
        </p>
        <h3 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 18 }}>
          A quiet moment of reflection
        </h3>

        {!ready ? (
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>
            Ambient music coming soon — audio files not yet uploaded.
          </p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={toggle} style={{
              background: C.gold, color: C.navy, border: 'none', borderRadius: '50%',
              width: 52, height: 52, fontSize: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {playing ? '⏸' : '▶'}
            </button>

            <button onClick={nextTrack} style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8, padding: '8px 14px', fontFamily: F.body, fontSize: 12.5, cursor: 'pointer'
            }}>
              ⏭ Next track
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>🔈</span>
              <input
                type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                style={{ width: 80 }}
              />
            </div>
          </div>
        )}

        <p style={{ fontFamily: F.body, fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 14 }}>
          {TRACKS[trackIndex].label}
        </p>
      </div>
    </div>
  )
}
