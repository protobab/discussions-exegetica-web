import { useState, useRef, useEffect } from 'react'
import { C, F } from '../lib/tokens.js'

// ─────────────────────────────────────────────────────────────
// Site-wide audio Bible player.
// Source: the Free Use Bible API (bible.helloao.org) — a free,
// no-key, no-limit API serving public-domain translations.
// We use the Berean Standard Bible (BSB), which was dedicated to
// the public domain in 2023, narrated by reader "souer".
// The API hands back each chapter's own audio link AND the next
// chapter's link in the same response, so we can queue playback
// continuously from Genesis 1 through Revelation 22, looping back
// to Genesis once the Bible is finished.
// ─────────────────────────────────────────────────────────────

const BIBLE_API = 'https://bible.helloao.org/api/BSB'
const DEFAULT_READER = 'souer' // plain narration, no background music
const START_BOOK = 'GEN'
const START_CHAPTER = 1
const PROGRESS_KEY = 'de-bible-audio-progress' // { book, chapter }

async function fetchChapter(book, chapter) {
  const res = await fetch(`${BIBLE_API}/${book}/${chapter}.json`)
  if (!res.ok) throw new Error('Chapter fetch failed')
  return res.json()
}

function pickAudioUrl(audioLinks, reader) {
  if (!audioLinks) return null
  return audioLinks[reader] || audioLinks[DEFAULT_READER] || Object.values(audioLinks)[0] || null
}

// Parses "/api/BSB/EXO/1.json" (a relative API link) into { book, chapter }.
function parseApiLink(link) {
  if (!link) return null
  const m = link.match(/\/([A-Z0-9]{2,4})\/(\d+)\.json$/)
  if (!m) return null
  return { book: m[1], chapter: parseInt(m[2], 10) }
}

export default function AmbientPlayer() {
  const [label, setLabel] = useState('Loading…')
  const [playing, setPlaying] = useState(false)
  const [vol, setVol] = useState(0.6)
  const [minimised, setMinimised] = useState(false)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef(null)
  const nextChapterRef = useRef(null) // { book, chapter } to advance to on 'ended'
  const triedAutoplay = useRef(false)
  const readerRef = useRef(DEFAULT_READER)

  const loadChapter = async (book, chapter) => {
    setLoading(true)
    try {
      const data = await fetchChapter(book, chapter)
      const url = pickAudioUrl(data.thisChapterAudioLinks, readerRef.current)
      if (!url) throw new Error('No audio for this chapter')
      if (audioRef.current) audioRef.current.src = url
      setLabel(`${data.book.commonName} ${data.chapter.number}`)
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ book, chapter }))
      // Where to go next: prefer the API's own nextChapterApiLink;
      // loop back to Genesis 1 once we reach the end of Revelation.
      const next = parseApiLink(data.nextChapterApiLink) || { book: START_BOOK, chapter: START_CHAPTER }
      nextChapterRef.current = next
      setLoading(false)
      return true
    } catch {
      setLabel('Audio unavailable')
      setLoading(false)
      return false
    }
  }

  // Initial load — pick up the admin's chosen narrator, then resume where
  // the visitor left off, if we have it saved.
  useEffect(() => {
    let start = { book: START_BOOK, chapter: START_CHAPTER }
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null')
      if (saved?.book && saved?.chapter) start = saved
    } catch {}
    fetch('/api/music-mode').then(r => r.json())
      .then(d => { if (d.reader) readerRef.current = d.reader })
      .catch(() => {})
      .finally(() => loadChapter(start.book, start.chapter))
  }, [])

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol
  }, [vol])

  // Autoplay attempt (browsers block unmuted autoplay without interaction,
  // so fall back to starting on the visitor's first click/scroll/touch).
  useEffect(() => {
    if (loading) return
    const tryPlay = () => {
      if (triedAutoplay.current || playing) return
      triedAutoplay.current = true
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => {})
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
  }, [loading])

  const handleEnded = async () => {
    const next = nextChapterRef.current || { book: START_BOOK, chapter: START_CHAPTER }
    const ok = await loadChapter(next.book, next.chapter)
    if (ok && audioRef.current) audioRef.current.play().catch(() => {})
  }

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const skip = async () => {
    const next = nextChapterRef.current || { book: START_BOOK, chapter: START_CHAPTER }
    const wasPlaying = playing
    const ok = await loadChapter(next.book, next.chapter)
    if (ok && wasPlaying && audioRef.current) audioRef.current.play().catch(() => {})
  }

  return (
    <>
      <audio ref={audioRef} onEnded={handleEnded}
        onError={() => { if (!loading) skip() }} />

      <div style={{
        position: 'fixed', bottom: 80, left: 16, zIndex: 300,
        display: 'flex', alignItems: 'center',
        gap: minimised ? 0 : 8,
        background: 'var(--surface-solid-c)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 40,
        padding: minimised ? '6px 10px' : '6px 12px 6px 8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        transition: 'all 0.2s',
      }}>
        <button onClick={toggle} disabled={loading} style={{
          background: C.gold, color: '#0a0f1e', border: 'none',
          borderRadius: '50%', width: 28, height: 28,
          fontSize: 10, cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {loading ? '…' : playing ? '⏸' : '▶'}
        </button>

        {!minimised && (
          <>
            <span title={`📖 ${label}`} style={{
              fontFamily: F.body, fontSize: 11,
              color: 'var(--fg-65)',
              whiteSpace: 'nowrap', maxWidth: 110,
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              📖 {label}
            </span>
            <button onClick={skip} disabled={loading} title="Next chapter" style={{
              background: 'none', border: 'none',
              color: 'var(--fg-45)',
              cursor: loading ? 'default' : 'pointer', fontSize: 12, padding: 0, flexShrink: 0,
            }}>⏭</button>
            <input type="range" min="0" max="1" step="0.05" value={vol}
              onChange={e => setVol(parseFloat(e.target.value))}
              style={{ width: 44, accentColor: C.gold, cursor: 'pointer', flexShrink: 0 }} />
          </>
        )}

        <button onClick={() => setMinimised(m => !m)} style={{
          background: 'none', border: 'none',
          color: 'var(--fg-3)',
          cursor: 'pointer', fontSize: 9,
          padding: minimised ? '0 0 0 4px' : '0 0 0 2px',
          flexShrink: 0,
        }}>
          {minimised ? '📖' : '−'}
        </button>
      </div>
    </>
  )
}
