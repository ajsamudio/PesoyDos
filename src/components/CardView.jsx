// CardView — renders a single playing card (face-up or face-down)
// Design tokens from pusoy-dos-design.md

const SUIT_SYMBOL = {
  clubs: '♣',
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
}

const RED_SUITS = new Set(['hearts', 'diamonds'])

function suitColor(suit) {
  return RED_SUITS.has(suit) ? '#C0392B' : '#1a1a2e'
}

export default function CardView({ card, selected, onClick, faceDown = false, disabled = false }) {
  if (faceDown) {
    return (
      <div
        style={{
          width: 56,
          height: 84,
          borderRadius: 6,
          background: 'linear-gradient(135deg, #8B1A1A 60%, #6B1414 100%)',
          border: '2px solid #C8860A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
        }}
      >
        {/* Bangko weave pattern hint */}
        <div style={{
          width: 40,
          height: 66,
          border: '1px solid rgba(200,134,10,0.5)',
          borderRadius: 3,
          background: 'repeating-linear-gradient(45deg, rgba(200,134,10,0.15) 0px, rgba(200,134,10,0.15) 2px, transparent 2px, transparent 8px)',
        }} />
      </div>
    )
  }

  const symbol = SUIT_SYMBOL[card.suit]
  const color = suitColor(card.suit)
  const rank = String(card.rank)

  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: 56,
        height: 84,
        borderRadius: 6,
        background: '#FDF6E3',
        border: selected
          ? '2px solid #FFD580'
          : '1.5px solid rgba(139,94,26,0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 4px',
        cursor: disabled ? 'default' : 'pointer',
        flexShrink: 0,
        transform: selected ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'transform 0.15s ease, border 0.1s ease, box-shadow 0.15s ease',
        boxShadow: selected
          ? '0 0 0 2px #FFD580, 0 6px 14px rgba(0,0,0,0.5)'
          : '0 2px 6px rgba(0,0,0,0.4)',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* Top-left rank + suit */}
      <div style={{ alignSelf: 'flex-start', lineHeight: 1, color }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{rank}</div>
        <div style={{ fontSize: 12, fontFamily: 'Georgia, serif' }}>{symbol}</div>
      </div>

      {/* Center suit symbol */}
      <div style={{
        fontSize: 28,
        fontFamily: 'Georgia, serif',
        fontWeight: 700,
        color,
        lineHeight: 1,
      }}>
        {symbol}
      </div>

      {/* Bottom-right rank + suit (rotated) */}
      <div style={{
        alignSelf: 'flex-end',
        lineHeight: 1,
        color,
        transform: 'rotate(180deg)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{rank}</div>
        <div style={{ fontSize: 12, fontFamily: 'Georgia, serif' }}>{symbol}</div>
      </div>
    </div>
  )
}
