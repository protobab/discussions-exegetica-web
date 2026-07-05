// functions/api/admin/auto-content.js
// Auto-generates new discussion threads weekly using Claude AI
// Called by a Cloudflare Cron Trigger (set in wrangler.toml)
// Can also be triggered manually by admin via POST request

import { getSession, json, ADMIN_USERS } from '../../_shared.js'

// ── Topic pools — rotated weekly to keep content fresh ───────

const TOPIC_POOLS = {
  exegesis: [
    'The Sermon on the Mount — which beatitude challenges you most and why?',
    'What does Sabbath mean for Christians today? A careful look at Hebrews 4',
    'The Lord''s Prayer — unpacking "thy kingdom come" in its first-century context',
    'Justification by faith in Galatians — what was the actual dispute Paul was addressing?',
    'The feeding of the 5,000 — why do all four Gospels include this miracle?',
    'What does "born again" actually mean in John 3? Nicodemus certainly didn''t know',
    'The Psalms of Ascent (120-134) — pilgrimage songs and what they teach us about worship',
    'Romans 7 — is Paul describing his pre-Christian or post-Christian experience?',
    'The "hard sayings" of Jesus — which one do you find most difficult?',
    'Daniel''s four kingdoms — how should we read apocalyptic prophecy today?',
    'The Song of Songs — allegory, wisdom literature, or both?',
    'What did Jesus mean by "the kingdom of God is within you" (Luke 17:21)?',
    'Hebrews and the priesthood of Christ — how does it transform how we pray?',
    'The seven "I AM" statements of John — read as a complete theological portrait',
    'What is the "unforgivable sin" in Matthew 12:31? Should Christians be worried?',
  ],
  seekers: [
    'I''m not sure the resurrection happened — what''s the best historical evidence?',
    'Can you be spiritual but not religious? Is that a coherent position?',
    'What makes Christianity different from other world religions at its core?',
    'Is faith opposed to reason, or can they work together?',
    'What happens after death? What does the Bible actually say — and what does it not say?',
    'Why does God seem so different in the Old Testament compared to the New?',
    'I was raised in church and left — what would make me consider coming back?',
    'How do Christians handle the parts of the Bible they find morally troubling?',
    'Is prayer just talking to yourself? What evidence is there that it works?',
    'What do you say to someone who says "all religions lead to the same God"?',
    'How did you personally come to faith — was it intellectual, experiential, or both?',
    'The problem of unanswered prayer — how do you make sense of it honestly?',
    'What does it actually mean to "accept Jesus into your heart"?',
    'If Christianity is true, why do so many sincere people reject it?',
    'Can someone be a good person without God? What does Christianity say?',
  ],
  prayer: [
    'How has your prayer life changed over the years — what rhythms actually work?',
    'Fasting and prayer — does anyone still practise this? What has been your experience?',
    'Praying for healing — how do you hold hope and acceptance together?',
    'What role does gratitude play in keeping faith strong through hard seasons?',
    'Corporate prayer vs private prayer — which do you find more meaningful and why?',
    'The prayer of Jabez (1 Chronicles 4:10) — prosperity gospel or legitimate request?',
    'Praying for enemies — what does this actually look like in practice?',
    'How do you know when God is speaking to you versus your own thoughts?',
    'Prayer and mental health — has prayer helped with anxiety or depression for you?',
    'Contemplative prayer and silence — is there a place for it in evangelical Christianity?',
    'How do you pray when you''re angry at God?',
    'Intercession — what does it actually accomplish if God is sovereign?',
    'Building a family or household prayer life — what has worked and what hasn''t?',
    'The relationship between Bible reading and prayer — how do you integrate them?',
    'Praying in tongues — what does the Bible teach and what is your experience?',
  ],
  theology: [
    'What is the image of God (imago Dei) — and what does it mean for human dignity?',
    'Hell — eternal conscious torment, annihilation, or universal restoration? The biblical case for each',
    'The atonement — which theory (penal substitution, Christus Victor, moral influence) best captures Scripture?',
    'Predestination and free will — can both be true? How do you hold the tension?',
    'What does it mean that God is holy? Is this his most fundamental attribute?',
    'The prosperity gospel — why is it problematic and what''s the biblical alternative?',
    'Spiritual gifts today — are all gifts still active or did some cease with the apostles?',
    'Christian nationalism — is there such a thing as a Christian nation, biblically speaking?',
    'The relationship between faith and doubt — is doubt sinful or a normal part of faith?',
    'What does the Bible teach about angels — and how much popular belief is actually biblical?',
    'End times — pre, mid, or post tribulation rapture? Does it matter what you believe?',
    'The inspiration of Scripture — what do inerrancy and infallibility actually claim?',
    'Women in ministry — what do the disputed Pauline texts actually mean in context?',
    'Divorce and remarriage — what does Jesus actually permit?',
    'Christian ethics and AI — how should believers think about artificial intelligence?',
  ],
  prophecy: [
    'Has Ezekiel 38-39 (Gog and Magog) been fulfilled, or is it still future?',
    'The 70 weeks of Daniel (9:24-27) — the most debated prophecy in the Old Testament',
    'Joel 2:28 and Pentecost — was this prophecy fully fulfilled or partially?',
    'Zechariah''s visions — how do they relate to the New Testament?',
    'The "abomination of desolation" Jesus mentions — what is it referring to?',
    'Messianic prophecy — which Old Testament texts do you find most compelling as pointing to Jesus?',
    'The New Jerusalem in Revelation 21 — literal city or symbolic vision of restored creation?',
    'Israel and the church in prophecy — replacement theology, dual covenant, or something else?',
    'The mark of the beast — was this a first-century symbol or still future?',
    'Prophecy and the Holy Spirit today — what does a New Testament gift of prophecy look like?',
  ]
}

// ── Main handler ─────────────────────────────────────────────

export async function onRequestPost({ env, request }) {
  // Verify admin or valid cron secret
  const cronSecret = request.headers.get('X-Cron-Secret')
  const isValidCron = cronSecret && cronSecret === env.CRON_SECRET

  if (!isValidCron) {
    const session = await getSession(request, env)
    if (!session || !ADMIN_USERS.includes(session.username)) {
      return json({ error: 'Unauthorised' }, 401)
    }
  }

  const body = await request.json().catch(() => ({}))
  const count = Math.min(parseInt(body.count || 3), 5) // max 5 per run
  const categorySlug = body.category || null // optional: target specific category

  try {
    const results = await generateThreads(env, count, categorySlug)
    return json({ ok: true, generated: results.length, threads: results })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function onRequestGet({ env, request }) {
  // GET returns status — how many auto-threads have been created
  const session = await getSession(request, env)
  if (!session || !ADMIN_USERS.includes(session.username)) {
    return json({ error: 'Unauthorised' }, 401)
  }
  const result = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM threads WHERE author_id = (SELECT id FROM users WHERE username = 'de_autobot') `
  ).first().catch(() => ({ count: 0 }))
  return json({ auto_thread_count: result?.count || 0 })
}

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-Secret',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }})
}

// ── Content generation ────────────────────────────────────────

async function generateThreads(env, count, categorySlug) {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')

  // Get or create the autobot user
  let autobot = await env.DB.prepare(`SELECT id FROM users WHERE username = 'de_autobot'`).first()
  if (!autobot) {
    const r = await env.DB.prepare(`
      INSERT INTO users (username, email, password_hash, display_name, avatar_color, badge, reputation, is_admin)
      VALUES ('de_autobot', 'autobot@discussionsexegetica.com', 'not-a-real-hash', 'The Community', '#C9A84C', 'Elder', 500, 0)
    `).run()
    autobot = { id: r.meta.last_row_id }
  }

  // Get categories
  const { results: categories } = await env.DB.prepare(`SELECT id, slug, label FROM categories`).all()
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c]))

  // Pick topics to generate
  const toGenerate = selectTopics(count, categorySlug, env)
  const generated = []

  for (const { slug, topic } of toGenerate) {
    const cat = catMap[slug]
    if (!cat) continue

    // Check we haven''t already created a very similar thread recently
    const recent = await env.DB.prepare(
      `SELECT id FROM threads WHERE title LIKE ? AND created_at > datetime('now', '-30 days')`
    ).bind(`%${topic.slice(0, 30)}%`).first()
    if (recent) continue

    try {
      const thread = await generateThread(env.ANTHROPIC_API_KEY, topic, cat.label, slug)
      if (!thread) continue

      const r = await env.DB.prepare(`
        INSERT INTO threads (category_id, author_id, title, body, is_pinned, view_count)
        VALUES (?, ?, ?, ?, 0, ?)
      `).bind(cat.id, autobot.id, thread.title, thread.body, Math.floor(Math.random() * 20) + 5).run()

      generated.push({ id: r.meta.last_row_id, title: thread.title, category: slug })

      // Small delay between API calls
      await new Promise(r => setTimeout(r, 1000))
    } catch (e) {
      console.error(`Failed to generate thread for topic "${topic}":`, e.message)
    }
  }

  return generated
}

function selectTopics(count, categorySlug, env) {
  const selected = []
  const slugs = categorySlug
    ? [categorySlug]
    : ['exegesis', 'seekers', 'prayer', 'theology', 'prophecy']

  // Use current week number as seed for consistent but rotating selection
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))

  for (let i = 0; i < count; i++) {
    const slug = slugs[i % slugs.length]
    const pool = TOPIC_POOLS[slug] || TOPIC_POOLS.seekers
    const topicIdx = (weekNum + i * 7) % pool.length
    selected.push({ slug, topic: pool[topicIdx] })
  }

  return selected
}

async function generateThread(apiKey, topic, categoryLabel, slug) {
  const systemPrompt = `You are a thoughtful, well-read Christian writer contributing to Discussions Exegetica — a global non-denominational evangelical biblical discussion platform welcoming seekers and believers alike.

Your task is to write an opening discussion post that:
- Opens with genuine intellectual curiosity and warmth
- Is substantive and well-researched (references specific Bible passages with verse numbers)
- Raises honest questions that invite real engagement
- Is accessible to non-experts but satisfying to serious students
- Ends with 1-2 specific questions to the community that invite diverse perspectives
- Is between 350-550 words
- Does NOT use headings or bullet points — write in flowing prose with paragraph breaks
- Sounds like a real person, not an AI
- The category is: ${categoryLabel}

Respond with JSON only in this exact format:
{"title": "...", "body": "..."}`

  const userPrompt = `Write a discussion post on this topic: ${topic}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  })

  const data = await res.json()
  if (!data.content?.[0]?.text) throw new Error('No content from API')

  const text = data.content[0].text.trim()
  const clean = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    // Try to extract JSON from the response
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse JSON from API response')
  }
}
