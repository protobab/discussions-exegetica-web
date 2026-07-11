// Per-section visual themes — each page has its own identity

export const THEMES = {
  home: {
    bg: '#F7F3EB',        // warm parchment
    hero: 'linear-gradient(135deg, #1B2A4A 0%, #2E4270 100%)',
  },
  forum: {
    bg: '#F5F0E8',        // aged parchment — scholarly library feel
    accent: '#8B6914',    // antique gold
    hero: 'linear-gradient(135deg, #2C1810 0%, #4A2C1A 100%)', // deep mahogany
  },
  seekers: {
    bg: '#F0F7F4',        // soft sage — welcoming, not churchy
    accent: '#2D6A4F',    // forest green
    hero: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
  },
  groups: {
    bg: '#F0F5FF',        // soft blue — intimate community
    accent: '#2E4270',
    hero: 'linear-gradient(135deg, #1E3A5F 0%, #2E4270 100%)',
  },
  bible: {
    bg: '#0D1B2A',        // deep ink night — contemplative
    bgLight: '#112236',
    accent: '#C9A84C',
    text: '#E8DCC8',      // warm cream on dark
  },
  armchair: {
    // Already has full-screen atmospheric — handled in ArmchairPage
    bg: 'transparent',
  },
  daily: {
    bg: '#1B2A4A',        // deep navy — meditative
    accent: '#C9A84C',
  }
}

// Page transition timing
export const TRANSITION = 'opacity 0.4s ease, transform 0.3s ease'
