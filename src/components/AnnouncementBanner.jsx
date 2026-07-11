import { useEffect, useState } from 'react'
import { C, F } from '../lib/tokens.js'

const TYPE_STYLES = {
  info:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: 'ℹ️' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', color: '#15803D', icon: '✅' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', icon: '⚠️' },
  gold:    { bg: C.navy,    border: C.gold,     color: '#fff',    icon: '📢' },
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/announcement')
      .then(r => r.json())
      .then(d => {
        if (!d.announcement) return
        // Check if expired
        if (d.announcement.expires_at && new Date(d.announcement.expires_at) < new Date()) return
        // Check if dismissed this session
        const key = `dismissed_ann_${d.announcement.created_at}`
        if (sessionStorage.getItem(key)) return
        setAnnouncement(d.announcement)
      }).catch(() => {})
  }, [])

  const dismiss = () => {
    if (announcement) {
      sessionStorage.setItem(`dismissed_ann_${announcement.created_at}`, '1')
    }
    setDismissed(true)
  }

  if (!announcement || dismissed) return null

  const s = TYPE_STYLES[announcement.type] || TYPE_STYLES.info

  return (
    <div style={{
      background: s.bg, borderBottom: `1px solid ${s.border}`,
      padding: '10px 20px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 12, flexWrap: 'wrap', position: 'relative'
    }}>
      <span style={{ fontSize: 16 }}>{s.icon}</span>
      <p style={{ fontFamily: F.body, fontSize: 13.5, color: s.color, margin: 0, lineHeight: 1.5, maxWidth: 800, textAlign: 'center' }}>
        {announcement.text}
      </p>
      <button onClick={dismiss} style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: s.color, fontSize: 16,
        cursor: 'pointer', opacity: 0.6, padding: 4, lineHeight: 1
      }}>✕</button>
    </div>
  )
}
