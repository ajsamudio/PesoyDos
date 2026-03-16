# Pusoy Dos — Design System
> Stage 5 document · Version 1.0  
> Filipino cultural aesthetic · Warm tones · Perspective Three.js table  
> Use this in Cowork when building M3.

---

## Visual identity

| Property | Value |
|----------|-------|
| Vibe | Filipino cultural — warm, rich, grounded |
| Primary influence | Bangko weave patterns, baybayin script, indigenous craft |
| Renderer | Three.js (WebGL) — perspective 3D table |
| Performance target | 60fps desktop · 30fps+ mobile · <2MB JS bundle |

---

## Color palette

### Core colors (hardcoded — not CSS variables, these are game world colors)

| Token | Hex | Use |
|-------|-----|-----|
| `table-felt` | `#2D5016` | Table surface felt |
| `table-rim` | `#6B3A1F` | Wooden table edge |
| `table-bg` | `#1a0f05` | Scene background / night |
| `card-face` | `#FDF6E3` | Card face — warm white, not pure white |
| `card-back-primary` | `#8B1A1A` | Card back — deep Filipino red |
| `card-back-accent` | `#C8860A` | Card back pattern — golden bangko |
| `suit-red` | `#C0392B` | Hearts ♥ and Diamonds ♦ |
| `suit-black` | `#1a1a2e` | Clubs ♣ and Spades ♠ |
| `chip-red` | `#C0392B` | High value chip |
| `chip-gold` | `#F39C12` | Mid value chip |
| `chip-green` | `#27AE60` | Low value chip |
| `ui-gold` | `#FFD580` | UI highlights, selected card glow |
| `ui-gold-dark` | `#8B6914` | UI labels, secondary text |

### UI overlay palette (for HUD, buttons, menus — on top of the 3D scene)

| Token | Hex | Use |
|-------|-----|-----|
| `ui-bg` | `rgba(26,15,5,0.85)` | Panel backgrounds (dark warm translucent) |
| `ui-border` | `rgba(200,134,10,0.4)` | Panel borders — golden at low opacity |
| `ui-text-primary` | `#FDF6E3` | Main readable text |
| `ui-text-secondary` | `#C8A96E` | Secondary labels |
| `ui-btn-bg` | `rgba(139,58,10,0.8)` | Button fill |
| `ui-btn-hover` | `rgba(200,90,15,0.9)` | Button hover |
| `ui-btn-text` | `#FFD580` | Button label |
| `ui-selected` | `#FFD580` | Selected card highlight ring |
| `ui-invalid` | `#C0392B` | Invalid play flash |

---

## Typography

| Use | Font | Size | Weight |
|-----|------|------|--------|
| Card rank label | Georgia / serif | 28–36px | Bold |
| Card suit symbol | Georgia / serif | 36–56px | Bold |
| HUD player name | System sans | 13px | 500 |
| HUD card count | System sans | 11px | 400 |
| Button label | System sans | 14px | 500 |
| Turn indicator | System sans | 13px | 400 |
| Win screen title | Georgia / serif | 32px | Bold |

> Rule: Card faces use serif. All UI chrome uses system sans. Never mix them in the same element.

---

## Three.js scene setup

### Camera
```js
camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 100)
camera.position.set(0, 5.5, 7)  // slightly above, slightly back
camera.lookAt(0, 0, 0)
```

### Lighting
```js
// Warm ambient — Filipino afternoon light
ambientLight = new THREE.AmbientLight(0xffecc8, 0.6)

// Key light from upper right
dirLight = new THREE.DirectionalLight(0xffd580, 1.2)
dirLight.position.set(3, 8, 4)
dirLight.castShadow = true

// Warm fill from back left — adds depth to cards
fillLight = new THREE.PointLight(0xff9933, 0.4, 20)
fillLight.position.set(-4, 3, -2)
```

### Table
```js
// Felt top — cylinder, flat
tableGeo = new THREE.CylinderGeometry(5, 5, 0.18, 64)
// Apply felt texture (canvas-drawn woven grid — see texture spec below)

// Wooden rim — torus around edge
rimGeo = new THREE.TorusGeometry(5, 0.18, 12, 64)
rimColor = 0x6B3A1F
```

### Performance rules
- Use `MeshLambertMaterial` NOT `MeshStandardMaterial` — Lambert is 3× faster on mobile
- All textures drawn via `CanvasTexture` (no external image requests)
- Max texture size: 256×256px per card face
- Card geometry: `BoxGeometry(0.7, 0.015, 1.0)` — 6 faces, 12 triangles each
- Max scene polygons: keep under 15,000 total
- Use `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — cap at 2x on retina
- Disable shadows on mobile: check `navigator.maxTouchPoints > 0`

---

## Card design

### Card geometry
```js
width  = 0.7   // Three.js units
height = 0.015 // thickness
depth  = 1.0   // card length
rx     = 0.04  // corner rounding (approximate with beveled geo or canvas)
```

### Card face texture (drawn on 256×256 canvas)
```
Background: #FDF6E3 (warm white)
Border: 1px #8B5E1A at 30% opacity, inset 6px
Rank: top-left, 28px bold Georgia, suit color
Suit symbol small: below rank, 22px
Suit symbol large: centered, 56px bold Georgia
```

### Card back texture (drawn on 256×256 canvas)
```
Background: #8B1A1A (deep red)
Pattern layer 1: diamond bangko weave in #C8860A at 40% opacity
  — 12×12px repeating diamond grid
Pattern layer 2: radial sunburst lines from center at 15% opacity
Border: 3px double line in #FFD580 at 80% opacity, inset 8px and 14px
```

### Card states
| State | Visual |
|-------|--------|
| Default | Flat on table, slight y-offset stacking |
| Hovered | Lifts +0.3 units in y, 200ms ease |
| Selected | Lifts +0.5 units, golden ring glow around base |
| Played | Animates from hand to center table (0.4s arc) |
| Invalid | Quick red flash on card face (0.15s) |
| Opponent card | Always shows back texture |

---

## Table layout (player positions)

```
        [Player 2 — AI] (top, facing down)
               ↑
[Player 3]  [Center pile]  [Player 1]
  (left)                    (right)
               ↓
        [Player 0 — Human] (bottom, facing up, cards visible)
```

### Position coordinates (Three.js)
```js
positions = {
  human:  { x: 0,    z:  4.2, rotY: 0,           tilt: 0.18 },
  right:  { x: 4.0,  z:  0,   rotY: -1.35,        tilt: 0.12 },
  top:    { x: 0,    z: -3.8, rotY: Math.PI,       tilt: 0.18 },
  left:   { x: -4.0, z:  0,   rotY:  1.35,         tilt: 0.12 },
}
```

### Hand fan layout
- Cards fanned in an arc: each card offset by 0.22 radians
- Z-rotation = fan angle, slight X-tilt toward viewer
- Human hand: full face-up fan, 7–13 cards
- AI hands: back-texture only, fanned the same way for fairness

### Center play pile
- Played combo sits center table (0, 0.2, 0.3)
- Each new play replaces or stacks slightly above previous
- Max 5 cards visible at once (the combo played)

---

## HUD (HTML overlay on top of canvas)

The HUD is a standard HTML/CSS layer positioned absolute over the Three.js canvas. It does NOT use Three.js.

### Layout
```
┌─────────────────────────────────┐
│  [Player 2]  13 cards           │  ← top bar
├─────────────────────────────────┤
│                                 │
│        [3D TABLE]               │
│                                 │
├────────────────┬────────────────┤
│ [PASS]         │ [PLAY]         │  ← action bar
└────────────────┴────────────────┘
```

### Action bar
```css
background: rgba(26,15,5,0.85);
border-top: 1px solid rgba(200,134,10,0.4);
padding: 12px 16px;
display: flex;
gap: 12px;
```

### Buttons
```css
.btn-play {
  background: rgba(139,58,10,0.8);
  color: #FFD580;
  border: 1px solid rgba(200,134,10,0.6);
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 500;
}
.btn-play:hover { background: rgba(200,90,15,0.9); }
.btn-play:disabled { opacity: 0.35; cursor: not-allowed; }

.btn-pass {
  background: transparent;
  color: #C8A96E;
  border: 1px solid rgba(200,134,10,0.3);
}
```

### Turn indicator
```
"Your turn" — ui-gold, 13px
"AI thinking..." — ui-text-secondary, 13px, pulsing opacity animation
```

---

## Animations

| Event | Animation | Duration |
|-------|-----------|----------|
| Card played | Arc from hand to center | 400ms ease-in-out |
| Card hover | Y lift + scale 1.03 | 150ms ease |
| Card select | Y lift + gold ring | 200ms ease |
| AI thinking | Visible pause + "thinking..." text | 600–1200ms (random) |
| Win screen | Cards fan out + gold shimmer | 800ms |
| Invalid play | Red flash on card(s) | 150ms |
| New round | Center pile sweeps off-table | 300ms |

All Three.js animations use a simple lerp in the `requestAnimationFrame` loop — no animation library needed.

```js
// lerp helper
function lerp(a, b, t) { return a + (b - a) * t }

// In animate loop:
card.position.y = lerp(card.position.y, card.targetY, 0.12)
card.rotation.z = lerp(card.rotation.z, card.targetRot, 0.12)
```

---

## Mobile considerations

- Touch drag to rotate table: `touchmove` event on canvas
- Touch tap card = select; tap again = deselect
- On screens < 480px: reduce hand fan spread by 30%
- On screens < 480px: reduce camera distance by 1 unit for closer view
- Disable `dirLight.castShadow` on mobile (check `navigator.maxTouchPoints > 0`)
- Target 30fps minimum on mid-range Android (Moto G series)

---

## File structure for M3

```
src/
  game/          ← all logic from game-logic.md
  three/
    scene.js     ← renderer, camera, lights setup
    table.js     ← table mesh + rim
    card.js      ← card geometry + texture generation
    hand.js      ← fan layout for each player position
    animations.js ← lerp helpers, play arc, win screen
  ui/
    HUD.jsx      ← React overlay (turn indicator, buttons)
    WinScreen.jsx
  App.jsx        ← mounts canvas + HUD
```

---

## What goes in Cowork for M3

When starting M3 in Cowork, paste:
> "I'm polishing the design for my Pusoy Dos game. Here is my design.md: [paste]. Implement the Three.js scene setup, card textures, and HUD overlay. Start with `scene.js` and `card.js`."

---

---

## Future — custom themes (post-launch, M6)

Players will be able to unlock or purchase alternate visual themes. This is a monetization feature planned for M6.

### What a theme controls
| Element | Customizable |
|---------|-------------|
| Card back pattern | Custom image upload or preset pattern |
| Card back color | Full color picker |
| Felt color | Preset swatches (green, navy, burgundy, black, custom) |
| Table rim color | Preset swatches (dark wood, light wood, gold, black) |
| Suit colors | Custom hex for red suits and black suits separately |
| Card face background | Color tint over the warm white base |

### How it works technically
- Each theme is a plain JSON object that overrides the default color tokens
- The Three.js `CanvasTexture` generation functions accept a `theme` parameter
- Custom image uploads are stored in Supabase Storage, fetched as a URL, drawn onto the card back canvas via `ctx.drawImage()`
- Themes are saved per user in Supabase (linked to their account)

```js
// Theme shape
{
  id: 'baybayin-gold',
  name: 'Baybayin gold',
  cardBackColor: '#1A0A3B',
  cardBackAccent: '#FFD700',
  cardBackImageUrl: null,       // or a Supabase Storage URL
  feltColor: '#1B3A2D',
  rimColor: '#4A2C0A',
  suitRed: '#E74C3C',
  suitBlack: '#1a1a2e',
}
```

### Custom image upload rules
- Max file size: 2MB
- Accepted formats: JPG, PNG, WebP
- Image is tiled or center-cropped to fill the card back canvas (256×256)
- Explicit content check before storing (basic client-side size/type validation; server-side moderation optional)

### Preset themes to ship at M6
1. **Classic Filipino** — default (deep red + bangko gold)
2. **Baybayin night** — dark navy + gold baybayin script pattern
3. **Sampaguita** — white + green, floral weave
4. **Jeepney brights** — vibrant multicolor, loud and fun
5. **Custom** — player-defined (color picker + optional image upload)

---

*End of Stage 5 design document. Next: Stage 6 — Ship (Vercel + Supabase deploy).*
