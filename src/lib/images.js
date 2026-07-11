// Curated Unsplash image URLs for each section
// All are free to use, no attribution required via Unsplash licence
// Swap any URL for your own photography later

export const IMAGES = {
  // Homepage hero — diverse people in warm discussion
  homeHero: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=75',
  // Forum — open Bible / scholarly study
  forumHero: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&q=75',
  // Seekers — person looking up / open hands / wonder
  seekersHero: 'https://images.unsplash.com/photo-1501290836048-d8c8d6d84c8d?w=1600&q=75',
  // Groups — small group gathered warmly
  groupsHero: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=75',
  // Daily Word — soft light through clouds / painterly
  dailyHero: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=75',
  // Bible Study — ancient manuscript / candlelight
  bibleHero: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1600&q=75',
  // Armchair — intimate conversation / warm room
  armchairHero: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=75',
  // Prayer — hands clasped / light rays
  prayerHero: 'https://images.unsplash.com/photo-1501290836048-d8c8d6d84c8d?w=1600&q=75',
  // Profile — community gathering
  profileHero: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=75',
}

// Overlay opacity per section (content sections lighter, hero sections darker)
export const OVERLAY = {
  hero: 'rgba(27,42,74,0.72)',       // bold hero sections
  content: 'rgba(27,42,74,0.88)',    // content areas — image very subtle
  groups: 'rgba(30,58,47,0.78)',     // sage green overlay for groups
  daily: 'rgba(15,25,50,0.82)',      // deep blue for daily word
  bible: 'rgba(10,20,35,0.88)',      // near-opaque for bible dark theme
}
