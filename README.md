# Discussions Exegetica
### *Where Scripture is Opened Together*

A global biblical discussion platform for seekers and believers — built on React, Cloudflare Pages, D1, and Workers.

**Live site:** https://discussionsexegetica.com

---

## 🏗️ Tech Stack

| Layer       | Technology                      |
|-------------|----------------------------------|
| Frontend    | React 18 + Vite                  |
| Hosting     | Cloudflare Pages                 |
| Database    | Cloudflare D1 (SQLite)           |
| API         | Cloudflare Pages Functions       |
| Sessions    | Cloudflare KV                    |
| Auth        | Custom PBKDF2 (Web Crypto API)   |
| Domain      | Cloudflare Registrar             |

**Cost: $0/month** (within Cloudflare free tier limits)

---

## 🚀 Setup Guide

### Prerequisites
- Node.js 18+
- A Cloudflare account (free)
- Wrangler CLI (installed automatically via npm)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/discussions-exegetica.git
cd discussions-exegetica
npm install
```

---

### Step 2 — Authenticate Wrangler

```bash
npx wrangler login
```

This opens a browser window. Log in with your Cloudflare account.

---

### Step 3 — Create the D1 Database

```bash
npx wrangler d1 create discussions-exegetica-db
```

Copy the `database_id` from the output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "discussions-exegetica-db"
database_id = "PASTE_YOUR_ID_HERE"
```

---

### Step 4 — Create the KV Namespace (for sessions)

```bash
npx wrangler kv:namespace create SESSIONS
```

Copy the `id` from the output and paste it into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "PASTE_YOUR_KV_ID_HERE"
```

---

### Step 5 — Run the database migrations

```bash
# Create tables
npm run db:init

# Seed categories and first daily words
npm run db:migrate
```

---

### Step 6 — Run locally

```bash
npm run dev
```

Visit http://localhost:3000

To test with real D1/KV locally:

```bash
npm run cf:dev
```

---

### Step 7 — Deploy to Cloudflare Pages

```bash
npm run build
npm run cf:deploy
```

Or connect your GitHub repo in the Cloudflare Dashboard:
1. Go to **Workers & Pages → Create → Pages**
2. Connect your GitHub repo
3. Set build command: `npm run build`
4. Set build output directory: `dist`
5. Add environment variables if needed

Every push to `main` auto-deploys. 🚀

---

### Step 8 — Connect your domains

In Cloudflare Dashboard:
1. Go to **Workers & Pages → discussions-exegetica → Custom Domains**
2. Add `discussionsexegetica.com`
3. Add `discussionsexegetica.org` (auto-redirects to .com via middleware)

---

## 📁 Project Structure

```
discussions-exegetica/
├── functions/               # Cloudflare Pages Functions (API)
│   ├── _middleware.js       # CORS + .org redirect
│   ├── api/
│   │   ├── auth.js          # Register & Login
│   │   ├── threads.js       # Thread CRUD
│   │   └── daily-word.js    # Today's verse
├── migrations/
│   ├── 001_initial.sql      # Database schema
│   └── 002_seed.sql         # Categories + seed data
├── src/
│   ├── components/          # Shared UI components
│   ├── hooks/               # useAuth and other hooks
│   ├── lib/                 # Design tokens, constants
│   ├── pages/               # Route-level page components
│   ├── App.jsx              # Router
│   └── main.jsx             # Entry point
├── index.html
├── vite.config.js
└── wrangler.toml            # Cloudflare config
```

---

## 🗄️ Database Schema

**Tables:** `users`, `categories`, `threads`, `replies`, `thread_likes`, `reply_likes`, `daily_words`, `study_groups`, `study_group_members`

See `migrations/001_initial.sql` for the full schema.

---

## 🏅 Reputation & Badge System

| Badge    | Reputation | Description             |
|----------|-----------|--------------------------|
| Seeker   | 0+        | Asking honest questions  |
| Disciple | 20+       | Consistent learner       |
| Elder    | 100+      | Trusted community voice  |
| Teacher  | 500+      | Guiding others in faith  |

Points awarded: +5 for new thread, +2 for reply, +1 per like received.

---

## 🌐 Domains

- Primary: https://discussionsexegetica.com
- Redirect: https://discussionsexegetica.org → .com

---

## 📬 Contact

hello@discussionsexegetica.com
