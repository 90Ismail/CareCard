/* ── CareCard SVG logo: card shape + ECG/pulse line ─────────── */
export function CareCardLogo({ size = 24, color = 'currentColor' }) {
  const h = Math.round(size * 0.7)
  return (
    <svg
      width={size} height={h}
      viewBox="0 0 40 28"
      fill="none"
      aria-hidden="true"
    >
      {/* Card outline */}
      <rect x="1" y="1" width="38" height="26" rx="3.5"
        stroke={color} strokeWidth="2" />
      {/* Chip */}
      <rect x="5" y="5" width="8" height="6" rx="1"
        stroke={color} strokeWidth="1.5" opacity="0.7" />
      {/* ECG / heartbeat line */}
      <polyline
        points="3,19 9,19 12,13 15,23 18,19 24,19 26,16 28,19 37,19"
        stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

/* ── Emergency alert banner ──────────────────────────────────── */
export function AlertBanner() {
  return (
    <div className="alert-banner" role="alert" aria-live="polite">
      <div className="alert-banner__left">
        {/* Warning triangle */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <span className="alert-banner__title">SEVERE TORNADO</span>
          <span className="alert-banner__divider">·</span>
          <span className="alert-banner__place">Minneapolis, MN</span>
          <p className="alert-banner__sub">
            Violent, long-track tornado on ground — Zones A &amp; B in direct path
          </p>
        </div>
      </div>
      <div className="alert-banner__pulse" aria-hidden="true" />
    </div>
  )
}

/* ── Person avatar with status ring ─────────────────────────── */
const AVATAR_STATUS = {
  'need-help': { color: '#f28b82', bg: 'rgba(242,139,130,0.12)', border: 'rgba(242,139,130,0.35)' },
  evacuating:  { color: '#fdd663', bg: 'rgba(253,214,99,0.12)',  border: 'rgba(253,214,99,0.35)'  },
  safe:        { color: '#81c995', bg: 'rgba(129,201,149,0.12)', border: 'rgba(129,201,149,0.35)' },
}

export function PersonAvatar({ name, status, size = 38 }) {
  const sc = AVATAR_STATUS[status] || AVATAR_STATUS.safe
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: sc.bg,
        border: `2px solid ${sc.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.34,
        fontWeight: 700,
        color: sc.color,
        letterSpacing: '.02em',
        flexShrink: 0,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {initials}
    </div>
  )
}
