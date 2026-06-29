import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, BadgeTag, CategoryPill, Spinner, Btn } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'

const ALL_CATS = [
  { slug:'all',      label:'All Topics',     icon:'✦' },
  { slug:'exegesis', label:'Deep Dive',       icon:'📖' },
  { slug:'seekers',  label:"Seekers' Corner", icon:'🌱' },
  { slug:'prayer',   label:'Prayer & Life',   icon:'🙏' },
  { slug:'prophecy', label:'Prophecy',        icon:'🕊️' },
  { slug:'theology', label:'Theology',        icon:'⚡' },
  { slug:'resources',label:'Resources',       icon:'📚' },
]

export default function ForumPage() {
  const { category = 'all' } = useParams()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    const q = category !== 'all' ? `?category=${category}` : ''
    fetch(`${API}/threads${q}`)
      .then(r => r.json())
      .then(d => { setThreads(d.threads || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category])

  const filtered = threads.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'36px 24px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:F.display, fontSize:28, fontWeight:700, color:C.navy, marginBottom:4 }}>
            The Forum
          </h1>
          <p style={{ fontFamily:F.body, fontSize:14, color:C.muted }}>
            {filtered.length} discussion{filtered.length !== 1 ? 's' : ''} · Join in, ask freely, share deeply
          </p>
        </div>
        {user ? (
          <Btn variant="gold" onClick={() => navigate('/new-thread')}>+ Start a Discussion</Btn>
        ) : (
          <Link to="/register" style={{
            background:C.gold, color:C.navy, borderRadius:8,
            padding:'9px 20px', fontFamily:F.body, fontSize:13.5, fontWeight:700
          }}>Join to Post</Link>
        )}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search discussions…"
        style={{
          width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8,
          padding:'10px 14px', fontFamily:F.body, fontSize:14, color:C.text,
          outline:'none', background:'#fff', marginBottom:16
        }}
      />

      {/* Category pills */}
      <div style={{ display:'flex', gap:8, marginBottom:24, overflowX:'auto', paddingBottom:4 }}>
        {ALL_CATS.map(cat => (
          <CategoryPill
            key={cat.slug}
            label={cat.label}
            icon={cat.icon}
            active={category === cat.slug}
            onClick={() => navigate(cat.slug === 'all' ? '/forum' : `/forum/${cat.slug}`)}
          />
        ))}
      </div>

      {/* Thread list */}
      {loading ? <Spinner/> : (
        <div style={{ display:'grid', gap:14 }}>
          {filtered.length > 0 ? filtered.map(t => (
            <ThreadCard key={t.id} thread={t} onClick={() => navigate(`/thread/${t.id}`)}/>
          )) : (
            <div style={{ textAlign:'center', padding:'60px 0', color:C.muted, fontFamily:F.body }}>
              {search ? `No results for "${search}"` : 'No discussions yet in this category.'}<br/>
              {user
                ? <Link to="/new-thread" style={{ color:C.gold, fontWeight:600 }}>Start one →</Link>
                : <Link to="/register" style={{ color:C.gold, fontWeight:600 }}>Join and start one →</Link>
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ThreadCard({ thread, onClick }) {
  return (
    <Card pinned={thread.is_pinned} style={{ cursor:'pointer' }}>
      <div onClick={onClick}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <span style={{
            background:C.mist, color:C.navyLight, borderRadius:6,
            padding:'2px 9px', fontSize:11, fontFamily:F.body, fontWeight:600
          }}>{thread.cat_label}</span>
          {thread.is_pinned===1 && <span style={{ fontSize:11, color:C.gold, fontWeight:700 }}>📌 Featured</span>}
        </div>
        <h3 style={{ fontFamily:F.display, fontSize:17, fontWeight:700, color:C.navy, margin:'0 0 7px', lineHeight:1.35 }}>
          {thread.title}
        </h3>
        <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted, margin:'0 0 14px', lineHeight:1.6 }}>
          {thread.body?.slice(0,180)}…
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Avatar name={thread.display_name} color={thread.avatar_color} size={26}/>
            <span style={{ fontFamily:F.body, fontSize:12.5, fontWeight:500 }}>{thread.display_name}</span>
            <BadgeTag label={thread.badge}/>
            <span style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>
              {new Date(thread.created_at).toLocaleDateString()}
            </span>
          </div>
          <div style={{ display:'flex', gap:14 }}>
            <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>💬 {thread.reply_count}</span>
            <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>👁 {thread.view_count}</span>
            <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>❤️ {thread.like_count}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
