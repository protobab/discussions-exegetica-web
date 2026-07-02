import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, F, API, ADMIN_USERS } from '../lib/tokens.js'
import { Card, Avatar, BadgeTag, Btn, Spinner } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { HostBroadcaster, ListenerReceiver } from '../components/AudioStream.jsx'

const FB = 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=800&q=60'

export default function ArmchairSessionPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [asQ, setAsQ] = useState(false)
  const [posting, setPosting] = useState(false)
  const scrollRef = useRef(null)

  usePageTitle(session?.title)

  const load = async () => {
    const res = await fetch(`${API}/armchair/sessions/${id}/messages`)
    const data = await res.json()
    setMessages(data.messages || [])
    setSession(data.session)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const iv = setInterval(load, 4000)
    return () => clearInterval(iv)
  }, [id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const send = async () => {
    if (!text.trim()) return
    setPosting(true)
    const res = await fetch(`${API}/armchair/sessions/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body: text, is_question: asQ })
    })
    const data = await res.json()
    if (data.ok) { setText(''); setAsQ(false); load() }
    setPosting(false)
  }

  const flag = async (msgId) => {
    await fetch(`${API}/armchair/messages/${msgId}/flag`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  if (loading) return <div style={{ maxWidth:820, margin:'40px auto' }}><Spinner/></div>
  if (!session) return <div style={{ textAlign:'center', padding:'80px', fontFamily:F.body, color:C.muted }}>Session not found.</div>

  const isLive = session.status === 'live'
  const isEnded = session.status === 'ended'
  const isHost = user && ADMIN_USERS.includes(user.username)

  return (
    <div style={{ maxWidth:820, margin:'0 auto', padding:'32px 20px 60px' }}>
      <button onClick={() => navigate('/armchair')} style={{ background:'none', border:'none', color:C.navyLight, fontFamily:F.body, fontSize:13.5, fontWeight:600, cursor:'pointer', marginBottom:20, padding:0 }}>
        ← Back to The Armchair
      </button>

      {/* Status banner */}
      <div style={{ background:isLive?'#EF4444':isEnded?C.navy:C.gold, color:isLive||isEnded?'#fff':C.navy, borderRadius:10, padding:'10px 18px', marginBottom:16, fontFamily:F.body, fontSize:13, fontWeight:700, textAlign:'center' }}>
        {isLive ? '🔴 LIVE NOW — join the conversation' : isEnded ? '📼 Session ended — recording available below' : '📅 Session not yet live — check back soon'}
      </div>

      {/* Session header */}
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.2fr) minmax(0,1fr)', gap:20, marginBottom:20 }} className="sess-grid">
        <div style={{ backgroundImage:`url(${session.cover_image||FB})`, backgroundSize:'cover', backgroundPosition:'center', borderRadius:12, minHeight:160 }}/>
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <h1 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:C.navy, marginBottom:6, lineHeight:1.3 }}>{session.title}</h1>
          {session.guest_name && <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted, marginBottom:8 }}>with <strong style={{ color:C.text }}>{session.guest_name}</strong></p>}
          <p style={{ fontFamily:F.body, fontSize:13, color:C.text, lineHeight:1.65 }}>{session.description}</p>
          <p style={{ fontFamily:F.body, fontSize:12, color:C.muted, marginTop:10 }}>👥 {session.listener_count} engaging in this conversation</p>
        </div>
      </div>

      {/* HOST BROADCASTER CONTROLS */}
      {isHost && isLive && (
        <HostBroadcaster sessionId={id} token={token} onEnd={() => { load() }} />
      )}

      {/* LISTENER AUDIO RECEIVER */}
      {!isHost && isLive && (
        <ListenerReceiver sessionId={id} roomId={session.room_id} />
      )}

      {/* RECORDING PLAYBACK */}
      {isEnded && session.recording_url && (
        <div style={{ marginBottom:20, borderRadius:12, overflow:'hidden', background:'#000' }}>
          <audio controls style={{ width:'100%', display:'block' }} src={session.recording_url}/>
          <p style={{ fontFamily:F.body, fontSize:11.5, color:'rgba(255,255,255,0.5)', padding:'6px 14px' }}>Recording from this session</p>
        </div>
      )}
      {isEnded && session.recording_key && !session.recording_url && (
        <div style={{ marginBottom:20 }}>
          <audio controls style={{ width:'100%', display:'block', borderRadius:10 }} src={`${API}/armchair/recordings/${session.recording_key.replace('recordings/','')}`}/>
        </div>
      )}

      {/* CHAT */}
      <Card style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:F.display, fontSize:15, fontWeight:700, color:C.navy }}>Live Chat & Q&A</span>
          <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>{messages.length} messages</span>
        </div>

        <div ref={scrollRef} style={{ maxHeight:380, overflowY:'auto', padding:'16px 18px' }}>
          {messages.length === 0
            ? <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted, textAlign:'center', padding:'24px 0' }}>No messages yet. {isLive ? 'Be the first to say hello or ask a question!' : 'Chat opens when the session goes live.'}</p>
            : messages.map(m => (
              <div key={m.id} style={{ marginBottom:12, display:'flex', gap:9 }}>
                <Avatar name={m.display_name} color={m.avatar_color} size={26}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:2 }}>
                    <span style={{ fontFamily:F.body, fontSize:12.5, fontWeight:600 }}>{m.display_name}</span>
                    <BadgeTag label={m.badge}/>
                    {m.is_question === 1 && <span style={{ background:C.gold+'22', color:C.gold, borderRadius:4, padding:'1px 6px', fontSize:10, fontWeight:700, fontFamily:F.body }}>❓ QUESTION</span>}
                    <span style={{ fontFamily:F.body, fontSize:10.5, color:C.muted }}>{new Date(m.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <p style={{ fontFamily:F.body, fontSize:13.5, color:C.text, lineHeight:1.5 }}>{m.body}</p>
                </div>
                {user && (
                  <button onClick={() => flag(m.id)} title="Report" style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:11, flexShrink:0, alignSelf:'flex-start', padding:2 }}>🚩</button>
                )}
              </div>
            ))
          }
        </div>

        <div style={{ borderTop:`1px solid ${C.border}`, padding:'12px 16px' }}>
          {!user
            ? <p style={{ fontFamily:F.body, fontSize:13, color:C.muted }}><Link to="/login" style={{ color:C.gold, fontWeight:600 }}>Sign in</Link> to join the conversation.</p>
            : !isLive
            ? <p style={{ fontFamily:F.body, fontSize:13, color:C.muted }}>{isEnded ? 'This session has ended.' : 'Chat will open once the session goes live.'}</p>
            : (
              <>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={asQ ? 'Type your question for the guest…' : 'Share a thought or comment…'} style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontFamily:F.body, fontSize:13.5, outline:'none' }}/>
                  <Btn onClick={send} disabled={posting||!text.trim()}>{posting?'…':'Send'}</Btn>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:6, marginTop:7, cursor:'pointer' }}>
                  <input type="checkbox" checked={asQ} onChange={e=>setAsQ(e.target.checked)}/>
                  <span style={{ fontFamily:F.body, fontSize:12, color:C.muted }}>Mark as a question for the guest</span>
                </label>
              </>
            )
          }
        </div>
      </Card>

      <style>{`@media(max-width:600px){.sess-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
