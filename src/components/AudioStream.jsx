import { useState, useRef, useEffect } from 'react'
import { C, F, API } from '../lib/tokens.js'
import { Btn } from './ui.jsx'

// ─────────────────────────────────────────────────────────────
// AudioStream — LiveKit Cloud
// Host publishes audio to a LiveKit room
// Listeners subscribe and hear it in real time
// Works across all browsers and networks
// Falls back to Zoom link if provided
// ─────────────────────────────────────────────────────────────

const LIVEKIT_CDN = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js'

function loadLiveKit() {
  return new Promise((resolve, reject) => {
    if (window.LivekitClient) { resolve(window.LivekitClient); return }
    const s = document.createElement('script')
    s.src = LIVEKIT_CDN
    s.onload = () => resolve(window.LivekitClient)
    s.onerror = () => reject(new Error('Failed to load LiveKit SDK'))
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
  const streamRef = useRef(null)

  const startBroadcast = async () => {
    setStatus('connecting')
    try {
      // Get LiveKit token
      const res = await fetch(`${API}/armchair/livekit-token?session_id=${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!data.token) throw new Error(data.error || 'Could not get session token')
      if (data.wsUrl.includes('your-project')) throw new Error('LiveKit not configured yet — please add LIVEKIT_WS_URL to Cloudflare environment variables')

      const LK = await loadLiveKit()
      const room = new LK.Room({
        audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
      roomRef.current = room

      // Track participant count
      room.on(LK.RoomEvent.ParticipantConnected, () => setListenerCount(room.remoteParticipants.size))
      room.on(LK.RoomEvent.ParticipantDisconnected, () => setListenerCount(room.remoteParticipants.size))

      await room.connect(data.wsUrl, data.token)
      await room.localParticipant.setMicrophoneEnabled(true)
      setStatus('broadcasting')
      setListenerCount(room.remoteParticipants.size)

      // Start recording via MediaRecorder on the mic stream
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = micStream
        const recorder = new MediaRecorder(micStream, { mimeType: 'audio/webm;codecs=opus' })
        recorderRef.current = recorder
        recorder.ondataavailable = e => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
            setRecordingSize(s => s + e.data.size)
          }
        }
        recorder.start(5000)
      } catch (e) {
        console.warn('Recording not available:', e)
      }

    } catch (e) {
      console.error('Broadcast error:', e)
      setStatus('idle')
      setMsg(`❌ ${e.message}`)
    }
  }

  const endBroadcast = async () => {
    setStatus('saving')
    setMsg('Ending session and saving recording…')

    // Stop recorder — wait for all chunks
    await new Promise(resolve => {
      if (!recorderRef.current || recorderRef.current.state === 'inactive') { resolve(); return }
      recorderRef.current.onstop = resolve
      recorderRef.current.stop()
    })
    await new Promise(r => setTimeout(r, 400))

    // Disconnect from LiveKit
    streamRef.current?.getTracks().forEach(t => t.stop())
    await roomRef.current?.disconnect()

    // Save recording
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

      // 1. Download to computer
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `armchair-${sessionId}-${new Date().toISOString().slice(0,10)}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // 2. Upload to R2
      setMsg('⏫ Uploading recording to site library…')
      try {
        const res = await fetch(`${API}/armchair/recordings/upload?session_id=${sessionId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'audio/webm' },
          body: blob
        })
        const data = await res.json()
        setMsg(data.ok
          ? '✅ Session ended. Recording saved to library and downloaded to your computer.'
          : `⚠️ Uploaded failed (${data.error}) — but the file downloaded to your computer.`)
      } catch {
        setMsg('⚠️ Upload to library failed — but the file downloaded to your computer.')
        // Still mark session ended
        await fetch(`${API}/armchair/manage`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ session_id: sessionId, status: 'ended' })
        })
      }
    } else {
      setMsg('Session ended. No audio was captured.')
      await fetch(`${API}/armchair/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ session_id: sessionId, status: 'ended' })
      })
    }

    setStatus('ended')
    onEnd?.()
  }

  useEffect(() => () => {
    recorderRef.current?.state !== 'inactive' && recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    roomRef.current?.disconnect()
  }, [])

  return (
    <div style={{ background: status === 'broadcasting' ? '#FEF2F2' : C.parchment, borderRadius: 12, padding: '18px 20px', marginBottom: 16, border: `1px solid ${status === 'broadcasting' ? '#FECACA' : C.border}` }}>
      <p style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🎙 Host Broadcast Controls
      </p>

      {msg && <p style={{ fontFamily: F.body, fontSize: 13, color: msg.startsWith('❌') ? '#DC2626' : msg.startsWith('✅') ? '#15803D' : C.muted, marginBottom: 12 }}>{msg}</p>}

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn variant="primary" onClick={startBroadcast}>🎙 Start Live Audio</Btn>
          {zoomLink && (
            <a href={zoomLink} target="_blank" rel="noreferrer">
              <Btn variant="outline">📹 Open Zoom / Video Link</Btn>
            </a>
          )}
        </div>
      )}

      {status === 'connecting' && <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>Connecting to broadcast room…</p>}

      {status === 'broadcasting' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}/>
            <span style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 600, color: '#DC2626' }}>
              LIVE — {listenerCount} listener{listenerCount !== 1 ? 's' : ''} connected
            </span>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Recording: {(recordingSize / 1024).toFixed(0)} KB captured
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn variant="outline" onClick={endBroadcast}>⏹ End Session & Save Recording</Btn>
            {zoomLink && (
              <a href={zoomLink} target="_blank" rel="noreferrer">
                <Btn variant="ghost">📹 Also open Zoom</Btn>
              </a>
            )}
          </div>
        </div>
      )}

      {(status === 'saving' || status === 'ended') && (
        <p style={{ fontFamily: F.body, fontSize: 13, color: status === 'ended' ? '#15803D' : C.muted }}>{msg}</p>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} .pulse-dot{animation:pulse 1.2s infinite}`}</style>
    </div>
  )
}

// ── Listener Receiver ─────────────────────────────────────────

export function ListenerReceiver({ sessionId, zoomLink }) {
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const roomRef = useRef(null)
  const audioElementsRef = useRef([])

  const connect = async () => {
    setStatus('connecting')
    setErrorMsg('')

    // Clean up previous connection
    if (roomRef.current) {
      await roomRef.current.disconnect()
      roomRef.current = null
    }
    audioElementsRef.current.forEach(el => { el.srcObject = null; el.remove() })
    audioElementsRef.current = []

    try {
      // Get LiveKit token (no auth needed for listeners)
      const res = await fetch(`${API}/armchair/livekit-token?session_id=${sessionId}`)
      const data = await res.json()

      if (!data.token) throw new Error(data.error || 'Could not get session token')
      if (data.wsUrl?.includes('your-project')) throw new Error('LiveKit not configured — please use the Zoom link instead')

      const LK = await loadLiveKit()
      const room = new LK.Room()
      roomRef.current = room

      // Handle incoming audio tracks
      room.on(LK.RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === LK.Track.Kind.Audio) {
          const audioEl = track.attach()
          audioEl.autoplay = true
          audioEl.style.display = 'none'
          document.body.appendChild(audioEl)
          audioElementsRef.current.push(audioEl)

          // Try to play immediately
          audioEl.play().catch(() => {
            // Autoplay blocked — we handle this with the UI button
          })

          setStatus('connected')
        }
      })

      room.on(LK.RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === LK.Track.Kind.Audio) {
          const elements = track.detach()
          elements.forEach(el => el.remove())
        }
      })

      room.on(LK.RoomEvent.Disconnected, () => {
        if (status === 'connected') {
          setStatus('idle')
          setErrorMsg('Disconnected from the live session.')
        }
      })

      room.on(LK.RoomEvent.ParticipantDisconnected, participant => {
        if (participant.identity?.startsWith('host-')) {
          setStatus('idle')
          setErrorMsg('The host has ended the broadcast.')
        }
      })

      await room.connect(data.wsUrl, data.token)

      // Check if host is already publishing
      const hasAudio = [...room.remoteParticipants.values()].some(p =>
        [...p.trackPublications.values()].some(pub => pub.kind === LK.Track.Kind.Audio && pub.isSubscribed)
      )
      if (hasAudio) setStatus('connected')
      else {
        // Waiting for host to start — set a timeout
        setTimeout(() => {
          if (status !== 'connected' && roomRef.current) {
            setErrorMsg('Connected to room — waiting for host to start broadcasting. You will hear audio automatically when they begin.')
          }
        }, 5000)
      }

    } catch (e) {
      console.error('Listener error:', e)
      setErrorMsg(e.message || 'Connection failed — please retry.')
      setStatus('failed')
    }
  }

  const disconnect = async () => {
    await roomRef.current?.disconnect()
    roomRef.current = null
    audioElementsRef.current.forEach(el => { el.srcObject = null; el.remove() })
    audioElementsRef.current = []
    setStatus('idle')
    setErrorMsg('')
  }

  // Start audio on user gesture (needed for Safari/iOS)
  const startAudio = () => {
    audioElementsRef.current.forEach(el => el.play().catch(() => {}))
  }

  useEffect(() => () => {
    roomRef.current?.disconnect()
    audioElementsRef.current.forEach(el => el.remove())
  }, [])

  return (
    <div style={{ background: C.mist, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Btn variant="primary" onClick={connect}>🎧 Connect to Live Audio</Btn>
          {zoomLink && (
            <a href={zoomLink} target="_blank" rel="noreferrer">
              <Btn variant="outline">📹 Join Video Instead</Btn>
            </a>
          )}
          <span style={{ fontFamily: F.body, fontSize: 12.5, color: C.muted }}>Click to hear the live conversation</span>
        </div>
      )}

      {status === 'connecting' && (
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>
          Connecting to live room… (this takes a few seconds)
        </p>
      )}

      {status === 'connected' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803D', display: 'inline-block' }}/>
            <span style={{ fontFamily: F.body, fontSize: 13, color: '#15803D', fontWeight: 600 }}>🎧 Connected — listening live</span>
            <button onClick={disconnect} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: F.body }}>Disconnect</button>
          </div>
          <button onClick={startAudio} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', fontFamily: F.body, fontSize: 11.5, color: C.muted, cursor: 'pointer' }}>
            🔊 Click if you can't hear audio (Safari fix)
          </button>
        </div>
      )}

      {(status === 'failed' || (status === 'connecting' && errorMsg)) && (
        <div>
          <p style={{ fontFamily: F.body, fontSize: 13, color: '#DC2626', marginBottom: 10 }}>
            {errorMsg || 'Connection failed.'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn variant="outline" onClick={connect}>Retry</Btn>
            {zoomLink && (
              <a href={zoomLink} target="_blank" rel="noreferrer">
                <Btn variant="ghost">📹 Try Video Instead</Btn>
              </a>
            )}
          </div>
        </div>
      )}

      {status === 'connecting' && errorMsg && (
        <p style={{ fontFamily: F.body, fontSize: 12.5, color: C.muted, marginTop: 8 }}>{errorMsg}</p>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} .pulse-dot{animation:pulse 1.2s infinite}`}</style>
    </div>
  )
}
