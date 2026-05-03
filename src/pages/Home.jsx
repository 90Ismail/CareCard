import { useNavigate } from 'react-router-dom'
import { AlertTriangle, MapPin, MessageCircle, CheckCircle, Zap, Thermometer, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { activeDisaster } from '../data/mockData'

const statusConfig = {
  safe: { label: 'Safe', color: 'var(--green)', bg: 'var(--green-50)', border: 'var(--green-200)' },
  'need-help': { label: 'Needs Help', color: 'var(--red)', bg: 'var(--red-50)', border: 'var(--red-200)' },
  evacuating: { label: 'Evacuating', color: 'var(--orange)', bg: 'var(--orange-50)', border: 'var(--orange-200)' },
}

function CompletenessRing({ value }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <div className="completeness-ring">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke="var(--teal)" strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="completeness-ring__num">{value}%</div>
    </div>
  )
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useApp()
  const sc = statusConfig[user.status]

  const powerDevices = user.devices.filter(d => d.requiresPower)
  const coldMeds = user.medications.filter(m => m.requiresRefrigeration)

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: 16 }}>
        <div className="row row-between gap-2">
          <div>
            <p className="text-sm text-muted" style={{ marginBottom: 2 }}>Good morning,</p>
            <h1 className="page-title">{user.name.split(' ')[0]}</h1>
          </div>
          <CompletenessRing value={user.profileCompleteness} />
        </div>
        <p className="text-sm text-secondary mt-1">Zone {user.zone} · {user.address.split(',')[1]?.trim()}</p>
      </div>

      {/* Active Alert Card */}
      <div className="section" style={{ paddingTop: 8 }}>
        <button
          className="card card--critical card-body"
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
          onClick={() => navigate('/alert')}
          aria-label="View tornado warning details"
        >
          <div className="row row-between gap-2">
            <div className="row gap-2">
              <AlertTriangle size={20} color="var(--red)" strokeWidth={2.5} aria-hidden="true" />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--red)' }}>{activeDisaster.title}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                  Zones {activeDisaster.affectedZones.join(', ')} · {activeDisaster.location}
                </p>
              </div>
            </div>
            <span className="badge badge--critical">Your Zone</span>
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {activeDisaster.description.slice(0, 90)}…
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--red)', fontWeight: 600 }}>
            View action checklist →
          </p>
        </button>
      </div>

      {/* Current Status */}
      <div className="section" style={{ paddingTop: 0 }}>
        <p className="section__title">Your Status</p>
        <div
          className="card card-body"
          style={{
            border: `1.5px solid ${sc.border}`,
            background: sc.bg,
          }}
        >
          <div className="row row-between gap-2">
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Current status</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: sc.color }}>{sc.label}</p>
              <p className="text-xs text-muted mt-1">
                <Clock size={11} style={{ display: 'inline', marginRight: 3 }} aria-hidden="true" />
                Updated {timeAgo(user.lastCheckIn)}
              </p>
            </div>
            <button className="btn btn--sm btn--ghost" onClick={() => navigate('/checkin')}>
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Needs at a glance */}
      <div className="section" style={{ paddingTop: 0 }}>
        <p className="section__title">Your Critical Needs</p>
        <div className="stack stack-2">
          {powerDevices.map(d => (
            <div key={d.id} className="card card-body row gap-2" style={{ padding: '10px 14px' }}>
              <Zap size={16} color="var(--orange)" aria-hidden="true" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</p>
                <p className="text-xs text-muted">Requires power</p>
              </div>
              <span className="badge badge--warning" style={{ marginLeft: 'auto' }}>Power</span>
            </div>
          ))}
          {coldMeds.map(m => (
            <div key={m.id} className="card card-body row gap-2" style={{ padding: '10px 14px' }}>
              <Thermometer size={16} color="var(--blue)" aria-hidden="true" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</p>
                <p className="text-xs text-muted">Requires refrigeration · {m.daysSupply}d supply</p>
              </div>
              <span className="badge badge--info" style={{ marginLeft: 'auto' }}>Cold</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section" style={{ paddingTop: 0 }}>
        <p className="section__title">Quick Actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="card card-body stack stack-2" style={{ textAlign: 'left', cursor: 'pointer', padding: 14 }} onClick={() => navigate('/shelters')}>
            <MapPin size={22} color="var(--teal)" aria-hidden="true" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>Find Shelter</p>
              <p className="text-xs text-muted">3 nearby options</p>
            </div>
          </button>
          <button className="card card-body stack stack-2" style={{ textAlign: 'left', cursor: 'pointer', padding: 14 }} onClick={() => navigate('/assistant')}>
            <MessageCircle size={22} color="var(--blue)" aria-hidden="true" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>AI Assistant</p>
              <p className="text-xs text-muted">Ask anything</p>
            </div>
          </button>
          <button className="card card-body stack stack-2" style={{ textAlign: 'left', cursor: 'pointer', padding: 14 }} onClick={() => navigate('/checkin')}>
            <CheckCircle size={22} color="var(--green)" aria-hidden="true" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>Check In</p>
              <p className="text-xs text-muted">Update your status</p>
            </div>
          </button>
          <button className="card card-body stack stack-2" style={{ textAlign: 'left', cursor: 'pointer', padding: 14 }} onClick={() => navigate('/profile')}>
            <AlertTriangle size={22} color="var(--yellow)" aria-hidden="true" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>Care Profile</p>
              <p className="text-xs text-muted">{user.profileCompleteness}% complete</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
