import { useState, useRef, useEffect } from 'react'
import { C, F } from '../lib/tokens.js'

// Jamendo API — free, no key needed for basic streaming
// These are real streamable ambient/worship tracks from Jamendo
const FALLBACK_TRACKS = [
  { src:'/ambient/track1.mp3', label:'Reflective Piano' },
  { src:'/ambient/track2.mp3', label:'Gentle Strings' },
  { src:'/ambient/track3.mp3', label:'Quiet Worship Pads' },
]

const JAMENDO_TRACKS = [
  {
    src: 'https://mp3l.jamendo.com/?trackid=1884527&format=mp31&from=app-devsite',
    label: 'Peaceful Meditation'
  },
  {
    src: 'https://mp3l.jamendo.com/?trackid=1460771&format=mp31&from=app-devsite',
    label: 'Ambient Worship'
  },
  {
    src: 'https://mp3l.jamendo.com/?trackid=1136839&format=mp31&from=app-devsite',
    label: 'Gentle Reflection'
  },
  {
    src: 'https://mp3l.jamendo.com/?trackid=974939&format=mp31&from=app-devsite',
    label: 'Still Waters'
  },
  {
    src: 'https://mp3l.jamendo.com/?trackid=1078612&format=mp31&from=app-devsite',
    label: 'Morning Light'
  },
]

export default function AmbientPlayer({ hidden = false }) {
  const [playing, setPlaying] = useState(false)
  const [idx, setIdx] = useState(0)
  const [vol, setVol] = useState(0.4)
  const [tracks, setTracks] = useState(FALLBACK_TRACKS)
  const [minimised, setMinimised] = useState(false)
  const audioRef = useRef(null)
  const hasInteracted = useRef(false)

  // Try to load Jamendo tracks, fall back to local files
  useEffect(() => {
    // Shuffle Jamendo tracks for variety
    const shuffled = [...JAMENDO_TRACKS].sort(() => Math.random() - 0.5)
    setTracks([...shuffled, ...FALLBACK_TRACKS])
  }, [])

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol
  }, [vol])

  // Attempt autoplay after user has interacted with the page
  useEffect(() => {
    const tryPlay = () => {
      if (hasInteracted.current) return
      hasInteracted.current = true
      if (audioRef.current && !playing) {
        audioRef.current.volume = vol
        audioRef.current.play()
          .then(() => setPlaying(true))
          .catch(() => {})
      }
    }
    // Listen for any user interaction on the page
    document.addEventListener('click', tryPlay, { once: true })
    document.addEventListener('keydown', tryPlay, { once: true })
    document.addEventListener('touchstart', tryPlay, { once: true })
    document.addEventListener('scroll', tryPlay, { once: true })

    // Also try immediately in case browser allows it
    setTimeout(() => {
      if (audioRef.current && !playing) {
        audioRef.current.volume = vol
        audioRef.current.play()
          .then(() => setPlaying(true))
          .catch(() => {})
      }
    }, 800)

    return () => {
      document.removeEventListener('click', tryPlay)
      document.removeEventListener('keydown', tryPlay)
      document.removeEventListener('touchstart', tryPlay)
      document.removeEventListener('scroll', tryPlay)
    }
  }, [tracks])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const next = () => {
    const n = (idx + 1) % tracks.length
    setIdx(n)
    setTimeout(() => {
      if (playing && audioRef.current) audioRef.current.play().catch(() => {})
    }, 80)
  }

  // Auto-advance to next track on end
  const onEnded = () => next()

  if (hidden) return (
    <audio ref={audioRef} src={tracks[idx]?.src} onEnded={onEnded} />
  )

  return (
    <div style={{
      position: 'fixed',
      bottom: 80, // above mobile bottom nav
      left: 16,
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      gap: minimised ? 0 : 10,
      background: 'rgba(10,15,30,0.88)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(201,168,76,0.35)',
      borderRadius: 40,
      padding: minimised ? '7px 10px' : '7px 14px 7px 9px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      transition: 'all 0.25s ease',
      cursor: 'pointer',
    }}>
      <audio
        ref={audioRef}
        src={tracks[idx]?.src}
        loop={false}
        onEnded={onEnded}
        onError={() => {
          // Skip to next track on error
          setIdx(i => (i + 1) % tracks.length)
        }}
      />

      {/* Play/Pause */}
      <button onClick={toggle} style={{
        background: playing ? C.gold : 'rgba(201,168,76,0.8)',
        color: '#0a0f1e',
        border: 'none',
        borderRadius: '50%',
        width: 30, height: 30,
        fontSize: 11,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}>
        {playing ? '⏸' : '▶'}
      </button>

      {/* Expanded content */}
      {!minimised && (
        <>
          <span style={{
            fontFamily: F.body,
            fontSize: 11,
            color: 'rgba(255,255,255,0.7)',
            whiteSpace: 'nowrap',
            maxWidth: 100,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {tracks[idx]?.label || 'Ambient'}
          </span>

          <button onClick={next} style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontSize: 13, padding: 0,
            display: 'flex', alignItems: 'center',
          }}>⏭</button>

          <input
            type="range" min="0" max="1" step="0.05" value={vol}
            onChange={e => setVol(parseFloat(e.target.value))}
            style={{ width: 48, accentColor: C.gold, cursor: 'pointer' }}
          />
        </>
      )}

      {/* Minimise/expand toggle */}
      <button
        onClick={e => { e.stopPropagation(); setMinimised(m => !m) }}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.35)',
          cursor: 'pointer', fontSize: 10, padding: '0 0 0 2px',
          display: 'flex', alignItems: 'center',
        }}
        title={minimised ? 'Expand player' : 'Minimise'}
      >
        {minimised ? '♪' : '×'}
      </button>
    </div>
  )
}
