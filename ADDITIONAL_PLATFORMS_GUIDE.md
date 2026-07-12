# Discussions Exegetica — Additional Platform Submission Guide
## Samsung Galaxy Store · Amazon Appstore · Microsoft Store

---

## IMPORTANT: Prerequisites
Complete the Google Play setup (APP_STORE_GUIDE.md Part 2) first.
You will need the signed `.aab` / `.apk` file from that process for Samsung and Amazon.

---

## PLATFORM 1: SAMSUNG GALAXY STORE
**Effort: ~2 hours · Cost: Free · Audience: 1B+ Samsung devices**

Samsung Galaxy Store reaches all Samsung phones and tablets worldwide — a significant
audience especially in Africa, Asia, and the Middle East where Samsung dominates.

### Step 1 — Create Samsung Developer account
1. Go to seller.samsungapps.com
2. Sign up → Individual seller
3. No registration fee
4. Verify your email

### Step 2 — Convert your .aab to .apk
Samsung requires an .apk, not .aab. From Android Studio:
1. Build → Generate Signed Bundle/APK → APK (not Bundle this time)
2. Use the same keystore you created for Google Play
3. Choose Release → Build
The .apk appears in `android/app/release/app-release.apk`

### Step 3 — Create your Galaxy Store listing
Seller Portal → Add New App:
- **App name:** Discussions Exegetica
- **Category:** Education → Religious
- **Default language:** English
- **Age restriction:** 4+ (all ages)
- **Countries:** Select All (worldwide)

### Step 4 — Upload and complete listing
- Upload: app-release.apk
- **Short description:** Where Scripture is opened together
- **Full description:** Use the same text from APP_STORE_GUIDE.md
- **Icon:** Upload your 512x512 PNG from public/icons/icon-512.png
- **Screenshots:** Use the same Android screenshots from Google Play (min 4 required)
- **Feature image:** 1920x1080px — create in Canva: navy background, flame logo, tagline

### Step 5 — Submit
Review → Submit for Review
**Samsung typically reviews within 1–5 business days.**

### After approval
Your app will appear in Galaxy Store on all Samsung devices.
Users can find it by searching "Discussions Exegetica" or "biblical discussion".

---

## PLATFORM 2: AMAZON APPSTORE
**Effort: ~2 hours · Cost: Free · Audience: Fire tablets, Fire TV, Echo Show**

Amazon Appstore is particularly valuable for:
- Fire tablets (popular in education, often used by churches and Bible study groups)
- Echo Show devices (screen-based Alexa devices)
- Android users in markets where Google Play is restricted

### Step 1 — Create Amazon Developer account
1. Go to developer.amazon.com
2. Sign in with your Amazon account (or create one)
3. Register as a developer — free
4. Accept the App Distribution Agreement

### Step 2 — Create new app submission
Amazon Developer Console → Add a New App → Android:
- **App title:** Discussions Exegetica
- **App SKU:** discussions-exegetica-001
- **Category:** Education → Reference
- **Content rating:** Complete the questionnaire
  (All "No" answers — no violence, no adult content, no gambling)

### Step 3 — Upload your APK
- Upload the same `app-release.apk` from Samsung step
- Amazon will scan it automatically — no changes needed
- **Binary type:** Phone & Tablet

### Step 4 — Complete the listing
**Description tab:**
- Short description (1200 chars): Use Google Play short description
- Long description: Use the same full description
- Keywords: bible, scripture, christian, faith, discussion, theology, prayer, study, exegesis

**Images tab:**
- Icon: 512x512 PNG (use icon-512.png)
- Screenshots: minimum 3, same as Google Play
- Promotional image: 1024x500px (same as Google Play feature graphic)

**Content Rating tab:**
- Complete the IARC questionnaire
- Expected rating: Everyone / PEGI 3

**Pricing tab:**
- Base list price: Free
- In-app purchasing: No

### Step 5 — Submit
Submit App → Amazon typically reviews within 1–3 business days.

### Fire TV consideration
If you want the app on Fire TV (TV screens in homes):
- In Binary Files, also upload a Fire TV optimised APK
- Requires a 1920x1080 TV banner image
- The web app works on Fire TV browser already — a dedicated listing is optional

---

## PLATFORM 3: MICROSOFT STORE (PWA)
**Effort: ~1 hour · Cost: $19 one-time individual / $99 company · Audience: Windows 10/11 users**

Microsoft Store now accepts Progressive Web Apps directly — no code changes needed
since your PWA manifest is already in place. This gets Discussions Exegetica onto
Windows desktops and laptops worldwide.

### Step 1 — Use PWABuilder (the easiest route)
PWABuilder is Microsoft's official free tool that packages your PWA for the Store.

1. Go to pwabuilder.com
2. Enter: https://discussionsexegetica.com
3. PWABuilder scans your site and manifest — should score highly since manifest is complete
4. Click "Package for Stores" → "Microsoft Store"
5. Download the generated .msix package

### Step 2 — Create Microsoft Partner Center account
1. Go to partner.microsoft.com/dashboard
2. Sign in with Microsoft account
3. Enrol as App developer: $19 one-time fee (individual)
4. Account verification takes 1–2 business days

### Step 3 — Create your Store listing
Partner Center → Apps and Games → New Product → App:
- **App name:** Discussions Exegetica (reserve this name first)
- **Category:** Education
- **Sub-category:** Reference

### Step 4 — Complete the submission
**Properties:**
- Category: Education → Religious
- Age rating: Complete the IARC questionnaire (expected: PEGI 3 / Everyone)
- Privacy policy URL: https://discussionsexegetica.com/contact

**Store listings (English):**
- Description: Use the same full description from Google Play
- Short description (≤270 chars):
  "A global biblical discussion community — forum, live audio, Bible study hub, daily verse. Where Scripture is opened together."
- Keywords: bible, scripture, christian, discussion, theology, exegesis, faith, prayer

**Screenshots:**
- Need at least 1 desktop screenshot (1366x768 or larger)
- Open discussionsexegetica.com in a browser at 1366x768 → screenshot
- Also add mobile screenshots from your Android/iOS submissions

**Packages:**
- Upload the .msix file from PWABuilder

### Step 5 — Submit
Submit to certification → Microsoft typically reviews within 3–5 business days.

### After approval
The app appears in the Microsoft Store and can be found by Windows users.
It installs like a desktop app, appears in the Start Menu, and launches as a
standalone window (no browser chrome) — exactly like a native app.

---

## PLATFORM 4: META HORIZON (Future consideration)

For now, Discussions Exegetica works in the Quest Browser as a PWA — users
can bookmark it and it runs in a 2D panel inside VR. This is actually a compelling
experience: reading Scripture and discussing theology in a focused VR environment.

A full Horizon Store listing as a standalone app would require:
- Building a 3D "room" environment in Unity or Unreal
- Embedding your web app as a 2D panel within that 3D space
- Meta's review process (similar to Apple in strictness)

**Recommendation:** Revisit this after the main store launches. If the community grows,
a dedicated VR experience for The Armchair (a virtual gathering space for live audio
discussions) could be genuinely powerful and distinctive. Flag this for Phase 4.

---

## COMBINED TIMELINE

| Platform         | Prerequisite      | Extra effort | Review time |
|-----------------|-------------------|--------------|-------------|
| Google Play      | Android build     | —            | 1–3 days    |
| Apple App Store  | Mac + Xcode       | —            | 1–3 days    |
| Samsung Galaxy   | Google Play APK   | ~2 hours     | 1–5 days    |
| Amazon Appstore  | Google Play APK   | ~2 hours     | 1–3 days    |
| Microsoft Store  | PWABuilder        | ~1 hour      | 3–5 days    |

**Total extra effort beyond Google Play + Apple: approximately 5 hours**
**All five platforms live: within 2 weeks of starting**

---

## TOTAL POTENTIAL REACH ACROSS ALL PLATFORMS
- Google Play: 3B+ Android devices
- Apple App Store: 1B+ iOS devices
- Samsung Galaxy Store: 1B+ Samsung devices (overlaps with Android)
- Amazon Appstore: 180M+ Fire devices + Android
- Microsoft Store: 1.4B+ Windows devices

---

## RECOMMENDED SUBMISSION ORDER
1. Google Play (while Apple is under review — faster approval)
2. Apple App Store
3. Samsung Galaxy Store (use APK from step 2)
4. Amazon Appstore (same APK)
5. Microsoft Store (PWABuilder — no build needed)
