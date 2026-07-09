// ─── ForumPage ───────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, BadgeTag, CategoryPill, Spinner, Btn } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import ShareButton from '../components/ShareButton.jsx'

const ALL_CATS = [
  {slug:'all',label:'All Topics',icon:'✦'},
  {slug:'exegesis',label:'Deep Dive',icon:'📖'},
  {slug:'seekers',label:"Seekers' Corner",icon:'🌱'},
  {slug:'prayer',label:'Prayer & Life',icon:'🙏'},
  {slug:'prophecy',label:'Prophecy',icon:'🕊️'},
  {slug:'theology',label:'Theology',icon:'⚡'},
  {slug:'resources',label:'Resources',icon:'📚'},
]

const PAGE_SIZE = 10

export function ForumPage() {
  usePageTitle('Forum')
  const { category='all' } = useParams()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('recent') // recent | popular | unanswered
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    setPage(1)
    const q = category !== 'all' ? `?category=${category}` : ''
    fetch(`${API}/threads${q}`)
      .then(r => r.json())
      .then(d => { setThreads(d.threads || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category])

  // Filter and sort
  const filtered = threads.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.body?.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'popular') return (b.like_count + b.reply_count) - (a.like_count + a.reply_count)
    if (sort === 'unanswered') return a.reply_count - b.reply_count
    return 0 // recent = default API order
  })

  const pinned = sorted.filter(t => t.is_pinned === 1)
  const unpinned = sorted.filter(t => t.is_pinned !== 1)
  const paginated = unpinned.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(unpinned.length / PAGE_SIZE)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.navy, marginBottom: 4 }}>The Forum</h1>
          <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.muted }}>
            {filtered.length} discussion{filtered.length !== 1 ? 's' : ''} · Join in, ask freely, share deeply
          </p>
        </div>
        {user
          ? <Btn variant="gold" onClick={() => navigate('/new-thread')}>+ Start a Discussion</Btn>
          : <Link to="/register" style={{ background: C.gold, color: C.navy, borderRadius: 8, padding: '9px 18px', fontFamily: F.body, fontSize: 13, fontWeight: 700 }}>Join to Post</Link>
        }
      </div>

      {/* Search + Sort */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search discussions…"
          style={{ flex: 1, minWidth: 200, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontFamily: F.body, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
        />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontFamily: F.body, fontSize: 13.5, outline: 'none', background: '#fff' }}>
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="unanswered">Unanswered</option>
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 22, overflowX: 'auto', paddingBottom: 4 }}>
        {ALL_CATS.map(cat => (
          <CategoryPill key={cat.slug} label={cat.label} icon={cat.icon} active={category === cat.slug}
            onClick={() => { navigate(cat.slug === 'all' ? '/forum' : `/forum/${cat.slug}`); setSearch('') }}
          />
        ))}
      </div>

      {loading ? <Spinner/> : (
        <>
          {/* Pinned threads */}
          {pinned.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: F.body, fontSize: 11.5, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>📌 Featured</p>
              <div style={{ display: 'grid', gap: 10 }}>
                {pinned.map(t => <ThreadCard key={t.id} thread={t} onClick={() => navigate(`/thread/${t.id}`)} pinned/>)}
              </div>
            </div>
          )}

          {/* Regular threads */}
          {paginated.length > 0
            ? (
              <>
                {pinned.length > 0 && <p style={{ fontFamily: F.body, fontSize: 11.5, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>All Discussions</p>}
                <div style={{ display: 'grid', gap: 10 }}>
                  {paginated.map(t => <ThreadCard key={t.id} thread={t} onClick={() => navigate(`/thread/${t.id}`)}/>)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                    <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ border: `1.5px solid ${C.border}`, background: '#fff', borderRadius: 8, padding: '7px 14px', fontFamily: F.body, fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => (
                      <span key={p}>
                        {i > 0 && arr[i-1] !== p - 1 && <span style={{ fontFamily: F.body, color: C.muted, padding: '0 4px' }}>…</span>}
                        <button onClick={() => setPage(p)} style={{ border: `1.5px solid ${p === page ? C.navy : C.border}`, background: p === page ? C.navy : '#fff', color: p === page ? '#fff' : C.text, borderRadius: 8, padding: '7px 12px', fontFamily: F.body, fontSize: 13, cursor: 'pointer', minWidth: 36 }}>{p}</button>
                      </span>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={{ border: `1.5px solid ${C.border}`, background: '#fff', borderRadius: 8, padding: '7px 14px', fontFamily: F.body, fontSize: 13, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
                  </div>
                )}
              </>
            )
            : (
              <div style={{ textAlign: 'center', padding: '52px 0', color: C.muted, fontFamily: F.body }}>
                {search ? `No results for "${search}"` : 'No discussions yet in this category.'}
                <br/>
                {user ? <Link to="/new-thread" style={{ color: C.gold, fontWeight: 600 }}>Start one →</Link>
                      : <Link to="/register" style={{ color: C.gold, fontWeight: 600 }}>Join and start one →</Link>}
              </div>
            )
          }
        </>
      )}
    </div>
  )
}

function ThreadCard({ thread, onClick, pinned }) {
  const timeAgo = ts => {
    const s = Math.floor((Date.now() - new Date(ts+'Z').getTime()) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s/60)}m ago`
    if (s < 86400) return `${Math.floor(s/3600)}h ago`
    if (s < 604800) return `${Math.floor(s/86400)}d ago`
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 10, padding: '14px 18px',
      border: `1px solid ${pinned ? C.gold + '55' : C.border}`,
      cursor: 'pointer', transition: 'box-shadow 0.15s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
        <span style={{ background: C.mist, color: C.navyLight, borderRadius: 5, padding: '2px 8px', fontSize: 11, fontFamily: F.body, fontWeight: 600 }}>{thread.cat_label}</span>
        {pinned && <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>📌 Featured</span>}
        <span style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginLeft: 'auto' }}>{timeAgo(thread.created_at)}</span>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: C.navy, margin: '0 0 5px', lineHeight: 1.35 }}>{thread.title}</h3>
      <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, margin: '0 0 10px', lineHeight: 1.5 }}>{thread.body?.slice(0, 140)}…</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar name={thread.display_name} color={thread.avatar_color} size={22}/>
          <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 500 }}>{thread.display_name}</span>
          <BadgeTag label={thread.badge}/>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>💬 {thread.reply_count}</span>
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>👁 {thread.view_count}</span>
          <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>❤️ {thread.like_count}</span>
        </div>
      </div>
    </div>
  )
}

// ─── ThreadPage ──────────────────────────────────────────────

export function ThreadPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  usePageTitle(thread?.title)

  const load = () => {
    fetch(`${API}/threads/${id}/replies`)
      .then(r => r.json())
      .then(d => { setReplies(d.replies || []); setThread(d.thread || null); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(load, [id])

  const post = async () => {
    if (!body.trim()) return
    setPosting(true); setError('')
    const res = await fetch(`${API}/threads/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body })
    })
    const data = await res.json()
    if (data.ok) { setBody(''); load() }
    else setError(data.error || 'Something went wrong')
    setPosting(false)
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) { try { await navigator.share({ title: thread?.title, url }) } catch {} }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  if (loading) return <div style={{ maxWidth: 820, margin: '40px auto' }}><Spinner/></div>
  if (!thread) return <div style={{ textAlign: 'center', padding: '80px', fontFamily: F.body, color: C.muted }}>Not found. <Link to="/forum" style={{ color: C.gold }}>Back to forum</Link></div>

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 60px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: C.navyLight, fontFamily: F.body, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', marginBottom: 22, padding: 0 }}>
        ← Back
      </button>

      {/* Thread */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px 24px', border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <span style={{ background: C.mist, color: C.navyLight, borderRadius: 6, padding: '2px 9px', fontSize: 11, fontFamily: F.body, fontWeight: 600 }}>
            {thread.cat_label || 'Discussion'}
          </span>
          <ShareButton
            title={thread.title}
            url={`https://discussionsexegetica.com/thread/${thread.id}`}
            excerpt={thread.body?.slice(0, 120)}
          />
        </div>

        <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 16px', lineHeight: 1.3 }}>
          {thread.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <Avatar name={thread.display_name} color={thread.avatar_color} size={34}/>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Link to={`/profile/${thread.username}`} style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 600, color: C.navy }}>{thread.display_name}</Link>
              <BadgeTag label={thread.badge}/>
            </div>
            <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>
              {new Date(thread.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div style={{ fontFamily: F.body, fontSize: 15.5, color: C.text, lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
          {thread.body}
        </div>
      </div>

      {/* Replies header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 14px' }}>
        <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: C.navy }}>
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        {replies.length > 0 && (
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>
            {thread.view_count} views · {thread.like_count} likes
          </span>
        )}
      </div>

      {/* Replies */}
      {replies.map((r, i) => (
        <div key={r.id} style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 10, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Avatar name={r.display_name} color={r.avatar_color} size={28}/>
            <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600 }}>{r.display_name}</span>
            <BadgeTag label={r.badge}/>
            <span style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginLeft: 'auto' }}>
              {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14.5, color: C.text, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{r.body}</p>
        </div>
      ))}

      {/* Reply box */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: `1px solid ${C.border}`, marginTop: 22 }}>
        <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>Add your voice</p>
        {!user
          ? <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.muted }}><Link to="/login" style={{ color: C.gold, fontWeight: 600 }}>Sign in</Link> or <Link to="/register" style={{ color: C.gold, fontWeight: 600 }}>join free</Link> to reply.</p>
          : <>
              {error && <p style={{ color: '#DC2626', fontFamily: F.body, fontSize: 13, marginBottom: 10 }}>{error}</p>}
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Share your reflection, question, or insight…" rows={4}
                style={{ width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 13px', fontFamily: F.body, fontSize: 14, resize: 'vertical', outline: 'none', marginBottom: 10, boxSizing: 'border-box', lineHeight: 1.65 }}
              />
              <Btn onClick={post} disabled={posting || !body.trim()}>{posting ? 'Posting…' : 'Post Reply'}</Btn>
            </>
        }
      </div>
    </div>
  )
}

// ─── NewThreadPage ───────────────────────────────────────────

export function NewThreadPage() {
  usePageTitle('Start a Discussion')
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', body: '', category_slug: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: F.body, color: C.muted }}>Please <Link to="/login" style={{ color: C.gold, fontWeight: 600 }}>sign in</Link> to start a discussion.</div>

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.category_slug) return setError('Please fill in all fields and choose a category.')
    setLoading(true); setError('')
    const res = await fetch(`${API}/threads`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.id) navigate(`/thread/${data.id}`)
    else { setError(data.error || 'Something went wrong'); setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '36px auto', padding: '0 20px 60px' }}>
      <button onClick={() => navigate('/forum')} style={{ background: 'none', border: 'none', color: C.navyLight, fontFamily: F.body, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', marginBottom: 24, padding: 0 }}>← Back to Forum</button>
      <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Start a Discussion</h1>
      <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.muted, marginBottom: 24 }}>Ask a question, share an insight, or open a passage for study. All perspectives welcome.</p>
      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontFamily: F.body, fontSize: 13, color: '#DC2626', marginBottom: 16 }}>{error}</div>}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 8 }}>Category *</label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {ALL_CATS.filter(c => c.slug !== 'all').map(cat => (
            <button key={cat.slug} onClick={() => setForm(f => ({ ...f, category_slug: cat.slug }))}
              style={{ background: form.category_slug === cat.slug ? C.navy : '#fff', color: form.category_slug === cat.slug ? '#fff' : C.muted, border: `1.5px solid ${form.category_slug === cat.slug ? C.navy : C.border}`, borderRadius: 20, padding: '6px 14px', fontFamily: F.body, fontSize: 12.5, cursor: 'pointer' }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>Title *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. What does 'logos' really mean in John 1:1?" maxLength={200}
          style={{ width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 13px', fontFamily: F.body, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
      </div>
      <div style={{ marginBottom: 22 }}>
        <label style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>Your opening post *</label>
        <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Share your question, reflection, or insight…" rows={8}
          style={{ width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 13px', fontFamily: F.body, fontSize: 14, resize: 'vertical', outline: 'none', lineHeight: 1.7, boxSizing: 'border-box' }}/>
      </div>
      <Btn variant="gold" onClick={submit} disabled={loading} style={{ fontSize: 14.5, padding: '11px 26px' }}>{loading ? 'Posting…' : 'Post Discussion'}</Btn>
    </div>
  )
}
