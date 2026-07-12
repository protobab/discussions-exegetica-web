import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { C, F } from '../lib/tokens.js'
import { usePageTitle } from '../lib/usePageTitle.js'

const today = '12 July 2026'

export default function PrivacyPolicyPage() {
  usePageTitle('Privacy Policy')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ background: C.navy, minHeight: '100vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>← Home</Link>
        </div>

        <h1 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontFamily: F.body, fontSize: 13.5, color: 'rgba(255,255,255,0.4)', marginBottom: 48 }}>
          Last updated: {today} · Effective: {today}
        </p>

        <div style={{ fontFamily: F.body, fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.85 }}>

          <Section title="1. Who we are">
            <p>Discussions Exegetica is operated by <strong style={{ color: '#fff' }}>Lives In Motion Ltd</strong>, a company registered in England and Wales. We are the data controller for all personal information collected through this platform.</p>
            <p>Contact us about privacy matters at: <a href="https://discussionsexegetica.com/contact" style={{ color: C.gold }}>discussionsexegetica.com/contact</a></p>
          </Section>

          <Section title="2. What information we collect">
            <p>We collect the following personal information when you use Discussions Exegetica:</p>
            <ul>
              <li><strong style={{ color: '#fff' }}>Account information</strong> — your display name, username, and email address when you register</li>
              <li><strong style={{ color: '#fff' }}>Content you create</strong> — forum posts, replies, study group messages, and any content you submit to the platform</li>
              <li><strong style={{ color: '#fff' }}>Usage data</strong> — pages visited, discussions viewed, activity timestamps, and engagement with features such as the Daily Word and Bible Study Hub</li>
              <li><strong style={{ color: '#fff' }}>Communications</strong> — messages you send us via the contact form</li>
              <li><strong style={{ color: '#fff' }}>Device information</strong> — browser type, operating system, and approximate location (country level) for security purposes</li>
            </ul>
            <p>We do <strong style={{ color: '#fff' }}>not</strong> collect payment information, government identification, or sensitive personal data such as health records.</p>
          </Section>

          <Section title="3. How we use your information">
            <p>We use your personal information to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Display your contributions in the community forum, study groups, and discussions</li>
              <li>Send you the weekly email digest if you have opted in</li>
              <li>Send password reset and account notification emails</li>
              <li>Moderate content and enforce our Terms of Use</li>
              <li>Improve the platform and understand how it is being used</li>
              <li>Respond to your support requests</li>
            </ul>
            <p>We do <strong style={{ color: '#fff' }}>not</strong> sell your personal data to any third party. We do not use your data for advertising profiling.</p>
          </Section>

          <Section title="4. Legal basis for processing (UK GDPR)">
            <p>We process your personal data under the following legal bases:</p>
            <ul>
              <li><strong style={{ color: '#fff' }}>Contract</strong> — processing necessary to provide the service you signed up for (account creation, forum access)</li>
              <li><strong style={{ color: '#fff' }}>Legitimate interests</strong> — platform security, fraud prevention, and improving the service</li>
              <li><strong style={{ color: '#fff' }}>Consent</strong> — email digest communications, which you can withdraw at any time</li>
              <li><strong style={{ color: '#fff' }}>Legal obligation</strong> — retaining records where required by law</li>
            </ul>
          </Section>

          <Section title="5. How we share your information">
            <p>We share your information only in the following circumstances:</p>
            <ul>
              <li><strong style={{ color: '#fff' }}>Service providers</strong> — we use Cloudflare (infrastructure and security), Resend (transactional email), and LiveKit (live audio streaming). Each processes data only as necessary to provide their service.</li>
              <li><strong style={{ color: '#fff' }}>Third-party tools</strong> — the Bible Study Hub uses STEPBible (stepbible.org), an independent scholarly tool. We do not share your account data with STEPBible.</li>
              <li><strong style={{ color: '#fff' }}>Legal requirements</strong> — we may disclose information if required by law or to protect the rights and safety of our users or the public.</li>
            </ul>
            <p>We do not share your personal data with any other third parties.</p>
          </Section>

          <Section title="6. Data retention">
            <p>We retain your personal data for as long as your account is active. If you delete your account, your personal details are anonymised within 30 days, though your public forum contributions may remain in anonymised form to preserve the integrity of discussions.</p>
            <p>Contact form messages are retained for 90 days then deleted automatically.</p>
          </Section>

          <Section title="7. Your rights under UK GDPR">
            <p>You have the following rights regarding your personal data:</p>
            <ul>
              <li><strong style={{ color: '#fff' }}>Right of access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong style={{ color: '#fff' }}>Right to rectification</strong> — correct inaccurate or incomplete data</li>
              <li><strong style={{ color: '#fff' }}>Right to erasure</strong> — request deletion of your personal data</li>
              <li><strong style={{ color: '#fff' }}>Right to restrict processing</strong> — ask us to limit how we use your data</li>
              <li><strong style={{ color: '#fff' }}>Right to data portability</strong> — receive your data in a machine-readable format</li>
              <li><strong style={{ color: '#fff' }}>Right to object</strong> — object to processing based on legitimate interests</li>
              <li><strong style={{ color: '#fff' }}>Right to withdraw consent</strong> — unsubscribe from email communications at any time</li>
            </ul>
            <p>To exercise any of these rights, please contact us via <Link to="/contact" style={{ color: C.gold }}>our contact form</Link>. We will respond within 30 days.</p>
            <p>You also have the right to lodge a complaint with the <strong style={{ color: '#fff' }}>Information Commissioner's Office (ICO)</strong> at ico.org.uk if you believe we have not handled your data appropriately.</p>
          </Section>

          <Section title="8. Cookies and local storage">
            <p>Discussions Exegetica uses browser local storage (not cookies) to save your session, study notes, and Bible Study AI chat history on your own device. This data never leaves your device and is not transmitted to our servers.</p>
            <p>The STEPBible tool embedded in the Bible Study Hub may set its own cookies. We do not control these. Please refer to STEPBible's privacy policy at stepbible.org for details.</p>
          </Section>

          <Section title="9. Security">
            <p>We take reasonable technical and organisational measures to protect your personal data, including HTTPS encryption on all connections, secure password hashing, and session token authentication. However, no method of transmission over the internet is completely secure.</p>
          </Section>

          <Section title="10. Children">
            <p>Discussions Exegetica is not directed at children under the age of 13. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has registered, please contact us and we will delete the account promptly.</p>
          </Section>

          <Section title="11. International transfers">
            <p>Our infrastructure is provided by Cloudflare and may involve processing in countries outside the UK. Cloudflare participates in appropriate data transfer frameworks. Your data is always processed in accordance with UK GDPR standards.</p>
          </Section>

          <Section title="12. Changes to this policy">
            <p>We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email or an announcement banner on the platform. The date at the top of this page shows when it was last updated.</p>
          </Section>

          <div style={{ marginTop: 48, padding: '24px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12 }}>
            <p style={{ fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: C.gold }}>Lives In Motion Ltd</strong><br/>
              Registered in England and Wales<br/>
              Privacy enquiries: <Link to="/contact" style={{ color: C.gold }}>discussionsexegetica.com/contact</Link>
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
      <h2 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}
