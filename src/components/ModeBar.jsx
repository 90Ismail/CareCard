import { User, Shield, Heart } from 'lucide-react'
import { CareCardLogo } from './CareCardBrand'

const STATUS_CFG = {
  safe:        { label: 'Safe',       dot: '#5fad7e', text: '#5fad7e', bg: 'rgba(95,173,126,.1)',  border: 'rgba(95,173,126,.3)'  },
  'need-help': { label: 'Needs Help', dot: '#e5736b', text: '#e5736b', bg: 'rgba(229,115,107,.1)', border: 'rgba(229,115,107,.3)' },
  evacuating:  { label: 'Evacuating', dot: '#d4aa3a', text: '#d4aa3a', bg: 'rgba(212,170,58,.1)',  border: 'rgba(212,170,58,.3)'  },
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
