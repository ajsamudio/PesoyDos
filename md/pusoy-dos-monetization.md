# Pusoy Dos — Monetization Guide
> Stage 7 document · Version 1.0  
> Philosophy: free first, earn trust, scale when you have users  
> Never paywalled — the core game is always free

---

## The core principle

> You cannot monetize zero users. Grow first. Charge later.

Most indie games fail at monetization because they add it before they have an audience.
The right order is:

```
Ship free → Get 100 players → Get 1,000 players → Introduce first revenue stream
→ Optimize → Get 10,000 players → Add second stream → Repeat
```

Do not touch monetization until you have at least 100 real returning players.
"Returning" means they came back more than once without you asking them to.

---

## Phase 0 — Free (launch through ~100 users)

**What to do:** nothing. Ship the game. Make it good. Make it fast.
Make players want to come back before you ask anything of them.

**What to track in Supabase (already set up in ship.md):**
- Games played per session
- Win rate
- Return visits (same session_id appearing on different days)

**The metric that unlocks Phase 1:**
> 100 unique session IDs that have played on 2+ different days.
> That means 100 people who genuinely like the game.

---

## Phase 1 — Tip jar (~100 users)

**What it is:** a single "Buy me a coffee" link. No accounts needed, no friction.

**Why this first:**
- Zero technical setup
- Tells you if anyone values the game enough to pay anything at all
- $1 from a stranger is proof of product-market fit

**How to set it up:**
1. Go to buymeacoffee.com → create a free account
2. Set your page name (e.g. `buymeacoffee.com/pusoydos`)
3. Add a small button to your HUD or win screen:

```jsx
// In WinScreen.jsx
<a
  href="https://buymeacoffee.com/pusoydos"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    fontSize: '12px',
    color: '#C8A96E',
    textDecoration: 'none',
    opacity: 0.7
  }}
>
  Enjoying the game? Support development
</a>
```

**Where to show it:** only on the win screen, never during gameplay.
Showing it mid-game kills immersion and annoys players.

**Target:** $0. Seriously. Phase 1 is a signal detector, not a revenue stream.
If you get even $5 in the first month, that's a green light to keep going.

---

## Phase 2 — Non-intrusive ads (~1,000 users)

**What it is:** Google AdSense banner. Free tier players see one small banner.
It appears only on the menu/lobby screen — never during a game.

**Why ads before cosmetics:**
- Zero friction for users (no buying flow to build)
- Passive income while you build cosmetics
- AdSense approval requires real traffic — start early so it's approved by the time you need it

**Revenue estimate:**
- Filipino diaspora CPM (cost per 1,000 views): ~$1–3
- Philippines-based CPM: ~$0.30–0.80
- At 1,000 daily active users × 2 page views each: ~$2–6/day = $60–180/month
- Not life-changing but it pays for your Supabase and domain

**How to set it up:**
1. Apply for Google AdSense at adsense.google.com
2. You need a real domain (this is when to buy one — ~$12/year)
3. AdSense review takes 1–2 weeks — apply early
4. Once approved, paste the ad snippet into your lobby/menu component only

```jsx
// In Lobby.jsx — NOT in the game canvas
useEffect(() => {
  if (window.adsbygoogle) {
    window.adsbygoogle.push({})
  }
}, [])

return (
  <ins
    className="adsbygoogle"
    style={{ display: 'block', width: '320px', height: '50px' }}
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot="XXXXXXXXXX"
  />
)
```

**Rules:**
- One ad unit maximum per page
- Never inside the game canvas
- Never on the win screen (that's for the tip jar)
- Never as a popup or interstitial

---

## Phase 3 — Cosmetic themes (~2,000–5,000 users)

**What it is:** paid card themes. The core game stays free forever.
Players pay only for visual customization — never for gameplay advantage.

**This is already designed** — see `pusoy-dos-design.md` → "Future custom themes" section.

### Pricing model options

| Model | Price | Best for |
|-------|-------|---------|
| One-time purchase per theme | $1.99–$2.99 | Players who hate subscriptions |
| Theme bundle pack | $4.99 for 3 themes | Higher average order value |
| "Supporter" one-time | $9.99 — unlocks all current + future themes | Best lifetime value |

**Recommendation:** start with one-time per theme at $1.99.
Simple to understand, low barrier, no subscription anxiety.

**What to use:** Stripe + a simple checkout flow.

```bash
npm install @stripe/stripe-js
```

**The buying flow:**
```
Player clicks theme → Preview shown → "Unlock for $1.99" button
→ Stripe checkout (hosted page — no card handling in your code)
→ Supabase records purchase against user account
→ Theme unlocked immediately
```

**Supabase tables needed for this (add in M6):**
```sql
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  theme_id text not null,
  amount_cents int not null,
  created_at timestamptz default now()
);
```

**Revenue estimate at 5,000 users:**
- 3% conversion rate (industry standard for cosmetics) = 150 buyers
- Average purchase $1.99 = ~$300 one-time
- Not huge — but combined with ads it funds development
- Grows linearly with users

---

## Phase 4 — Multiplayer premium (~10,000 users)

**What it is:** real-time online multiplayer as a premium feature.
Free players get AI only. Premium players get online multiplayer.

**Why save this for Phase 4:**
- Multiplayer requires WebSockets (Supabase Realtime) — significant engineering work
- It's only worth building once you know people love the single-player version
- It's a natural upsell: "You beat the AI — now play real people"

**What it costs to build:**
- Supabase Realtime is free up to 200 concurrent connections
- Beyond that: $25/month Supabase Pro plan
- Engineering time: ~2–4 weeks in Cowork

**Pricing model:**
- Free tier: vs AI only
- Pro tier: $2.99/month or $19.99/year — includes multiplayer + all themes
- "Lifetime" option: $49.99 one-time — popular with Filipino diaspora who want to support

**Revenue estimate at 10,000 users:**
- 2% convert to Pro ($2.99/month) = 200 subscribers = $598/month recurring
- That's your first real monthly recurring revenue (MRR)
- This is the inflection point — recurring revenue is what makes a product a business

---

## Phase 5 — Tournaments (~25,000+ users)

**What it is:** weekly or monthly bracketed tournaments with an entry fee.
Winner takes a portion of the pot. You take a platform fee (10–20%).

**Why this works for Pusoy Dos specifically:**
- Pusoy Dos is already played competitively in Filipino communities
- Tournaments create urgency and social sharing
- "I made it to the finals" is free marketing

**How it works:**
- Entry fee: $0.50–$2.00 per tournament
- 80% goes to winner(s), 20% platform fee to you
- Use Stripe for payment collection
- Tournament brackets handled in Supabase

**Legal note:** tournament prize pools with entry fees may be considered gambling
in some jurisdictions. Research your local laws before implementing.
Keeping entry fees very low ($0.50–$1.00) and emphasizing skill keeps this in
the "competitive game" category in most places. Consult a lawyer before launch.

---

## Revenue roadmap summary

| Phase | Trigger | Revenue stream | Est. monthly |
|-------|---------|----------------|-------------|
| 0 | Launch | None | $0 |
| 1 | 100 users | Tip jar | $0–20 |
| 2 | 1,000 users | AdSense banner | $60–180 |
| 3 | 2,000–5,000 users | Cosmetic themes | $100–500 |
| 4 | 10,000 users | Pro multiplayer subscription | $500–2,000 |
| 5 | 25,000+ users | Tournaments | $500–5,000+ |

---

## What NOT to do

These are the most common mistakes indie game developers make with monetization:

| Mistake | Why it kills your game |
|---------|----------------------|
| Ads during gameplay | Players quit and never return |
| Paywalling core features early | Kills word-of-mouth before you have any |
| Too many upsell prompts | Feels cheap, destroys trust |
| Adding monetization before retention | Monetizing people who don't love the game yet |
| Copying mobile game dark patterns | Your audience is adults who know what manipulation looks like |
| Subscriptions too early | Players resist recurring charges for a game they just found |

---

## Key metrics to track in Supabase

Add these tracking calls progressively as you grow:

```js
// Track these events in a simple 'events' table
{
  event: 'game_started' | 'game_won' | 'game_lost' | 'theme_previewed' |
         'theme_purchased' | 'ad_shown' | 'tip_clicked' | 'session_returned',
  session_id: string,
  user_id: string | null,
  metadata: object,
  created_at: timestamp
}
```

**The three numbers that matter most:**
1. **DAU (daily active users)** — is the game growing?
2. **D7 retention** — of players who played today, how many played 7 days ago? Target: >20%
3. **ARPU (average revenue per user)** — total revenue ÷ total users. Even $0.05 is meaningful early on.

---

## Cowork prompt for monetization features

When you're ready to implement a specific phase in Cowork:
> "I'm adding [tip jar / AdSense / Stripe cosmetics] to my Pusoy Dos game. Here is my ship doc and design doc. The game is live at [URL]. Help me implement [specific feature] without affecting gameplay or the Three.js canvas."

---

## Final thought

The best monetization strategy for a passion project like this is patience.
Build something Filipinos are genuinely proud to share with their family.
Word of mouth in tight-knit communities like the Filipino diaspora is
worth more than any ad spend. Get the game right first.
The money follows the players.

---

*End of Stage 7 monetization guide.*  
*All 7 stages complete. Your Pusoy Dos project documents are ready.*
