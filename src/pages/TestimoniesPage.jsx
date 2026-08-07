import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Spinner } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

// Turns a YouTube/Vimeo watch link into an embeddable URL. Returns null if the
// URL doesn't match a known video host, so the caller can fall back to a plain <video> tag.
function toEmbedUrl(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch { return null }
}

function TestimonyVideo({ url }) {
  const embed = toEmbedUrl(url)
  if (embed) {
    return (
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
        <iframe src={embed} title="Testimony video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}/>
      </div>
    )
  }
  return (
    <video controls style={{ width: '100%', borderRadius: 12, display: 'block', background: '#000' }}>
      <source src={url} />
      Your browser does not support video playback.
    </video>
  )
}

export default function TestimoniesPage() {
  usePageTitle('Testimonies')
  const [items, setItems] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetch(`${API}/testimonies`).then(r => r.json()).then(d => setItems(d.testimonies || [])).catch(() => setItems([]))
  }, [])

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: F.body, fontSize: 13, color: 'var(--fg-4)' }}>← Home</Link>
        </div>

        <h1 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, color: 'var(--fg-100)', textAlign: 'center', marginBottom: 10 }}>
          Testimonies
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.gold, textAlign: 'center', marginBottom: 48, fontStyle: 'italic' }}>
          Stories of God's word at work in real lives
        </p>

        {items === null && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner/></div>}

        {items?.length === 0 && (
          <p style={{ fontFamily: F.body, fontSize: 15, color: 'var(--fg-4)', textAlign: 'center', padding: '40px 0' }}>
            No testimonies published yet — check back soon.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {items?.map(t => (
            <div key={t.id} style={{ background: 'var(--fg-05)', border: '1px solid var(--fg-1)', borderRadius: 16, padding: 22 }}>
              {t.video_url && <div style={{ marginBottom: 18 }}><TestimonyVideo url={t.video_url}/></div>}
              <p style={{ fontFamily: F.display, fontSize: 16.5, color: 'var(--fg-92)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 14 }}>
                "{t.story}"
              </p>
              <p style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 700, color: C.gold }}>
                {t.name}{t.location ? ` · ${t.location}` : ''}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
          <Link to="/contact" style={{ background: C.gold, color: C.navy, borderRadius: 10, padding: '13px 26px', fontFamily: F.body, fontSize: 14.5, fontWeight: 700 }}>
            Share your own testimony →
          </Link>
        </div>
      </div>
    </div>
  )
}
