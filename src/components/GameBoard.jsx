// GameBoard — the central table area
// Shows: current combo on table, turn info, play/pass buttons

import CardView from './CardView.jsx'
import { identifyCombo } from '../game/gameLogic.js'

const COMBO_LABEL = {
  single: 'Single',
  pair: 'Pair',
  straight: 'Straight',
  flush: 'Flush',
  fullhouse: 'Full House',
  fourofakind: 'Four of a Kind',
  straightflush: 'Straight Flush',
  royalflush: 'Royal Flush',
}

export default function GameBoard({
  currentCombo,
  currentComboType,
  isHumanTurn,
  isAIThinking,
  selectedCount,
  onPlay,
  onPass,
  canPass,
  invalidFlash,
  message,
}) {
  const comboLabel = currentComboType ? COMBO_LABEL[currentComboType] : null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '16px 0',
    }}>

      {/* Status / turn message */}
      <div style={{
        fontSize: 13,
        color: isAIThinking ? '#C8A96E' : '#FFD580',
        minHeight: 20,
        animation: isAIThinking ? 'pulse 1.2s infinite' : 'none',
      }}>
        {message}
      </div>

      {/* Table felt area */}
      <div style={{
        width: 360,
        minHeight: 120,
        borderRadius: 180,
        background: 'radial-gradient(ellipse at center, #2D5016 60%, #1d3a0f 100%)',
        border: '6px solid #6B3A1F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '20px 24px',
        boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.6)',
      }}>
        {/* Combo type label */}
        {comboLabel && (
          <div style={{
            fontSize: 11,
            color: 'rgba(255,213,128,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {comboLabel}
          </div>
        )}

        {/* Cards on table */}
        {currentCombo && currentCombo.length > 0 ? (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            {currentCombo.map((card, i) => (
              <CardView key={i} card={card} disabled />
            ))}
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontStyle: 'italic' }}>
            — lead the round —
          </div>
        )}
      </div>

      {/* Invalid play flash message */}
      {invalidFlash && (
        <div style={{
          color: '#C0392B',
          fontSize: 12,
          fontWeight: 500,
          animation: 'fadeout 0.8s forwards',
        }}>
          {invalidFlash}
        </div>
      )}

      {/* Action bar */}
      {isHumanTurn && (
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 4,
        }}>
          {/* Pass button */}
          <button
            onClick={onPass}
            disabled={!canPass}
            style={{
              background: 'transparent',
              color: canPass ? '#C8A96E' : 'rgba(200,169,110,0.3)',
              border: canPass
                ? '1px solid rgba(200,134,10,0.3)'
                : '1px solid rgba(200,134,10,0.1)',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 500,
              cursor: canPass ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (canPass) e.target.style.background = 'rgba(139,58,10,0.3)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent' }}
          >
            Pass
          </button>

          {/* Play button */}
          <button
            onClick={onPlay}
            disabled={selectedCount === 0}
            style={{
              background: selectedCount > 0
                ? 'rgba(139,58,10,0.8)'
                : 'rgba(139,58,10,0.25)',
              color: selectedCount > 0 ? '#FFD580' : 'rgba(255,213,128,0.3)',
              border: '1px solid rgba(200,134,10,0.6)',
              borderRadius: 8,
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 500,
              cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (selectedCount > 0) e.target.style.background = 'rgba(200,90,15,0.9)' }}
            onMouseLeave={e => { if (selectedCount > 0) e.target.style.background = 'rgba(139,58,10,0.8)' }}
          >
            Play {selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>
        </div>
      )}
    </div>
  )
}
