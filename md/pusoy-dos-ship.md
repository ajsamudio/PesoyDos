# Pusoy Dos — Ship Guide
> Stage 6 document · Version 1.0  
> Stack: React + Vite · GitHub · Vercel · Supabase  
> Goal: game is live at a public URL, anyone can play

---

## Overview

Three services, three jobs:

| Service | Job | Cost |
|---------|-----|------|
| **GitHub** | Stores your code, tracks every change | Free |
| **Vercel** | Publishes your game to the internet, auto-updates | Free |
| **Supabase** | Database — stores game results, later user accounts | Free |

The flow is: you write code → push to GitHub → Vercel automatically detects the push → rebuilds and redeploys in ~30 seconds. You never manually upload anything.

---

## Phase 1 — Create your React project

Do this in your terminal. You only do this once.

### Step 1 — Check Node.js is installed
```bash
node -v
```
If you see a version number (e.g. `v20.11.0`), you're good.  
If you get "command not found", download Node.js from nodejs.org first.

### Step 2 — Create the project
```bash
npm create vite@latest pusoy-dos -- --template react
cd pusoy-dos
npm install
```

### Step 3 — Install Three.js
```bash
npm install three
```

### Step 4 — Run locally to confirm it works
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. You should see the default Vite + React page. That means everything is working.

---

## Phase 2 — Push to GitHub

### Step 1 — Create a new repo on GitHub
- Go to github.com → click the `+` button → "New repository"
- Name it: `pusoy-dos`
- Set to **Public** (required for free Vercel deploys)
- Do NOT check "Add README" — your project already has files
- Click "Create repository"

### Step 2 — Connect your local project to GitHub
Run these commands inside your `pusoy-dos` folder:
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pusoy-dos.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3 — Confirm
Refresh your GitHub repo page. You should see all your files there.

> From now on, every time you want to save + publish changes:
> ```bash
> git add .
> git commit -m "describe what you changed"
> git push
> ```
> That's it. Vercel will auto-deploy within 30 seconds.

---

## Phase 3 — Deploy to Vercel

### Step 1 — Create a Vercel account
- Go to vercel.com → "Sign up" → choose "Continue with GitHub"
- Authorize Vercel to access your GitHub

### Step 2 — Import your project
- In Vercel dashboard → click "Add New Project"
- Find `pusoy-dos` in the list → click "Import"
- Vercel will auto-detect it as a Vite project
- Leave all settings as default
- Click "Deploy"

### Step 3 — Wait ~30 seconds
Vercel builds your project. When it's done you'll see a green checkmark and a live URL like:
```
https://pusoy-dos-abc123.vercel.app
```

That URL is your game. Share it with anyone.

### Step 4 — Every future deploy is automatic
Push to GitHub → Vercel detects it → rebuilds automatically. You never touch Vercel again unless you want to change settings.

---

## Phase 4 — Set up Supabase

You won't need Supabase until late M4 (anonymous tracking) but set it up now while everything is fresh.

### Step 1 — Create a Supabase account
- Go to supabase.com → "Start your project" → sign in with GitHub

### Step 2 — Create a project
- Click "New project"
- Name: `pusoy-dos`
- Database password: generate a strong one and save it somewhere safe
- Region: pick the one closest to you (US West for California)
- Click "Create new project" — takes about 1 minute

### Step 3 — Create the game_results table
In the Supabase dashboard → Table Editor → "New table":

```
Table name: game_results

Columns:
  id          uuid        primary key, default: gen_random_uuid()
  created_at  timestamptz default: now()
  result      text        'win' or 'loss'
  rounds      int         number of rounds played
  session_id  text        anonymous browser session ID
```

Or run this in the SQL editor (Dashboard → SQL Editor):
```sql
create table game_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  result text not null check (result in ('win','loss')),
  rounds int default 1,
  session_id text
);
```

### Step 4 — Get your API keys
In Supabase → Project Settings → API:
- Copy `Project URL` — looks like `https://xxxxx.supabase.co`
- Copy `anon public` key — a long string starting with `eyJ...`

### Step 5 — Add keys to Vercel (never put them in your code)
In Vercel → your project → Settings → Environment Variables:
```
VITE_SUPABASE_URL      = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...your anon key...
```

### Step 6 — Install Supabase in your project
```bash
npm install @supabase/supabase-js
```

### Step 7 — Create the Supabase client
Create file `src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Step 8 — Save a game result (use this when a game ends)
```js
import { supabase } from './lib/supabase'

async function saveResult(result) {
  const sessionId = localStorage.getItem('session_id') || crypto.randomUUID()
  localStorage.setItem('session_id', sessionId)

  await supabase.from('game_results').insert({
    result,           // 'win' or 'loss'
    rounds: 1,
    session_id: sessionId
  })
}

// Call it when the game ends:
saveResult('win')
saveResult('loss')
```

---

## Phase 5 — Share and collect feedback

Once live, share with at least 5 people before building anything else. Real feedback is worth more than perfect code.

### What to ask them
- Could you figure out how to play without instructions?
- Did anything feel broken or confusing?
- Did the game run well on your device?
- Would you come back and play again?

### Where to share
- Filipino community Discord servers
- Reddit: r/Philippines, r/CardGames
- Twitter/X with #PusoyDos hashtag
- Direct message 5 people who you know play card games

---

## Vercel URL vs custom domain

You chose to skip a custom domain for now — smart. Your Vercel URL works perfectly for testing and early users.

When you're ready to buy a domain later (recommended before M5/launch):
- Buy from Namecheap or Cloudflare Registrar (~$10-15/year)
- Add it in Vercel → Project → Settings → Domains
- Vercel handles the SSL certificate automatically (HTTPS, free)

Good domain ideas:
- `pusoydos.app`
- `pusoydos.io`
- `playputsoy.com`
- `pusoygo.com`

---

## Checklist — done when all boxes are ticked

- [ ] `npm run dev` runs locally without errors
- [ ] Code is pushed to GitHub repo `pusoy-dos`
- [ ] Vercel is connected to GitHub repo and auto-deploys
- [ ] Game is live at a `vercel.app` URL
- [ ] Supabase project created with `game_results` table
- [ ] Environment variables added to Vercel
- [ ] `saveResult()` fires correctly when a game ends (check Supabase table for rows)
- [ ] Game tested on a phone browser (not just desktop)
- [ ] Shared with at least 5 people, feedback collected

---

## Cowork prompt for this stage

When you open Cowork for M4 (shipping), paste:
> "I'm deploying my Pusoy Dos React + Vite game. I have a GitHub account and my game code is ready. Help me: 1) initialize the git repo and push to GitHub, 2) connect to Vercel, 3) set up Supabase with the game_results table, 4) wire up the saveResult() function to fire when a game ends. Here is my design doc and logic doc: [paste]."

---

## What comes after this (M5)

Once the game is live and you have real users, M5 adds:
- User accounts (Supabase Auth — email or Google login)
- Win/loss history per user
- Global leaderboard
- Hard / Easy AI difficulty toggle

You'll add these tables to Supabase when the time comes:
```sql
-- M5 additions (don't create these yet)
-- profiles table (created automatically by Supabase Auth)
-- leaderboard view (built from game_results filtered by auth.uid)
```

---

*End of Stage 6 ship guide. Next: Stage 7 — Monetize.*
