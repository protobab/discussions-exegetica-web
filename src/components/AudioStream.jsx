import { useState, useRef, useEffect } from 'react'
import { C, F, API } from '../lib/tokens.js'
import { Btn } from './ui.jsx'
import { useAuth } from '../lib/auth.jsx'

// ─────────────────────────────────────────────────────────────
// WebRTC Signalling via Cloudflare KV polling
// Host creates an offer, stores it in KV via API.
// Listeners poll for the offer, send answers back.
// Simple but effective for up to ~50 listeners.
// ─────────────────────────────────────────────────────────────

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

// ── Host Broadcaster ─────────────────────────────────────────

export function HostBroadcaster({ sessionId, token, onEnd }) {
  const [status, setStatus] = useState('idle') // idle | capturing | broadcasting | ended
  const [listenerCount, setListenerCount] = useState(0)
  const [recordingSize, setRecordingSize] = useState(0)
  const streamRef = useRef(null)
  const peersRef = useRef({})
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const pollRef = useRef(null)

  const startBroadcast = async () => {
    setStatus('capturing')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      setStatus('broadcasting')

      // Start recording
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      recorderRef.current = recorder
      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
          setRecordingSize(s => s + e.data.size)
        }
      }
      recorder.start(5000) // collect chunks every 5s

      // Signal "host is live" to listeners via API
      await fetch(`${API}/armchair/signal?session=${sessionId}&type=host_live`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ts: Date.now() })
      })

      // Poll for listener answers
      pollRef.current = setInterval(() => pollAnswers(), 3000)

    } catch (err) {
      setStatus('idle')
      alert('Microphone access denied. Please allow microphone access in your browser and try again.')
    }
  }

  const pollAnswers = async () => {
    try {
      const res = await fetch(`${API}/armchair/signal?session=${sessionId}&type=answer`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      for (const answer of (data.signals || [])) {
        if (!peersRef.current[answer.listener_id] && streamRef.current) {
          await connectListener(answer)
        }
      }
      setListenerCount(Object.keys(peersRef.current).length)
    } catch {}
  }

  const connectListener = async (answer) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    peersRef.current[answer.listener_id] = pc
    streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current))
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    // Send offer to this specific listener
    await fetch(`${API}/armchair/signal?session=${sessionId}&type=offer&listener=${answer.listener_id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdp: offer })
    })

    // Set listener's answer as remote description
    await pc.setRemoteDescription(new RTCSessionDescription(answer.sdp))
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        delete peersRef.current[answer.listener_id]
        setListenerCount(Object.keys(peersRef.current).length)
      }
    }
  }

  const endBroadcast = async () => {
    clearInterval(pollRef.current)
    setStatus('ended')

    // Stop recording
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
      await new Promise(r => setTimeout(r, 500)) // wait for final chunk
    }

    // Close all peer connections
    Object.values(peersRef.current).forEach(pc => pc.close())
    streamRef.current?.getTracks().forEach(t => t.stop())

    // Upload recording to R2
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setStatus('uploading')
      try {
        await fetch(`${API}/armchair/recordings/upload?session_id=${sessionId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'audio/webm' },
          body: blob
        })
        setStatus('saved')
      } catch {
        setStatus('ended')
      }
    }

    onEnd?.()
  }

  useEffect(() => () => {
    clearInterval(pollRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  return (
    <div style={{ background: status === 'broadcasting' ? '#FEF2F2' : C.parchment, borderRadius: 12, padding: '18px 20px', marginBottom: 16, border: `1px solid ${status === 'broadcasting' ? '#FECACA' : C.border}` }}>
      <p style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🎙 Host Audio Controls
      </p>

      {status === 'idle' && (
        <Btn variant="primary" onClick={startBroadcast}>🎙 Start Broadcasting</Btn>
      )}
      {status === 'capturing' && (
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>Accessing microphone…</p>
      )}
      {status === 'broadcasting' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
            <span style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 600, color: '#DC2626' }}>LIVE — {listenerCount} listener{listenerCount !== 1 ? 's' : ''} connected</span>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Recording: {(recordingSize / 1024).toFixed(0)} KB captured
          </p>
          <Btn variant="outline" onClick={endBroadcast}>⏹ End Session & Save Recording</Btn>
        </div>
      )}
      {status === 'uploading' && (
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>⏫ Saving recording to library…</p>
      )}
      {status === 'saved' && (
        <p style={{ fontFamily: F.body, fontSize: 13, color: '#15803D', fontWeight: 600 }}>✅ Session ended and recording saved to the library.</p>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}

// ── Listener Receiver ─────────────────────────────────────────

export function ListenerReceiver({ sessionId, roomId }) {
  const [status, setStatus] = useState('waiting') // waiting | connecting | connected | failed
  const pcRef = useRef(null)
  const audioRef = useRef(null)
  const listenerId = useRef('l_' + Math.random().toString(36).slice(2, 9))

  const connect = async () => {
    setStatus('connecting')
    try {
      // Request an offer from host via API
      await fetch(`${API}/armchair/signal?session=${sessionId}&type=listener_ready&listener=${listenerId.current}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listener_id: listenerId.current })
      })

      // Poll for offer from host
      let offer = null
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const res = await fetch(`${API}/armchair/signal?session=${sessionId}&type=offer&listener=${listenerId.current}`)
        const data = await res.json()
        if (data.sdp) { offer = data.sdp; break }
      }

      if (!offer) { setStatus('failed'); return }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      pcRef.current = pc

      pc.ontrack = e => {
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0]
          audioRef.current.play().catch(() => {})
          setStatus('connected')
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      // Send answer back to host
      await fetch(`${API}/armchair/signal?session=${sessionId}&type=answer&listener=${listenerId.current}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listener_id: listenerId.current, sdp: answer })
      })

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') setStatus('failed')
      }

    } catch { setStatus('failed') }
  }

  useEffect(() => () => { pcRef.current?.close() }, [])

  return (
    <div style={{ background: C.mist, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
      <audio ref={audioRef} autoPlay controls style={{ width: '100%', marginBottom: status === 'connected' ? 8 : 0 }}/>
      {status === 'waiting' && (
        <div>
          <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, marginBottom: 8 }}>Click to connect to the live audio stream.</p>
          <Btn variant="primary" onClick={connect}>🎧 Connect to Live Audio</Btn>
        </div>
      )}
      {status === 'connecting' && <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>Connecting… (this may take up to 30 seconds)</p>}
      {status === 'connected' && <p style={{ fontFamily: F.body, fontSize: 12.5, color: '#15803D', fontWeight: 600 }}>🎧 Connected — listening live</p>}
      {status === 'failed' && (
        <div>
          <p style={{ fontFamily: F.body, fontSize: 13, color: '#DC2626', marginBottom: 8 }}>Connection failed. The host may not have started streaming yet.</p>
          <Btn variant="outline" onClick={connect}>Retry</Btn>
        </div>
      )}
    </div>
  )
}
