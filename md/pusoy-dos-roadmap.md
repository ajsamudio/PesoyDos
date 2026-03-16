# Pusoy Dos — Project Roadmap
> Stage 3 document · Version 1.0  
> Stack: React + Vite · GitHub · Vercel · Supabase

---

## Overview

| Milestone | Focus | Tool | Est. Time |
|-----------|-------|------|-----------|
| M1 | Game runs in the browser | Cowork | 1–2 weeks |
| M2 | Logic verified + documented | Chat + Projects | 3–5 days |
| M3 | Design polished | Chat + Projects | 1 week |
| M4 | Live on the internet | Cowork | 2–3 days |
| M5 | Users + retention | Chat + Cowork | 2 weeks |
| M6 | Monetization | Chat | 1 week |

**Total to "live and playable":** M1–M4 ≈ 6–8 weeks at a few focused hours per week.

---

## M1 — Game runs in the browser
**Done when:** you can play a full game of Pusoy Dos alone vs AI in your browser.

- [ ] Set up GitHub repo + React app with Vite
- [ ] Build deck model — 52 unique cards, shuffle, deal 13 each
- [ ] Implement combo validator (single, pair, 5-card hands)
- [ ] Build game state machine (whose turn, current combo, control)
- [ ] Wire up medium AI — plays lowest valid combo, occasionally passes
- [ ] Basic UI — show cards, click to select, play/pass buttons
- [ ] Win detection + round end screen

---

## M2 — Logic verified + documented
**Done when:** every edge case in the rules .md is tested and confirmed correct.

- [ ] Build game-logic.md — every rule mapped to a function
- [ ] Write edge case tests (suit tiebreakers, control resets, last card)
- [ ] Play 10 full games manually, log any bugs
- [ ] Fix all bugs found, re-verify against rules spec

---

## M3 — Design polished
**Done when:** the game looks good enough that you'd show it to someone.

- [ ] Define visual style — card design, colors, table felt
- [ ] Build design.md — components, colors, font choices
- [ ] Implement card component with suit symbols + hover states
- [ ] Polish game table layout — player hands, discard pile, turn indicator
- [ ] Add animations — card play, win screen, AI "thinking" delay
- [ ] Mobile responsive layout

---

## M4 — Live on the internet
**Done when:** anyone with the link can play on any device.

- [ ] Connect GitHub repo to Vercel — auto-deploy on push
- [ ] Buy domain name (optional but recommended)
- [ ] Set up Supabase project — game results table
- [ ] Anonymous win/loss tracking (no login needed yet)
- [ ] Share with 5 people, collect feedback

---

## M5 — Users + retention
**Done when:** players come back for a second session on their own.

- [ ] Add user accounts via Supabase Auth (email or Google)
- [ ] Win/loss history per user
- [ ] Global leaderboard — wins this week
- [ ] Difficulty selector — Easy / Medium / Hard AI
- [ ] Share game result as image (for social)

---

## M6 — Monetization
**Done when:** the game earns its first dollar.

- [ ] Cosmetic card themes (unlockable) — Filipino art style skins
- [ ] One-time "remove ads" purchase via Stripe
- [ ] Optional tip jar / "buy me a coffee" link
- [ ] Non-intrusive banner ad for free tier (Google AdSense)

---

## Tool guide

| Tool | When to use |
|------|-------------|
| **Chat (here)** | Thinking, designing, writing docs, decisions, debugging logic |
| **Projects tab** | Store .md files so Claude remembers them across sessions |
| **Cowork** | Writing and running actual code, file creation, deploys |

---

## Key principle
Build ugly-but-working first (M1), then make it beautiful (M3). Never design before the logic is solid.

---

*End of Stage 3 roadmap. Next: Stage 4 — Logic .md file.*
