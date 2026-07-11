import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { Logo } from '../components/ui.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

const STEPS = [
  {
    id: 'acknowledge',
    title: 'Acknowledging God',
    verse: 'For all have sinned and fall short of the glory of God.',
    ref: 'Romans 3:23',
    text: `Every one of us, no matter our background or story, has fallen short of what God made us to be. This isn't about condemnation — it's about honesty. The first step toward God is simply admitting that we need him.`,
    prompt: 'Take a moment. Is there an honest acknowledgement in your heart that you need God?'
  },
  {
    id: 'believe',
    title: 'Believing in Christ',
    verse: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    ref: 'John 3:16',
    text: `God's response to our need was not judgement — it was love. He sent Jesus Christ, who lived the life we couldn't live, died the death we deserved, and rose on the third day to prove that death itself has been defeated. This is the gospel — the good news at the heart of everything.`,
    prompt: 'Do you believe that Jesus died for you and rose again? Even the smallest genuine faith is enough.'
  },
  {
    id: 'confess',
    title: 'Confessing with your mouth',
    verse: 'If you declare with your mouth, "Jesus is Lord," and believe in your heart that God raised him from the dead, you will be saved.',
    ref: 'Romans 10:9',
    text: `Salvation isn't just a private thought — it's a turning of your whole self toward Christ. "Jesus is Lord" was the earliest Christian confession, and it still carries all its power today. To say it and mean it is to hand the throne of your life to him.`,
    prompt: 'Are you ready to say — and mean — that Jesus is Lord of your life?'
  },
  {
    id: 'pray',
    title: 'The Prayer',
    verse: 'Everyone who calls on the name of the Lord will be saved.',
    ref: 'Romans 10:13',
    text: `There is no single "magic formula" — God hears every honest heart. But if you'd like words to pray, here is a simple prayer. Pray it slowly, meaning every word:`,
    prayer: `Lord Jesus,\n\nI come to you just as I am.\n\nI acknowledge that I have sinned and fallen short — that I need you, and cannot save myself.\n\nI believe that you are the Son of God. That you died on the cross for my sins and rose again on the third day.\n\nI turn away from my old life and turn toward you.\n\nJesus, be my Lord and Saviour. Come into my heart. Fill me with your Holy Spirit.\n\nThank you for your grace, your forgiveness, and your love.\n\nAmen.`
  },
  {
    id: 'next',
    title: 'What happens next?',
    verse: 'Therefore, if anyone is in Christ, the new creation has come: the old has gone, the new is here!',
    ref: '2 Corinthians 5:17',
    text: null,
  }
]

export default function PrayerOfSalvationPage() {
  usePageTitle('Prayer of Salvation')
  const [step, setStep] = useState(0)
  const [prayed, setPrayed] = useState(false)
  const [visible, setVisible] = useState(true)

  const goTo = (n) => {
    setVisible(false)
    setTimeout(() => { setStep(n); setVisible(true) }, 280)
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isPrayer = current.id === 'pray'

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(to bottom, #1B2A4A 0%, #0d1b2e 60%, #1B2A4A 100%)`, position: 'relative', overflow: 'hidden' }}>

      {/* Decorative rings */}
      {[280, 460, 640].map((r, i) => (
        <div key={i} style={{ position: 'fixed', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: r, height: r, borderRadius: '50%', border: `1px solid ${C.gold}${['12','0a','06'][i]}`, pointerEvents: 'none' }}/>
      ))}

      {/* Progress dots */}
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 20 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i <= step ? C.gold : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }}/>
        ))}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 80px', position: 'relative', zIndex: 10 }}>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><Logo size={44}/></div>

          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>
            {step + 1} of {STEPS.length}
          </p>

          <h1 style={{ fontFamily: F.display, fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 28, lineHeight: 1.2 }}>
            {current.title}
          </h1>

          {/* Verse */}
          <div style={{ borderLeft: `3px solid ${C.gold}`, paddingLeft: 20, marginBottom: 28 }}>
            <p style={{ fontFamily: F.display, fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 600, color: '#fff', lineHeight: 1.65, marginBottom: 8, fontStyle: 'italic' }}>
              "{current.verse}"
            </p>
            <p style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 700, color: C.gold }}>{current.ref}</p>
          </div>

          {/* Body text */}
          {current.text && (
            <p style={{ fontFamily: F.body, fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, marginBottom: 24 }}>
              {current.text}
            </p>
          )}

          {/* Prayer text */}
          {isPrayer && current.prayer && (
            <div style={{ background: 'rgba(201,168,76,0.08)', border: `1px solid ${C.gold}33`, borderRadius: 14, padding: '24px 28px', marginBottom: 24 }}>
              <p style={{ fontFamily: F.display, fontSize: 17, color: '#fff', lineHeight: 2, whiteSpace: 'pre-wrap', margin: 0 }}>
                {current.prayer}
              </p>
            </div>
          )}

          {/* Prompt */}
          {current.prompt && (
            <p style={{ fontFamily: F.body, fontSize: 14.5, color: C.goldLight, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 28, textAlign: 'center' }}>
              {current.prompt}
            </p>
          )}

          {/* Last step — next steps */}
          {isLast && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontFamily: F.body, fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, marginBottom: 20 }}>
                If you prayed that prayer sincerely, something eternal has happened. Welcome to the family of God.
              </p>
              <p style={{ fontFamily: F.body, fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 24 }}>
                What now? Three things matter most in these early days:
              </p>
              {[
                { icon: '📖', title: 'Read the Word', desc: 'Start with the Gospel of John. Read a little each day. Use our Bible Study Hub alongside.' },
                { icon: '🙏', title: 'Pray every day', desc: 'Talk to God like you would a friend. He hears you. The Prayer & Life forum is a safe space.' },
                { icon: '💬', title: 'Find community', desc: 'You were not made to walk alone. Dive into the Seekers\' Corner — no question is too basic.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{item.title}</p>
                    <p style={{ fontFamily: F.body, fontSize: 13.5, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {step > 0 && (
              <button onClick={() => goTo(step - 1)} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 24px', fontFamily: F.body, fontSize: 14, cursor: 'pointer' }}>
                ← Back
              </button>
            )}

            {isPrayer && !prayed && (
              <button onClick={() => { setPrayed(true) }} style={{ background: C.gold, color: C.navy, border: 'none', borderRadius: 10, padding: '13px 28px', fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                I prayed this prayer 🙏
              </button>
            )}

            {(!isPrayer || prayed) && !isLast && (
              <button onClick={() => goTo(step + 1)} style={{ background: C.gold, color: C.navy, border: 'none', borderRadius: 10, padding: '13px 28px', fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Continue →
              </button>
            )}

            {isLast && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/forum/seekers" style={{ background: C.gold, color: C.navy, borderRadius: 10, padding: '13px 26px', fontFamily: F.body, fontSize: 14.5, fontWeight: 700 }}>
                  🌱 Join Seekers' Corner →
                </Link>
                <Link to="/bible" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '13px 26px', fontFamily: F.body, fontSize: 14 }}>
                  📖 Open Bible Study
                </Link>
                <Link to="/register" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '13px 26px', fontFamily: F.body, fontSize: 14 }}>
                  Join the Community
                </Link>
              </div>
            )}
          </div>

          {/* Reassurance */}
          {step === 0 && (
            <p style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 24 }}>
              No pressure. No obligation. Just an open door — walk through at your own pace.
            </p>
          )}
        </div>
      </div>

      <style>{`@keyframes breathe{0%,100%{opacity:0.5}50%{opacity:0.2}}`}</style>
    </div>
  )
}
