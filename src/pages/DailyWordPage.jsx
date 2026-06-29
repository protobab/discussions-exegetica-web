import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Logo } from '../components/ui.jsx'

export default function DailyWordPage() {
  const [word, setWord] = useState(null)

  useEffect(() => {
    fetch(`${API}/daily-word`).then(r=>r.json()).then(d=>setWord(d.word)).catch(()=>{})
  }, [])

  return (
    <div style={{ maxWidth:680, margin:'60px auto', padding:'0 24px', textAlign:'center' }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}><Logo size={48}/></div>
      <p style={{ fontFamily:F.body, fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>
        Today's Word
      </p>
      {word ? (
        <>
          <blockquote style={{
            fontFamily:F.display, fontSize:'clamp(20px,4vw,30px)', fontWeight:700,
            color:C.navy, lineHeight:1.5, margin:'0 0 20px',
            borderLeft:`4px solid ${C.gold}`, paddingLeft:24, textAlign:'left'
          }}>
            "{word.verse_text}"
          </blockquote>
          <p style={{ fontFamily:F.body, fontSize:16, fontWeight:700, color:C.navyLight, marginBottom:6 }}>
            — {word.verse_ref}
          </p>
          <p style={{ fontFamily:F.body, fontSize:14, color:C.muted, marginBottom:36 }}>
            Theme: {word.theme}
          </p>
          <Link to="/forum/exegesis" style={{
            background:C.navy, color:'#fff', borderRadius:10,
            padding:'12px 28px', fontFamily:F.body, fontSize:14, fontWeight:700
          }}>
            Discuss this passage →
          </Link>
        </>
      ) : (
        <p style={{ fontFamily:F.body, color:C.muted }}>Loading today's word…</p>
      )}
    </div>
  )
}
