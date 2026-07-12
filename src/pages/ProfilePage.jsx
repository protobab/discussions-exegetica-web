import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Avatar, BadgeTag, Spinner } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import ShareButton from '../components/ShareButton.jsx'
import { IMAGES } from '../lib/images.js'

const BADGE_INFO = {
  Seeker:   { color:'#A78BFA', desc:'Asking honest questions — the beginning of wisdom' },
  Disciple: { color:'#3B82F6', desc:'A consistent learner growing in faith and knowledge' },
  Elder:    { color:'#C9A84C', desc:'A trusted voice in the community' },
  Teacher:  { color:'#EF4444', desc:'Guiding others in Scripture and faith' },
}

export default function ProfilePage() {
  const { username } = useParams()
  const { user: me, token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  usePageTitle(data?.user?.display_name || 'Profile')

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/profile/${username}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); setTimeout(() => setVisible(true), 60) })
      .catch(() => setLoading(false))
  }, [username])

  const getInviteLink = async () => {
    if (!token) return
    setInviteLoading(true)
    const res = await fetch(`${API}/invite`, { headers: { Authorization: `Bearer ${token}` } })
    const d = await res.json()
    setInviteCode(d)
    setInviteLoading(false)
  }

  if (loading) return <div style={{ maxWidth: 760, margin: '60px auto' }}><Spinner/></div>
  if (!data?.user) return (
    <div style={{ textAlign: 'center', padding: '80px', fontFamily: F.body, color: C.muted }}>
      User not found. <Link to="/forum" style={{ color: C.gold }}>Back to Forum</Link>
    </div>
  )

  const { user, threads, isOwn } = data
  const badge = BADGE_INFO[user.badge] || BADGE_INFO.Seeker
  const joinedDate = new Date(user.joined).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: C.parchment, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>

      {/* PROFILE HERO */}
      <div style={{ backgroundImage: `linear-gradient(135deg, rgba(27,42,74,0.88) 0%, rgba(46,66,112,0.92) 100%), url(${IMAGES.profileHero})`, backgroundSize: 'cover', backgroundPosition: 'center top', padding: '44px 24px 0' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 0, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: user.avatar_color || C.navy,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: F.display, fontSize: 34, fontWeight: 700, color: '#fff',
              border: '3px solid rgba(255,255,255,0.2)',
              flexShrink: 0
            }}>
              {user.display_name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()}
            </div>

            <div style={{ flex: 1, paddingBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>{user.display_name}</h1>
                <BadgeTag label={user.badge}/>
              </div>
              <p style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 6px' }}>@{user.username} · Member since {joinedDate}</p>
              {user.bio && !user.bio.startsWith('invited_by:') && (
                <p style={{ fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6, maxWidth: 500 }}>{user.bio}</p>
              )}
            </div>

            {isOwn && (
              <div style={{ paddingBottom: 20 }}>
                <ShareButton
                  title={`${user.display_name} on Discussions Exegetica`}
                  url={`https://discussionsexegetica.com/profile/${user.username}`}
                  excerpt="Join me on Discussions Exegetica — a global biblical discussion community"
                />
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px 10px 0 0', padding: '14px 20px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { val: user.thread_count, label: 'Discussions' },
              { val: user.reply_count, label: 'Replies' },
              { val: user.reputation, label: 'Reputation' },
              { val: user.current_streak || 0, label: '🔥 Day streak' },
              { val: user.longest_streak || 0, label: 'Best streak' },
            ].map((s, i) => (
              <div key={i}>
                <span style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: '#fff' }}>{s.val}</span>
                <span style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 5 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 60px', display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 24 }} className="profile-grid">

        {/* Threads */}
        <div>
          <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 14 }}>
            Discussions ({user.thread_count})
          </h2>
          {threads.length === 0
            ? <p style={{ fontFamily: F.body, color: C.muted, fontSize: 14 }}>No discussions yet.</p>
            : <div style={{ display: 'grid', gap: 10 }}>
                {threads.map(t => (
                  <div key={t.id} onClick={() => navigate(`/thread/${t.id}`)} style={{
                    background: '#fff', borderRadius: 10, padding: '14px 16px',
                    border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'box-shadow 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', gap: 7, marginBottom: 5 }}>
                      <span style={{ background: C.mist, color: C.navyLight, borderRadius: 5, padding: '2px 8px', fontSize: 10.5, fontFamily: F.body, fontWeight: 600 }}>{t.cat_label}</span>
                      <span style={{ fontFamily: F.body, fontSize: 10.5, color: C.muted, marginLeft: 'auto' }}>{new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <h3 style={{ fontFamily: F.display, fontSize: 14.5, fontWeight: 700, color: C.navy, margin: '0 0 6px', lineHeight: 1.35 }}>{t.title}</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>💬 {t.reply_count}</span>
                      <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>❤️ {t.like_count}</span>
                      <span style={{ fontFamily: F.body, fontSize: 11.5, color: C.muted }}>👁 {t.view_count}</span>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Sidebar */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>

          {/* Badge info */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: `1px solid ${C.border}` }}>
            <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Current Badge</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ background: badge.color + '22', color: badge.color, border: `1px solid ${badge.color}55`, borderRadius: 6, padding: '3px 11px', fontSize: 12, fontFamily: F.body, fontWeight: 700, textTransform: 'uppercase' }}>
                {user.badge}
              </span>
            </div>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{badge.desc}</p>
          </div>

          {/* Own profile actions */}
          {isOwn && (
            <div style={{ background: C.navy, borderRadius: 14, padding: '20px' }}>
              <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}>🔗 Invite Friends</p>
              <p style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 14 }}>
                Share your personal invite link. Every person who joins earns you +20 reputation.
              </p>
              <Link to="/change-password" style={{ display:'block', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', fontFamily:F.body, fontSize:13.5, color:'rgba(255,255,255,0.7)', marginBottom:12, textAlign:'center' }}>
                🔑 Change Password
              </Link>
              {!inviteCode ? (
                <button onClick={getInviteLink} disabled={inviteLoading} style={{ background: C.gold, color: C.navy, border: 'none', borderRadius: 8, padding: '10px 18px', fontFamily: F.body, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  {inviteLoading ? 'Generating…' : 'Get My Invite Link'}
                </button>
              ) : (
                <div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                    <p style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Your invite link</p>
                    <p style={{ fontFamily: F.body, fontSize: 13, color: '#fff', margin: 0, wordBreak: 'break-all' }}>{inviteCode.url}</p>
                  </div>
                  <p style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Used {inviteCode.uses} time{inviteCode.uses !== 1 ? 's' : ''}</p>
                  <ShareButton
                    title="Join me on Discussions Exegetica"
                    url={inviteCode.url}
                    excerpt="A global community for biblical discussion — honest questions welcome"
                  />
                </div>
              )}
            </div>
          )}

          {/* Quick links */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '18px', border: `1px solid ${C.border}` }}>
            <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Join the conversation</p>
            {[['📖 Deep Dive','/forum/exegesis'],['🌱 Seekers Corner','/forum/seekers'],['🙏 Prayer & Life','/forum/prayer'],['👥 Study Groups','/groups']].map(([l,t]) => (
              <Link key={t} to={t} style={{ fontFamily: F.body, fontSize: 13, color: C.navyLight, display: 'block', marginBottom: 8 }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:680px){.profile-grid{grid-template-columns:1fr !important}}`}</style>
    </div>
  )
}
