import { useState, useEffect, useCallback, useRef } from 'react'
import {
  createInitialGameState,
  isValidPlay,
  applyPlay,
  applyPass,
  getAIMove,
  cardId,
  identifyCombo,
} from './game/gameLogic.js'
import Hand from './components/Hand.jsx'
import GameBoard from './components/GameBoard.jsx'

const HUMAN_PLAYER = 0
const AI_THINK_MS_MIN = 600
const AI_THINK_MS_MAX = 1200

const PLAYER_LABELS = ['You', 'AI East', 'AI North', 'AI West']

export default function App() {
  const [gs, setGs] = useState(() => createInitialGameState())
  const [selected, setSelected] = useState(new Set()) // Set of cardId strings
  const [invalidFlash, setInvalidFlash] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const aiTimer = useRef(null)

  // ── Card selection (human player only) ──────────────────────
  const toggleCard = useCallback((card) => {
    if (gs.currentPlayer !== HUMAN_PLAYER || gs.winner !== null) return
    const id = cardId(card)
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [gs.currentPlayer, gs.winner])

  // ── Human: Play ──────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    if (gs.currentPlayer !== HUMAN_PLAYER || gs.winner !== null) return
    const hand = gs.hands[HUMAN_PLAYER]
    const played = hand.filter(c => selected.has(cardId(c)))

    if (!isValidPlay(played, gs)) {
      const reason = played.length === 0
        ? 'Select cards first'
        : identifyCombo(played) === null
          ? 'Not a valid combo'
          : gs.isFirstPlay && !played.some(c => c.rank === 3 && c.suit === 'clubs')
            ? 'First play must include 3♣'
            : 'Doesn\'t beat the current combo'
      setInvalidFlash(reason)
      setTimeout(() => setInvalidFlash(''), 1500)
      return
    }

    setSelected(new Set())
    setGs(prev => applyPlay(played, prev))
  }, [gs, selected])

  // ── Human: Pass ──────────────────────────────────────────────
  const handlePass = useCallback(() => {
    if (gs.currentPlayer !== HUMAN_PLAYER || gs.winner !== null) return
    // Can't pass if you have control and the table is clear
    const isInControl =
      gs.currentPlayer === gs.controller &&
      (!gs.currentCombo || gs.currentCombo.length === 0)
    if (isInControl) {
      setInvalidFlash('You have control — you must play!')
      setTimeout(() => setInvalidFlash(''), 1500)
      return
    }
    setSelected(new Set())
    setGs(prev => applyPass(prev))
  }, [gs])

  // ── AI turn loop ─────────────────────────────────────────────
  useEffect(() => {
    if (gs.winner !== null) return
    if (gs.currentPlayer === HUMAN_PLAYER) return

    // AI's turn
    setIsAIThinking(true)
    const delay =
      AI_THINK_MS_MIN + Math.random() * (AI_THINK_MS_MAX - AI_THINK_MS_MIN)

    aiTimer.current = setTimeout(() => {
      setGs(prev => {
        if (prev.winner !== null || prev.currentPlayer === HUMAN_PLAYER) return prev
        const hand = prev.hands[prev.currentPlayer]
        const move = getAIMove(hand, prev)
        if (move === 'pass') {
          return applyPass(prev)
        } else {
          return applyPlay(move, prev)
        }
      })
      setIsAIThinking(false)
    }, delay)

    return () => clearTimeout(aiTimer.current)
  }, [gs.currentPlayer, gs.winner])

  // ── Reset game ───────────────────────────────────────────────
  const handleNewGame = () => {
    clearTimeout(aiTimer.current)
    setGs(createInitialGameState())
    setSelected(new Set())
    setInvalidFlash('')
    setIsAIThinking(false)
  }

  // ── Derived state ─────────────────────────────────────────────
  const isHumanTurn = gs.currentPlayer === HUMAN_PLAYER && gs.winner === null
  const canPass = isHumanTurn && !(
    gs.currentPlayer === gs.controller &&
    (!gs.currentCombo || gs.currentCombo.length === 0)
  )

  const statusMessage = (() => {
    if (gs.winner !== null) return ''
    if (isAIThinking) return `${PLAYER_LABELS[gs.currentPlayer]} is thinking...`
    if (isHumanTurn) {
      if (gs.isFirstPlay) return 'Your turn — play a combo including 3♣'
      if (!gs.currentCombo || gs.currentCombo.length === 0) return 'Your turn — you have control'
      return 'Your turn — beat or pass'
    }
    return `${PLAYER_LABELS[gs.currentPlayer]}'s turn`
  })()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a0f05',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      gap: 8,
      fontFamily: 'system-ui, sans-serif',
      color: '#FDF6E3',
    }}>

      {/* Win screen overlay */}
      {gs.winner !== null && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,15,5,0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          gap: 20,
        }}>
          <div style={{
            fontSize: 48,
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            color: '#FFD580',
            textShadow: '0 0 30px rgba(255,213,128,0.5)',
          }}>
            {gs.winner === HUMAN_PLAYER ? '🏆 You Win!' : `${PLAYER_LABELS[gs.winner]} Wins!`}
          </div>
          <div style={{ color: '#C8A96E', fontSize: 16 }}>
            {gs.winner === HUMAN_PLAYER
              ? 'Mabuhay! First to empty their hand!'
              : 'Better luck next time.'}
          </div>
          <button
            onClick={handleNewGame}
            style={{
              marginTop: 16,
              background: 'rgba(139,58,10,0.8)',
              color: '#FFD580',
              border: '1px solid rgba(200,134,10,0.6)',
              borderRadius: 8,
              padding: '12px 32px',
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: 640,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 4px',
      }}>
        <div style={{ fontSize: 20, fontFamily: 'Georgia, serif', color: '#FFD580', fontWeight: 700 }}>
          Pusoy Dos
        </div>
        <button
          onClick={handleNewGame}
          style={{
            background: 'transparent',
            color: '#C8A96E',
            border: '1px solid rgba(200,134,10,0.3)',
            borderRadius: 6,
            padding: '5px 14px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          New Game
        </button>
      </div>

      {/* AI North hand (Player 2 — top) */}
      <Hand
        cards={gs.hands[2]}
        faceDown
        cardCount={gs.hands[2].length}
        label={PLAYER_LABELS[2]}
        isCurrentPlayer={gs.currentPlayer === 2}
      />

      {/* AI East and West flanking the table */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 640, justifyContent: 'space-between' }}>
        {/* AI West (Player 3) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 80 }}>
          <div style={{
            fontSize: 11,
            color: gs.currentPlayer === 3 ? '#FFD580' : '#C8A96E',
            fontWeight: gs.currentPlayer === 3 ? 600 : 400,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {PLAYER_LABELS[3]}
            {gs.currentPlayer === 3 && <span style={{ marginLeft: 4 }}>▶</span>}
          </div>
          <div style={{
            color: '#C8A96E',
            fontSize: 11,
          }}>
            {gs.hands[3].length} cards
          </div>
        </div>

        {/* Center game board */}
        <GameBoard
          currentCombo={gs.currentCombo}
          currentComboType={gs.currentComboType}
          isHumanTurn={isHumanTurn}
          isAIThinking={isAIThinking}
          selectedCount={selected.size}
          onPlay={handlePlay}
          onPass={handlePass}
          canPass={canPass}
          invalidFlash={invalidFlash}
          message={statusMessage}
        />

        {/* AI East (Player 1) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 80 }}>
          <div style={{
            fontSize: 11,
            color: gs.currentPlayer === 1 ? '#FFD580' : '#C8A96E',
            fontWeight: gs.currentPlayer === 1 ? 600 : 400,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {PLAYER_LABELS[1]}
            {gs.currentPlayer === 1 && <span style={{ marginLeft: 4 }}>▶</span>}
          </div>
          <div style={{ color: '#C8A96E', fontSize: 11 }}>
            {gs.hands[1].length} cards
          </div>
        </div>
      </div>

      {/* Human hand (Player 0 — bottom) */}
      <div style={{
        background: 'rgba(26,15,5,0.6)',
        border: '1px solid rgba(200,134,10,0.2)',
        borderRadius: 12,
        padding: '12px 16px',
        width: '100%',
        maxWidth: 640,
      }}>
        <Hand
          cards={gs.hands[HUMAN_PLAYER]}
          faceDown={false}
          selectedIds={selected}
          onCardClick={toggleCard}
          label={PLAYER_LABELS[HUMAN_PLAYER]}
          isCurrentPlayer={isHumanTurn}
          disabled={!isHumanTurn}
        />
      </div>

    </div>
  )
}
