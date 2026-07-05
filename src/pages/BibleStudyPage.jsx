import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { usePageTitle } from '../lib/usePageTitle.js'
import { Btn } from '../components/ui.jsx'

const BOOKS = [
  { label:'Genesis', ref:'Gen.1' }, { label:'Exodus', ref:'Exod.1' },
  { label:'Psalms', ref:'Ps.1' }, { label:'Proverbs', ref:'Prov.1' },
  { label:'Isaiah', ref:'Isa.1' }, { label:'Matthew', ref:'Matt.1' },
  { label:'Mark', ref:'Mark.1' }, { label:'Luke', ref:'Luke.1' },
  { label:'John', ref:'John.1' }, { label:'Acts', ref:'Acts.1' },
  { label:'Romans', ref:'Rom.1' }, { label:'1 Corinthians', ref:'1Cor.1' },
  { label:'Galatians', ref:'Gal.1' }, { label:'Ephesians', ref:'Eph.1' },
  { label:'Philippians', ref:'Phil.1' }, { label:'Hebrews', ref:'Heb.1' },
  { label:'James', ref:'Jas.1' }, { label:'Revelation', ref:'Rev.1' },
]

const VERSIONS = [
  { value:'KJV', label:'KJV — King James Version' },
  { value:'ESV', label:'ESV — English Standard Version' },
  { value:'NIV', label:'NIV — New International Version' },
  { value:'NASB', label:'NASB — New American Standard' },
  { value:'MSG', label:'MSG — The Message' },
]

export default function BibleStudyPage() {
  usePageTitle('Bible Study')
  const [version, setVersion] = useState('ESV')
  const [reference, setReference] = useState('John.1')
  const [refInput, setRefInput] = useState('')
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [parallel, setParallel] = useState(false)

  const stepUrl = parallel
    ? `https://www.stepbible.org/?q=version=${version}|version=KJV|reference=${reference}&options=VN`
    : `https://www.stepbible.org/?q=version=${version}|reference=${reference}&options=VN`

  const goToRef = () => {
    const cleaned = refInput.trim()
    if (!cleaned) return
    // Convert common references to STEPBible format
    const mapped = cleaned
      .replace(/^1\s+/, '1').replace(/^2\s+/, '2').replace(/^3\s+/, '3')
      .replace(/\s+/g, '.')
      .replace(/John\./, 'John.')
    setReference(mapped)
    setRefInput('')
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
      if (data.response) {
        setAiResponse(data.response)
      } else {
        setAiResponse(data.error || 'Could not generate a response. Please try again.')
      }
    } catch (e) {
      setAiResponse('Connection error. Please check your internet and try again.')
    }
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

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.navy, marginBottom: 4 }}>📖 Bible Study Hub</h1>
          <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.muted }}>Read, explore and reflect — then bring your questions to the forum</p>
        </div>
        <Link to="/forum/exegesis" style={{ background: C.gold, color: C.navy, borderRadius: 8, padding: '8px 18px', fontFamily: F.body, fontSize: 13, fontWeight: 700 }}>
          Discuss in Forum →
        </Link>
      </div>

      {/* CONTROLS */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Quick book picker */}
        <select value={reference} onChange={e => setReference(e.target.value)} style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontFamily: F.body, fontSize: 13.5, outline: 'none', background: '#fff', flex: '0 0 auto' }}>
          {BOOKS.map(b => <option key={b.ref} value={b.ref}>{b.label}</option>)}
        </select>

        {/* Free-form reference */}
        <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 200 }}>
          <input
            value={refInput}
            onChange={e => setRefInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && goToRef()}
            placeholder="e.g. John 3:16 or Romans 8"
            style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontFamily: F.body, fontSize: 13.5, outline: 'none' }}
          />
          <Btn variant="primary" onClick={goToRef} style={{ padding: '8px 14px', fontSize: 13 }}>Go</Btn>
        </div>

        {/* Version picker */}
        <select value={version} onChange={e => setVersion(e.target.value)} style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontFamily: F.body, fontSize: 13.5, outline: 'none', background: '#fff' }}>
          {VERSIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>

        {/* Parallel toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: F.body, fontSize: 13, color: C.muted, whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={parallel} onChange={e => setParallel(e.target.checked)}/>
          KJV parallel
        </label>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16 }} className="bible-grid">

        {/* LEFT — Bible viewer */}
        <div>
          <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <iframe
              src={stepUrl}
              title="Bible"
              style={{ width: '100%', height: 580, border: 'none', display: 'block' }}
              allow="fullscreen"
            />
          </div>
          <p style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 6, textAlign: 'center' }}>
            Powered by <a href="https://www.stepbible.org" target="_blank" rel="noreferrer" style={{ color: C.gold }}>STEPBible</a> — free scholarly Bible tool with Greek/Hebrew tools
          </p>
        </div>

        {/* RIGHT — AI Helper + Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* AI Study Helper */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '18px 18px', border: `1px solid ${C.border}` }}>
            <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
              🤖 Study Helper
            </p>
            <textarea
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              placeholder={`Ask about what you're reading… e.g.\n"What does logos mean in John 1?"\n"Explain the context of Romans 8:28"\n"Who wrote this letter and why?"`}
              rows={4}
              style={{ width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', fontFamily: F.body, fontSize: 13.5, resize: 'none', outline: 'none', marginBottom: 8, boxSizing: 'border-box', lineHeight: 1.55 }}
            />
            <Btn variant="gold" onClick={askHelper} disabled={aiLoading || !aiQuery.trim()} style={{ width: '100%', justifyContent: 'center' }}>
              {aiLoading ? 'Thinking…' : 'Ask Helper'}
            </Btn>

            {aiResponse && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: C.mist, borderRadius: 8 }}>
                <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {aiResponse}
                </p>
                <Link to="/forum" style={{ display: 'block', marginTop: 10, color: C.gold, fontFamily: F.body, fontSize: 12.5, fontWeight: 600 }}>
                  Discuss this in the forum →
                </Link>
              </div>
            )}
          </div>

          {/* Study Notes */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '18px 18px', border: `1px solid ${C.border}`, flex: 1 }}>
            <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
              📝 Study Notes
            </p>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); setNoteSaved(false) }}
              placeholder="Write your reflections, observations, and questions here…"
              rows={6}
              style={{ width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', fontFamily: F.body, fontSize: 13.5, resize: 'vertical', outline: 'none', marginBottom: 8, boxSizing: 'border-box', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="primary" onClick={saveNote} disabled={!notes.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                {noteSaved ? '✓ Saved' : 'Save Note'}
              </Btn>
              <Btn variant="ghost" onClick={downloadNotes} style={{ flex: 1, justifyContent: 'center' }}>
                Download All
              </Btn>
            </div>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 8 }}>
              Notes saved locally on this device
            </p>
          </div>

          {/* Quick links */}
          <div style={{ background: C.navy, borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Study with others</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { label: '💬 Deep Dive discussions', to: '/forum/exegesis' },
                { label: '🌱 Ask in Seekers Corner', to: '/forum/seekers' },
                { label: '📚 Community resources', to: '/forum/resources' },
                { label: '👥 Find a Study Group', to: '/groups' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ fontFamily: F.body, fontSize: 13, color: C.goldLight, display: 'block' }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){ .bible-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  )
}
