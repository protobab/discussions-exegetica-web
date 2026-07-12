# Discussions Exegetica — App Store Submission Guide
## Complete step-by-step for Google Play + Apple App Store

---

## HOW UPDATES WORK (Read this first)

Because the app loads from discussionsexegetica.com, **any update you deploy to the website
automatically appears in the app** — no resubmission needed. Users see the latest version
the next time they open the app or refresh.

You only need to resubmit to the stores when you:
- Change the app icon or splash screen
- Add new native permissions (camera, push notifications, etc.)
- Update the Capacitor version

---

## PART 1: ONE-TIME SETUP ON YOUR MAC

### Step 1 — Check macOS version
System Preferences → About This Mac → must be macOS Monterey (12) or later.
If not: Apple menu → System Preferences → Software Update → upgrade to Monterey (free).

### Step 2 — Install Xcode
1. Open Mac App Store → search "Xcode" → Install (7GB, takes 20–40 minutes)
2. Open Xcode once to accept the license agreement
3. Run: `sudo xcode-select --install`

### Step 3 — Install Node.js and project dependencies
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Clone your repo
git clone https://github.com/protobab/discussions-exegetica-web.git
cd discussions-exegetica-web

# Install all dependencies (includes Capacitor)
npm install

# Install sharp for icon generation
npm install sharp --save-dev
```

### Step 4 — Generate app icons and splash screens
```bash
node generate-icons.mjs
```
This creates PNG icons in `public/icons/` and splash screens in `public/splash/`.

### Step 5 — Build the web app
```bash
npm run build
```

### Step 6 — Add Capacitor platforms
```bash
# Add Android (creates the /android folder)
npx cap add android

# Add iOS (creates the /ios folder)
npx cap add ios
```

### Step 7 — Sync everything
```bash
npx cap sync
```
This copies your built web app and icons into both native projects.

---

## PART 2: ANDROID — GOOGLE PLAY

### Step 8 — Set up Google Play Console
1. Go to play.google.com/console → Sign in with your Google account
2. Pay the one-time $25 registration fee
3. Complete the account setup (takes ~10 minutes)

### Step 9 — Open the Android project in Android Studio
```bash
# Install Android Studio from https://developer.android.com/studio (free)
npx cap open android
```
Android Studio opens the `/android` folder.

### Step 10 — Configure signing (required for release)
In Android Studio:
1. Build → Generate Signed Bundle/APK → Android App Bundle
2. Create new keystore → fill in the details → **SAVE THE KEYSTORE FILE AND PASSWORD SAFELY**
   (if you lose this, you cannot update your app)
3. Choose Release → Build

The `.aab` file is created in `android/app/release/`.

### Step 11 — Create your Play Store listing
In Google Play Console → Create app:
- **App name:** Discussions Exegetica
- **Category:** Education
- **Content rating:** Complete the questionnaire (select: no violence, no adult content)
- **Target audience:** 13+ (faith discussion platform)
- **Short description** (80 chars):
  "Where Scripture is opened together — global biblical discussion community"
- **Full description** (4000 chars max): See suggested text below
- **Screenshots:** Take screenshots on an Android phone or emulator (need at least 2)
- **Feature graphic:** 1024x500px — create in Canva using navy background + flame logo

### Suggested store description:
```
Discussions Exegetica is a global, non-denominational evangelical biblical
discussion community — a place where honest seekers and devoted believers
can ask real questions, study Scripture deeply, and walk in the light together.

FEATURES:
📖 Bible Study Hub — Read with STEPBible integration, Greek & Hebrew tools,
   and an AI Study Helper that answers your questions about any passage

💬 Forum — Thousands of discussions across six categories: Deep Dive Exegesis,
   Seekers' Corner, Prayer & Life, Theology, Prophecy, and Resources

🎙️ The Armchair — Live audio discussions and recorded sessions with guests

✦ Daily Word — A daily verse with word-by-word reveal and meditate mode

👥 Study Groups — Book-by-book communities with discussion and notes

🙏 Prayer of Salvation — A warm, guided 5-step salvation experience

FREE forever. No ads. No spam. Just the Word, opened together.

"Did not our hearts burn within us?" — Luke 24:32
```

### Step 12 — Submit for review
Play Console → Releases → Production → Create new release → Upload the .aab file → Review → Submit
**Google typically reviews within 1–3 days.**

---

## PART 3: iOS — APPLE APP STORE

### Step 13 — Create Apple Developer account
1. Go to developer.apple.com → Enrol as Individual (£79/year)
2. Complete identity verification (takes 1–2 days)

### Step 14 — Create App ID in Apple Developer Portal
1. developer.apple.com → Identifiers → + → App IDs
2. Bundle ID: `com.discussionsexegetica.app`
3. Capabilities: nothing special needed (no push notifications yet)

### Step 15 — Create app in App Store Connect
1. Go to appstoreconnect.apple.com
2. My Apps → + → New App
3. Platform: iOS
4. Name: Discussions Exegetica
5. Bundle ID: com.discussionsexegetica.app
6. SKU: discussions-exegetica-001
7. Primary language: English (UK)

### Step 16 — Open iOS project in Xcode
```bash
npx cap open ios
```
In Xcode:
1. Select the project → Signing & Capabilities
2. Team: select your Apple Developer account
3. Bundle Identifier: com.discussionsexegetica.app
4. Deployment Target: iOS 15.0

### Step 17 — Archive and upload
1. Product → Archive (builds the release version)
2. Window → Organizer → Distribute App → App Store Connect → Upload
3. Follow the prompts — Xcode handles the signing automatically

### Step 18 — Complete App Store listing
In App Store Connect:
- **Category:** Education (primary), Lifestyle (secondary)
- **Age Rating:** 4+ (no objectionable content)
- **Privacy Policy URL:** https://discussionsexegetica.com/contact
- **Support URL:** https://discussionsexegetica.com/contact
- **Screenshots:** Need screenshots for iPhone 6.9" (iPhone 15 Pro Max size)
  Use Xcode Simulator: select iPhone 15 Pro Max → take screenshots
- **Description:** Use the same text as Google Play above
- **Keywords:** bible,scripture,faith,christian,discussion,exegesis,theology,study,prayer,community

### Step 19 — Submit for review
App Store Connect → Prepare for Submission → Submit for Review
**Apple typically reviews within 24–48 hours. First submission may take longer.**

---

## PART 4: FUTURE UPDATES

### Updating content/features (no store action needed):
```bash
# Just deploy to GitHub as normal
git add . && git commit -m "Update" && git push
```
The Cloudflare deployment updates the site, and the app picks it up automatically.

### Updating native configuration (requires new store build):
```bash
npm run build        # Rebuild web app
npx cap sync         # Sync to native projects
# Then follow Steps 10-12 (Android) or 16-18 (iOS) to build and upload new version
# Increment version in package.json: "version": "2.1.0"
```

---

## TIMELINE ESTIMATE
- Mac setup + Xcode install: 2–3 hours
- Icon generation + builds: 1 hour
- Store listings (descriptions, screenshots): 2 hours
- Google Play review: 1–3 days
- Apple review: 1–3 days

**Total from start to both stores: approximately 1 week**

---

## NEED HELP?
Contact: https://discussionsexegetica.com/contact
