import { CheckCircle, AlertOctagon, Navigation, Clock, Send } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STATUS_OPTIONS = [
  {
    id: 'safe',
    label: "I'm Safe",
    desc: 'You are secure at your current location',
    Icon: CheckCircle,
    iconBg: 'var(--green-100)',
    iconColor: 'var(--green)',
    activeClass: 'active-safe',
  },
  {
    id: 'need-help',
    label: 'I Need Help',
    desc: 'You require immediate assistance',
    Icon: AlertOctagon,
    iconBg: 'var(--red-100)',
    iconColor: 'var(--red)',
    activeClass: 'active-need-help',
  },
  {
    id: 'evacuating',
    label: "I'm Evacuating",
    desc: 'You are en route to a shelter',
    Icon: Navigation,
    iconBg: 'var(--orange-100)',
    iconColor: 'var(--orange)',
    activeClass: 'active-evacuating',
  },
]

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  return `${Math.floor(diff / 3600)} hours ago`
}

const statusLabels = {
  safe: { label: 'Safe', color: 'var(--green)' },
  'need-help': { label: 'Needs Help', color: 'var(--red)' },
  evacuating: { label: 'Evacuating', color: 'var(--orange)' },
}

export default function CheckIn() {
  const { user, updateStatus } = useApp()

  return (
    <div>
      <div className="page-header" style={{ paddingBottom: 8 }}>
        <h1 className="page-title">My Status</h1>
        <p className="page-subtitle">Tap to update — visible to emergency responders instantly</p>
      </div>

      {/* Current status display */}
      <div className="section">
        <div
          className="card card-body"
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            border: `2px solid ${statusLabels[user.status]?.color}20`,
          }}
        >
          <p className="text-sm text-muted mb-1">Current Status</p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              fontWeight: 700,
              color: statusLabels[user.status]?.color,
              lineHeight: 1.1,
            }}
          >
            {statusLabels[user.status]?.label}
          </p>
          <div className="row gap-1 mt-2" style={{ justifyContent: 'center' }}>
            <Clock size={13} color="var(--text-muted)" aria-hidden="true" />
            <p className="text-xs text-muted">Updated {timeAgo(user.lastCheckIn)}</p>
          </div>
        </div>
      </div>

      {/* Status buttons */}
      <div className="section" style={{ paddingTop: 0 }}>
        <p className="section__title">Update Your Status</p>
        <div className="stack stack-3">
          {STATUS_OPTIONS.map(({ id, label, desc, Icon, iconBg, iconColor, activeClass }) => (
            <button
              key={id}
              className={`status-btn ${user.status === id ? activeClass : ''}`}
              onClick={() => updateStatus(id)}
              aria-pressed={user.status === id}
            >
              <div className="status-btn__icon" style={{ background: iconBg }}>
                <Icon size={26} color={iconColor} strokeWidth={2} aria-hidden="true" />
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <p className="status-btn__title">{label}</p>
                <p className="status-btn__desc">{desc}</p>
              </div>
              {user.status === id && (
                <div
                  style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle size={13} color="white" strokeWidth={3} aria-hidden="true" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Broadcast info */}
      <div className="section" style={{ paddingTop: 0, paddingBottom: 24 }}>
        <div className="card card--info card-body row gap-2" style={{ padding: '12px 14px' }}>
          <Send size={15} color="var(--blue)" style={{ flexShrink: 0 }} aria-hidden="true" />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)' }}>Status broadcasts automatically</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Your update is sent to {user.emergencyContact.name} ({user.emergencyContact.phone}) and the emergency
              responder dashboard for Zone {user.zone}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
