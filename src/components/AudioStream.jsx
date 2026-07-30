import { useState, useRef, useEffect } from 'react'
import { C, F, API } from '../lib/tokens.js'
import { Btn } from './ui.jsx'

// ─────────────────────────────────────────────────────────────
// AudioStream — LiveKit Cloud v2
// CDN: https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js
// Global namespace: LivekitClient (NOT window.Peer)
// ─────────────────────────────────────────────────────────────

const LIVEKIT_CDN = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js'

function loadLiveKit() {
  return new Promise((resolve, reject) => {
    if (window.LivekitClient) { resolve(window.LivekitClient); return }
    const s = document.createElement('script')
    s.src = LIVEKIT_CDN
    s.onload = () => {
      if (window.LivekitClient) resolve(window.LivekitClient)
      else reject(new Error('LivekitClient not found in global scope after loading'))
    }
    s.onerror = () => reject(new Error('Failed to load LiveKit SDK from CDN'))
    document.head.appendChild(s)
  })
}

// ── Host Broadcaster ─────────────────────────────────────────

export function HostBroadcaster({ sessionId, token, zoomLink, onEnd }) {
  const [status, setStatus] = useState('idle')
  const [listenerCount, setListenerCount] = useState(0)
  const [recordingSize, setRecordingSize] = useState(0)
  const [msg, setMsg] = useState('')
  const roomRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  // Second, parallel recorder capturing a WebKit-playable format (mp4/aac)
  // whenever the browser supports it, so iOS Safari/Firefox have a native
  // fallback instead of only ever getting webm/opus.
  const mp4RecorderRef = useRef(null)
  const mp4ChunksRef = useRef([])
  const micStreamRef = useRef(null)

  const startBroadcast = async () => {
    setStatus('connecting')
    setMsg('')
    try {
      // 1. Get token from our API
      const res = await fetch(`${API}/armchair/livekit-token?session_id=${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!data.token) throw new Error(data.error || 'Could not get session token')
      if (!data.wsUrl || data.wsUrl.includes('your-project')) {
        throw new Error('LiveKit WebSocket URL not configured. Please add LIVEKIT_WS_URL to Cloudflare environment variables.')
      }

      // 2. Load LiveKit SDK
      const LK = await loadLiveKit()

      // 3. Create and connect room
      const room = new LK.Room({
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      roomRef.current = room

      room.on(LK.RoomEvent.ParticipantConnected, () => {
        setListenerCount(room.remoteParticipants.size)
      })
      room.on(LK.RoomEvent.ParticipantDisconnected, () => {
        setListenerCount(room.remoteParticipants.size)
      })
      room.on(LK.RoomEvent.Disconnected, () => {
        setStatus('idle')
        setMsg('Disconnected from room.')
      })

      await room.connect(data.wsUrl, data.token)
      await room.localParticipant.setMicrophoneEnabled(true)
      setStatus('broadcasting')
      setListenerCount(room.remoteParticipants.size)

      // 4. Also grab mic stream for local recording
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        micStreamRef.current = micStream

        const recorder = new MediaRecorder(micStream, { mimeType: 'audio/webm;codecs=opus' })
        recorderRef.current = recorder
        recorder.ondataavailable = e => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
            setRecordingSize(s => s + e.data.size)
          }
        }
        recorder.start(5000)

        // Best-effort second recording in a WebKit-playable container. Not
        // every browser supports recording straight to mp4, so this is
        // feature-detected — if unsupported, we simply fall back to the
        // webm-only behaviour we already had (no regression either way).
        if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported('audio/mp4')) {
          try {
            const mp4Recorder = new MediaRecorder(micStream, { mimeType: 'audio/mp4' })
            mp4RecorderRef.current = mp4Recorder
            mp4Recorder.ondataavailable = e => {
              if (e.data.size > 0) mp4ChunksRef.current.push(e.data)
            }
            mp4Recorder.start(5000)
          } catch (mp4Err) {
            console.warn('MP4 local recording unavailable:', mp4Err.message)
          }
        }
      } catch (recErr) {
        console.warn('Local recording unavailable:', recErr.message)
      }

    } catch (e) {
      console.error('Host broadcast error:', e)
      setStatus('idle')
      setMsg(`❌ ${e.message}`)
    }
  }

  const endBroadcast = async () => {
    setStatus('saving')
    setMsg('Ending session and saving recording…')

    // Stop both recorders cleanly
    await Promise.all([
      new Promise(resolve => {
        if (!recorderRef.current || recorderRef.current.state === 'inactive') { resolve(); return }
        recorderRef.current.onstop = resolve
        recorderRef.current.stop()
      }),
      new Promise(resolve => {
        if (!mp4RecorderRef.current || mp4RecorderRef.current.state === 'inactive') { resolve(); return }
        mp4RecorderRef.current.onstop = resolve
        mp4RecorderRef.current.stop()
      })
    ])
    await new Promise(r => setTimeout(r, 400))

    // Disconnect LiveKit and stop mic
    micStreamRef.current?.getTracks().forEach(t => t.stop())
    await roomRef.current?.disconnect()

    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

      // Auto-download to computer
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `armchair-${sessionId}-${new Date().toISOString().slice(0,10)}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Upload primary (webm) recording to R2
      setMsg('⏫ Uploading to site library…')
      let webmOk = false
      try {
        const res = await fetch(`${API}/armchair/recordings/upload?session_id=${sessionId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'audio/webm' },
          body: blob
        })
        const data = await res.json()
        webmOk = !!data.ok
        setMsg(data.ok
          ? '✅ Session ended. Recording saved to library and downloaded to your computer.'
          : `⚠️ Library upload failed (${data.error}) — file downloaded to your computer.`)
      } catch {
        setMsg('⚠️ Library upload failed — but the file downloaded to your computer.')
        await fetch(`${API}/armchair/manage`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ session_id: sessionId, status: 'ended' })
        })
      }

      // Upload secondary (mp4) recording, if we managed to capture one —
      // this is what makes playback
