import { useState } from 'react'
import { C, F, API } from '../lib/tokens.js'

export default function ImagePicker({ onSelect, currentImage }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setError('')
    const res = await fetch(`${API}/armchair/image-search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    if (data.images) setResults(data.images)
    else setError(data.error || 'Search failed')
    setLoading(false)
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600, color:C.navy, display:'block', marginBottom:5 }}>
        Cover image
      </label>

      {currentImage && (
        <div style={{
          backgroundImage: `url(${currentImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
          height: 100, borderRadius: 8, marginBottom: 8, border: `1px solid ${C.border}`
        }}/>
      )}

      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 8,
        padding: '8px 14px', fontFamily: F.body, fontSize: 12.5, color: C.navy, cursor: 'pointer'
      }}>
        🔍 {open ? 'Close image search' : 'Search for an image'}
      </button>

      {open && (
        <div style={{ marginTop: 10, padding: 14, background: C.parchment, borderRadius: 10 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="e.g. open bible, sunrise, mountains, candle"
              style={{
                flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 8,
                padding: '8px 12px', fontFamily: F.body, fontSize: 13, outline: 'none'
              }}
            />
            <button onClick={search} disabled={loading} style={{
              background: C.navy, color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 16px', fontFamily: F.body, fontSize: 12.5, cursor: 'pointer'
            }}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {error && <p style={{ fontFamily: F.body, fontSize: 12.5, color: '#DC2626', marginBottom: 10 }}>{error}</p>}

          {results.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
              {results.map(img => (
                <div
                  key={img.id}
                  onClick={() => { onSelect(img.full); setOpen(false) }}
                  style={{
                    backgroundImage: `url(${img.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    height: 80, borderRadius: 6, cursor: 'pointer', border: `2px solid transparent`
                  }}
                  title={`Photo by ${img.photographer} on Pixabay`}
                  onMouseEnter={e => e.currentTarget.style.border = `2px solid ${C.gold}`}
                  onMouseLeave={e => e.currentTarget.style.border = `2px solid transparent`}
                />
              ))}
            </div>
          )}
          <p style={{ fontFamily: F.body, fontSize: 10.5, color: C.muted, marginTop: 8 }}>
            Free images via Pixabay — no attribution required
          </p>
        </div>
      )}
    </div>
  )
}
