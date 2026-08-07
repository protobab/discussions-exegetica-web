import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { Logo } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export default function AboutPage() {
  usePageTitle('About Us')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: F.body, fontSize: 13, color: 'var(--fg-4)' }}>← Home</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><Logo size={44}/></div>

        <h1 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, color: 'var(--fg-100)', textAlign: 'center', marginBottom: 10 }}>
          About Discussions Exegetica
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.gold, textAlign: 'center', marginBottom: 48, fontStyle: 'italic' }}>
          Where Scripture is opened together
        </p>

        <div style={{ fontFamily: F.body, fontSize: 15.5, color: 'var(--fg-78)', lineHeight: 1.9 }}>

          <Section title="Who we are">
            <p>Discussions Exegetica is built and run by <strong style={{ color: 'var(--fg-100)' }}>Lives In Motion Ltd</strong>, a UK-registered company. We're not a large institution — we're a small team who felt a genuine call to build something the global Church could gather around: an open, honest space to study and discuss the Bible together, wherever in the world you are.</p>
          </Section>

          <Section title="Why we built this">
            <p>So much online discussion pulls people apart. We wanted the opposite — a place where Scripture brings people together instead. Whether you've followed Christ for decades or you're only just starting to ask questions, this platform exists so you don't have to search alone. Structured discussion, live "Armchair" conversations, study groups, and daily reflections — all built around one simple aim: helping people encounter God's word and each other, honestly.</p>
          </Section>

          <Section title="What we believe">
            <p>We hold to the historic evangelical Christian faith — the authority of Scripture, the person and work of Jesus Christ, and the call to know God and make him known. We welcome believers from every background and tradition, and we welcome honest seekers who aren't sure yet what they believe. No question is too basic here.</p>
          </Section>

          <Section title="Get in touch">
            <p>Have a question, a suggestion, or just want to say hello? We'd love to hear from you — reach us via our <Link to="/contact" style={{ color: C.gold }}>contact page</Link>.</p>
          </Section>

        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 48 }}>
          <Link to="/register" style={{ background: C.gold, color: C.navy, borderRadius: 10, padding: '13px 26px', fontFamily: F.body, fontSize: 14.5, fontWeight: 700 }}>
            Join the Community
          </Link>
          <Link to="/testimonies" style={{ background: 'var(--fg-08)', color: 'var(--fg-7)', border: '1px solid var(--fg-15)', borderRadius: 10, padding: '13px 26px', fontFamily: F.body, fontSize: 14 }}>
            Hear from our community →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 34 }}>
      <h2 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: 'var(--fg-100)', marginBottom: 10 }}>{title}</h2>
      {children}
    </div>
  )
}
