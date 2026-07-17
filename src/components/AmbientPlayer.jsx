import { useState, useRef, useEffect } from 'react'
import { C, F } from '../lib/tokens.js'

// Curated peaceful instrumental tracks from Pixabay (no API key needed, direct MP3 links)
// These are verified instrumental ambient/worship tracks
const TRACKS = [
  {
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0fd6a9d97.mp3',
    label: 'Peaceful Piano'
  },
  {
    src: 'https://cdn.pixabay.com/download/audio/2021/11/01/audio_cb31e59b4e.mp3',
    label: 'Meditation Bells'
  },
  {
    src: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
    label: 'Gentle Worship'
  },
  {
    src: 'https://cdn.pixabay.com/download/audio/2021/08/08/audio_dc39bde962.mp3',
    label: 'Still Waters'
  },
  {
    src: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_1a0e01b4bf.mp3',
    label: 'Morning Light'
  },
  // Local fallbacks
  { src: '/ambient/track1.mp3', label: 'Reflective Piano' },
  { src: '/ambient/track2.mp3', label: 'Gentle Strings' },
  { src: '/ambient/track3.mp3', label: 'Quiet Worship Pads' },
]

export default function AmbientPlayer() {
  const [playing, setPlaying] = useState(false)
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * 5)) // random start
  const [vol, setVol] = useState(0.35)
  const [minimised, setMinimised] = useState(false)
  const audioRef = useRef(null)
  const triedAutoplay = useRef(false)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol
  }, [vol])

  // Autoplay on first user interaction anywhere on the page
  useEffect(() => {
    const tryPlay = () => {
      if (triedAutoplay.current || playing) return
      triedAutoplay.current = true
      if (audioRef.current) {
        audioRef.current.volume = vol
        audioRef.current.play()
          .then(() => setPlaying(true))
          .catch(() => {})
      }
    }

    // Attempt immediate autoplay
    setTimeout(() => {
      if (audioRef.current && !triedAutoplay.current) {
        audioRef.current.volume = vol
        audioRef.current.play()
          .then(() => { setPlaying(true); triedAutoplay.current = true })
          .catch(() => {
            // Failed — try on first interaction
            document.addEventListener('click', tryPlay, { once: true })
            document.addEventListener('scroll', tryPlay, { once: true })
            document.addEventListener('touchstart', tryPlay, { once: true })
          })
      }
    }, 500)

    return () => {
      document.removeEventListener('click', tryPlay)
      document.removeEventListener('scroll', tryPlay)
      document.removeEventListener('touchstart', tryPlay)
    }
  }, [])

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

  const onError = () => {
    // Skip broken track silently
    setIdx(i => (i + 1) % TRACKS.length)
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={TRACKS[idx].src}
        loop
        onError={onError}
      />
      <div style={{
        position: 'fixed',
        bottom: 80,
        left: 16,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        gap: minimised ? 0 : 8,
        background: 'rgba(10,15,30,0.88)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 40,
        padding: minimised ? '6px 10px' : '6px 12px 6px 8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        transition: 'padding 0.2s',
        maxWidth: minimised ? 52 : 260,
        overflow: 'hidden',
      }}>
        {/* Play/Pause */}
        <button onClick={toggle} style={{
          background: C.gold,
          color: '#0a0f1e',
          border: 'none',
          borderRadius: '50%',
          width: 28, height: 28,
          fontSize: 10,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {playing ? '⏸' : '▶'}
        </button>

        {!minimised && (
          <>
            <span style={{
              fontFamily: F.body, fontSize: 11,
              color: 'rgba(255,255,255,0.65)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 90,
            }}>
              {TRACKS[idx]?.label}
            </span>

            <button onClick={next} style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer', fontSize: 12, padding: 0, flexShrink: 0,
            }}>⏭</button>

            <input
              type="range" min="0" max="1" step="0.05" value={vol}
              onChange={e => setVol(parseFloat(e.target.value))}
              style={{ width: 44, accentColor: C.gold, cursor: 'pointer', flexShrink: 0 }}
            />
          </>
        )}

        {/* Minimise toggle */}
        <button
          onClick={() => setMinimised(m => !m)}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer', fontSize: 9,
            padding: minimised ? '0 0 0 4px' : '0 0 0 2px',
            flexShrink: 0,
          }}
        >
          {minimised ? '♪' : '−'}
        </button>
      </div>
    </>
  )
}
