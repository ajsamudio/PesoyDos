// ============================================================
// Pusoy Dos — Game Logic
// All functions match the spec in pusoy-dos-game-logic.md
// ============================================================

// ── Data constants ───────────────────────────────────────────

export const SUITS = ['clubs', 'spades', 'hearts', 'diamonds']
export const RANKS = [3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A', 2]

const RANK_VALUE = {
  3: 0, 4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 6, 10: 7,
  J: 8, Q: 9, K: 10, A: 11, 2: 12,
}
const SUIT_VALUE = { clubs: 0, spades: 1, hearts: 2, diamonds: 3 }

const FIVE_CARD_TYPE_RANK = {
  straight: 1, flush: 2, fullhouse: 3, fourofakind: 4, straightflush: 5, royalflush: 6,
}
const FIVE_CARD_TYPES = new Set(['straight', 'flush', 'fullhouse', 'fourofakind', 'straightflush', 'royalflush'])

// ── 1. createDeck ────────────────────────────────────────────

export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit })
    }
  }
  // Validate no duplicates
  const ids = deck.map(cardId)
  if (new Set(ids).size !== 52) throw new Error('Deck creation error: duplicate cards')
  return deck
}

// ── 2. shuffleDeck ───────────────────────────────────────────

export function shuffleDeck(deck) {
  if (deck.length !== 52) throw new Error('shuffleDeck: expected 52 cards')
  const arr = [...deck] // never mutate original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── 3. dealCards ─────────────────────────────────────────────

export function dealCards(deck) {
  const hands = {
    0: deck.slice(0, 13),
    1: deck.slice(13, 26),
    2: deck.slice(26, 39),
    3: deck.slice(39, 52),
  }
  let starterIndex = -1
  for (let i = 0; i < 4; i++) {
    if (hands[i].some(c => c.rank === 3 && c.suit === 'clubs')) {
      starterIndex = i
      break
    }
  }
  if (starterIndex === -1) throw new Error('dealCards: 3♣ not found in any hand')
  return { hands, starterIndex }
}

// ── 4. getCardValue ──────────────────────────────────────────

export function getCardValue(card) {
  return RANK_VALUE[card.rank] * 4 + SUIT_VALUE[card.suit]
}

// ── 5. compareCards ──────────────────────────────────────────

export function compareCards(a, b) {
  return getCardValue(a) - getCardValue(b)
}

// ── Helper: cardId for dedup ─────────────────────────────────

export function cardId(card) {
  return `${card.rank}_${card.suit}`
}

// ── Helper: highestCard ──────────────────────────────────────

function highestCard(cards) {
  return cards.reduce((best, c) => compareCards(c, best) > 0 ? c : best)
}

// ── 6. identifyCombo ─────────────────────────────────────────

export function identifyCombo(cards) {
  if (!cards || cards.length === 0) return null

  if (cards.length === 1) return 'single'

  if (cards.length === 2) {
    return cards[0].rank === cards[1].rank ? 'pair' : null
  }

  if (cards.length === 5) {
    return identifyFiveCard(cards)
  }

  // 3 or 4 cards — not valid in this ruleset
  return null
}

function identifyFiveCard(cards) {
  const ranks = cards.map(c => RANK_VALUE[c.rank]).sort((a, b) => a - b)
  const suits = cards.map(c => c.suit)

  const isFlush = suits.every(s => s === suits[0])
  const isStraight = (() => {
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] !== ranks[i - 1] + 1) return false
    }
    return true
  })()

  // Rank frequency map
  const freq = {}
  for (const r of ranks) freq[r] = (freq[r] || 0) + 1
  const counts = Object.values(freq).sort((a, b) => b - a) // e.g. [4,1], [3,2], [2,2,1]

  // Royal flush: A-K-Q-J-10 all same suit (rank values 7,8,9,10,11)
  const isRoyal = isStraight && isFlush && ranks[0] === 7 && ranks[4] === 11
  if (isRoyal) return 'royalflush'
  if (isStraight && isFlush) return 'straightflush'
  if (counts[0] === 4) return 'fourofakind'
  if (counts[0] === 3 && counts[1] === 2) return 'fullhouse'
  if (isFlush) return 'flush'
  if (isStraight) return 'straight'
  return null
}

// ── 7. getComboRank ──────────────────────────────────────────

export function getComboRank(cards, type) {
  switch (type) {
    case 'single':
    case 'pair':
    case 'straight':
    case 'flush':
    case 'straightflush':
      return getCardValue(highestCard(cards))

    case 'fullhouse': {
      // Rank of the triple
      const freq = {}
      for (const c of cards) freq[c.rank] = (freq[c.rank] || 0) + 1
      const tripleRank = Object.entries(freq).find(([, v]) => v === 3)[0]
      // tripleRank is a string key; convert back to original rank type
      const rankKey = isNaN(tripleRank) ? tripleRank : Number(tripleRank)
      return RANK_VALUE[rankKey] * 4
    }

    case 'fourofakind': {
      const freq = {}
      for (const c of cards) freq[c.rank] = (freq[c.rank] || 0) + 1
      const quadRank = Object.entries(freq).find(([, v]) => v === 4)[0]
      const rankKey = isNaN(quadRank) ? quadRank : Number(quadRank)
      return RANK_VALUE[rankKey] * 4
    }

    default:
      return 0
  }
}

// ── 8. getFiveCardTypeRank ───────────────────────────────────

export function getFiveCardTypeRank(type) {
  return FIVE_CARD_TYPE_RANK[type] ?? 0
}

// ── 9. compareCombo ──────────────────────────────────────────

export function compareCombo(played, current) {
  const playedType = identifyCombo(played)
  const currentType = identifyCombo(current)

  if (!playedType || !currentType) return false

  // Must match length (can't beat a pair with a 5-card hand)
  if (played.length !== current.length) return false

  // Both five-card hands — can cross types
  if (FIVE_CARD_TYPES.has(playedType) && FIVE_CARD_TYPES.has(currentType)) {
    const pr = getFiveCardTypeRank(playedType)
    const cr = getFiveCardTypeRank(currentType)
    if (pr !== cr) return pr > cr
    // Same five-card type — compare rank
    return getComboRank(played, playedType) > getComboRank(current, currentType)
  }

  // Types must match for 1-card and 2-card plays
  if (playedType !== currentType) return false

  return getComboRank(played, playedType) > getComboRank(current, currentType)
}

// ── 10. isValidPlay ──────────────────────────────────────────

export function isValidPlay(played, gameState) {
  if (!played || played.length === 0) return false

  // All played cards must be in the current player's hand
  const hand = gameState.hands[gameState.currentPlayer]
  const handIds = new Set(hand.map(cardId))
  for (const c of played) {
    if (!handIds.has(cardId(c))) return false
  }

  // Must be a valid combo
  const type = identifyCombo(played)
  if (!type) return false

  // First play of game must include 3♣
  if (gameState.isFirstPlay) {
    const has3Clubs = played.some(c => c.rank === 3 && c.suit === 'clubs')
    if (!has3Clubs) return false
  }

  // No current combo on table — any valid combo goes
  if (!gameState.currentCombo || gameState.currentCombo.length === 0) {
    return true
  }

  // Must beat the current combo
  return compareCombo(played, gameState.currentCombo)
}

// ── 11. applyPlay ─────────────────────────────────────────────

export function applyPlay(played, gameState) {
  const newHands = {}
  for (let i = 0; i < 4; i++) {
    newHands[i] = [...gameState.hands[i]]
  }

  // Remove played cards from current player's hand
  const playedIds = new Set(played.map(cardId))
  newHands[gameState.currentPlayer] = newHands[gameState.currentPlayer].filter(
    c => !playedIds.has(cardId(c))
  )

  const winner =
    newHands[gameState.currentPlayer].length === 0
      ? gameState.currentPlayer
      : null

  const next = nextPlayer(gameState.currentPlayer)

  return {
    ...gameState,
    hands: newHands,
    currentCombo: played,
    currentComboType: identifyCombo(played),
    controller: gameState.currentPlayer,
    passCount: 0,
    winner,
    currentPlayer: winner !== null ? gameState.currentPlayer : next,
    isFirstPlay: false,
  }
}

// ── 12. applyPass ─────────────────────────────────────────────

export function applyPass(gameState) {
  const newPassCount = gameState.passCount + 1

  // All other 3 players passed — reset round, controller leads
  if (newPassCount === 3) {
    return {
      ...gameState,
      passCount: 0,
      currentCombo: null,
      currentComboType: null,
      currentPlayer: gameState.controller,
    }
  }

  return {
    ...gameState,
    passCount: newPassCount,
    currentPlayer: nextPlayer(gameState.currentPlayer),
  }
}

// ── 13. nextPlayer ────────────────────────────────────────────

export function nextPlayer(current) {
  return (current + 1) % 4
}

// ── 14. AI — getAIMove ────────────────────────────────────────

export function getAIMove(hand, gameState) {
  const candidates = getCandidateCombos(hand, gameState)

  if (candidates.length === 0) return 'pass'

  // Medium difficulty: 20% blunder — pass even when able to play
  // (but NOT when AI has control with no current combo — must play then)
  const mustPlay =
    gameState.currentPlayer === gameState.controller &&
    (!gameState.currentCombo || gameState.currentCombo.length === 0)

  if (!mustPlay && Math.random() < 0.2) return 'pass'

  // Pick the lowest-ranked valid combo to preserve strong cards
  candidates.sort((a, b) => {
    const ta = identifyCombo(a)
    const tb = identifyCombo(b)
    return getComboRank(a, ta) - getComboRank(b, tb)
  })

  return candidates[0]
}

function getCandidateCombos(hand, gameState) {
  const allCombos = generateAllCombos(hand)
  const current = gameState.currentCombo

  if (!current || current.length === 0) {
    // AI has control — any valid combo
    return allCombos.filter(c => identifyCombo(c) !== null)
  }

  // Must beat the current combo
  return allCombos.filter(c => compareCombo(c, current))
}

function generateAllCombos(hand) {
  const combos = []

  // Singles
  for (const c of hand) combos.push([c])

  // Pairs — cards with same rank
  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      if (hand[i].rank === hand[j].rank) {
        combos.push([hand[i], hand[j]])
      }
    }
  }

  // Five-card hands — check all C(n,5) combos
  if (hand.length >= 5) {
    const fiveCardCombos = choose5(hand)
    for (const five of fiveCardCombos) {
      if (identifyCombo(five) !== null) combos.push(five)
    }
  }

  return combos
}

function choose5(arr) {
  const result = []
  const n = arr.length
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++)
            result.push([arr[a], arr[b], arr[c], arr[d], arr[e]])
  return result
}

// ── Helper: initialise a fresh game state ─────────────────────

export function createInitialGameState() {
  const deck = shuffleDeck(createDeck())
  const { hands, starterIndex } = dealCards(deck)
  return {
    deck,
    hands,
    currentCombo: null,
    currentComboType: null,
    currentPlayer: starterIndex,
    controller: starterIndex,
    passCount: 0,
    winner: null,
    isFirstPlay: true,
  }
}
