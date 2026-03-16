# Pusoy Dos — Game Logic Document
> Stage 4 document · Version 1.0  
> This document maps every rule from the rules spec to a concrete function.  
> Use this in Cowork when building M1. Every function listed here must be implemented.

---

## Data models

Before writing any functions, define these core data structures. All functions operate on these shapes.

### Card
```js
{
  rank: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'J' | 'Q' | 'K' | 'A' | 2,
  suit: 'clubs' | 'spades' | 'hearts' | 'diamonds'
}
```

### Combo type
```js
'single' | 'pair' | 'straight' | 'flush' | 'fullhouse' | 'fourofakind' | 'straightflush' | 'royalflush'
```

### Game state
```js
{
  deck: Card[],             // 52 cards, shuffled
  hands: {                  // keyed by player index 0–3
    0: Card[],
    1: Card[],
    2: Card[],
    3: Card[]
  },
  currentCombo: Card[],     // cards on the table from the last valid play
  currentComboType: ComboType | null,
  currentPlayer: 0 | 1 | 2 | 3,
  controller: 0 | 1 | 2 | 3,  // player who last gained control
  passCount: number,           // how many consecutive passes this round
  winner: number | null        // null until someone empties their hand
}
```

---

## Function map

### 1. `createDeck(): Card[]`
Creates and returns a full 52-card deck.

**Logic:**
- Loop over all 4 suits × 13 ranks
- Return array of 52 unique card objects

**Edge cases:**
- Must produce exactly 52 cards
- No duplicates — validate with: `new Set(deck.map(cardId)).size === 52`
- Use a stable `cardId` format like `"3_clubs"` for deduplication

---

### 2. `shuffleDeck(deck: Card[]): Card[]`
Returns a new shuffled copy of the deck.

**Logic:**
- Use Fisher-Yates shuffle algorithm
- Never mutate the original array — return a new array

**Edge cases:**
- Input must have exactly 52 cards before shuffling
- Output must still have exactly 52 unique cards after shuffling

---

### 3. `dealCards(deck: Card[]): { hands: Hand, starterIndex: number }`
Deals 13 cards to each of 4 players and identifies who goes first.

**Logic:**
- Split deck into 4 arrays of 13 cards each (deck[0..12], deck[13..25], etc.)
- Find which hand contains the 3♣ — that player index is `starterIndex`

**Returns:**
```js
{
  hands: { 0: Card[], 1: Card[], 2: Card[], 3: Card[] },
  starterIndex: 0 | 1 | 2 | 3
}
```

**Edge cases:**
- Every player must receive exactly 13 cards
- 3♣ must exist in exactly one hand
- First play must include 3♣ (enforced in `isValidPlay`, not here)

---

### 4. `getCardValue(card: Card): number`
Returns a numeric value for a card used in comparisons.

**Logic:**
- Rank order (low → high): 3=0, 4=1, 5=2, 6=3, 7=4, 8=5, 9=6, 10=7, J=8, Q=9, K=10, A=11, 2=12
- Suit order (low → high): clubs=0, spades=1, hearts=2, diamonds=3
- Combined value: `rankValue * 4 + suitValue`
- This gives each card a unique integer from 0 (3♣) to 51 (2♦)

**Example:**
- 3♣ → 0*4 + 0 = 0
- 3♦ → 0*4 + 3 = 3
- 2♦ → 12*4 + 3 = 51

---

### 5. `compareCards(a: Card, b: Card): number`
Compares two individual cards. Returns positive if a > b, negative if a < b, 0 if equal.

**Logic:**
- `return getCardValue(a) - getCardValue(b)`

**Edge cases:**
- Two identical cards should never exist in a valid game (deck integrity constraint)
- Used as the comparator in all higher-order combo comparisons

---

### 6. `identifyCombo(cards: Card[]): ComboType | null`
Given an array of cards, returns the combo type or null if invalid.

**Logic:**
```
if cards.length === 1 → 'single'
if cards.length === 2 → check pair
if cards.length === 5 → check in order: royalflush, straightflush, fourofakind, fullhouse, flush, straight
anything else → null (invalid)
```

**Pair check:** both cards have the same rank

**Five-card checks (in priority order):**
1. `royalflush`: is it a straight flush AND the ranks are exactly 10-J-Q-K-A?
2. `straightflush`: is it a straight AND a flush? (but not a royal flush)
3. `fourofakind`: exactly 4 cards share a rank
4. `fullhouse`: one group of 3 same rank + one group of 2 same rank
5. `flush`: all 5 cards same suit
6. `straight`: 5 consecutive rank values (no gaps)

**Straight edge case:**
- Ranks must be consecutive using rankValue (0–12) with no gaps
- A-2-3-4-5 is NOT a valid straight (2 is rank 12, not rank 1)
- 10-J-Q-K-2 is NOT a valid straight (rank values 7-8-9-10-12, gap at 11)
- The 2 cannot act as a connector — it is only the highest single rank
- Valid lowest straight: 3-4-5-6-7 (rank values 0-1-2-3-4)
- Valid highest straight: 10-J-Q-K-A (rank values 7-8-9-10-11)

**Edge cases:**
- Cards array length other than 1, 2, or 5 → return null
- Triples (3 cards) → return null (excluded from this version)

---

### 7. `getComboRank(cards: Card[], type: ComboType): number`
Returns a numeric rank for a combo used to compare two combos of the same type.

**Logic by type:**

| Type | Rank basis |
|------|-----------|
| `single` | `getCardValue(cards[0])` |
| `pair` | `getCardValue(highestCard(cards))` — highest suit card in the pair |
| `straight` | `getCardValue(highestCard(cards))` |
| `flush` | `getCardValue(highestCard(cards))` |
| `fullhouse` | `rankValue of the triple` × 4 |
| `fourofakind` | `rankValue of the quad` × 4 |
| `straightflush` | `getCardValue(highestCard(cards))` |
| `royalflush` | `getCardValue(highestCard(cards))` — tiebreak by suit of the Ace |

**Helper:** `highestCard(cards)` = `cards.reduce((best, c) => compareCards(c, best) > 0 ? c : best)`

---

### 8. `getFiveCardTypeRank(type: ComboType): number`
Returns the tier ranking of a five-card hand type (used when types differ).

```js
{
  straight: 1,
  flush: 2,
  fullhouse: 3,
  fourofakind: 4,
  straightflush: 5,
  royalflush: 6
}
```

**Rule:** A higher type always beats a lower type, regardless of card values.

---

### 9. `compareCombo(played: Card[], current: Card[]): boolean`
Returns true if `played` beats `current`. This is the core gatekeeper function.

**Logic:**
```
1. Identify combo types for both
2. If either is null → return false (invalid combo)
3. If types don't match → return false (can't beat different type)
   Exception: five-card hands CAN beat each other across types
   (a fullhouse beats a flush even though they're different types)
4. If both are five-card hands of different types:
   → compare getFiveCardTypeRank — higher type wins
5. If same type (or both same five-card family):
   → compare getComboRank — higher rank wins
```

**Edge case — five-card cross-type rule:**
- `straight` vs `flush` → flush wins (type rank 2 > 1)
- `flush` vs `fullhouse` → fullhouse wins
- `fourofakind` vs `straightflush` → straightflush wins
- `straightflush` vs `royalflush` → royalflush wins
- A straight cannot beat a flush even if its cards are higher

---

### 10. `isValidPlay(played: Card[], gameState: GameState): boolean`
The top-level validation function. Returns true if a play is legal given the current game state.

**Logic:**
```
1. played must be non-empty
2. All played cards must exist in the current player's hand
3. identifyCombo(played) must not be null
4. If this is the very first play of the game:
   → played must include the 3♣
5. If currentCombo is null (player has control, fresh round):
   → any valid combo is allowed
6. If currentCombo exists:
   → compareCombo(played, currentCombo) must return true
```

**Edge cases:**
- Player cannot play cards they don't have
- Player in control cannot pass (enforced in turn logic, not here)
- First play of the game must contain 3♣ — the player can choose any valid combo that includes it (e.g. just the 3♣ as a single, or 3♣+3♥ as a pair, or a straight containing 3♣)

---

### 11. `applyPlay(played: Card[], gameState: GameState): GameState`
Applies a valid play to the game state and returns the new state.

**Logic:**
```
1. Remove played cards from currentPlayer's hand
2. Set currentCombo = played
3. Set currentComboType = identifyCombo(played)
4. Set controller = currentPlayer
5. Reset passCount = 0
6. Check win: if currentPlayer's hand is now empty → set winner = currentPlayer
7. Advance turn: currentPlayer = nextPlayer(currentPlayer)
```

**Returns:** new GameState (never mutate — always return a new object)

---

### 12. `applyPass(gameState: GameState): GameState`
Applies a pass to the game state and returns the new state.

**Logic:**
```
1. Increment passCount
2. If passCount === 3 (all other 3 players passed after controller's play):
   → New round: reset currentCombo = null, currentComboType = null, passCount = 0
   → Controller stays the same — they lead the next round
   → currentPlayer = controller
3. Else:
   → Advance turn: currentPlayer = nextPlayer(currentPlayer)
```

**Edge case — player can't pass if in control:**
- If `currentPlayer === controller` and `currentCombo === null`, they must play
- This check belongs in the UI layer, but document it here for clarity

---

### 13. `nextPlayer(current: number): number`
Returns the index of the next player in clockwise order.

**Logic:**
- `return (current + 1) % 4`

---

### 14. AI — `getAIMove(hand: Card[], gameState: GameState): Card[] | 'pass'`
Returns the AI's chosen play or 'pass'. Medium difficulty.

**Logic:**
```
1. Find all valid combos in hand that beat currentCombo
   → Use getCandidateCombos(hand, gameState)
2. If no valid combos → return 'pass'
3. Medium difficulty blunder: 20% of the time, return 'pass' even with valid options
4. From valid candidates, pick the lowest-ranked valid combo
   → Prefer using weaker cards to preserve strong ones
```

**Helper: `getCandidateCombos(hand, gameState)`**
```
- If currentCombo is null (AI has control):
  → Generate all valid combos from hand (any type)
  → Prefer leading with singles or pairs of low cards
- If currentCombo exists:
  → Generate all combos of the same type that beat currentCombo
  → For five-card hands: also include higher-type five-card combos
```

**Edge case — AI in control:**
- AI cannot pass when it has control and currentCombo is null
- Must always play something

---

## Edge case registry

These are the situations most likely to produce bugs. Test each one explicitly.

| # | Edge case | Expected behaviour |
|---|-----------|-------------------|
| 1 | 3♣ holder tries to open with a combo not containing 3♣ | `isValidPlay` returns false |
| 2 | Player tries to play a triple (3 cards same rank) | `identifyCombo` returns null |
| 3 | Player tries to beat a pair with a single | `compareCombo` returns false (type mismatch) |
| 4 | Player tries to beat a flush with a higher straight | `compareCombo` returns false (straight < flush) |
| 5 | Same rank pair, player plays same suit pair | Should never happen (deck integrity) |
| 6 | Same rank pair, player plays lower suit | `compareCombo` returns false |
| 7 | All 3 opponents pass after a play | Control resets, `currentCombo` clears |
| 8 | Player plays their last card | `winner` is set immediately, game ends |
| 9 | A-2-3-4-5 straight attempted | `identifyCombo` returns null (not valid straight) |
| 10 | Player tries to play cards not in their hand | `isValidPlay` returns false |
| 11 | AI has control with no valid combos in hand | Cannot happen — AI always has cards if game isn't over |
| 12 | Straight with a 2 attempted (e.g. 10-J-Q-K-2) | `identifyCombo` returns null — 2 is rank 12, creates a gap at Ace |

---

## Function dependency map

```
createDeck
  └─ shuffleDeck
       └─ dealCards

getCardValue
  └─ compareCards
       └─ getComboRank
            └─ compareCombo
                 └─ isValidPlay
                      └─ applyPlay
                      └─ applyPass

identifyCombo
  └─ isValidPlay
  └─ applyPlay
  └─ getAIMove

getFiveCardTypeRank
  └─ compareCombo

nextPlayer
  └─ applyPlay
  └─ applyPass

getAIMove  (uses isValidPlay, compareCombo, identifyCombo)
```

---

## Testing checklist for M2

Run these manually before moving to M3:

- [ ] Deal 4 hands — confirm 13 cards each, 52 total, no duplicates
- [ ] Confirm 3♣ appears in exactly one hand
- [ ] Single card: 2♦ beats every other single
- [ ] Pair: K♥K♦ beats K♣K♠
- [ ] Royal flush beats straight flush beats four of a kind beats full house beats flush beats straight
- [ ] A-2-3-4-5 is rejected as a straight
- [ ] 10-J-Q-K-A is accepted as the highest valid straight
- [ ] 10-J-Q-K-2 is rejected as a straight (2 is rank 12, gap at Ace)
- [ ] Passing 3 times correctly resets round and restores control
- [ ] Playing last card correctly ends the game
- [ ] AI never passes when it has control
- [ ] AI occasionally passes when it could play (blunder rate ~20%)

---

*End of Stage 4 logic document. Next: Stage 5 — Design.*
