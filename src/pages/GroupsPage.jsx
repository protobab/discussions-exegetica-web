import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, Btn, Spinner } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function GroupsPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', description:'', book_focus:'' })
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    fetch(`${API}/groups`).then(r=>r.json()).then(d=>{ setGroups(d.groups||[]); setLoading(false) })
  }
  useEffect(load, [])

  const createGroup = async () => {
    if (!form.name.trim()) return setError('Group name is required')
    setCreating(true); setError('')
    const res = await fetch(`${API}/groups`, {
      method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.id) navigate(`/groups/${data.id}`)
    else { setError(data.error||'Something went wrong'); setCreating(false) }
  }

  return (
    <div style={{ maxWidth:880, margin:'0 auto', padding:'36px 24px 60px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:F.display, fontSize:28, fontWeight:700, color:C.navy, marginBottom:4 }}>Study Groups</h1>
          <p style={{ fontFamily:F.body, fontSize:14, color:C.muted }}>
            Small communities studying Scripture together, book by book
          </p>
        </div>
        {user && (
          <Btn variant="gold" onClick={() => setShowForm(s=>!s)}>
            {showForm ? 'Cancel' : '+ Start a Group'}
          </Btn>
        )}
      </div>

      {showForm && (
        <Card style={{ marginBottom:24 }}>
          {error && <p style={{ color:'#DC2626', fontFamily:F.body, fontSize:13, marginBottom:12 }}>{error}</p>}
          <div style={{ display:'grid', gap:12 }}>
            <input
              placeholder="Group name (e.g. Romans Deep Dive)"
              value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              style={{ border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none' }}
            />
            <input
              placeholder="Which book or topic? (optional)"
              value={form.book_focus}
              onChange={e=>setForm(f=>({...f,book_focus:e.target.value}))}
              style={{ border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none' }}
            />
            <textarea
              placeholder="Describe the group's purpose…"
              value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              rows={3}
              style={{ border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 13px', fontFamily:F.body, fontSize:14, outline:'none', resize:'vertical' }}
            />
            <Btn variant="gold" onClick={createGroup} disabled={creating} style={{ width:'fit-content' }}>
              {creating ? 'Creating…' : 'Create Group'}
            </Btn>
          </div>
        </Card>
      )}

      {loading ? <Spinner/> : groups.length === 0 ? (
        <Card>
          <p style={{ textAlign:'center', fontFamily:F.body, color:C.muted, padding:'30px 0' }}>
            No study groups yet. {user ? 'Start the first one!' : <>Please <Link to="/login" style={{color:C.gold}}>sign in</Link> to start one.</>}
          </p>
        </Card>
      ) : (
        <div style={{ display:'grid', gap:14 }}>
          {groups.map(g => (
            <Card key={g.id} style={{ cursor:'pointer' }}>
              <div onClick={() => navigate(`/groups/${g.id}`)}>
                {g.book_focus && (
                  <span style={{
                    background:C.mist, color:C.navyLight, borderRadius:6, padding:'2px 9px',
                    fontSize:11, fontFamily:F.body, fontWeight:600, marginBottom:8, display:'inline-block'
                  }}>📖 {g.book_focus}</span>
                )}
                <h3 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.navy, margin:'0 0 6px' }}>
                  {g.name}
                </h3>
                {g.description && (
                  <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted, margin:'0 0 14px', lineHeight:1.6 }}>
                    {g.description}
                  </p>
                )}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Avatar name={g.display_name} color={g.avatar_color} size={24}/>
                    <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>Started by {g.display_name}</span>
                  </div>
                  <div style={{ display:'flex', gap:14 }}>
                    <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>👥 {g.member_count}</span>
                    <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>💬 {g.post_count}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
