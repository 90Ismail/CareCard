import { User, Shield, Heart } from 'lucide-react'
import { CareCardLogo } from './CareCardBrand'

const STATUS_CFG = {
  safe:        { label: 'Safe',       dot: '#81c995', text: '#81c995', bg: '#0d2b1a', border: '#1f4a2d' },
  'need-help': { label: 'Needs Help', dot: '#f28b82', text: '#f28b82', bg: '#2d1111', border: '#4d2020' },
  evacuating:  { label: 'Evacuating', dot: '#fdd663', text: '#fdd663', bg: '#2a2008', border: '#4a3a18' },
}

const TABS = [
  { id: 'user',      label: 'My Card',   Icon: User   },
  { id: 'responder', label: 'Responder', Icon: Shield },
  { id: 'volunteer', label: 'Volunteer', Icon: Heart  },
]

export default function ModeBar({ mode, setMode, userStatus }) {
  const sc = STATUS_CFG[userStatus] || STATUS_CFG.safe

  return (
    <div className="modebar">
      <div className="modebar__top">
        <div className="modebar__brand">
          <div className="modebar__icon">
            <CareCardLogo size={18} color="white" />
          </div>
          <div>
            <span className="modebar__name" style={{ fontFamily: 'var(--font-display)', letterSpacing: '.03em' }}>CareCard</span>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-4)', marginTop: 0, lineHeight: 1 }}>Emergency Network</p>
          </div>
        </div>

        {userStatus && (
          <div
            className="modebar__status-pill"
            style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
            aria-label={`Status: ${sc.label}`}
          >
            <div
              className="modebar__status-dot"
              style={{
                background: sc.dot,
                ...(userStatus === 'need-help'
                  ? { animation: 'pulse-dot 1.4s ease-in-out infinite' }
                  : {}),
              }}
            />
            {sc.label}
          </div>
        )}
      </div>

      <div className="modebar__tabs" role="tablist">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            className={`modebar__tab ${mode === id ? `active-${id}` : ''}`}
            onClick={() => setMode(id)}
          >
            <Icon size={13} strokeWidth={2} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
