import { useState } from 'react'
import { X, UserCheck, CheckCircle2 } from 'lucide-react'
import { NEEDS } from '../data/mockData'

/* Approximate positions on the 400×270 SVG canvas
   (Minneapolis: W Broadway in the north → 50th St in the south,
    Penn Ave west → Mississippi east) */
const PINS = {
  c7:   { x: 148, y: 48  },  // Ahmed Hassan  — Zone D, West Broadway
  c1:   { x: 232, y: 82  },  // David Chen    — Zone A, Park Ave
  c5:   { x: 258, y: 70  },  // Thomas Mbeki  — Zone A, University Ave
  c3:   { x: 205, y: 148 },  // Eleanor Vasquez — Zone B, Central Ave
  c2:   { x: 150, y: 164 },  // Ruth Patel    — Zone B, Hennepin Ave
  user: { x: 128, y: 180 },  // Maria (you)   — Zone B, Lakeview Ave
  c4:   { x: 168, y: 220 },  // James Okoye   — Zone C, Nicollet Mall
  c6:   { x: 296, y: 228 },  // Linda Johansson — Zone C, Summit Ave
}

const STATUS_COLOR = {
  'need-help': '#f28b82',
  evacuating:  '#fdd663',
  safe:        '#81c995',
}

const needMap = Object.fromEntries(NEEDS.map(n => [n.id, n]))

/* ── Small popup shown when a pin is selected ─────────────────── */
function Popup({ card, isUser, mode, onClaim, onUnclaim, onReach, onClose }) {
  const myName = mode === 'responder' ? 'Dispatcher Jordan' : 'Volunteer You'
  const isMine = card.claimedBy?.name === myName
  const isClaimed = !!card.claimedBy

  const statusLabel = { 'need-help': 'Needs Help', evacuating: 'Evacuating', safe: 'Safe' }
  const statusColor = STATUS_COLOR[card.status] || '#5f6368'

  return (
    <div style={{
      position: 'absolute', bottom: 10, left: 10, right: 10,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      boxShadow: '0 4px 20px rgba(0,0,0,.5)',
      overflow: 'hidden',
      zIndex: 10,
    }}>
      {/* Accent stripe */}
      <div style={{ height: 3, background: statusColor }} />

      <div style={{ padding: '12px 14px 10px' }}>
        <div className="row sb gap-2">
          <div className="f1">
            <div className="row gap-2">
              <span style={{ fontSize: 14, fontWeight: 500 }}>{isUser ? `${card.name} (you)` : card.name}</span>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '2px 8px',
                borderRadius: 9999, background: `${statusColor}18`,
                color: statusColor, border: `1px solid ${statusColor}30`,
              }}>
                {statusLabel[card.status]}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{card.address}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-4)', flexShrink: 0, padding: 2 }} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {card.needs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {card.needs.map(id => {
              const n = needMap[id]
              return n ? (
                <span key={id} style={{
                  fontSize: 11, fontWeight: 500,
                  padding: '2px 8px', borderRadius: 9999,
                  background: n.bg, color: n.color,
                  border: `1px solid ${n.color}25`,
                }}>
                  {n.label}
                </span>
              ) : null
            })}
          </div>
        )}

        {card.medicalNotes && (
          <p style={{ fontSize: 12, color: '#fdd663', background: 'rgba(253,214,99,.08)', border: '1px solid rgba(253,214,99,.18)', borderRadius: 4, padding: '6px 9px', marginTop: 8, lineHeight: 1.45 }}>
            {card.medicalNotes}
          </p>
        )}
      </div>

      {/* Actions */}
      {!isUser && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          {mode === 'responder' ? (
            <>
              <button
                className={`btn btn--sm ${isClaimed ? 'btn--ghost' : 'btn--primary'}`}
                style={{ flex: 1 }}
                onClick={() => isClaimed ? onUnclaim(card.id) : onClaim(card.id, 'Dispatcher Jordan')}
              >
                <UserCheck size={12} aria-hidden="true" />
                {isClaimed ? (isMine ? 'Unclaim' : `Claimed`) : 'Claim Card'}
              </button>
              <button
                className={`btn btn--sm ${card.reached ? 'btn--success' : 'btn--ghost'}`}
                style={{ flex: 1 }}
                disabled={card.reached}
                onClick={() => onReach(card.id)}
              >
                <CheckCircle2 size={12} aria-hidden="true" />
                {card.reached ? 'Reached' : 'Mark Reached'}
              </button>
            </>
          ) : (
            <button
              className={`btn btn--sm ${isMine ? 'btn--ghost' : 'btn--primary'}`}
              style={{ flex: 1 }}
              onClick={() => isMine ? onUnclaim(card.id) : onClaim(card.id, 'Volunteer You')}
            >
              <UserCheck size={12} aria-hidden="true" />
              {isMine ? 'Remove Claim' : 'Volunteer to Help'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main map component ───────────────────────────────────────── */
export default function MapView({ cards, currentUser, mode, onClaim, onUnclaim, onReach }) {
  const [selected, setSelected] = useState(null)

  const allPins = [
    ...cards.map(c => ({ ...c, isUser: false })),
    { ...currentUser, id: 'user', isUser: true },
  ]

  const selectedCard = selected === 'user'
    ? { ...currentUser, id: 'user' }
    : cards.find(c => c.id === selected)

  return (
    <div style={{ padding: '0 16px 16px', position: 'relative' }}>
      <div style={{
        position: 'relative',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-2)',
        background: '#1a1d2e',
      }}>
        <svg
          viewBox="0 0 400 270"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Map of Minneapolis showing care card locations"
          role="img"
        >
          {/* ── Base ── */}
          <rect width="400" height="270" fill="#1a1d2e" />

          {/* ── Parks / green areas ── */}
          <ellipse cx="170" cy="132" rx="32" ry="22" fill="#1c3025" />
          <rect x="282" y="44" width="46" height="58" rx="6" fill="#1c3025" />
          <ellipse cx="310" cy="148" rx="18" ry="12" fill="#1c3025" />

          {/* ── Water ── */}
          {/* Mississippi River — right edge */}
          <path d="M 348 0 Q 362 55 356 120 Q 349 185 360 270" stroke="#1e3a5c" strokeWidth="20" fill="none" strokeLinecap="round" />
          {/* Lake of the Isles */}
          <ellipse cx="88" cy="195" rx="28" ry="19" fill="#1e3a5c" />
          {/* Bde Maka Ska */}
          <ellipse cx="70" cy="233" rx="24" ry="17" fill="#1e3a5c" />
          {/* Cedar Lake */}
          <ellipse cx="52" cy="186" rx="16" ry="12" fill="#1e3a5c" />

          {/* ── Downtown blocks (slightly lighter area) ── */}
          <rect x="198" y="58" width="108" height="82" rx="2" fill="#22263e" opacity="0.9" />

          {/* ── Street grid — major ── */}
          {/* Horizontals */}
          <line x1="0" y1="52" x2="340" y2="52" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
          <line x1="0" y1="90" x2="340" y2="90" stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" />
          <line x1="0" y1="135" x2="340" y2="135" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
          <line x1="0" y1="178" x2="340" y2="178" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
          <line x1="0" y1="218" x2="340" y2="218" stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" />
          <line x1="0" y1="255" x2="340" y2="255" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          {/* Verticals */}
          <line x1="48" y1="0" x2="48" y2="270" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          <line x1="108" y1="0" x2="108" y2="270" stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" />
          <line x1="162" y1="0" x2="162" y2="270" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
          <line x1="205" y1="0" x2="205" y2="270" stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" />
          <line x1="248" y1="0" x2="248" y2="270" stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" />
          <line x1="298" y1="0" x2="298" y2="270" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

          {/* ── Minor streets ── */}
          <line x1="0" y1="22" x2="340" y2="22" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="0" y1="112" x2="340" y2="112" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="0" y1="157" x2="340" y2="157" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="0" y1="198" x2="340" y2="198" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="78" y1="0" x2="78" y2="270" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="135" y1="0" x2="135" y2="270" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="228" y1="0" x2="228" y2="270" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="270" y1="0" x2="270" y2="270" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

          {/* ── Diagonal — Hennepin Ave ── */}
          <line x1="163" y1="270" x2="285" y2="52" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />

          {/* ── Zone boundaries ── */}
          <rect x="0" y="0" width="340" height="108" fill="#4285f4" opacity="0.06" />
          <rect x="0" y="108" width="340" height="112" fill="#a78bfa" opacity="0.06" />
          <rect x="0" y="220" width="340" height="50" fill="#34d399" opacity="0.06" />
          <rect x="0" y="0" width="60" height="66" fill="#fbbf24" opacity="0.08" />

          {/* ── Zone labels ── */}
          <text x="10" y="26" fontSize="9" fontWeight="700" fill="#3d506e" fontFamily="Roboto, sans-serif" letterSpacing="0.08em">ZONE D</text>
          <text x="10" y="80" fontSize="9" fontWeight="700" fill="#3d506e" fontFamily="Roboto, sans-serif" letterSpacing="0.08em">ZONE A</text>
          <text x="10" y="160" fontSize="9" fontWeight="700" fill="#3d506e" fontFamily="Roboto, sans-serif" letterSpacing="0.08em">ZONE B</text>
          <text x="10" y="250" fontSize="9" fontWeight="700" fill="#3d506e" fontFamily="Roboto, sans-serif" letterSpacing="0.08em">ZONE C</text>

          {/* ── Street name labels ── */}
          <text x="214" y="49" fontSize="8" fill="#3a4a62" fontFamily="Roboto, sans-serif" fontWeight="500">W Broadway</text>
          <text x="214" y="132" fontSize="8" fill="#3a4a62" fontFamily="Roboto, sans-serif" fontWeight="500">Franklin Ave</text>
          <text x="214" y="175" fontSize="8" fill="#3a4a62" fontFamily="Roboto, sans-serif" fontWeight="500">Lake Street</text>
          <text x="164" y="103" fontSize="8" fill="#3a4a62" fontFamily="Roboto, sans-serif" fontWeight="500" transform="rotate(-90 164 103)">Nicollet</text>

          {/* ── Scale bar ── */}
          <line x1="316" y1="258" x2="346" y2="258" stroke="#3a4a62" strokeWidth="1.5" />
          <line x1="316" y1="254" x2="316" y2="262" stroke="#3a4a62" strokeWidth="1.5" />
          <line x1="346" y1="254" x2="346" y2="262" stroke="#3a4a62" strokeWidth="1.5" />
          <text x="331" y="252" fontSize="8" fill="#3a4a62" fontFamily="Roboto, sans-serif" textAnchor="middle">0.5 mi</text>

          {/* ── User pins ── */}
          {allPins.map(card => {
            const pos = PINS[card.id]
            if (!pos) return null
            const color = card.isUser ? '#1a73e8' : (STATUS_COLOR[card.status] || '#5f6368')
            const isSelected = selected === card.id
            const initials = card.name.split(' ').map(w => w[0]).join('').slice(0, 2)

            return (
              <g
                key={card.id}
                onClick={() => setSelected(isSelected ? null : card.id)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={`${card.name} — ${card.isUser ? 'you' : (card.status === 'need-help' ? 'needs help' : card.status)}`}
              >
                {/* Halo for selected */}
                {isSelected && (
                  <circle cx={pos.x} cy={pos.y} r={16} fill={color} opacity={0.18} />
                )}
                {/* Pulse ring for need-help */}
                {!card.isUser && card.status === 'need-help' && (
                  <circle cx={pos.x} cy={pos.y} r={12} fill="none" stroke={color} strokeWidth="1.5" opacity="0.35">
                    <animate attributeName="r" values="9;16;9" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Pin shadow */}
                <circle cx={pos.x + 1} cy={pos.y + 1} r={9} fill="rgba(0,0,0,.15)" />
                {/* Pin body */}
                <circle cx={pos.x} cy={pos.y} r={9}
                  fill={color}
                  stroke="white"
                  strokeWidth={card.isUser ? 2.5 : 1.5}
                />
                {/* Initial */}
                <text
                  x={pos.x} y={pos.y + 3.5}
                  textAnchor="middle"
                  fontSize={card.isUser ? "7.5" : "7"}
                  fontWeight="700"
                  fill="white"
                  fontFamily="Roboto, sans-serif"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {card.isUser ? 'ME' : initials}
                </text>
              </g>
            )
          })}
        </svg>

        {/* ── Popup overlay ── */}
        {selected && selectedCard && (
          <Popup
            card={selectedCard}
            isUser={selected === 'user'}
            mode={mode}
            onClaim={onClaim}
            onUnclaim={onUnclaim}
            onReach={onReach}
            onClose={() => setSelected(null)}
          />
        )}

        {/* ── "You are here" compass ── */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '3px 7px',
          fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
          fontFamily: 'Roboto, sans-serif', letterSpacing: '.04em',
          boxShadow: 'var(--shadow)',
        }}>
          N ↑
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{
        display: 'flex', gap: 14, marginTop: 10,
        justifyContent: 'center', flexWrap: 'wrap',
      }}>
        {[
          { color: '#d93025', label: 'Needs Help' },
          { color: '#f29900', label: 'Evacuating' },
          { color: '#1e8e3e', label: 'Safe' },
          { color: '#1a73e8', label: 'You' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '1.5px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,.12)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
