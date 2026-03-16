// Hand — displays a player's hand of cards
// For the human player, cards are face-up and clickable
// For AI players, cards are face-down

import CardView from './CardView.jsx'
import { cardId, getCardValue } from '../game/gameLogic.js'

export default function Hand({
  cards,
  faceDown = false,
  selectedIds = new Set(),
  onCardClick,
  label,
  cardCount,
  isCurrentPlayer = false,
  disabled = false,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* Player label */}
      <div style={{
        fontSize: 12,
        color: isCurrentPlayer ? '#FFD580' : '#C8A96E',
        fontWeight: isCurrentPlayer ? 600 : 400,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        {label}
        {isCurrentPlayer && (
          <span style={{ marginLeft: 6, opacity: 0.8 }}>▶</span>
        )}
        {faceDown && cardCount !== undefined && (
          <span style={{ marginLeft: 6, color: '#C8A96E' }}>({cardCount})</span>
        )}
      </div>

      {/* Cards row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 4,
        maxWidth: 600,
      }}>
        {faceDown
          ? Array.from({ length: cardCount ?? cards.length }).map((_, i) => (
              <CardView key={i} faceDown />
            ))
          : [...cards].sort((a, b) => getCardValue(a) - getCardValue(b)).map(card => {
              const id = cardId(card)
              return (
                <CardView
                  key={id}
                  card={card}
                  selected={selectedIds.has(id)}
                  onClick={() => onCardClick && onCardClick(card)}
                  disabled={disabled}
                />
              )
            })
        }
      </div>
    </div>
  )
}
