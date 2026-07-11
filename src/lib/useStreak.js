import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth.jsx'
import { API } from './tokens.js'

export function useStreak() {
  const { user, token } = useAuth()
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [lastThread, setLastThread] = useState(null)
  const [lastBibleRef, setLastBibleRef] = useState(null)

  useEffect(() => {
    if (!user || !token) return
    fetch(`${API}/streak`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setStreak(d.streak || 0)
        setLongestStreak(d.longestStreak || 0)
        setLastThread(d.lastThread || null)
        setLastBibleRef(d.lastBibleRef || null)
      }).catch(() => {})
  }, [user, token])

  const recordActivity = useCallback(async (type, ref) => {
    if (!user || !token) return
    try {
      const res = await fetch(`${API}/streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, ref })
      })
      const d = await res.json()
      if (d.streak !== undefined) setStreak(d.streak)
      if (d.longestStreak !== undefined) setLongestStreak(d.longestStreak)
    } catch {}
  }, [user, token])

  return { streak, longestStreak, lastThread, lastBibleRef, recordActivity }
}
