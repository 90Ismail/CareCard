import { useState, useMemo } from 'react'
import { Users, Zap, Thermometer, Clock, CheckCircle, PhoneCall, Filter } from 'lucide-react'
import { useApp } from '../context/AppContext'

const ZONES = ['All', 'A', 'B', 'C', 'D']
const STATUS_FILTERS = ['All', 'need-help', 'evacuating', 'safe']

function priorityClass(score, status) {
  if (status === 'need-help' || score >= 88) return 'critical'
  if (score >= 70) return 'high'
  if (score >= 50) return 'moderate'
  return 'low'
}

const priorityLabels = {
  critical: { label: 'Critical', color: 'var(--red)', bg: 'var(--red-50)', border: 'var(--red-200)' },
  high: { label: 'High', color: 'var(--orange)', bg: 'var(--orange-50)', border: 'var(--orange-200)' },
  moderate: { label: 'Moderate', color: 'var(--yellow)', bg: 'var(--yellow-50)', border: 'var(--yellow-200)' },
  low: { label: 'Low', color: 'var(--green)', bg: 'var(--green-50)', border: 'var(--green-200)' },
}

const statusBadge = {
  safe: <span className="badge badge--safe" style={{ fontSize: 11 }}>Safe</span>,
  'need-help': <span className="badge badge--need-help" style={{ fontSize: 11 }}>Needs Help</span>,
  evacuating: <span className="badge badge--evacuating" style={{ fontSize: 11 }}>Evacuating</span>,
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function Responder() {
  const { residents, markResident } = useApp()
  const [zone, setZone] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(() => {
    return residents
      .filter(r => zone === 'All' || r.zone === zone)
      .filter(r => statusFilter === 'All' || r.status === statusFilter)
      .sort((a, b) => {
        const ap = priorityClass(a.priorityScore, a.status)
        const bp = priorityClass(b.priorityScore, b.status)
        const order = { critical: 0, high: 1, moderate: 2, low: 3 }
        if (order[ap] !== order[bp]) return order[ap] - order[bp]
        return b.priorityScore - a.priorityScore
      })
  }, [residents, zone, statusFilter])

  const stats = useMemo(() => ({
    total: residents.length,
    critical: residents.filter(r => priorityClass(r.priorityScore, r.status) === 'critical').length,
    needHelp: residents.filter(r => r.status === 'need-help').length,
    safe: residents.filter(r => r.status === 'safe').length,
  }), [residents])

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
          padding: '24px 16px 20px',
          color: 'white',
        }}
      >
        <div className="row gap-2 mb-3">
          <Users size={22} aria-hidden="true" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
            Responder Dashboard
          </h1>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: 'Total', val: stats.total, color: 'rgba(255,255,255,0.9)' },
            { label: 'Critical', val: stats.critical, color: '#FCA5A5' },
            { label: 'Need Help', val: stats.needHelp, color: '#FED7AA' },
            { label: 'Safe', val: stats.safe, color: '#6EE7B7' },
          ].map(({ label, val, color }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.12)',
                borderRadius: 'var(--r-sm)',
                padding: '10px 6px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{val}</p>
              <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="row gap-2">
          <Filter size={13} color="var(--text-muted)" aria-hidden="true" />
          <p className="text-xs text-muted font-semibold" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Zone
          </p>
        </div>
        <div className="filter-row" style={{ padding: 0 }}>
          {ZONES.map(z => (
            <button
              key={z}
              className={`filter-chip ${zone === z ? 'active' : ''}`}
              onClick={() => setZone(z)}
              aria-pressed={zone === z}
            >
              {z === 'All' ? 'All Zones' : `Zone ${z}`}
            </button>
          ))}
        </div>

        <div className="filter-row" style={{ padding: 0 }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
            >
              {s === 'All' ? 'All Statuses' : s === 'need-help' ? 'Needs Help' : s === 'evacuating' ? 'Evacuating' : 'Safe'}
            </button>
          ))}
        </div>
      </div>

      {/* Resident list */}
      <div className="section">
        <p className="section__title">{filtered.length} resident{filtered.length !== 1 ? 's' : ''}</p>
        <div className="stack stack-3">
          {filtered.map(r => {
            const pClass = priorityClass(r.priorityScore, r.status)
            const pm = priorityLabels[pClass]

            return (
              <div
                key={r.id}
                className="resident-card"
                style={{ borderLeft: `4px solid ${pm.color}` }}
              >
                <div className="resident-card__header">
                  <div className="row gap-2" style={{ flex: 1, minWidth: 0 }}>
                    <div className={`priority-ring priority-ring--${pClass}`} aria-label={`Priority: ${pm.label}`}>
                      {r.priorityScore}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row gap-2">
                        <p style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</p>
                        {statusBadge[r.status]}
                      </div>
                      <p className="text-xs text-muted mt-1">{r.address}</p>
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{ background: pm.bg, color: pm.color, fontSize: 11, flexShrink: 0 }}
                  >
                    {pm.label}
                  </span>
                </div>

                {/* Conditions + devices */}
                <div style={{ padding: '0 14px 10px' }}>
                  <div className="row gap-1 flex-wrap" style={{ flexWrap: 'wrap' }}>
                    {r.powerDependent && (
                      <span className="amenity-tag amenity-tag--yes" style={{ fontSize: 11 }}>
                        <Zap size={10} aria-hidden="true" /> Power Dep.
                      </span>
                    )}
                    {r.refrigerationNeeded && (
                      <span className="amenity-tag amenity-tag--yes" style={{ fontSize: 11 }}>
                        <Thermometer size={10} aria-hidden="true" /> Refrigeration
                      </span>
                    )}
                    {r.conditions.map((c, i) => (
                      <span key={i} className="badge badge--muted" style={{ fontSize: 10 }}>{c}</span>
                    ))}
                  </div>
                </div>

                {/* Needs + last check-in */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: pm.bg,
                    borderTop: `1px solid ${pm.border}`,
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: pm.color, lineHeight: 1.35 }}>
                    {r.topNeeds}
                  </p>
                  <div className="row gap-1 mt-1">
                    <Clock size={11} color="var(--text-muted)" aria-hidden="true" />
                    <p className="text-xs text-muted">Last check-in: {timeAgo(r.lastCheckIn)}</p>
                  </div>
                </div>

                {/* Recommended action */}
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs text-muted mb-1" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Recommended Action
                  </p>
                  <p className="text-sm" style={{ lineHeight: 1.4 }}>{r.action}</p>
                </div>

                {/* Action buttons */}
                <div className="row gap-2" style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
                  <button
                    className={`btn btn--sm ${r.contacted ? 'btn--ghost' : 'btn--ghost'}`}
                    style={{ flex: 1, color: r.contacted ? 'var(--green)' : undefined, borderColor: r.contacted ? 'var(--green-200)' : undefined }}
                    onClick={() => markResident(r.id, 'contacted')}
                    disabled={r.contacted}
                    aria-label={r.contacted ? 'Already contacted' : 'Mark as contacted'}
                  >
                    <PhoneCall size={13} aria-hidden="true" />
                    {r.contacted ? 'Contacted ✓' : 'Mark Contacted'}
                  </button>
                  <button
                    className={`btn btn--sm ${r.reached ? 'btn--green' : 'btn--ghost'}`}
                    style={{ flex: 1 }}
                    onClick={() => markResident(r.id, 'reached')}
                    disabled={r.reached}
                    aria-label={r.reached ? 'Already reached' : 'Mark as reached'}
                  >
                    <CheckCircle size={13} aria-hidden="true" />
                    {r.reached ? 'Reached ✓' : 'Mark Reached'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
