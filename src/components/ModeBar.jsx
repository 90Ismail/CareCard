import { ShieldCheck, User, Shield, Heart } from 'lucide-react'

const STATUS_CONFIG = {
  safe:        { label: 'Safe',       dot: '#10B981', text: '#065F46', bg: '#D1FAE5' },
  'need-help': { label: 'Needs Help', dot: '#EF4444', text: '#991B1B', bg: '#FEE2E2' },
  evacuating:  { label: 'Evacuating', dot: '#F59E0B', text: '#92400E', bg: '#FEF3C7' },
}

const TABS = [
  { id: 'user',      label: 'My Card',   Icon: User    },
  { id: 'responder', label: 'Responder', Icon: Shield  },
  { id: 'volunteer', label: 'Volunteer', Icon: Heart   },
]

export default function ModeBar({ mode, setMode, userStatus }) {
  const sc = STATUS_CONFIG[userStatus] || STATUS_CONFIG.safe

  return (
    <div className="modebar">
      <div className="modebar__top">
        <div className="modebar__brand">
          <div className="modebar__icon">
            <ShieldCheck size={16} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="modebar__wordmark">
            <span className="modebar__name">CareCard</span>
            <span className="modebar__sub">Emergency Readiness</span>
          </div>
        </div>

        {userStatus && (
          <div
            className="modebar__status-pill"
            style={{ background: sc.bg, color: sc.text }}
            aria-label={`Your status: ${sc.label}`}
          >
            <div
              className="modebar__status-dot"
              style={{
                background: sc.dot,
                animation: userStatus === 'need-help' ? 'status-pulse 1.3s infinite' : undefined,
              }}
            />
            {sc.label}
          </div>
        )}
      </div>

      <div className="modebar__tabs" role="tablist" aria-label="App mode">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            className={`modebar__tab ${mode === id ? `active-${id}` : ''}`}
            onClick={() => setMode(id)}
          >
            <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
