import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Card, Avatar, BadgeTag, Btn, Spinner } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=800&q=60'

export default function ArmchairSessionPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [asQuestion, setAsQuestion] = useState(false)
  const [error, setError] = useState('')
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
    const interval = setInterval(load, 4000) // poll every 4s while viewing
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const send = async () => {
    if (!text.trim()) return
    setError('')
    const res = await fetch(`${API}/armchair/sessions/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify({ body: text, is_question: asQuestion })
    })
    const data = await res.json()
    if (data.ok) { setText(''); setAsQuestion(false); load() }
    else setError(data.error)
  }

  const flag = async (messageId) => {
    await fetch(`${API}/armchair/messages/${messageId}/flag`, {
      method: 'POST', headers: { Authorization:`Bearer ${token}` }
    })
    load()
  }

  if (loading) return <div style={{ maxWidth:800, margin:'60px auto' }}><Spinner/></div>
  if (!session) return <div style={{ textAlign:'center', padding:'80px', fontFamily:F.body, color:C.muted }}>Session not found.</div>

  const isLive = session.status === 'live'
  const isEnded = session.status === 'ended'

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 60px' }}>
      <button onClick={() => navigate('/armchair')} style={{
        background:'none', border:'none', color:C.navyLight, fontFamily:F.body,
        fontSize:13.5, fontWeight:600, cursor:'pointer', marginBottom:20, padding:0
      }}>← Back to The Armchair</button>

      {/* Status banner */}
      <div style={{
        background: isLive ? '#EF4444' : isEnded ? C.navy : C.gold,
        color: isLive || isEnded ? '#fff' : C.navy,
        borderRadius: 10, padding: '10px 18px', marginBottom: 18,
        fontFamily: F.body, fontSize: 13, fontWeight: 700, textAlign: 'center'
      }}>
        {isLive ? '🔴 LIVE NOW — join the conversation below' : isEnded ? '📼 This session has ended — recording available' : '📅 Scheduled — chat opens when live'}
      </div>

      <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
        {session.title}
      </h1>
      <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, marginBottom: 20 }}>
        👥 {session.listener_count || messages.length} engaging in this conversation
      </p>

      {/* Recording playback if ended */}
      {isEnded && session.recording_url && (
        <div style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <video controls style={{ width: '100%', display: 'block' }} src={session.recording_url} />
        </div>
      )}

      {/* Chat / Q&A */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div ref={scrollRef} style={{ maxHeight: 420, overflowY: 'auto', padding: '18px 20px' }}>
          {messages.length === 0 ? (
            <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.muted, textAlign: 'center', padding: '30px 0' }}>
              No messages yet. Be the first to say hello or ask a question!
            </p>
          ) : messages.map(m => (
            <div key={m.id} style={{ marginBottom: 14, display: 'flex', gap: 10 }}>
              <Avatar name={m.display_name} color={m.avatar_color} size={28} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 600 }}>{m.display_name}</span>
                  <BadgeTag label={m.badge} />
                  {m.is_question === 1 && (
                    <span style={{
                      background: C.gold + '22', color: C.gold, borderRadius: 4,
                      padding: '1px 6px', fontSize: 10, fontWeight: 700, fontFamily: F.body
                    }}>❓ QUESTION</span>
                  )}
                  <span style={{ fontFamily: F.body, fontSize: 10.5, color: C.muted }}>
                    {new Date(m.created_at).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
                  </span>
                </div>
                <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.text, lineHeight: 1.5, marginTop: 2 }}>
                  {m.body}
                </p>
              </div>
              {user && (
                <button onClick={() => flag(m.id)} title="Report message" style={{
                  background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
                  fontSize: 12, flexShrink: 0, alignSelf: 'flex-start', padding: 4
                }}>🚩</button>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 18px' }}>
          {!user ? (
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>
              <Link to="/login" style={{ color: C.gold, fontWeight: 600 }}>Sign in</Link> to join the conversation.
            </p>
          ) : !isLive ? (
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>
              {isEnded ? 'This session has ended.' : 'The chat will open once the session goes live.'}
            </p>
          ) : (
            <>
              {error && <p style={{ color:'#DC2626', fontFamily:F.body, fontSize:12.5, marginBottom:8 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder={asQuestion ? 'Type your question for the guest…' : 'Share a thought or comment…'}
                  style={{
                    flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 8,
                    padding: '9px 13px', fontFamily: F.body, fontSize: 13.5, outline: 'none'
                  }}
                />
                <Btn onClick={send} disabled={!text.trim()}>Send</Btn>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={asQuestion} onChange={e => setAsQuestion(e.target.checked)} />
                <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>Mark as a question for the guest</span>
              </label>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
