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

    // Stop recorder cleanly
    await new Promise(resolve => {
      if (!recorderRef.current || recorderRef.current.state === 'inactive') { resolve(); return }
      recorderRef.current.onstop = resolve
      recorderRef.current.stop()
    })
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

      // Upload to R2
      setMsg('⏫ Uploading to site library…')
      try {
        const res = await fetch(`${API}/armchair/recordings/upload?session_id=${sessionId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'audio/webm' },
          body: blob
        })
        const data = await res.json()
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
    } else {
      setMsg('Session ended. No audio was captured (microphone may not have been enabled).')
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
    micStreamRef.current?.getTracks().forEach(t => t.stop())
    roomRef.current?.disconnect()
  }, [])

  return (
    <div style={{ background: status === 'broadcasting' ? '#FEF2F2' : C.parchment, borderRadius: 12, padding: '18px 20px', marginBottom: 16, border: `1px solid ${status === 'broadcasting' ? '#FECACA' : '#D4C9AE'}` }}>
      <p style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🎙 Host Broadcast Controls
      </p>

      {msg && (
        <p style={{ fontFamily: F.body, fontSize: 13, marginBottom: 12, color: msg.startsWith('❌') ? '#DC2626' : msg.startsWith('✅') ? '#15803D' : '#5a6472' }}>
          {msg}
        </p>
      )}

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn variant="primary" onClick={startBroadcast}>🎙 Start Live Audio</Btn>
          {zoomLink && (
            <a href={zoomLink} target="_blank" rel="noreferrer">
              <Btn variant="outline">📹 Open Zoom / Video</Btn>
            </a>
          )}
        </div>
      )}

      {status === 'connecting' && (
        <p style={{ fontFamily: F.body, fontSize: 13, color: '#5a6472' }}>Connecting to broadcast room…</p>
      )}

      {status === 'broadcasting' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}/>
            <span style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 600, color: '#DC2626' }}>
              LIVE — {listenerCount} listener{listenerCount !== 1 ? 's' : ''} connected
            </span>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 12, color: '#5a6472', marginBottom: 12 }}>
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
        <p style={{ fontFamily: F.body, fontSize: 13, color: status === 'ended' ? '#15803D' : '#5a6472' }}>{msg}</p>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .pulse-dot { animation: pulse 1.2s infinite }
      `}</style>
    </div>
  )
}

// ── Listener Receiver ─────────────────────────────────────────

export function ListenerReceiver({ sessionId, zoomLink }) {
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const roomRef = useRef(null)

  const connect = async () => {
    setStatus('connecting')
    setErrorMsg('')

    if (roomRef.current) {
      await roomRef.current.disconnect()
      roomRef.current = null
    }

    try {
      // Get token (no auth — listeners don't need to be logged in)
      const res = await fetch(`${API}/armchair/livekit-token?session_id=${sessionId}`)
      const data = await res.json()

      if (!data.token) throw new Error(data.error || 'Could not get session token')
      if (!data.wsUrl || data.wsUrl.includes('your-project')) {
        throw new Error('Live audio not configured. Please use the Zoom link instead.')
      }

      const LK = await loadLiveKit()
      const room = new LK.Room()
      roomRef.current = room

      // Handle incoming audio
      room.on(LK.RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === LK.Track.Kind.Audio) {
          const el = track.attach()
          el.autoplay = true
          document.body.appendChild(el)
          el.play().catch(() => {})
          setStatus('connected')
        }
      })

      room.on(LK.RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach(el => el.remove())
      })

      room.on(LK.RoomEvent.Disconnected, () => {
        setStatus('idle')
      })

      room.on(LK.RoomEvent.ParticipantDisconnected, participant => {
        if (participant.identity?.startsWith('host-')) {
          setStatus('idle')
          setErrorMsg('The host has ended the broadcast.')
        }
      })

      await room.connect(data.wsUrl, data.token)

      // Wait up to 15s for host audio track
      let waited = 0
      const check = setInterval(() => {
        waited += 500
        // Check if any remote participant has an audio track
        const hasAudio = [...room.remoteParticipants.values()].some(p =>
          [...p.trackPublications.values()].some(pub =>
            pub.kind === LK.Track.Kind.Audio && pub.isSubscribed && pub.track
          )
        )
        if (hasAudio) {
          clearInterval(check)
          setStatus('connected')
        } else if (waited >= 15000) {
          clearInterval(check)
          setErrorMsg('Connected to room but no audio from host yet. Wait a moment and retry, or ensure the host has clicked "Start Live Audio".')
          setStatus('failed')
        }
      }, 500)

    } catch (e) {
      console.error('Listener error:', e)
      setErrorMsg(e.message || 'Connection failed — please retry.')
      setStatus('failed')
    }
  }

  const disconnect = async () => {
    await roomRef.current?.disconnect()
    roomRef.current = null
    setStatus('idle')
    setErrorMsg('')
  }

  useEffect(() => () => { roomRef.current?.disconnect() }, [])

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
          <span style={{ fontFamily: F.body, fontSize: 12.5, color: '#5a6472' }}>
            Click to hear the live conversation
          </span>
        </div>
      )}

      {status === 'connecting' && (
        <p style={{ fontFamily: F.body, fontSize: 13, color: '#5a6472' }}>
          Connecting to live room…
        </p>
      )}

      {status === 'connected' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803D', display: 'inline-block' }}/>
          <span style={{ fontFamily: F.body, fontSize: 13, color: '#15803D', fontWeight: 600 }}>
            🎧 Connected — listening live
          </span>
          <button onClick={disconnect} style={{ background: 'none', border: 'none', color: '#5a6472', fontSize: 12, cursor: 'pointer', fontFamily: F.body }}>
            Disconnect
          </button>
        </div>
      )}

      {status === 'failed' && (
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

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .pulse-dot { animation: pulse 1.2s infinite }
      `}</style>
    </div>
  )
}
