import { ShieldCheck, User, Shield, Heart } from 'lucide-react'

const STATUS_CFG = {
  safe:        { label: 'Safe',       dot: '#1e8e3e', text: '#1e8e3e', bg: '#e6f4ea', border: '#a8d5b5' },
  'need-help': { label: 'Needs Help', dot: '#d93025', text: '#d93025', bg: '#fce8e6', border: '#f5c6c2' },
  evacuating:  { label: 'Evacuating', dot: '#f29900', text: '#b06000', bg: '#fef7e0', border: '#fde68a' },
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
            <ShieldCheck size={15} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <span className="modebar__name">CareCard</span>
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
