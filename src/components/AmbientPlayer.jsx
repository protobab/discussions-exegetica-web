import { useState, useRef, useEffect } from 'react'
import { C, F } from '../lib/tokens.js'

// ─────────────────────────────────────────────────────────────
// Site-wide audio Bible player.
// Source: the Free Use Bible API (bible.helloao.org) — a free,
// no-key, no-limit API serving public-domain translations.
// We use the Berean Standard Bible (BSB), dedicated to the public
// domain in 2023. Each chapter response includes that chapter's
// own audio link plus the next/previous chapter's audio link, so
// we can play continuously from Genesis 1 through Revelation 22,
// looping back to Genesis once the Bible is finished — or jump
// straight to any book/chapter, rewind, skip, or repeat.
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
  const [repeat, setRepeat] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [books, setBooks] = useState([])
  const [pickBook, setPickBook] = useState(START_BOOK)
  const [pickChapter, setPickChapter] = useState(1)

  const audioRef = useRef(null)
  const nextChapterRef = useRef(null)
  const prevChapterRef = useRef(null)
  const currentRef = useRef({ book: START_BOOK, chapter: START_CHAPTER })
  const triedAutoplay = useRef(false)
  const readerRef = useRef(DEFAULT_READER)
  const repeatRef = useRef(false)

  const loadChapter = async (book, chapter) => {
    setLoading(true)
    try {
      const data = await fetchChapter(book, chapter)
      const url = pickAudioUrl(data.thisChapterAudioLinks, readerRef.current)
      if (!url) throw new Error('No audio for this chapter')
      if (audioRef.current) audioRef.current.src = url
      setLabel(`${data.book.commonName} ${data.chapter.number}`)
      currentRef.current = { book, chapter }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ book, chapter }))
      nextChapterRef.current = parseApiLink(data.nextChapterApiLink) || { book: START_BOOK, chapter: START_CHAPTER }
      prevChapterRef.current = parseApiLink(data.previousChapterApiLink) // null at Genesis 1
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

    // Load the book list once, for the picker (name + chapter count per book).
    fetch(`${BIBLE_API}/books.json`).then(r => r.json())
      .then(d => setBooks(d.books || []))
      .catch(() => {})
  }, [])

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol
  }, [vol])

  useEffect(() => { repeatRef.current = repeat }, [repeat])

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
    let ok
    if (repeatRef.current) {
      const { book, chapter } = currentRef.current
      ok = await loadChapter(book, chapter)
    } else {
      const next = nextChapterRef.current || { book: START_BOOK, chapter: START_CHAPTER }
      ok = await loadChapter(next.book, next.chapter)
    }
    if (ok && audioRef.current) audioRef.current.play().catch(() => {})
  }

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const goRelative = async (target) => {
    if (!target) return
    const wasPlaying = playing
    const ok = await loadChapter(target.book, target.chapter)
    if (ok && wasPlaying && audioRef.current) audioRef.current.play().catch(() => {})
  }

  const skipNext = () => goRelative(nextChapterRef.current || { book: START_BOOK, chapter: START_CHAPTER })
  const skipPrev = () => goRelative(prevChapterRef.current || currentRef.current)

  const openPicker = () => {
    setPickBook(currentRef.current.book)
    setPickChapter(currentRef.current.chapter)
    setPickerOpen(v => !v)
  }

  const jumpTo = async () => {
    setPickerOpen(false)
    await goRelative({ book: pickBook, chapter: pickChapter })
  }

  const pickBookMeta = books.find(b => b.id === pickBook)

  return (
    <>
      <audio ref={audioRef} onEnded={handleEnded}
        onError={() => { if (!loading) skipNext() }} />

      <div style={{ position: 'fixed', bottom: 80, left: 16, zIndex: 300 }}>

        {pickerOpen && (
          <div style={{
            position: 'absolute', bottom: 46, left: 0,
            background: 'var(--surface-solid-c)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(201,168,76,0.35)', borderRadius: 14,
            padding: 14, width: 220, boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          }}>
            <label style={{ fontFamily: F.body, fontSize: 11, color: 'var(--fg-5)', display: 'block', marginBottom: 4 }}>Book</label>
            <select value={pickBook} onChange={e => { setPickBook(e.target.value); setPickChapter(1) }}
              style={{ width: '100%', marginBottom: 10, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--fg-2)', background: 'var(--fg-08)', color: 'var(--fg-100)', fontFamily: F.body, fontSize: 12.5, colorScheme: 'dark' }}>
              {books.map(b => <option key={b.id} value={b.id}>{b.commonName}</option>)}
            </select>
            <label style={{ fontFamily: F.body, fontSize: 11, color: 'var(--fg-5)', display: 'block', marginBottom: 4 }}>Chapter</label>
            <select value={pickChapter} onChange={e => setPickChapter(parseInt(e.target.value, 10))}
              style={{ width: '100%', marginBottom: 12, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--fg-2)', background: 'var(--fg-08)', color: 'var(--fg-100)', fontFamily: F.body, fontSize: 12.5, colorScheme: 'dark' }}>
              {Array.from({ length: pickBookMeta?.numberOfChapters || 1 }, (_, i) => i + 1).map(n =>
                <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={jumpTo} style={{ width: '100%', background: C.gold, color: '#0a0f1e', border: 'none', borderRadius: 8, padding: '7px 0', fontFamily: F.body, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              Go
            </button>
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center',
          gap: minimised ? 0 : 6,
          background: 'var(--surface-solid-c)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 40,
          padding: minimised ? '6px 10px' : '6px 12px 6px 8px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          transition: 'all 0.2s',
        }}>
          {!minimised && (
            <button onClick={skipPrev} disabled={loading || !prevChapterRef.current} title="Previous chapter" style={{
              background: 'none', border: 'none', color: 'var(--fg-45)',
              cursor: loading ? 'default' : 'pointer', fontSize: 12, padding: 0, flexShrink: 0,
              opacity: prevChapterRef.current ? 1 : 0.3,
            }}>⏮</button>
          )}

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
              <button onClick={skipNext} disabled={loading} title="Next chapter" style={{
                background: 'none', border: 'none', color: 'var(--fg-45)',
                cursor: loading ? 'default' : 'pointer', fontSize: 12, padding: 0, flexShrink: 0,
              }}>⏭</button>

              <button onClick={() => setRepeat(r => !r)} title="Repeat this chapter" style={{
                background: 'none', border: 'none',
                color: repeat ? C.gold : 'var(--fg-45)',
                cursor: 'pointer', fontSize: 12, padding: 0, flexShrink: 0,
              }}>🔁</button>

              <button onClick={openPicker} title="Jump to book/chapter" style={{
                background: 'none', border: 'none',
                fontFamily: F.body, fontSize: 11,
                color: pickerOpen ? C.gold : 'var(--fg-65)',
                whiteSpace: 'nowrap', maxWidth: 100,
                overflow: 'hidden', textOverflow: 'ellipsis',
                cursor: 'pointer', padding: 0,
              }}>
                📖 {label}
              </button>

              <input type="range" min="0" max="1" step="0.05" value={vol}
                onChange={e => setVol(parseFloat(e.target.value))}
                style={{ width: 40, accentColor: C.gold, cursor: 'pointer', flexShrink: 0 }} />
            </>
          )}

          <button onClick={() => { setMinimised(m => !m); setPickerOpen(false) }} style={{
            background: 'none', border: 'none',
            color: 'var(--fg-3)',
            cursor: 'pointer', fontSize: 9,
            padding: minimised ? '0 0 0 4px' : '0 0 0 2px',
            flexShrink: 0,
          }}>
            {minimised ? '📖' : '−'}
          </button>
        </div>
      </div>
    </>
  )
}
