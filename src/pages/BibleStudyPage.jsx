import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { usePageTitle } from '../lib/usePageTitle.js'
import { useAuth } from '../lib/auth.jsx'
import { useStreak } from '../lib/useStreak.js'
import { IMAGES } from '../lib/images.js'

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
const CHAT_KEY = 'de_bible_chat'
const NOTES_KEY = 'de_study_notes'

// Simple markdown renderer
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, '<p style="font-weight:700;color:#E8C97A;margin:8px 0 3px">$1</p>')
    .replace(/^## (.+)$/gm, '<p style="font-weight:700;color:#E8C97A;font-size:15px;margin:10px 0 4px">$1</p>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0;padding-left:4px">$1</li>')
    .replace(/\n/g, '<br/>')
}

export default function BibleStudyPage() {
  usePageTitle('Bible Study')
  const location = useLocation()
  const { user } = useAuth()
  const { recordActivity } = useStreak()
  const [version, setVersion] = useState('ESV')
  const [reference, setReference] = useState('John.1')
  const [refInput, setRefInput] = useState('')
  const [parallel, setParallel] = useState(false)
  const [visible, setVisible] = useState(false)

  // Chat history — persisted in localStorage
  const [chatHistory, setChatHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]') } catch { return [] }
  })
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const chatEndRef = useRef(null)

  // Notes — persisted in localStorage with delete support
  const [notes, setNotes] = useState('')
  const [savedNotes, setSavedNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NOTES_KEY + '_list') || '[]') } catch { return [] }
  })
  const [noteSaved, setNoteSaved] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  // Audio recording
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    // Detect if STEPBible iframe fails to load
    const timer = setTimeout(() => {
      const iframe = document.querySelector('iframe[title="Bible"]')
      if (iframe) {
        try {
          // If contentDocument is null after 8s, show fallback
          setTimeout(() => {
            const fallback = document.getElementById('stepbible-fallback')
            if (fallback && iframe) {
              try { const d = iframe.contentDocument; if (!d || !d.body || !d.body.innerHTML) fallback.style.display = 'block' } catch { fallback.style.display = 'block' }
            }
          }, 8000)
        } catch {}
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [stepUrl])

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
    const params = new URLSearchParams(location.search)
    const ref = params.get('ref')
    if (ref) setReference(ref)
    if (user) recordActivity('bible', ref || 'John.1')
  }, [])

  // Persist chat to localStorage
  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chatHistory.slice(-50)))
  }, [chatHistory])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

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
    const userMsg = { role: 'user', text: aiQuery, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
    setChatHistory(h => [...h, userMsg])
    setAiQuery('')
    setAiLoading(true)
    try {
      const res = await fetch('/api/bible-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, reference })
      })
      const data = await res.json()
      const aiMsg = {
        role: 'assistant',
        text: data.response || data.error || 'Could not generate a response.',
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      }
      setChatHistory(h => [...h, aiMsg])
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', text: 'Connection error. Please try again.', time: '' }])
    }
    setAiLoading(false)
  }

  const clearChat = () => {
    if (window.confirm('Clear your conversation history?')) {
      setChatHistory([])
      localStorage.removeItem(CHAT_KEY)
    }
  }

  const downloadChat = () => {
    const text = chatHistory.map(m => `[${m.time}] ${m.role === 'user' ? 'You' : 'Study Helper'}: ${m.text}`).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `bible-study-chat-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
  }

  const saveNote = () => {
    if (!notes.trim()) return
    const newNote = {
      id: Date.now(),
      text: notes.trim(),
      ref: reference,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    const updated = [newNote, ...savedNotes]
    setSavedNotes(updated)
    localStorage.setItem(NOTES_KEY + '_list', JSON.stringify(updated))
    setNotes('')
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const deleteNote = (id) => {
    const updated = savedNotes.filter(n => n.id !== id)
    setSavedNotes(updated)
    localStorage.setItem(NOTES_KEY + '_list', JSON.stringify(updated))
  }

  const downloadNotes = (selected = null) => {
    const toDownload = selected ? savedNotes.filter(n => n.id === selected) : savedNotes
    const text = toDownload.map(n => `[${n.date} — ${n.ref}]\n${n.text}`).join('\n\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `study-notes-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
  }

  // Audio recording for notes
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      setRecording(true)

      // Start live transcription via Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognitionRef.current = recognition
        let finalTranscript = ''
        recognition.onstart = () => setTranscribing(true)
        recognition.onresult = (e) => {
          let interim = ''
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript
            if (e.results[i].isFinal) finalTranscript += t + ' '
            else interim = t
          }
          setTranscript(finalTranscript + interim)
        }
        recognition.onerror = () => setTranscribing(false)
        recognition.onend = () => setTranscribing(false)
        recognition.start()
      }
    } catch { alert('Microphone access required for audio notes') }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    recognitionRef.current?.stop()
    setRecording(false)
    setTranscribing(false)
  }

  const saveTranscriptAsNote = () => {
    if (!transcript.trim()) return
    const newNote = {
      id: Date.now(),
      text: '[Audio transcript] ' + transcript.trim(),
      ref: reference,
      date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
    }
    const updated = [newNote, ...savedNotes]
    setSavedNotes(updated)
    localStorage.setItem(NOTES_KEY + '_list', JSON.stringify(updated))
    setTranscript('')
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const downloadTranscript = () => {
    if (!transcript.trim()) return
    const blob = new Blob([transcript], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `transcript-${reference}-${Date.now()}.txt`
    a.click()
  }

  const downloadAudioNote = () => {
    if (!audioBlob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(audioBlob)
    a.download = `audio-note-${reference}-${Date.now()}.webm`
    a.click()
  }

  const inputStyle = { border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', fontFamily: F.body, fontSize: 13.5, outline: 'none', background: 'rgba(255,255,255,0.08)', color: cream, width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', backgroundImage: `linear-gradient(rgba(10,25,42,0.93), rgba(10,25,42,0.96)), url(${IMAGES.bibleHero})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>

      {/* HEADER */}
      <div style={{ background: inkLight, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: F.display, fontSize: 21, fontWeight: 700, color: cream, margin: 0 }}>📖 Bible Study Hub</h1>
            <p style={{ fontFamily: F.body, fontSize: 12.5, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Read, explore, reflect — bring your questions to the community</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowNotes(s => !s)} style={{ background: showNotes ? gold : 'rgba(255,255,255,0.1)', color: showNotes ? ink : cream, border: 'none', borderRadius: 8, padding: '7px 14px', fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              📝 Notes ({savedNotes.length})
            </button>
            <Link to="/forum/exegesis" style={{ background: gold, color: ink, borderRadius: 8, padding: '7px 16px', fontFamily: F.body, fontSize: 13, fontWeight: 700 }}>Discuss →</Link>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={reference} onChange={e => { setReference(e.target.value); if(user) recordActivity('bible', e.target.value) }}
            style={{ ...inputStyle, width: 'auto' }}>
            {BOOKS.map(b => <option key={b.ref} value={b.ref} style={{ background: ink }}>{b.label}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 160 }}>
            <input value={refInput} onChange={e => setRefInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&goToRef()}
              placeholder="e.g. John 3:16" style={{ ...inputStyle, flex: 1 }}/>
            <button onClick={goToRef} style={{ background: gold, color: ink, border: 'none', borderRadius: 8, padding: '9px 14px', fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Go</button>
          </div>
          <select value={version} onChange={e => setVersion(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            {VERSIONS.map(v => <option key={v.value} value={v.value} style={{ background: ink }}>{v.label}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={parallel} onChange={e => setParallel(e.target.checked)}/>
            KJV parallel
          </label>
          {/* Open in STEPBible */}
          <a href={stepUrl} target="_blank" rel="noreferrer" style={{ color: gold, fontFamily: F.body, fontSize: 12.5, whiteSpace: 'nowrap' }}>
            Open full ↗
          </a>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px 40px', display: 'grid', gridTemplateColumns: showNotes ? '1fr' : 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16 }} className="bible-grid">

        {!showNotes ? (
          <>
            {/* Bible viewer */}
            <div>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <iframe
                  src={stepUrl}
                  title="Bible"
                  style={{ width: '100%', height: 560, border: 'none', display: 'block' }}
                  onError={() => {}}
                />
                <div id="stepbible-fallback" style={{ display:'none', padding:'24px', background:'rgba(255,255,255,0.05)', borderRadius:8, textAlign:'center' }}>
                  <p style={{ fontFamily:F.body, fontSize:14, color:'rgba(255,255,255,0.6)', marginBottom:12 }}>
                    Unable to load STEPBible — your network may be blocking the connection.
                  </p>
                  <a href={stepUrl} target="_blank" rel="noreferrer" style={{ color:gold, fontFamily:F.body, fontSize:13.5, fontWeight:600 }}>
                    Open STEPBible directly in a new tab →
                  </a>
                </div>
              </div>
              <p style={{ fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6, textAlign: 'center' }}>
                Powered by <a href="https://www.stepbible.org" target="_blank" rel="noreferrer" style={{ color: gold }}>STEPBible</a> — free scholarly Bible tool with Greek &amp; Hebrew
              </p>
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* AI Study Chat */}
              <div style={{ background: inkLight, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', maxHeight: 480 }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: cream, margin: 0 }}>🤖 Study Helper</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {chatHistory.length > 0 && (
                      <>
                        <button onClick={downloadChat} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: F.body, fontSize: 11.5, cursor: 'pointer' }}>⬇ Download</button>
                        <button onClick={clearChat} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: F.body, fontSize: 11.5, cursor: 'pointer' }}>✕ Clear</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Chat messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120 }}>
                  {chatHistory.length === 0 && (
                    <p style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 20 }}>
                      Ask anything about what you're reading…<br/>
                      <span style={{ fontSize: 11.5 }}>e.g. "What does logos mean in John 1?" or "Who wrote this letter?"</span>
                    </p>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '88%', padding: '9px 12px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        background: msg.role === 'user' ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.07)',
                        border: msg.role === 'user' ? `1px solid ${gold}44` : '1px solid rgba(255,255,255,0.1)',
                      }}>
                        <p style={{ fontFamily: F.body, fontSize: 13, color: cream, margin: 0, lineHeight: 1.65 }}
                          dangerouslySetInnerHTML={{ __html: msg.role === 'assistant' ? renderMarkdown(msg.text) : msg.text }}/>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {msg.time && <span style={{ fontFamily: F.body, fontSize: 10, color: 'rgba(255,255,255,0.25)', padding: '0 4px' }}>{msg.time}</span>}
                        {msg.role === 'assistant' && (
                          <a href="https://discussionsexegetica.com/contact" target="_blank" rel="noreferrer"
                            style={{ fontFamily: F.body, fontSize: 11, color: 'rgba(239,68,68,0.6)', textDecoration:'none', border:'1px solid rgba(239,68,68,0.25)', borderRadius:4, padding:'1px 6px' }}
                            title="Report inappropriate AI response">⚑ Report</a>
                        )}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[0,1,2].map(i => (
                          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: gold, display: 'inline-block', animation: `bounce 1s ${i*0.2}s infinite` }}/>
                        ))}
                      </div>
                      <span style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Thinking…</span>
                    </div>
                  )}
                  <div ref={chatEndRef}/>
                </div>

                {/* Input */}
                <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && askHelper()}
                      placeholder={`Ask about ${reference}…`}
                      style={{ ...inputStyle, flex: 1, padding: '8px 10px', fontSize: 13 }}/>
                    <button onClick={askHelper} disabled={aiLoading || !aiQuery.trim()} style={{ background: aiLoading||!aiQuery.trim() ? 'rgba(201,168,76,0.3)' : gold, color: ink, border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Send
                    </button>
                  </div>
                  <p style={{ fontFamily: F.body, fontSize: 10.5, color: 'rgba(255,255,255,0.25)', margin: '5px 0 0' }}>
                    Chat history saves automatically · {chatHistory.length} message{chatHistory.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Quick note + audio */}
              <div style={{ background: inkLight, borderRadius: 12, padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: cream, margin: 0 }}>📝 Quick Note</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!recording
                      ? <button onClick={startRecording} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 10px', fontFamily: F.body, fontSize: 11.5, cursor: 'pointer' }}>🎙 Record</button>
                      : <button onClick={stopRecording} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontFamily: F.body, fontSize: 11.5, cursor: 'pointer', animation: 'pulse-red 1s infinite' }}>⏹ Stop</button>
                    }
                    {audioBlob && <button onClick={downloadAudioNote} style={{ background: 'rgba(201,168,76,0.15)', color: gold, border: `1px solid ${gold}44`, borderRadius: 6, padding: '4px 10px', fontFamily: F.body, fontSize: 11.5, cursor: 'pointer' }}>⬇ Audio</button>}
                  </div>
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder={`Notes on ${reference}…`} rows={3}
                  style={{ ...inputStyle, resize: 'none', marginBottom: 8, lineHeight: 1.55, fontSize: 13 }}/>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={saveNote} disabled={!notes.trim()} style={{ flex: 1, background: !notes.trim() ? 'rgba(255,255,255,0.08)' : gold, color: !notes.trim() ? 'rgba(255,255,255,0.3)' : ink, border: 'none', borderRadius: 8, padding: '8px', fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: notes.trim() ? 'pointer' : 'not-allowed' }}>
                    {noteSaved ? '✓ Saved' : 'Save Note'}
                  </button>
                  <button onClick={() => setShowNotes(true)} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', fontFamily: F.body, fontSize: 13, cursor: 'pointer' }}>
                    All notes ({savedNotes.length})
                  </button>
                </div>
              </div>

              {/* Community links */}
              <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, borderRadius: 12, padding: '14px' }}>
                <p style={{ fontFamily: F.display, fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Study with others</p>
                {[['💬 Deep Dive','/forum/exegesis'],['🌱 Seekers Corner','/forum/seekers'],['📚 Resources','/forum/resources'],['👥 Study Groups','/groups']].map(([l,t]) => (
                  <Link key={t} to={t} style={{ fontFamily: F.body, fontSize: 12.5, color: '#E8C97A', display: 'block', marginBottom: 6 }}>{l}</Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* NOTES PANEL */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: cream, margin: 0 }}>📝 Study Notes ({savedNotes.length})</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {savedNotes.length > 0 && <button onClick={() => downloadNotes()} style={{ background: gold, color: ink, border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>⬇ Download All</button>}
                <button onClick={() => setShowNotes(false)} style={{ background: 'rgba(255,255,255,0.1)', color: cream, border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: F.body, fontSize: 13, cursor: 'pointer' }}>← Back to Study</button>
              </div>
            </div>
            {savedNotes.length === 0
              ? <p style={{ fontFamily: F.body, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px 0' }}>No notes saved yet. Go back to study and save your first note.</p>
              : <div style={{ display: 'grid', gap: 12 }}>
                  {savedNotes.map(note => (
                    <div key={note.id} style={{ background: inkLight, borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: gold }}>{note.ref}</span>
                          <span style={{ fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 10 }}>{note.date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => downloadNotes(note.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: F.body, fontSize: 11.5, cursor: 'pointer' }}>⬇</button>
                          <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontFamily: F.body, fontSize: 11.5, cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                      <p style={{ fontFamily: F.body, fontSize: 13.5, color: cream, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{note.text}</p>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:768px){.bible-grid{grid-template-columns:1fr !important}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes pulse-red{0%,100%{opacity:1}50%{opacity:0.6}}
      `}</style>
    </div>
  )
}
