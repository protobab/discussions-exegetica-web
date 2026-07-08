import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { usePageTitle } from '../lib/usePageTitle.js'
import { Btn } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useStreak } from '../lib/useStreak.js'

const BOOKS = [
  {label:'Genesis',ref:'Gen.1'},{label:'Exodus',ref:'Exod.1'},
  {label:'Psalms',ref:'Ps.1'},{label:'Proverbs',ref:'Prov.1'},
  {label:'Isaiah',ref:'Isa.1'},{label:'Matthew',ref:'Matt.1'},
  {label:'Mark',ref:'Mark.1'},{label:'Luke',ref:'Luke.1'},
  {label:'John',ref:'John.1'},{label:'Acts',ref:'Acts.1'},
  {label:'Romans',ref:'Rom.1'},{label:'1 Corinthians',ref:'1Cor.1'},
  {label:'Galatians',ref:'Gal.1'},{label:'Ephesians',ref:'Eph.1'},
  {label:'Philippians',ref:'Phil.1'},{label:'Hebrews',ref:'Heb.1'},
  {label:'James',ref:'Jas.1'},{label:'Revelation',ref:'Rev.1'},
]
const VERSIONS = [
  {value:'ESV',label:'ESV'},{value:'KJV',label:'KJV'},
  {value:'NIV',label:'NIV'},{value:'NASB',label:'NASB'},{value:'MSG',label:'MSG'},
]
const ink = '#0D1B2A'
const inkLight = '#112236'
const cream = '#E8DCC8'
const gold = '#C9A84C'

export default function BibleStudyPage() {
  usePageTitle('Bible Study')
  const location = useLocation()
  const { user } = useAuth()
  const { recordActivity } = useStreak()
  const [version, setVersion] = useState('ESV')
  const [reference, setReference] = useState('John.1')
  const [refInput, setRefInput] = useState('')
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [parallel, setParallel] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
    const params = new URLSearchParams(location.search)
    if (params.get('ref')) setReference(params.get('ref'))
    if (user) recordActivity('bible', reference)
  }, [])

  const stepUrl = parallel
    ? `https://www.stepbible.org/?q=version=${version}|version=KJV|reference=${reference}&options=VN`
    : `https://www.stepbible.org/?q=version=${version}|reference=${reference}&options=VN`

  const goToRef = () => {
    const cleaned = refInput.trim().replace(/\s+/g, '.')
    if (!cleaned) return
    setReference(cleaned)
    setRefInput('')
    if (user) recordActivity('bible', cleaned)
  }

  const askHelper = async () => {
    if (!aiQuery.trim()) return
    setAiLoading(true); setAiResponse('')
    try {
      const res = await fetch('/api/bible-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, reference })
      })
      const data = await res.json()
      setAiResponse(data.response || data.error || 'Could not generate a response.')
    } catch { setAiResponse('Connection error. Please try again.') }
    setAiLoading(false)
  }

  const saveNote = () => {
    if (!notes.trim()) return
    const existing = localStorage.getItem('de_study_notes') || ''
    const entry = `\n\n[${new Date().toLocaleDateString('en-GB')} — ${reference}]\n${notes}`
    localStorage.setItem('de_study_notes', existing + entry)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const downloadNotes = () => {
    const all = localStorage.getItem('de_study_notes') || 'No notes saved yet.'
    const blob = new Blob([all], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'my-bible-study-notes.txt'
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const inputStyle = { border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8, padding: '9px 12px', fontFamily: F.body, fontSize: 13.5, outline: 'none', background: 'rgba(255,255,255,0.08)', color: cream, width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: ink, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>

      {/* HEADER */}
      <div style={{ background: inkLight, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: cream, margin: 0 }}>📖 Bible Study Hub</h1>
            <p style={{ fontFamily: F.body, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', margin: '3px 0 0' }}>Read, explore, reflect — then bring your questions to the community</p>
          </div>
          <Link to="/forum/exegesis" style={{ background: gold, color: ink, borderRadius: 8, padding: '8px 18px', fontFamily: F.body, fontSize: 13, fontWeight: 700 }}>
            Discuss in Forum →
          </Link>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div style={{ background: inkLight, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={reference} onChange={e => { setReference(e.target.value); if(user) recordActivity('bible', e.target.value) }}
            style={{ ...inputStyle, width: 'auto', flex: '0 0 auto' }}>
            {BOOKS.map(b => <option key={b.ref} value={b.ref}>{b.label}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 180 }}>
            <input value={refInput} onChange={e => setRefInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&goToRef()}
              placeholder="e.g. John 3:16" style={{ ...inputStyle, flex: 1 }}/>
            <button onClick={goToRef} style={{ background: gold, color: ink, border: 'none', borderRadius: 8, padding: '9px 16px', fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Go</button>
          </div>
          <select value={version} onChange={e => setVersion(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            {VERSIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={parallel} onChange={e => setParallel(e.target.checked)}/>
            KJV parallel
          </label>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16 }} className="bible-grid">

        {/* Bible viewer */}
        <div>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <iframe src={stepUrl} title="Bible" style={{ width: '100%', height: 560, border: 'none', display: 'block' }} allow="fullscreen"/>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, textAlign: 'center' }}>
            Powered by <a href="https://www.stepbible.org" target="_blank" rel="noreferrer" style={{ color: gold }}>STEPBible</a> — free scholarly Bible tool with Greek &amp; Hebrew
          </p>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* AI Helper */}
          <div style={{ background: inkLight, borderRadius: 12, padding: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: cream, marginBottom: 12 }}>🤖 Study Helper</p>
            <textarea value={aiQuery} onChange={e => setAiQuery(e.target.value)}
              placeholder={'Ask about what you\'re reading…\ne.g. "What does logos mean in John 1?"\n"Who wrote this and why?"'}
              rows={4} style={{ ...inputStyle, resize: 'none', marginBottom: 8, lineHeight: 1.55 }}/>
            <button onClick={askHelper} disabled={aiLoading || !aiQuery.trim()} style={{ width: '100%', background: aiLoading||!aiQuery.trim() ? 'rgba(201,168,76,0.3)' : gold, color: ink, border: 'none', borderRadius: 8, padding: '10px', fontFamily: F.body, fontSize: 13.5, fontWeight: 700, cursor: aiLoading||!aiQuery.trim() ? 'not-allowed' : 'pointer' }}>
              {aiLoading ? 'Thinking…' : 'Ask Helper'}
            </button>
            {aiResponse && (
              <div style={{ marginTop: 12, padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontFamily: F.body, fontSize: 13.5, color: cream, lineHeight: 1.75, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>{aiResponse}</p>
                <Link to="/forum" style={{ color: gold, fontFamily: F.body, fontSize: 12.5, fontWeight: 600 }}>Discuss in the forum →</Link>
              </div>
            )}
          </div>

          {/* Study Notes */}
          <div style={{ background: inkLight, borderRadius: 12, padding: '18px', border: '1px solid rgba(255,255,255,0.08)', flex: 1 }}>
            <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: cream, marginBottom: 12 }}>📝 Study Notes</p>
            <textarea value={notes} onChange={e => { setNotes(e.target.value); setNoteSaved(false) }}
              placeholder="Write your reflections, observations, and questions here…"
              rows={5} style={{ ...inputStyle, resize: 'vertical', marginBottom: 8, lineHeight: 1.6 }}/>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveNote} disabled={!notes.trim()} style={{ flex: 1, background: !notes.trim()?'rgba(255,255,255,0.1)':gold, color: !notes.trim()?'rgba(255,255,255,0.4)':ink, border: 'none', borderRadius: 8, padding: '9px', fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: notes.trim()?'pointer':'not-allowed' }}>
                {noteSaved ? '✓ Saved' : 'Save Note'}
              </button>
              <button onClick={downloadNotes} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px', fontFamily: F.body, fontSize: 13, cursor: 'pointer' }}>
                Download All
              </button>
            </div>
            <p style={{ fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 7 }}>Notes saved locally on this device</p>
          </div>

          {/* Community links */}
          <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, borderRadius: 12, padding: '16px' }}>
            <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Study with the community</p>
            {[['💬 Deep Dive discussions','/forum/exegesis'],['🌱 Ask in Seekers Corner','/forum/seekers'],['📚 Resources','/forum/resources'],['👥 Find a Study Group','/groups']].map(([l,t]) => (
              <Link key={t} to={t} style={{ fontFamily: F.body, fontSize: 13, color: '#E8C97A', display: 'block', marginBottom: 6 }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.bible-grid{grid-template-columns:1fr !important}}`}</style>
    </div>
  )
}
