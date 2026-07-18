// Design tokens — cinematic dark navy theme
export const C = {
  // Core palette
  navy:      '#0a0f1e',        // deepest dark — page backgrounds
  navyMid:   '#111827',        // card backgrounds
  navyLight: '#1B2A4A',        // elevated surfaces
  navyBorder:'var(--c-gold-dim)', // gold-tinted borders

  // Gold spectrum
  gold:      'var(--c-gold)',
  goldLight: 'var(--c-gold-light)',
  goldDim:   'var(--c-gold-dim)',

  // Text
  text:      'var(--c-text)',  // warm ink — cream on dark, warm brown-black on light
  textMuted: 'var(--fg-55)',
  textDim:   'var(--fg-35)',

  // Accents
  sage:      '#52B788',
  red:       '#EF4444',

  // Legacy aliases (keep for compatibility)
  parchment: '#F7F3EB',
  mist:      '#EEF2F7',
  muted:     'var(--fg-55)',
  border:    'var(--fg-1)',
  navyLightOld: '#2E4270',
}

export const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'Inter', system-ui, sans-serif",
}

export const BADGE = {
  Seeker:  '#A78BFA',
  Disciple:'#3B82F6',
  Elder:   '#C9A84C',
  Teacher: '#EF4444'
}

export const API = '/api'
export const ADMIN_USERS = ['eki']
