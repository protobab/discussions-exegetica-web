// src/lib/tourSteps.jsx
// Shared step data + demo components for the feature tour.
// Used by both TourPage.jsx (full page) and TourModal.jsx (homepage box).
import { useState, useEffect } from 'react'
import { F } from './tokens.js'

export const GOLD = 'var(--c-gold)'
export const NAVY = '#0a0f1e'
export const PANEL = 'var(--surface-tourpanel)'

export const STEPS = [
  {
    id: 'welcome',
    label: 'Welcome',
    emoji: '🔥',
    title: 'Where Scripture is\nopened together.',
    subtitle: 'Discussions Exegetica is a free, global biblical discussion community — for honest seekers and devoted believers alike.',
    note: 'This is the front door — a quick look at everything you can do here. Tip: there\'s a light/dark toggle in the top-right corner too.',
    color: GOLD,
    demo: 'hero',
  },
  {
    id: 'forum',
    label: 'Forum',
    emoji: '💬',
    title: 'Start or join a\ndiscussion.',
    subtitle: 'Six categories cover every angle — from deep exegesis to honest seekers\' questions. Ask freely. Share deeply.',
    note: 'Every thread lives in a category, so you can browse by the kind of conversation you\'re after.',
    color: '#7C3AED',
    demo: 'forum',
    categories: ['📖 Deep Dive', '🌱 Seekers\' Corner', '🙏 Prayer & Life', '⚡ Theology', '🔮 Prophecy', '📚 Resources'],
  },
  {
    id: 'bible',
    label: 'Bible',
    emoji: '📖',
    title: 'Study Scripture\nwith an AI helper.',
    subtitle: 'Read in STEPBible with Greek and Hebrew tools. Ask the AI Study Helper anything about the passage. Save notes and record audio reflections.',
    note: 'Type a question about any verse and get a grounded, referenced answer in seconds.',
    color: '#0891B2',
    demo: 'bible',
  },
  {
    id: 'armchair',
    label: 'Armchair',
    emoji: '🎙️',
    title: 'Live conversations\non faith.',
    subtitle: 'Join Eki and guests for live audio sessions. Listen back to past recordings. Ambient worship music plays as you read.',
    note: 'Can\'t make it live? Every session is recorded so you can catch up later.',
    color: '#059669',
    demo: 'armchair',
  },
  {
    id: 'daily',
    label: 'Daily Word',
    emoji: '✦',
    title: 'A verse, every\nday.',
    subtitle: 'Each morning brings a new verse with a cinematic word-by-word reveal. Enter meditate mode for a quiet moment with Scripture.',
    note: 'A small daily habit — thirty seconds of Scripture before your day starts.',
    color: '#D97706',
    demo: 'daily',
  },
  {
    id: 'groups',
    label: 'Groups',
    emoji: '👥',
    title: 'Study a book\ntogether.',
    subtitle: 'Create or join a study group — book by book through Scripture. Groups can be open, approval-based, or private with invite links.',
    note: 'Choose how open your group is — anyone can join, or invite-only for close friends.',
    color: '#DC2626',
    demo: 'groups',
  },
  {
    id: 'salvation',
    label: 'Salvation',
    emoji: '🙏',
    title: 'An open door\nfor anyone.',
    subtitle: 'A warm, unhurried five-step guided salvation experience — for anyone wondering whether to take that step.',
    note: 'No pressure, no time limit — just a gentle walk through what it means to begin.',
    color: GOLD,
    demo: 'salvation',
  },
  {
    id: 'join',
    label: 'Join',
    emoji: '✨',
    title: 'Free forever.\nNo ads. No spam.',
    subtitle: 'Join thousands of believers and seekers from around the world. All you need is a name and an email.',
    note: 'Takes under a minute. You can always come back to this tour later from the homepage.',
    color: GOLD,
    demo: 'join',
  },
]

export function DemoHero() {
  const [word, setWord] = useState(0)
  const words = ['Where', 'Scripture', 'is', 'opened', 'together.']
  useEffect(() => {
    if (word >= words.length) return
    const t = setTimeout(() => setWord(w => w + 1), 320)
    return () => clearTimeout(t)
  }, [word])
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
      <h2 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 900, color: 'var(--fg-100)', lineHeight: 1.2, margin: '0 0 16px' }}>
        {words.slice(0, word).map((w, i) => (
          <span key={i} style={{ color: i === 3 ? GOLD : 'var(--fg-100)', marginRight: 8,
            animation: 'fadeIn 0.3s ease', display: 'inline-block' }}>{w}</span>
        ))}
      </h2>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
        {['Forum', 'Bible Study', 'Armchair', 'Daily Word', 'Groups'].map(f => (
          <span key={f} style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '4px 12px', fontFamily: F.body, fontSize: 12, color: GOLD }}>{f}</span>
        ))}
      </div>
      <p style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-35)', marginTop: 16 }}>Free forever · No ads · Available on web, Windows & Android</p>
    </div>
  )
}

export function DemoForum({ categories }) {
  const [active, setActive] = useState(0)
  const threads = [
    { cat: 0, title: 'What does "logos" really mean in John 1:1?', replies: 12, views: 84 },
    { cat: 1, title: 'Can you be a Christian and believe in evolution?', replies: 7, views: 63 },
    { cat: 2, title: 'How do you pray when God feels absent?', replies: 5, views: 41 },
  ]
  const filtered = threads.filter(t => t.cat === active % 3)
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {categories.map((c, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ background: active === i ? GOLD : 'var(--fg-08)', color: active === i ? NAVY : 'var(--fg-7)', border: `1px solid ${active === i ? GOLD : 'var(--fg-15)'}`, borderRadius: 20, padding: '4px 10px', fontFamily: F.body, fontSize: 11, cursor: 'pointer', fontWeight: active === i ? 700 : 400 }}>
            {c}
          </button>
        ))}
      </div>
      {threads.map((t, i) => (
        <div key={i} style={{ background: 'var(--fg-05)', border: '1px solid var(--fg-08)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, borderLeft: `3px solid ${['#7C3AED','#059669','#0891B2'][t.cat]}` }}>
          <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: 'var(--fg-100)', margin: '0 0 6px' }}>{t.title}</p>
          <p style={{ fontFamily: F.body, fontSize: 11, color: 'var(--fg-4)', margin: 0 }}>💬 {t.replies} · 👁 {t.views}</p>
        </div>
      ))}
    </div>
  )
}

export function DemoBible() {
  const [typed, setTyped] = useState('')
  const [response, setResponse] = useState('')
  const query = 'What does logos mean?'
  const answer = 'In John 1:1, "logos" (λόγος) means the divine Word — the rational principle through which God created and sustains all things, now revealed in the person of Jesus Christ.'
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      if (i <= query.length) { setTyped(query.slice(0, i)); i++ }
      else clearInterval(t)
    }, 60)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (typed !== query) return
    let i = 0
    const t = setInterval(() => {
      if (i <= answer.length) { setResponse(answer.slice(0, i)); i++ }
      else clearInterval(t)
    }, 18)
    return () => clearInterval(t)
  }, [typed])
  return (
    <div>
      <div style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 10, fontFamily: 'Georgia, serif', fontSize: 13, color: 'var(--fg-85)', lineHeight: 1.7 }}>
        <span style={{ color: '#0891B2', fontWeight: 700, fontSize: 11, display: 'block', marginBottom: 4 }}>JOHN 1:1 · ESV</span>
        In the beginning was the Word, and the Word was with God, and the Word was God.
      </div>
      <div style={{ background: 'var(--fg-05)', borderRadius: 10, padding: '10px 12px' }}>
        <p style={{ fontFamily: F.body, fontSize: 11, color: 'var(--fg-4)', margin: '0 0 6px' }}>🤖 Study Helper</p>
        <div style={{ background: 'rgba(201,168,76,0.1)', borderRadius: 8, padding: '8px 10px', marginBottom: 8, fontFamily: F.body, fontSize: 12, color: GOLD }}>
          {typed}<span style={{ opacity: typed === query ? 0 : 1 }}>|</span>
        </div>
        {response && (
          <div style={{ background: 'var(--fg-05)', borderRadius: 8, padding: '8px 10px', fontFamily: F.body, fontSize: 12, color: 'var(--fg-8)', lineHeight: 1.6 }}>
            {response}
          </div>
        )}
      </div>
    </div>
  )
}

export function DemoArmchair() {
  const [playing, setPlaying] = useState(false)
  return (
    <div>
      <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--surface-elevated-b), var(--surface-solid-b))', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontFamily: F.body, fontSize: 10, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Upcoming Session</p>
          <p style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: 'var(--fg-100)', marginBottom: 4 }}>The Holiness of God</p>
          <p style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-55)' }}>with Hubby · Tuesday 21 July, 14:00</p>
        </div>
      </div>
      <div style={{ background: 'var(--surface-solid-b)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 30, padding: '8px 16px 8px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setPlaying(p => !p)} style={{ background: GOLD, color: NAVY, border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {playing ? '⏸' : '▶'}
        </button>
        <span style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-7)' }}>Reflective Piano</span>
        <span style={{ fontFamily: F.body, fontSize: 10, color: 'var(--fg-3)', marginLeft: 'auto' }}>Ambient music</span>
      </div>
    </div>
  )
}

export function DemoDaily() {
  const verse = ['For', 'God', 'so', 'loved', 'the', 'world', 'that', 'he', 'gave', 'his', 'only', 'Son.']
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (shown >= verse.length) return
    const t = setTimeout(() => setShown(s => s + 1), 200)
    return () => clearTimeout(t)
  }, [shown])
  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <p style={{ fontFamily: F.body, fontSize: 10, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Today's Word · John 3:16</p>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: 'var(--fg-100)', lineHeight: 1.5, marginBottom: 20 }}>
        {verse.slice(0, shown).map((w, i) => (
          <span key={i} style={{ color: ['loved', 'gave', 'only', 'Son.'].includes(w) ? GOLD : 'var(--fg-100)', marginRight: 5, display: 'inline-block', animation: 'fadeIn 0.2s ease' }}>{w}</span>
        ))}
      </p>
      <button style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '6px 16px', fontFamily: F.body, fontSize: 12, color: GOLD, cursor: 'pointer' }}>
        ✦ Meditate
      </button>
    </div>
  )
}

export function DemoGroups() {
  const groups = [
    { name: 'The Gospel of John', members: 8, type: 'Open', color: '#059669' },
    { name: 'Romans Deep Dive', members: 5, type: 'Approval', color: '#D97706' },
    { name: 'Prayer Partners', members: 3, type: '🔐 Private', color: '#7C3AED' },
  ]
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {groups.map((g, i) => (
        <div key={i} style={{ background: 'var(--fg-05)', border: '1px solid var(--fg-08)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: 'var(--fg-100)', margin: '0 0 4px' }}>{g.name}</p>
            <p style={{ fontFamily: F.body, fontSize: 11, color: 'var(--fg-4)', margin: 0 }}>👥 {g.members} members</p>
          </div>
          <span style={{ background: `${g.color}22`, color: g.color, border: `1px solid ${g.color}44`, borderRadius: 6, padding: '3px 9px', fontFamily: F.body, fontSize: 11, fontWeight: 600 }}>{g.type}</span>
        </div>
      ))}
    </div>
  )
}

export function DemoSalvation() {
  const steps = ['Acknowledge', 'Believe', 'Confess', 'Receive', 'Walk']
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % steps.length), 1200)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-5)', marginBottom: 20 }}>A quiet, unhurried five-step journey</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ width: 60, textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === active ? GOLD : 'var(--fg-08)', border: `2px solid ${i === active ? GOLD : 'var(--fg-15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', transition: 'all 0.4s', color: i === active ? NAVY : 'var(--fg-4)', fontFamily: F.body, fontSize: 13, fontWeight: 700 }}>
              {i + 1}
            </div>
            <p style={{ fontFamily: F.body, fontSize: 10, color: i === active ? GOLD : 'var(--fg-3)', margin: 0, transition: 'color 0.4s' }}>{s}</p>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: 'var(--fg-5)', fontStyle: 'italic', marginTop: 20 }}>"If you confess with your mouth that Jesus is Lord..." — Romans 10:9</p>
    </div>
  )
}

export function DemoJoin() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: 'var(--fg-04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '20px', maxWidth: 280, margin: '0 auto' }}>
        <p style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: 'var(--fg-100)', marginBottom: 16 }}>Join Discussions Exegetica</p>
        <div style={{ background: 'var(--fg-08)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontFamily: F.body, fontSize: 13, color: 'var(--fg-4)', textAlign: 'left' }}>Display name</div>
        <div style={{ background: 'var(--fg-08)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontFamily: F.body, fontSize: 13, color: 'var(--fg-4)', textAlign: 'left' }}>Email address</div>
        <div style={{ background: 'var(--fg-08)', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontFamily: F.body, fontSize: 13, color: 'var(--fg-4)', textAlign: 'left' }}>Password</div>
        <div style={{ background: GOLD, borderRadius: 8, padding: '11px', fontFamily: F.body, fontSize: 14, fontWeight: 700, color: NAVY }}>Create free account →</div>
        <p style={{ fontFamily: F.body, fontSize: 11, color: 'var(--fg-3)', marginTop: 10 }}>Available on Web · Windows · Android</p>
      </div>
    </div>
  )
}

export const DEMOS = {
  hero: DemoHero,
  forum: DemoForum,
  bible: DemoBible,
  armchair: DemoArmchair,
  daily: DemoDaily,
  groups: DemoGroups,
  salvation: DemoSalvation,
  join: DemoJoin,
}
