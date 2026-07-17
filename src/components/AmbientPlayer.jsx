import { useState, useRef, useEffect } from 'react'
import { C, F, API } from '../lib/tokens.js'

const LOCAL_TRACKS = [
  { src: '/ambient/track1.mp3', label: 'Reflective Piano' },
  { src: '/ambient/track2.mp3', label: 'Gentle Strings' },
  { src: '/ambient/track3.mp3', label: 'Quiet Worship Pads' },
]

// Curated Jamendo instrumental ambient tracks (fetched when admin enables Jamendo mode)
const JAMENDO_CLIENT_ID = '35ead394' // Jamendo public demo client ID

async function fetchJamendoTracks() {
  try {
    const res = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}` +
      `&format=json&limit=10&tags=ambient+instrumental&audioformat=mp31` +
      `&boost=popularity_total&include=musicinfo&fuzzytags=1`
    )
    const data = await res.json()
    if (data.results?.length) {
      return data.results
        .filter(t => t.audio)
        .map(t => ({ src: t.audio, label: t.name || 'Instrumental' }))
    }
  } catch {}
  return []
}

export default function AmbientPlayer() {
  const [tracks, setTracks] = useState(LOCAL_TRACKS)
  const [playing, setPlaying] = useState(false)
  const [idx, setIdx] = useState(0)
  const [vol, setVol] = useState(0.35)
  const [minimised, setMinimised] = useState(false)
  const [mode, setMode] = useState('local')
  const audioRef = useRef(null)
  const triedAutoplay = useRef(false)

  // Fetch music mode from server
  useEffect(() => {
    fetch(`${API}/music-mode`)
      .then(r => r.json())
      .then(async d => {
        setMode(d.mode)
        if (d.mode === 'jamendo') {
          const jamTracks = await fetchJamendoTracks()
          if (jamTracks.length) {
            setTracks(jamTracks)
            setIdx(Math.floor(Math.random() * jamTracks.length))
          }
        }
      })
      .catch(() => {})
  }, [])

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol
  }, [vol])

  // Autoplay attempt
  useEffect(() => {
    const tryPlay = () => {
      if (triedAutoplay.current || playing) return
      triedAutoplay.current = true
      audioRef.current?.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
    const timer = setTimeout(() => {
      audioRef.current?.play()
        .then(() => { setPlaying(true); triedAutoplay.current = true })
        .catch(() => {
          document.addEventListener('click', tryPlay, { once: true })
          document.addEventListener('scroll', tryPlay, { once: true })
          document.addEventListener('touchstart', tryPlay, { once: true })
        })
    }, 500)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', tryPlay)
      document.removeEventListener('scroll', tryPlay)
      document.removeEventListener('touchstart', tryPlay)
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

  return (
    <>
      <audio ref={audioRef} src={tracks[idx]?.src} loop
        onError={() => setIdx(i => (i + 1) % tracks.length)} />

      <div style={{
        position: 'fixed', bottom: 80, left: 16, zIndex: 300,
        display: 'flex', alignItems: 'center',
        gap: minimised ? 0 : 8,
        background: 'rgba(10,15,30,0.88)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 40,
        padding: minimised ? '6px 10px' : '6px 12px 6px 8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        transition: 'all 0.2s',
      }}>
        <button onClick={toggle} style={{
          background: C.gold, color: '#0a0f1e', border: 'none',
          borderRadius: '50%', width: 28, height: 28,
          fontSize: 10, cursor: 'pointer',
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
              whiteSpace: 'nowrap', maxWidth: 90,
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {tracks[idx]?.label}
            </span>
            <button onClick={next} style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer', fontSize: 12, padding: 0, flexShrink: 0,
            }}>⏭</button>
            <input type="range" min="0" max="1" step="0.05" value={vol}
              onChange={e => setVol(parseFloat(e.target.value))}
              style={{ width: 44, accentColor: C.gold, cursor: 'pointer', flexShrink: 0 }} />
          </>
        )}

        <button onClick={() => setMinimised(m => !m)} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer', fontSize: 9,
          padding: minimised ? '0 0 0 4px' : '0 0 0 2px',
          flexShrink: 0,
        }}>
          {minimised ? '♪' : '−'}
        </button>
      </div>
    </>
  )
}
