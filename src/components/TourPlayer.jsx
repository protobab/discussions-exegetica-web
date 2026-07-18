// src/components/TourPlayer.jsx
// The interactive stepper itself — reused by the full-page tour (/tour)
// and the homepage "box" preview (TourModal.jsx). Each step auto-advances
// after DURATION ms (long enough to read the note), and can be paused,
// resumed, or navigated freely at any time.
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { F } from '../lib/tokens.js'
import { STEPS, DEMOS, GOLD, NAVY, PANEL } from '../lib/tourSteps.jsx'

// 11s per step — slower, more comfortable pace per feedback.
// Pause is always available for anyone who wants longer still.
const DURATION = 11000

export default function TourPlayer({ variant = 'full', onClose, fullScreenLink = false }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [demoKey, setDemoKey] = useState(0)
  const progressRef = useRef(null)
  const isBox = variant === 'box'

  const goTo = (i) => {
    setStep(i)
    setProgress(0)
    setDemoKey(k => k + 1)
  }

  const next = () => goTo((step + 1) % STEPS.length)
  const prev = () => goTo((step - 1 + STEPS.length) % STEPS.length)

  useEffect(() => {
    if (paused) return
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { next(); return 0 }
        return p + (100 / (DURATION / 50))
      })
    }, 50)
    return () => clearInterval(progressRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paused])

  const current = STEPS[step]
  const Demo = DEMOS[current.demo]
  const cardMax = isBox ? 460 : 560
  const titleSize = isBox ? 21 : 26
  const emojiSize = isBox ? 26 : 32
  const demoMinHeight = isBox ? 130 : 160

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .tour-step { animation: slideUp 0.4s ease; }
      `}</style>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 6, marginBottom: isBox ? 14 : 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            background: i === step ? current.color : 'var(--fg-08)',
            border: `1px solid ${i === step ? current.color : 'var(--fg-12)'}`,
            borderRadius: 20, padding: isBox ? '3px 8px' : '4px 10px', fontFamily: F.body, fontSize: isBox ? 10 : 11,
            color: i === step ? (current.color === GOLD ? NAVY : 'var(--fg-100)') : 'var(--fg-5)',
            cursor: 'pointer', transition: 'all 0.25s', fontWeight: i === step ? 700 : 400,
          }}>
            {s.emoji}{!isBox && ` ${s.label}`}
          </button>
        ))}
      </div>

      {/* Main card */}
      <div style={{
        background: PANEL,
        border: `1px solid ${current.color}33`,
        borderRadius: 20,
        width: '100%',
        maxWidth: cardMax,
        overflow: 'hidden',
        boxShadow: `0 0 60px ${current.color}18`,
        transition: 'border-color 0.4s, box-shadow 0.4s',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--fg-08)' }}>
          <div style={{ height: '100%', background: current.color, width: `${progress}%`, transition: 'width 0.05s linear' }}/>
        </div>

        <div className="tour-step" key={step} style={{ padding: isBox ? '20px 20px 16px' : '28px 28px 20px' }}>
          {/* Step header */}
          <div style={{ marginBottom: isBox ? 14 : 20 }}>
            <span style={{ fontSize: emojiSize, display: 'block', marginBottom: 8 }}>{current.emoji}</span>
            <h2 style={{ fontFamily: F.display, fontSize: titleSize, fontWeight: 900, color: 'var(--fg-100)', lineHeight: 1.2, margin: '0 0 8px', whiteSpace: 'pre-line' }}>
              {current.title.split('\n').map((line, i) => (
                <span key={i}>
                  {i === 1 ? <span style={{ color: current.color }}>{line}</span> : line}
                  {i === 0 && '\n'}
                </span>
              ))}
            </h2>
            <p style={{ fontFamily: F.body, fontSize: isBox ? 13 : 14, color: 'var(--fg-65)', lineHeight: 1.6, margin: '0 0 10px' }}>
              {current.subtitle}
            </p>
            {/* Annotated explanatory note */}
            <p style={{
              fontFamily: F.body, fontSize: isBox ? 11.5 : 12.5, color: current.color,
              lineHeight: 1.6, margin: 0, paddingLeft: 10, borderLeft: `2px solid ${current.color}55`
            }}>
              💡 {current.note}
            </p>
          </div>

          {/* Demo area */}
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: isBox ? '12px' : '16px', marginBottom: isBox ? 14 : 20, minHeight: demoMinHeight }}>
            <Demo key={demoKey} categories={current.categories} />
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={prev} style={{ background: 'var(--fg-08)', border: '1px solid var(--fg-12)', borderRadius: 8, padding: isBox ? '6px 12px' : '7px 14px', fontFamily: F.body, fontSize: 13, color: 'var(--fg-6)', cursor: 'pointer' }}>← Prev</button>
              <button onClick={() => setPaused(p => !p)} style={{ background: 'var(--fg-06)', border: '1px solid var(--fg-1)', borderRadius: 8, padding: isBox ? '6px 10px' : '7px 12px', fontFamily: F.body, fontSize: 12, color: 'var(--fg-4)', cursor: 'pointer' }}>
                {paused ? '▶ Play' : '⏸ Pause'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {step === STEPS.length - 1 ? (
                <Link to="/register" style={{ background: GOLD, color: NAVY, border: 'none', borderRadius: 8, padding: isBox ? '7px 14px' : '8px 18px', fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
                  Join Free →
                </Link>
              ) : (
                <button onClick={next} style={{ background: current.color, color: current.color === GOLD ? NAVY : 'var(--fg-100)', border: 'none', borderRadius: 8, padding: isBox ? '7px 14px' : '8px 18px', fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step counter + fullscreen link */}
      <p style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-25)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>{step + 1} of {STEPS.length} · Auto-advances · <button onClick={() => setPaused(p => !p)} style={{ background: 'none', border: 'none', color: 'var(--fg-3)', fontFamily: F.body, fontSize: 12, cursor: 'pointer', padding: 0 }}>{paused ? 'resume' : 'pause'}</button></span>
        {fullScreenLink && (
          <Link to="/tour" onClick={onClose} style={{ color: GOLD, fontFamily: F.body, fontSize: 12, fontWeight: 600, textDecoration: 'none', borderLeft: '1px solid var(--fg-15)', paddingLeft: 10 }}>
            ⤢ View full screen
          </Link>
        )}
      </p>

      {!isBox && (
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <Link to="/" style={{ fontFamily: F.body, fontSize: 12, color: 'var(--fg-3)', textDecoration: 'none' }}>← Back to site</Link>
          <Link to="/register" style={{ fontFamily: F.body, fontSize: 12, color: GOLD, textDecoration: 'none', fontWeight: 600 }}>Join Free →</Link>
        </div>
      )}
    </div>
  )
}
