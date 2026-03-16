# Pusoy Dos — Game Rules Spec
> Stage 2 document · Version 1.0  
> This is the authoritative ruleset for the Pusoy Dos web game build.  
> All game logic must conform to this document.
---

## Overview

Pusoy Dos (Filipino Poker) is a shedding-type card game for 4 players. The goal is to be the first player to discard all cards from your hand.

---

## Deck & Deal

- Standard 52-card deck, no jokers
- **Each card is unique** — the deck contains exactly one of every card (e.g. only one 3♦, one A♠). Duplicate cards must never appear. This is a hard constraint on shuffle and deal logic.
- 4 players are dealt 13 cards each (52 ÷ 4 = 13)
- Cards are dealt one at a time, clockwise

---

## Card Rankings

### Face value (low → high)
```
3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · J · Q · K · A · 2
```
The **2 is the highest** card by face value. The **3 is the lowest**.

### Suit rank (low → high)
```
♣ Clubs  <  ♠ Spades  <  ♥ Hearts  <  ♦ Diamonds
```

### Tiebreaker
When two cards share the same face value, the higher suit wins.  
Example: 7♦ beats 7♥ beats 7♠ beats 7♣

### Absolute rankings
- **Highest card in the game:** 2♦
- **Lowest card in the game:** 3♣

---

## Starting the Game

- The player holding **3♣ goes first**
- They must play a combination that **includes the 3♣**
- Play proceeds **clockwise**

---

## Turn Structure

On each turn, a player must either:

1. **Play** — put down a valid combination that is **the same type** and **higher rank** than the previous play, OR
2. **Pass** — skip their turn (they cannot play again until a new round begins)

> ⚠️ A player who has already passed in the current round cannot play again until control resets.

---

## Gaining Control

A player **gains control** when:
- All other players pass consecutively after their play, OR
- The previous player discards their last card (that player wins; the next player with fewest cards leads)

A player **in control** may lead any valid combination of their choice. They **cannot pass**.

---

## Valid Combinations

Only these combination types are legal. A combination can only be beaten by a **higher combination of the same type and same card count**.

> ❌ Triples (three of a kind played as a standalone combo) are **not valid** in this version.

### Single
- Any 1 card
- Beaten by: a single card of higher rank, or same rank with higher suit

### Pair
- 2 cards of identical face value
- Beaten by: a pair of higher rank, or same rank with higher suit pair
- Rank of pair = face value; tiebreak = highest suit in the pair

### Five-Card Hands
All five-card hands are ranked against each other in the following order (low → high):

| Rank | Hand | Description |
|------|------|-------------|
| 1 (lowest) | **Straight** | 5 consecutive face values, any suits. Ranked by highest card, then suit. |
| 2 | **Flush** | 5 cards of the same suit. Ranked by highest card, then suit. |
| 3 | **Full House** | 3 cards of one rank + 2 cards of another rank. Ranked by the triple's face value. |
| 4 | **Four of a Kind + 1** | 4 cards of the same rank + any 1 card. Ranked by the quad's face value. |
| 5 | **Straight Flush** | 5 consecutive cards of the same suit. Ranked by highest card, then suit. |
| 6 (highest) | **Royal Flush** | 10-J-Q-K-A of the same suit. Beats all other five-card hands including Straight Flush. |

> ⚠️ A higher hand type always beats a lower hand type regardless of card values.  
> Example: Any Full House beats any Flush. Any Four of a Kind beats any Full House.

### Comparing same-type five-card hands

| Hand | How to compare |
|------|---------------|
| Straight | Compare highest card → then suit of highest card |
| Flush | Compare highest card → then suit |
| Full House | Compare the rank of the triple |
| Four of a Kind | Compare the rank of the quad |
| Straight Flush | Compare highest card → then suit |
| Royal Flush | All Royal Flushes are equal in rank — tiebreak by suit of the Ace |

---

## Winning a Round

- The **first player to discard all 13 cards wins** the round
- The game ends immediately when a player plays their last card
- No scoring — result is **win/loss only**
- A full game = **first to win 1 round**

---

## Special Rules

None active in this version. The following were explicitly excluded:

| Rule | Status |
|------|--------|
| Triples as valid combo | ❌ Excluded |
| Four 2s = instant win | ❌ Excluded |
| Penalty for ending with a 2 | ❌ Excluded |
| Honest card count rule | ❌ Excluded |
| Penalty point scoring | ❌ Excluded |

---

## Developer Notes

### Deck integrity constraint
The shuffle and deal algorithm must guarantee:
- Exactly 52 unique cards are in play at all times
- No card appears more than once across all hands
- Validation check: after dealing, confirm `allDealtCards.length === 52` and `new Set(allDealtCards).size === 52`

### Combo validation logic order
When checking if a played combo is legal, validate in this order:
1. Is the combo a valid type? (single / pair / 5-card hand)
2. Does it match the current round's combo type?
3. Does it match the card count of the current play?
4. Is it ranked higher than the current play?

### AI opponent (medium difficulty)
- Plays the lowest valid combo that beats the current play when possible
- Occasionally passes even when it could play (simulates blundering)
- Does not aggressively save high cards for end game
- No lookahead or hand simulation
---