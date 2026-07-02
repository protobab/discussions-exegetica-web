import { useState, useRef, useEffect } from 'react'
import { C, F } from '../lib/tokens.js'

const TRACKS = [
  { src:'/ambient/track1.mp3', label:'Reflective Piano' },
  { src:'/ambient/track2.mp3', label:'Gentle Strings' },
  { src:'/ambient/track3.mp3', label:'Quiet Worship Pads' },
]

export default function AmbientPlayer() {
  const [playing, setPlaying] = useState(false)
  const [idx, setIdx] = useState(0)
  const [vol, setVol] = useState(0.35)
  const [hasFiles, setHasFiles] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => { if (audioRef.current) audioRef.current.volume = vol }, [vol])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().then(()=>setPlaying(true)).catch(()=>setHasFiles(false)) }
  }

  const next = () => {
    const n = (idx+1)%TRACKS.length; setIdx(n)
    setTimeout(()=>{ if (playing) audioRef.current?.play().catch(()=>{}) }, 80)
  }

  return (
    <div style={{
      position:'relative', borderRadius:16, overflow:'hidden', minHeight:190,
      backgroundImage:`linear-gradient(rgba(27,42,74,0.6),rgba(27,42,74,0.8)), url(/ambient/bg-loop.jpg)`,
      backgroundSize:'cover', backgroundPosition:'center',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 20px', marginBottom:32
    }}>
      <audio ref={audioRef} src={TRACKS[idx].src} loop onError={()=>setHasFiles(false)}/>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily:F.body, fontSize:10.5, fontWeight:700, color:C.gold, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>While You Wait</p>
        <h3 style={{ fontFamily:F.display, fontSize:19, fontWeight:700, color:'#fff', marginBottom:16 }}>A quiet moment of reflection</h3>
        {!hasFiles ? (
          <p style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,0.55)' }}>Ambient music coming soon.</p>
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
            <button onClick={toggle} style={{ background:C.gold, color:C.navy, border:'none', borderRadius:'50%', width:48, height:48, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {playing?'⏸':'▶'}
            </button>
            <button onClick={next} style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, padding:'7px 13px', fontFamily:F.body, fontSize:12, cursor:'pointer' }}>⏭ Next</button>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:12 }}>🔈</span>
              <input type="range" min="0" max="1" step="0.05" value={vol} onChange={e=>setVol(parseFloat(e.target.value))} style={{ width:72 }}/>
            </div>
          </div>
        )}
        <p style={{ fontFamily:F.body, fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:12 }}>{TRACKS[idx].label}</p>
      </div>
    </div>
  )
}
