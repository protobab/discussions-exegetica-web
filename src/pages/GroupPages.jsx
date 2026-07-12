import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Avatar, BadgeTag, Spinner, Btn } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { IMAGES } from '../lib/images.js'

const sage = '#2D6A4F'
const sageBg = '#F0F7F4'
const sageMid = '#52B788'
const sageLight = '#D8F3DC'

// Pixabay image picker for groups
function GroupImagePicker({ currentImage, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    const res = await fetch(`${API}/armchair/image-search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.images || [])
    setLoading(false)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {currentImage && (
        <div style={{ backgroundImage: `url(${currentImage})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 80, borderRadius: 8, marginBottom: 8, border: `1px solid ${sageLight}` }}/>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: `1.5px solid ${sageLight}`, borderRadius: 8, padding: '7px 14px', fontFamily: F.body, fontSize: 12.5, color: sage, cursor: 'pointer' }}>
        🖼 {open ? 'Close' : currentImage ? 'Change cover image' : 'Add cover image'}
      </button>
      {open && (
        <div style={{ marginTop: 10, padding: 14, background: '#fff', borderRadius: 10, border: `1px solid ${sageLight}` }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="e.g. bible study, community, prayer, mountains"
              style={{ flex: 1, border: `1.5px solid ${sageLight}`, borderRadius: 8, padding: '8px 12px', fontFamily: F.body, fontSize: 13, outline: 'none' }}/>
            <button onClick={search} disabled={loading} style={{ background: sage, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontFamily: F.body, fontSize: 12.5, cursor: 'pointer' }}>
              {loading ? '…' : 'Search'}
            </button>
          </div>
          {results.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px,1fr))', gap: 6 }}>
              {results.map(img => (
                <div key={img.id} onClick={() => { onSelect(img.full); setOpen(false) }}
                  style={{ backgroundImage: `url(${img.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 64, borderRadius: 6, cursor: 'pointer', border: '2px solid transparent', transition: 'border 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.border = `2px solid ${sage}`}
                  onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}
                  title={`Photo by ${img.photographer}`}
                />
              ))}
            </div>
          )}
          <p style={{ fontFamily: F.body, fontSize: 10.5, color: C.muted, marginTop: 6 }}>Free images via Pixabay</p>
        </div>
      )}
    </div>
  )
}

export function GroupsPage() {
  usePageTitle('Study Groups')
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', book_focus: '', cover_image: '', max_members: 0, approval_required: false, is_private: false })
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [visible, setVisible] = useState(false)
  const [filter, setFilter] = useState('all') // all | open | approval

  const load = () => {
    fetch(`${API}/groups`).then(r => r.json()).then(d => { setGroups(d.groups || []); setLoading(false) })
  }
  useEffect(() => { load(); setTimeout(() => setVisible(true), 60) }, [])

  const create = async () => {
    if (!form.name.trim()) return setError('Group name required')
    setCreating(true); setError('')
    const res = await fetch(`${API}/groups`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, max_members: parseInt(form.max_members) || 0 })
    })
    const data = await res.json()
    if (data.id) navigate(`/groups/${data.id}`)
    else { setError(data.error || 'Error'); setCreating(false) }
  }

  const filtered = groups.filter(g => {
    if (filter === 'open') return !g.approval_required && !g.is_private && (!g.max_members || g.member_count < g.max_members)
    if (filter === 'approval') return g.approval_required
    if (filter === 'private') return g.is_private
    return true
  })

  const FB = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=60'

  return (
    <div style={{ minHeight: '100vh', background: sageBg, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>

      {/* HERO */}
      <div style={{ backgroundImage: `linear-gradient(135deg, rgba(30,58,47,0.85) 0%, rgba(45,106,79,0.9) 100%), url(${IMAGES.groupsHero})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '52px 24px 44px', textAlign: 'center' }}>
        <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: sageMid, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>Study Groups</p>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
          Smaller circles,<br/>deeper roots.
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.75 }}>
          Book-by-book study communities where everyone knows your name and your questions are welcome.
        </p>
        {user
          ? <button onClick={() => setShowForm(s => !s)} style={{ background: sageMid, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontFamily: F.body, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {showForm ? 'Cancel' : '+ Start a Group'}
            </button>
          : <Link to="/register" style={{ background: sageMid, color: '#fff', borderRadius: 10, padding: '11px 24px', fontFamily: F.body, fontSize: 14, fontWeight: 700 }}>Join to start a group</Link>
        }
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* Create form */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px', marginBottom: 24, border: `1px solid ${sageLight}`, boxShadow: '0 4px 20px rgba(45,106,79,0.1)' }}>
            <h3 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: sage, marginBottom: 16 }}>New Study Group</h3>
            {error && <p style={{ color: '#DC2626', fontFamily: F.body, fontSize: 13, marginBottom: 10 }}>{error}</p>}
            <div style={{ display: 'grid', gap: 10 }}>
              <input placeholder="Group name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ border: `1.5px solid ${sageLight}`, borderRadius: 8, padding: '10px 13px', fontFamily: F.body, fontSize: 13.5, outline: 'none' }}/>
              <input placeholder="Book or topic focus (e.g. Gospel of John, Psalms)" value={form.book_focus} onChange={e => setForm(f => ({ ...f, book_focus: e.target.value }))}
                style={{ border: `1.5px solid ${sageLight}`, borderRadius: 8, padding: '10px 13px', fontFamily: F.body, fontSize: 13.5, outline: 'none' }}/>
              <textarea placeholder="Describe the group's purpose…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                style={{ border: `1.5px solid ${sageLight}`, borderRadius: 8, padding: '10px 13px', fontFamily: F.body, fontSize: 13.5, outline: 'none', resize: 'vertical' }}/>
              <GroupImagePicker currentImage={form.cover_image} onSelect={url => setForm(f => ({ ...f, cover_image: url }))}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: sage, display: 'block', marginBottom: 5 }}>Max members (0 = unlimited)</label>
                  <input type="number" min="0" max="500" value={form.max_members} onChange={e => setForm(f => ({ ...f, max_members: e.target.value }))}
                    style={{ width: '100%', border: `1.5px solid ${sageLight}`, borderRadius: 8, padding: '9px 12px', fontFamily: F.body, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: F.body, fontSize: 13.5, color: C.text, alignSelf: 'end', paddingBottom: 10 }}>
                  <input type="checkbox" checked={form.approval_required} onChange={e => setForm(f => ({ ...f, approval_required: e.target.checked }))}/>
                  Require approval to join
                </label>
              </div>
              <button onClick={create} disabled={creating} style={{ background: sage, color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontFamily: F.body, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: creating ? .7 : 1 }}>
                {creating ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[['all','All Groups'],['open','Open to join'],['approval','Approval required'],['private','🔐 Private']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ background: filter===k ? sage : '#fff', color: filter===k ? '#fff' : C.muted, border: `1.5px solid ${filter===k ? sage : sageLight}`, borderRadius: 20, padding: '6px 16px', fontFamily: F.body, fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
          <span style={{ fontFamily: F.body, fontSize: 12.5, color: C.muted, alignSelf: 'center', marginLeft: 4 }}>{filtered.length} group{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? <Spinner/> : filtered.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: '52px 24px' }}>
              <p style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: sage, marginBottom: 8 }}>No groups yet</p>
              <p style={{ fontFamily: F.body, fontSize: 14.5, color: C.muted, marginBottom: 20 }}>Be the founder of the first one.</p>
              {user
                ? <button onClick={() => setShowForm(true)} style={{ background: sage, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontFamily: F.body, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Start a Group</button>
                : <Link to="/register" style={{ background: sage, color: '#fff', borderRadius: 10, padding: '11px 24px', fontFamily: F.body, fontSize: 14, fontWeight: 700 }}>Join to start one</Link>}
            </div>
          )
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: 18 }}>
              {filtered.map(g => {
                const full = g.max_members > 0 && g.member_count >= g.max_members
                return (
                  <div key={g.id} onClick={() => !full && navigate(`/groups/${g.id}`)} style={{
                    background: '#fff', borderRadius: 14, overflow: 'hidden', cursor: full ? 'not-allowed' : 'pointer',
                    border: `1px solid ${sageLight}`, transition: 'all 0.2s', opacity: full ? 0.7 : 1,
                    boxShadow: '0 2px 8px rgba(45,106,79,0.08)'
                  }}
                    onMouseEnter={e => { if (!full) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(45,106,79,0.15)' }}}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(45,106,79,0.08)' }}
                  >
                    {g.cover_image && (
                      <div style={{ backgroundImage: `url(${g.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 100 }}/>
                    )}
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        {g.book_focus && <span style={{ background: sageLight, color: sage, borderRadius: 6, padding: '2px 9px', fontSize: 11, fontFamily: F.body, fontWeight: 600 }}>📖 {g.book_focus}</span>}
                        {g.approval_required && <span style={{ background: '#FFF8E7', color: '#92400E', borderRadius: 6, padding: '2px 9px', fontSize: 10.5, fontFamily: F.body, fontWeight: 600 }}>🔒 Approval</span>}
                        {full && <span style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 6, padding: '2px 9px', fontSize: 10.5, fontFamily: F.body, fontWeight: 600 }}>Full</span>}
                      </div>
                      <h3 style={{ fontFamily: F.display, fontSize: 16.5, fontWeight: 700, color: '#1E3A2F', margin: '0 0 5px', lineHeight: 1.3 }}>{g.name}</h3>
                      {g.description && <p style={{ fontFamily: F.body, fontSize: 12.5, color: C.muted, margin: '0 0 12px', lineHeight: 1.55 }}>{g.description.slice(0, 90)}{g.description.length > 90 ? '…' : ''}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Avatar name={g.display_name} color={g.avatar_color || sage} size={20}/>
                          <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>{g.display_name}</span>
                        </div>
                        <span style={{ fontFamily: F.body, fontSize: 12, color: sage, fontWeight: 600 }}>
                          👥 {g.member_count}{g.max_members > 0 ? `/${g.max_members}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}

export function GroupDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [posting, setPosting] = useState(false)
  const [joining, setJoining] = useState(false)
  const [visible, setVisible] = useState(false)
  const [maxMembers, setMaxMembers] = useState('')
  const [editingMax, setEditingMax] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)

  usePageTitle(group?.name)

  const load = () => {
    fetch(`${API}/groups/${id}`).then(r => r.json()).then(d => {
      setGroup(d.group); setPosts(d.posts || []); setLoading(false)
      setMaxMembers(String(d.group?.max_members || 0))
      if (d.group?.invite_url) setInviteUrl(d.group.invite_url)
    })
  }
  useEffect(() => { load(); setTimeout(() => setVisible(true), 60) }, [id])

  const isOwner = user && group && (user.username === group.username || group.display_name === user.display_name)

  const join = async () => {
    setJoining(true)
    const res = await fetch(`${API}/groups/${id}/join`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (data.ok) load(); else setError(data.error)
    setJoining(false)
  }

  const post = async () => {
    if (!body.trim()) return
    setPosting(true); setError('')
    const res = await fetch(`${API}/groups/${id}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ body }) })
    const data = await res.json()
    if (data.ok) { setBody(''); load() } else setError(data.error)
    setPosting(false)
  }

  const saveMaxMembers = async () => {
    await fetch(`${API}/groups/${id}/settings`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ max_members: parseInt(maxMembers) || 0 }) })
    setEditingMax(false)
    load()
  }

  if (loading) return <div style={{ maxWidth: 760, margin: '40px auto' }}><Spinner/></div>
  if (!group && !loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0f1e' }}>
      <div style={{ textAlign:'center', padding:'40px', maxWidth:400 }}>
        <p style={{ fontSize:48, marginBottom:16 }}>🔐</p>
        <h2 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:'#fff', marginBottom:10 }}>Private Group</h2>
        <p style={{ fontFamily:F.body, fontSize:14.5, color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:20 }}>This group is private. You need a personal invite link from the group owner to join.</p>
        <button onClick={()=>navigate('/groups')} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', borderRadius:10, padding:'10px 24px', fontFamily:F.body, fontSize:14, cursor:'pointer' }}>← Back to Groups</button>
      </div>
    </div>
  )

  const full = group.max_members > 0 && group.member_count >= group.max_members

  return (
    <div style={{ minHeight: '100vh', background: sageBg, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
      <div style={{ backgroundImage: `linear-gradient(135deg, rgba(30,58,47,0.88) 0%, rgba(45,106,79,0.92) 100%), url(${group.cover_image || IMAGES.groupsHero})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '32px 24px 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button onClick={() => navigate('/groups')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', fontFamily: F.body, fontSize: 13, cursor: 'pointer', marginBottom: 14, padding: 0 }}>← All Groups</button>
          {group.book_focus && <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 11, fontFamily: F.body, fontWeight: 600, display: 'inline-block', marginBottom: 10 }}>📖 {group.book_focus}</span>}
          <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{group.name}</h1>
          {group.description && <p style={{ fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 14, maxWidth: 540 }}>{group.description}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              👥 {group.member_count}{group.max_members > 0 ? `/${group.max_members}` : ''} members
            </span>
            {group.is_private && <span style={{ fontFamily: F.body, fontSize: 12, color: '#C9A84C', fontWeight: 600 }}>🔐 Private Group</span>}
            {group.approval_required && <span style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>🔒 Approval required</span>}
            {full && <span style={{ fontFamily: F.body, fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>Group is full</span>}
            {user && !full && (
              <button onClick={join} disabled={joining} style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 16px', fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {joining ? 'Joining…' : group.approval_required ? 'Request to Join' : 'Join Group'}
              </button>
            )}
            {/* Owner: edit max members */}
            {isOwner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {editingMax
                  ? <>
                      <input type="number" min="0" value={maxMembers} onChange={e => setMaxMembers(e.target.value)}
                        style={{ width: 70, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '5px 8px', fontFamily: F.body, fontSize: 13, background: 'rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}/>
                      <button onClick={saveMaxMembers} style={{ background: sageMid, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontFamily: F.body, fontSize: 12, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingMax(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontFamily: F.body, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                    </>
                  : <button onClick={() => setEditingMax(true)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '5px 10px', fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                      ⚙️ Max: {group.max_members > 0 ? group.max_members : '∞'}
                    </button>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 60px' }}>
        {/* Invite link panel for owner/admin of private group */}
        {inviteUrl && (
          <div style={{ background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:12, padding:'16px 18px', marginBottom:20 }}>
            <p style={{ fontFamily:F.body, fontSize:12, fontWeight:700, color:'#C9A84C', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>🔐 Private Invite Link</p>
            <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.55)', marginBottom:10, lineHeight:1.6 }}>Share this link to invite members. Only people with this link can find and join this group.</p>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <code style={{ flex:1, background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'8px 12px', fontFamily:'monospace', fontSize:12.5, color:'#E8C97A', wordBreak:'break-all' }}>{inviteUrl}</code>
              <button onClick={async () => { await navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                style={{ background:copied?'rgba(21,128,61,0.2)':'rgba(201,168,76,0.15)', color:copied?'#4ade80':'#C9A84C', border:`1px solid ${copied?'rgba(21,128,61,0.4)':'rgba(201,168,76,0.3)'}`, borderRadius:8, padding:'8px 14px', fontFamily:F.body, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        )}
        <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: '#1E3A2F', marginBottom: 14 }}>Discussion ({posts.length})</h2>
        {posts.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', marginBottom: 10, border: `1px solid ${sageLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Avatar name={p.display_name} color={p.avatar_color || sage} size={28}/>
              <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: '#1E3A2F' }}>{p.display_name}</span>
              <BadgeTag label={p.badge}/>
              <span style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginLeft: 'auto' }}>
                {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{p.body}</p>
          </div>
        ))}

        <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: `1px solid ${sageLight}`, marginTop: 18 }}>
          {!user
            ? <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.muted }}><Link to="/login" style={{ color: sage, fontWeight: 600 }}>Sign in</Link> to join the conversation.</p>
            : <>
                {error && <p style={{ color: '#DC2626', fontFamily: F.body, fontSize: 13, marginBottom: 8 }}>{error}</p>}
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Share your thoughts with the group…" rows={3}
                  style={{ width: '100%', border: `1.5px solid ${sageLight}`, borderRadius: 8, padding: '10px 13px', fontFamily: F.body, fontSize: 13.5, resize: 'vertical', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}/>
                <button onClick={post} disabled={posting || !body.trim()} style={{ background: posting || !body.trim() ? sageLight : sage, color: posting || !body.trim() ? C.muted : '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontFamily: F.body, fontSize: 13.5, fontWeight: 700, cursor: posting || !body.trim() ? 'not-allowed' : 'pointer' }}>
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </>
          }
        </div>
      </div>
    </div>
  )
}

// ── Group Join Page (private invite link landing) ─────────────
export function GroupJoinPage() {
  const { code } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    if (!code) return
    fetch(`${API}/groups?invite=${code}`)
      .then(r => r.json())
      .then(d => { setGroup(d.group); setLoading(false) })
      .catch(() => setLoading(false))
  }, [code])

  const join = async () => {
    if (!user) { navigate(`/register?next=/groups/join/${code}`); return }
    setJoining(true); setError('')
    const res = await fetch(`${API}/groups/${group.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.ok) setJoined(true)
    else setError(data.error || 'Could not join group')
    setJoining(false)
  }

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0f1e' }}>
      <p style={{ fontFamily:F.body, color:'rgba(255,255,255,0.4)' }}>Loading…</p>
    </div>
  )

  if (!group) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0f1e' }}>
      <div style={{ textAlign:'center', padding:40 }}>
        <p style={{ fontFamily:F.display, fontSize:20, color:'#fff', marginBottom:12 }}>Invalid invite link</p>
        <p style={{ fontFamily:F.body, fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:20 }}>This link may have expired or been removed.</p>
        <button onClick={()=>navigate('/groups')} style={{ background:sage, color:'#fff', border:'none', borderRadius:10, padding:'11px 24px', fontFamily:F.body, fontSize:14, fontWeight:700, cursor:'pointer' }}>Browse Groups</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0f1e', padding:'40px 20px' }}>
      <div style={{ background:'rgba(17,24,39,0.95)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:20, padding:'40px 32px', maxWidth:460, width:'100%', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
        {group.cover_image && (
          <div style={{ backgroundImage:`url(${group.cover_image})`, backgroundSize:'cover', backgroundPosition:'center', height:120, borderRadius:12, marginBottom:20 }}/>
        )}
        <span style={{ background:'rgba(201,168,76,0.15)', color:'#C9A84C', borderRadius:6, padding:'3px 12px', fontSize:12, fontFamily:F.body, fontWeight:700, display:'inline-block', marginBottom:14 }}>
          🔐 Private Group Invitation
        </span>
        <h1 style={{ fontFamily:F.display, fontSize:24, fontWeight:700, color:'#fff', marginBottom:8 }}>{group.name}</h1>
        {group.book_focus && <p style={{ fontFamily:F.body, fontSize:13, color:'#C9A84C', marginBottom:10 }}>📖 {group.book_focus}</p>}
        {group.description && <p style={{ fontFamily:F.body, fontSize:14.5, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:20 }}>{group.description}</p>}
        <p style={{ fontFamily:F.body, fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>
          {group.member_count} member{group.member_count !== 1 ? 's' : ''} · Hosted by {group.display_name}
        </p>

        {error && <p style={{ fontFamily:F.body, fontSize:13, color:'#f87171', marginBottom:14 }}>{error}</p>}

        {joined ? (
          <div>
            <p style={{ fontFamily:F.body, fontSize:15, color:'#4ade80', marginBottom:16 }}>✅ You've joined the group!</p>
            <button onClick={()=>navigate(`/groups/${group.id}`)} style={{ background:'linear-gradient(135deg,#C9A84C,#E8C97A)', color:'#0a0f1e', border:'none', borderRadius:10, padding:'12px 28px', fontFamily:F.body, fontSize:14.5, fontWeight:700, cursor:'pointer' }}>
              Enter Group →
            </button>
          </div>
        ) : (
          <button onClick={join} disabled={joining} style={{ background:'linear-gradient(135deg,#C9A84C,#E8C97A)', color:'#0a0f1e', border:'none', borderRadius:10, padding:'13px 32px', fontFamily:F.body, fontSize:15, fontWeight:700, cursor:'pointer', opacity:joining?0.7:1, width:'100%' }}>
            {joining ? 'Joining…' : user ? 'Join This Group →' : 'Sign in to Join →'}
          </button>
        )}
        <button onClick={()=>navigate('/groups')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', fontFamily:F.body, fontSize:12.5, cursor:'pointer', marginTop:14 }}>
          ← Back to all groups
        </button>
      </div>
    </div>
  )
}
