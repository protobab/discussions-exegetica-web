// sw.js — Discussions Exegetica Service Worker
// Handles offline caching, background sync, and push notifications

const CACHE_NAME = 'de-cache-v1'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
]

// ── Install: cache app shell ──────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL).catch(() => {
        // Fail silently if some resources aren't available
      })
    })
  )
  self.skipWaiting()
})

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first for API, cache-first for assets ──────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Always fetch API calls from network — never cache
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(fetch(event.request).catch(() => {
      // Return offline page for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/') 
      }
    }))
    return
  }

  // For navigation (HTML pages), try network first then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match('/').then(r => r || caches.match('/index.html')))
    )
    return
  }

  // For static assets (JS, CSS, images): cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      }).catch(() => cached)
    })
  )
})

// ── Background Sync ────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPendingPosts())
  }
})

async function syncPendingPosts() {
  // Placeholder for future offline post queuing
  // When user posts while offline, store in IndexedDB and sync here
  console.log('[SW] Background sync triggered')
}

// ── Push Notifications (ready for future use) ─────────────────
self.addEventListener('push', event => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Discussions Exegetica', body: event.data.text() } }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Discussions Exegetica', {
      body: data.body || 'New activity in the community',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag || 'de-notification',
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

// ── Periodic Background Sync (daily word refresh) ─────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-word-refresh') {
    event.waitUntil(refreshDailyWord())
  }
})

async function refreshDailyWord() {
  try {
    const response = await fetch('/api/daily-word')
    const cache = await caches.open(CACHE_NAME)
    await cache.put('/api/daily-word', response)
  } catch {}
}
