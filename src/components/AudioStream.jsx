import { useState, useRef, useEffect } from 'react'
import { C, F, API } from '../lib/tokens.js'
import { Btn } from './ui.jsx'

// ─────────────────────────────────────────────────────────────
// AudioStream — PeerJS + Metered TURN
// Host broadcasts audio to all listeners via PeerJS cloud signalling
// Metered TURN relay ensures connections work across all networks
// Falls back to Zoom link if provided
// ─────────────────────────────────────────────────────────────

const PEERJS_CDN = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'

// Load PeerJS from CDN once
function loadPeerJS() {
  return new Promise((resolve, reject) => {
    if (window.Peer) { resolve(window.Peer); return }
    const s = document.createElement('script')
    s.src = PEERJS_CDN
    s.onload = () => resolve(window.Peer)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// Get TURN credentials from Metered (free tier)
async function getIceServers(meteredApiKey) {
  if (!meteredApiKey) {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  }
  try {
    const res = await fetch(`https://discussionsexegetica.metered.live/api/v1/turn/credentials?apiKey=${meteredApiKey}`)
    const servers = await res.json()
    return servers
  } catch {
    return [{ urls: 'stun:stun.l.google.com:19302' }]
  }
}

// ── Host Broadcaster ─────────────────────────────────────────
export function HostBroadcaster({ sessionId, token, zoomLink, onEnd }) {
  const [status, setStatus] = useState('idle')
  const [listenerCount, setListenerCount] = useState(0)
  const [recordingSize, setRecordingSize] = useState(0)
  const [uploadMsg, setUploadMsg] = useState('')
  const peerRef = useRef(null)
  const streamRef = useRef(null)
  const connectionsRef = useRef({})
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  const startBroadcast = async () => {
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      setStatus('connecting')

      const Peer = await loadPeerJS()
      const iceServers = await getIceServers(null) // add Metered key here once you have it

      const peer = new Peer(`host-${sessionId}`, {
        config: { iceServers },
        debug: 0
      })
      peerRef.current = peer

      peer.on('open', () => {
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
        recorder.start(5000)
      })

      // When a listener connects, send them the audio stream
      peer.on('call', call => {
        call.answer(stream)
        const id = call.peer
        connectionsRef.current[id] = call
        setListenerCount(Object.keys(connectionsRef.current).length)
        call.on('close', () => {
          delete connectionsRef.current[id]
          setListenerCount(Object.keys(connectionsRef.current).length)
        })
      })

      peer.on('error', err => {
        console.error('PeerJS host error:', err.type, err)
        if (err.type === 'unavailable-id') {
          // Previous session's peer ID still registered — wait and retry
          peer.destroy()
          setTimeout(startBroadcast, 3000)
        } else {
          setStatus('idle')
          alert(`Broadcast error (${err.type}): ${err.message || 'Please try again.'}`)
        }
      })

    } catch (err) {
      console.error('Broadcast error:', err)
      setStatus('idle')
      alert('Could not access microphone. Please allow microphone access and try again.')
    }
  }

  const endBroadcast = async () => {
    setStatus('saving')

    // Stop recorder and wait for all chunks
    await new Promise(resolve => {
      if (!recorderRef.current || recorderRef.current.state === 'inactive') { resolve(); return }
      recorderRef.current.onstop = resolve
      recorderRef.current.stop()
    })
    await new Promise(r => setTimeout(r, 400))

    // Close connections and mic
    Object.values(connectionsRef.current).forEach(c => c.close())
    peerRef.current?.destroy()
    streamRef.current?.getTracks().forEach(t => t.stop())

    // 1. Auto-download recording to computer
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

      // Download to computer
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `armchair-session-${sessionId}-${new Date().toISOString().slice(0,10)}.webm`
      a.click()
      URL.revokeObjectURL(url)

      // 2. Upload to R2
      setUploadMsg('Uploading to library…')
      try {
        const res = await fetch(`${API}/armchair/recordings/upload?session_id=${sessionId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'audio/webm' },
          body: blob
        })
        const data = await res.json()
        if (data.ok) {
          setUploadMsg('✅ Recording saved to library')
        } else {
          setUploadMsg(`⚠️ Upload failed: ${data.error} — but the file downloaded to your computer.`)
        }
      } catch (e) {
        setUploadMsg('⚠️ Upload to library failed — but the file downloaded to your computer.')
      }
    } else {
      setUploadMsg('No audio was captured.')
      // Mark session ended in DB even with no recording
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
    peerRef.current?.destroy()
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  return (
    <div style={{ background: status === 'broadcasting' ? '#FEF2F2' : C.parchment, borderRadius: 12, padding: '18px 20px', marginBottom: 16, border: `1px solid ${status === 'broadcasting' ? '#FECACA' : C.border}` }}>
      <p style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🎙 Host Broadcast Controls
      </p>

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn variant="primary" onClick={startBroadcast}>🎙 Start Native Audio</Btn>
          {zoomLink && (
            <a href={zoomLink} target="_blank" rel="noreferrer">
              <Btn variant="outline">📹 Open Zoom/Video Link</Btn>
            </a>
          )}
        </div>
      )}

      {status === 'requesting' && <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>Requesting microphone access…</p>}
      {status === 'connecting' && <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>Connecting to broadcast network…</p>}

      {status === 'broadcasting' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} className="pulse-dot"/>
            <span style={{ fontFamily: F.body, fontSize: 13.5, fontWeight: 600, color: '#DC2626' }}>
              LIVE — {listenerCount} listener{listenerCount !== 1 ? 's' : ''} connected
            </span>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Recording: {(recordingSize / 1024).toFixed(0)} KB captured
          </p>
          <Btn variant="outline" onClick={endBroadcast}>⏹ End Session & Save Recording</Btn>
          {zoomLink && (
            <a href={zoomLink} target="_blank" rel="noreferrer" style={{ marginLeft: 10 }}>
              <Btn variant="ghost">📹 Also open Zoom</Btn>
            </a>
          )}
        </div>
      )}

      {status === 'saving' && <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>⏫ Saving recording — please wait, do not close this page…</p>}
      {status === 'ended' && <p style={{ fontFamily: F.body, fontSize: 13, color: '#15803D', fontWeight: 600 }}>{uploadMsg || '✅ Session ended.'}</p>}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} .pulse-dot{animation:pulse 1.2s infinite}`}</style>
    </div>
  )
}

// ── Listener Receiver ─────────────────────────────────────────
export function ListenerReceiver({ sessionId, zoomLink }) {
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const peerRef = useRef(null)
  const audioRef = useRef(null)
  const listenerId = useRef('l-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7))

  const connect = async () => {
    setStatus('connecting')
    setErrorMsg('')

    // Destroy any previous peer cleanly
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
      await new Promise(r => setTimeout(r, 500))
    }

    try {
      const Peer = await loadPeerJS()
      const iceServers = await getIceServers(null)

      // Use a unique ID each time to avoid collisions
      const peer = new Peer(listenerId.current + '-' + Date.now(), {
        config: { iceServers },
        debug: 0
      })
      peerRef.current = peer

      peer.on('error', err => {
        console.error('Listener peer error type:', err.type, err)
        peerRef.current = null

        if (err.type === 'peer-unavailable') {
          setErrorMsg('Host audio not available yet — the host may still be setting up. Please wait a moment and retry.')
        } else if (err.type === 'network' || err.type === 'disconnected') {
          setErrorMsg('Network connection lost. Please check your internet and retry.')
        } else if (err.type === 'server-error') {
          setErrorMsg('Could not reach the audio server. Please retry in a few seconds.')
        } else {
          setErrorMsg(`Connection error (${err.type}) — please retry.`)
        }
        setStatus('failed')
      })

      peer.on('open', () => {
        // Small delay to ensure host peer is fully registered
        setTimeout(() => {
          if (!peerRef.current) return

          try {
            // Call host with empty stream — host sends back their audio
            const call = peer.call(`host-${sessionId}`, new MediaStream())

            if (!call) {
              setErrorMsg('Could not reach host audio. Make sure the host has started broadcasting.')
              setStatus('failed')
              return
            }

            let streamReceived = false

            call.on('stream', remoteStream => {
              streamReceived = true
              if (audioRef.current) {
                audioRef.current.srcObject = remoteStream
                audioRef.current.play().catch(e => console.warn('Audio play error:', e))
                setStatus('connected')
              }
            })

            call.on('error', err => {
              console.error('Call error:', err)
              setErrorMsg('Audio call failed — please retry.')
              setStatus('failed')
            })

            call.on('close', () => {
              if (status === 'connected') setStatus('idle')
            })

            // Timeout if no stream received in 25 seconds
            setTimeout(() => {
              if (!streamReceived && status !== 'connected') {
                setErrorMsg('No audio received after 25 seconds. The host may not have started their microphone yet.')
                setStatus('failed')
              }
            }, 25000)

          } catch (e) {
            console.error('Call setup error:', e)
            setErrorMsg('Failed to initiate audio call — please retry.')
            setStatus('failed')
          }
        }, 1500)
      })

    } catch (e) {
      console.error('Listener init error:', e)
      setErrorMsg('Failed to load audio system — please refresh the page and try again.')
      setStatus('failed')
    }
  }

  const disconnect = () => {
    peerRef.current?.destroy()
    peerRef.current = null
    if (audioRef.current) audioRef.current.srcObject = null
    setStatus('idle')
    setErrorMsg('')
  }

  useEffect(() => () => {
    peerRef.current?.destroy()
  }, [])

  return (
    <div style={{ background: C.mist, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
      <audio ref={audioRef} autoPlay style={{ width: '100%', marginBottom: 8, display: status === 'connected' ? 'block' : 'none' }}/>

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
          Connecting to live audio… (this may take up to 30 seconds)
        </p>
      )}

      {status === 'connected' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.body, fontSize: 12.5, color: '#15803D', fontWeight: 600 }}>
            🎧 Connected — listening live
          </span>
          <button onClick={disconnect} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: F.body }}>
            Disconnect
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div>
          <p style={{ fontFamily: F.body, fontSize: 13, color: '#DC2626', marginBottom: 10 }}>
            {errorMsg || 'Could not connect to live audio.'}
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
    </div>
  )
}
