import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { C, F, API } from '../lib/tokens.js'
import { Logo } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export default function DailyWordPage() {
  usePageTitle("Today's Word")
  const [word, setWord] = useState(null)
  useEffect(() => { fetch(`${API}/daily-word`).then(r=>r.json()).then(d=>setWord(d.word)).catch(()=>{}) }, [])

  return (
    <div style={{ maxWidth:680, margin:'64px auto', padding:'0 20px', textAlign:'center' }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}><Logo size={46}/></div>
      <p style={{ fontFamily:F.body, fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>Today's Word</p>
      {word ? (
        <>
          <blockquote style={{ fontFamily:F.display, fontSize:'clamp(18px,3.5vw,28px)', fontWeight:700, color:C.navy, lineHeight:1.55, margin:'0 0 18px', borderLeft:`4px solid ${C.gold}`, paddingLeft:22, textAlign:'left' }}>
            "{word.verse_text}"
          </blockquote>
          <p style={{ fontFamily:F.body, fontSize:15.5, fontWeight:700, color:C.navyLight, marginBottom:6 }}>— {word.verse_ref}</p>
          {word.theme && <p style={{ fontFamily:F.body, fontSize:13.5, color:C.muted, marginBottom:32 }}>Theme: {word.theme}</p>}
          <Link to="/forum/exegesis" style={{ background:C.navy, color:'#fff', borderRadius:10, padding:'12px 26px', fontFamily:F.body, fontSize:14, fontWeight:700 }}>Discuss this passage →</Link>
        </>
      ) : (
        <p style={{ fontFamily:F.body, color:C.muted }}>Loading today's word…</p>
      )}
    </div>
  )
}
