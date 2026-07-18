import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { usePageTitle } from '../lib/usePageTitle.js'

const today = '12 July 2026'

export default function TermsOfUsePage() {
  usePageTitle('Terms of Use')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: F.body, fontSize: 13, color: 'var(--fg-4)' }}>← Home</Link>
        </div>

        <h1 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, color: 'var(--fg-100)', marginBottom: 8 }}>Terms of Use</h1>
        <p style={{ fontFamily: F.body, fontSize: 13.5, color: 'var(--fg-4)', marginBottom: 48 }}>
          Last updated: {today} · Effective: {today}
        </p>

        <div style={{ fontFamily: F.body, fontSize: 15, color: 'var(--fg-75)', lineHeight: 1.85 }}>

          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '20px 24px', marginBottom: 40 }}>
            <p style={{ fontFamily: F.body, fontSize: 14.5, color: 'var(--fg-8)', margin: 0, lineHeight: 1.7 }}>
              By accessing or using Discussions Exegetica, you agree to these Terms of Use. Please read them carefully. If you do not agree, please do not use the platform.
            </p>
          </div>

          <Section title="1. About the platform">
            <p>Discussions Exegetica is operated by <strong style={{ color: 'var(--fg-100)' }}>Lives In Motion Ltd</strong>, a company registered in England and Wales. It is a global, non-denominational evangelical biblical discussion community open to believers and seekers of all backgrounds.</p>
          </Section>

          <Section title="2. Your account">
            <p>To participate in discussions, create study groups, or access certain features, you must create an account. You agree to:</p>
            <ul>
              <li>Provide accurate information when registering</li>
              <li>Keep your password secure and not share it with others</li>
              <li>Take responsibility for all activity that occurs under your account</li>
              <li>Notify us immediately if you believe your account has been compromised</li>
            </ul>
            <p>You must be at least 13 years old to create an account.</p>
          </Section>

          <Section title="3. Acceptable use">
            <p>Discussions Exegetica is a place for thoughtful, respectful engagement with Scripture and faith. You agree not to post, share, or transmit content that:</p>
            <ul>
              <li>Is abusive, threatening, harassing, or defamatory toward any person</li>
              <li>Promotes hatred based on race, ethnicity, nationality, religion, gender, sexual orientation, disability, or any other characteristic</li>
              <li>Is sexually explicit or pornographic</li>
              <li>Promotes or glorifies violence, self-harm, or illegal activity</li>
              <li>Constitutes spam, unsolicited advertising, or deliberate misinformation</li>
              <li>Infringes the intellectual property rights of any person or organisation</li>
              <li>Impersonates another person or organisation</li>
              <li>Attempts to access or interfere with the technical systems of the platform</li>
            </ul>
            <p>We welcome robust theological discussion, honest questions, and respectful disagreement. We ask only that all interaction is conducted with courtesy and good faith.</p>
          </Section>

          <Section title="4. Content you post">
            <p>You retain ownership of the content you post on Discussions Exegetica. By posting, you grant Lives In Motion Ltd a non-exclusive, royalty-free licence to display, distribute, and store your content as part of the platform.</p>
            <p>You are responsible for ensuring that any content you post does not violate the rights of any third party, including copyright, trademark, or privacy rights.</p>
            <p>Content posted on the public forum is visible to all visitors. Content posted in private or approval-required study groups is visible only to members of that group.</p>
          </Section>

          <Section title="5. Moderation">
            <p>Lives In Motion Ltd reserves the right to remove any content that violates these Terms, or that we determine in our sole discretion to be harmful, misleading, or inconsistent with the spirit of this community.</p>
            <p>We may suspend or terminate accounts that repeatedly violate these Terms or that engage in behaviour harmful to the community.</p>
            <p>If you believe content on the platform violates these Terms, please report it via our <Link to="/contact" style={{ color: C.gold }}>contact form</Link>.</p>
          </Section>

          <Section title="6. The Bible Study AI Helper">
            <p>The AI Study Helper in the Bible Study Hub is provided for educational and devotional purposes only. It is not a substitute for qualified theological advice, pastoral counsel, or academic biblical scholarship. Responses are generated by an AI model and may contain inaccuracies. Always verify significant theological claims against Scripture and trusted sources.</p>
          </Section>

          <Section title="7. The Armchair — live audio">
            <p>Live sessions on The Armchair are hosted by Lives In Motion Ltd representatives. Listeners join as audience members and do not transmit audio unless explicitly invited by the host. Recordings may be made available after sessions end.</p>
          </Section>

          <Section title="8. Third-party services">
            <p>Discussions Exegetica integrates with third-party services including STEPBible (Bible reading), LiveKit (live audio), and Pixabay (images). Your use of these integrations is subject to their respective terms of service. We are not responsible for the content or availability of third-party services.</p>
          </Section>

          <Section title="9. Availability and changes">
            <p>We aim to keep Discussions Exegetica available at all times but cannot guarantee uninterrupted access. We may update, modify, or discontinue features at any time. We will provide reasonable notice of significant changes where possible.</p>
            <p>We reserve the right to update these Terms at any time. Continued use of the platform after changes are published constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="10. Limitation of liability">
            <p>To the fullest extent permitted by law, Lives In Motion Ltd shall not be liable for any indirect, incidental, or consequential loss arising from your use of Discussions Exegetica, including loss of data, reputation, or revenue.</p>
            <p>The platform is provided "as is" without warranties of any kind. We do not warrant that the platform will be error-free, secure, or uninterrupted.</p>
          </Section>

          <Section title="11. Governing law">
            <p>These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </Section>

          <Section title="12. Contact">
            <p>For any questions about these Terms, please contact us via <Link to="/contact" style={{ color: C.gold }}>our contact form</Link>.</p>
          </Section>

          <div style={{ marginTop: 48, padding: '24px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12 }}>
            <p style={{ fontFamily: F.body, fontSize: 14, color: 'var(--fg-7)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: C.gold }}>Lives In Motion Ltd</strong><br/>
              Registered in England and Wales<br/>
              Discussions Exegetica · <Link to="/" style={{ color: C.gold }}>discussionsexegetica.com</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, color: 'var(--fg-100)', marginBottom: 14, borderBottom: '1px solid var(--fg-08)', paddingBottom: 10 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}
