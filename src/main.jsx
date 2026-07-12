
// Register service worker for PWA / offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      console.log('[SW] Registered scope:', reg.scope)
      // Check for updates every hour
      setInterval(() => reg.update(), 60 * 60 * 1000)
    } catch (err) {
      console.warn('[SW] Registration failed:', err)
    }
  })
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
