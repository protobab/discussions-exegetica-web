import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Logo, Card, Avatar, BadgeTag } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export default function HomePage() {
  usePageTitle(null)
  const [dailyWord, setDailyWord] = useState(null)
  const [threads, setThreads] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/daily-word`).then(r=>r.json()).then(d=>setDailyWord(d.word)).catch(()=>{})
    fetch(`${API}/threads`).then(r=>r.json()).then(d=>setThreads(d.threads||[])).catch(()=>{})
  }, [])

  return (
    <div>
      {/* HERO */}
      <div style={{ background:`linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`, padding:'80px 24px 72px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        {[180,320,480].map((r,i)=>(
          <div key={i} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:r, height:r, borderRadius:'50%', border:`1px solid ${C.gold}${['18','10','08'][i]}`, pointerEvents:'none' }}/>
        ))}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}><Logo size={52}/></div>
        <h1 style={{ fontFamily:F.display, fontSize:'clamp(28px,5vw,50px)', fontWeight:900, color:'#fff', margin:'0 0 14px', lineHeight:1.15, position:'relative' }}>
          Where Scripture is<br/><span style={{ color:C.gold }}>opened together.</span>
        </h1>
        <p style={{ fontFamily:F.body, fontSize:16.5, color:'rgba(255,255,255,0.7)', maxWidth:500, margin:'0 auto 34px', lineHeight:1.7 }}>
          A global community for honest seekers and devoted believers — asking real questions, studying Scripture deeply, and walking in the light of Christ.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/forum" style={{ background:C.gold, color:C.navy, borderRadius:10, padding:'13px 26px', fontFamily:F.body, fontSize:15, fontWeight:700 }}>Enter the Forum</Link>
          <Link to="/register" style={{ background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.25)', borderRadius:10, padding:'13px 26px', fontFamily:F.body, fontSize:15, fontWeight:600 }}>I'm new — start here 🌱</Link>
        </div>
      </div>

      {/* ARMCHAIR PROMO */}
      <Link to="/armchair" style={{ display:'block', background:'#fff', borderBottom:`1px solid ${C.border}`, padding:'14px 24px', textAlign:'center' }}>
        <span style={{ fontFamily:F.body, fontSize:13.5, color:C.navy }}>🎙️ <strong style={{ color:C.gold }}>The Armchair</strong> — live conversations with guests, recordings, and reflections in writing →</span>
      </Link>

      {/* DAILY WORD */}
      {dailyWord && (
        <div style={{ background:C.gold, padding:'15px 24px', display:'flex', alignItems:'center', justifyContent:'center', gap:14, flexWrap:'wrap', textAlign:'center' }}>
          <span style={{ fontFamily:F.body, fontSize:11, fontWeight:700, color:C.navy, letterSpacing:'0.1em', textTransform:'uppercase' }}>Today's Word</span>
          <span style={{ fontFamily:F.display, fontSize:14.5, fontWeight:600, color:C.navy }}>"{dailyWord.verse_text.slice(0,120)}{dailyWord.verse_text.length>120?'…':''}"</span>
          <span style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:C.navyLight }}>— {dailyWord.verse_ref}</span>
        </div>
      )}

      {/* ACTIVE DISCUSSIONS */}
      <div style={{ maxWidth:860, margin:'48px auto', padding:'0 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:C.navy }}>Active Discussions</h2>
          <Link to="/forum" style={{ border:`1.5px solid ${C.navy}`, color:C.navy, borderRadius:8, padding:'7px 16px', fontFamily:F.body, fontSize:13, fontWeight:600 }}>See all →</Link>
        </div>
        {threads.length === 0
          ? <Card><p style={{ fontFamily:F.body, color:C.muted, textAlign:'center', padding:'28px 0' }}>No discussions yet — <Link to="/new-thread" style={{ color:C.gold, fontWeight:600 }}>be the first!</Link></p></Card>
          : <div style={{ display:'grid', gap:12 }}>{threads.slice(0,4).map(t=><ThreadCard key={t.id} thread={t} onClick={()=>navigate(`/thread/${t.id}`)}/>)}</div>
        }
      </div>

      {/* BADGE LEVELS */}
      <div style={{ background:C.navy, padding:'52px 24px', textAlign:'center' }}>
        <h2 style={{ fontFamily:F.display, fontSize:24, fontWeight:700, color:'#fff', margin:'0 0 8px' }}>Grow as you engage</h2>
        <p style={{ fontFamily:F.body, fontSize:14.5, color:'rgba(255,255,255,0.6)', margin:'0 0 32px' }}>Every reply, question and insight moves you along the journey</p>
        <div style={{ display:'flex', justifyContent:'center', gap:14, flexWrap:'wrap' }}>
          {[{l:'Seeker',c:'#A78BFA',d:'Asking honest questions'},{l:'Disciple',c:'#3B82F6',d:'Consistent learner'},{l:'Elder',c:C.gold,d:'Trusted community voice'},{l:'Teacher',c:'#EF4444',d:'Guiding others in faith'}].map(b=>(
            <div key={b.l} style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${b.c}44`, borderRadius:12, padding:'16px 22px', minWidth:140 }}>
              <span style={{ background:b.c+'22', color:b.c, border:`1px solid ${b.c}55`, borderRadius:4, padding:'1px 8px', fontSize:10, fontFamily:F.body, fontWeight:700, textTransform:'uppercase' }}>{b.l}</span>
              <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.55)', margin:'8px 0 0' }}>{b.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign:'center', padding:'56px 24px' }}>
        <h2 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.navy, margin:'0 0 10px' }}>Ready to join the Circle?</h2>
        <p style={{ fontFamily:F.body, fontSize:14.5, color:C.muted, margin:'0 0 24px' }}>Free to join. Open to all — whether you've read the Bible for decades or never opened one.</p>
        <Link to="/register" style={{ background:C.navy, color:'#fff', borderRadius:10, padding:'13px 30px', fontFamily:F.body, fontSize:15, fontWeight:700 }}>Create your free account</Link>
      </div>
    </div>
  )
}

function ThreadCard({ thread, onClick }) {
  return (
    <Card style={{ cursor:'pointer' }}>
      <div onClick={onClick}>
        <div style={{ marginBottom:7 }}>
          <span style={{ background:C.mist, color:C.navyLight, borderRadius:6, padding:'2px 9px', fontSize:11, fontFamily:F.body, fontWeight:600 }}>{thread.cat_label}</span>
          {thread.is_pinned===1 && <span style={{ marginLeft:8, fontSize:11, color:C.gold, fontWeight:700 }}>📌 Featured</span>}
        </div>
        <h3 style={{ fontFamily:F.display, fontSize:16.5, fontWeight:700, color:C.navy, margin:'0 0 6px', lineHeight:1.35 }}>{thread.title}</h3>
        <p style={{ fontFamily:F.body, fontSize:13, color:C.muted, margin:'0 0 12px', lineHeight:1.6 }}>{thread.body?.slice(0,160)}…</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Avatar name={thread.display_name} color={thread.avatar_color} size={24}/>
            <span style={{ fontFamily:F.body, fontSize:12, fontWeight:500 }}>{thread.display_name}</span>
            <BadgeTag label={thread.badge}/>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <span style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>💬 {thread.reply_count}</span>
            <span style={{ fontFamily:F.body, fontSize:11.5, color:C.muted }}>👁 {thread.view_count}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
