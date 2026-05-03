import { useState } from 'react'
import { User, Zap, Thermometer, Phone, FileText, CheckCircle, Plus, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

function Section({ title, children }) {
  return (
    <div className="section" style={{ paddingTop: 0 }}>
      <p className="section__title">{title}</p>
      {children}
    </div>
  )
}

function CompletenessRing({ value }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke="var(--teal)" strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>{value}%</p>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>complete</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user } = useApp()
  const [printed, setPrinted] = useState(false)

  const handlePrint = () => {
    setPrinted(true)
    setTimeout(() => {
      window.print()
      setPrinted(false)
    }, 100)
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: 16 }}>
        <div className="row gap-3">
          <CompletenessRing value={user.profileCompleteness} />
          <div>
            <h1 className="page-title">{user.name}</h1>
            <p className="text-sm text-secondary mt-1">Zone {user.zone} · Age {user.age}</p>
            <p className="text-xs text-muted mt-1">{user.address}</p>
            <div className="row gap-2 mt-2">
              <span className="badge badge--teal" style={{ fontSize: 11 }}>Profile {user.profileCompleteness}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Completeness notice */}
      {user.profileCompleteness < 100 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="card card--info card-body row gap-2" style={{ padding: '12px 14px' }}>
            <AlertCircle size={16} color="var(--blue)" aria-hidden="true" />
            <p className="text-sm" style={{ color: 'var(--blue)' }}>
              Add a photo ID to reach 100% — helps responders identify you.
            </p>
          </div>
        </div>
      )}

      <div className="divider" />

      {/* Personal Info */}
      <Section title="Personal Information">
        <div className="card card-body stack stack-3">
          <div className="row gap-2">
            <User size={16} color="var(--text-muted)" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted">Full Name</p>
              <p style={{ fontSize: 15, fontWeight: 600 }}>{user.name}</p>
            </div>
          </div>
          <div className="row gap-2">
            <Phone size={16} color="var(--text-muted)" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted">Phone</p>
              <p style={{ fontSize: 15, fontWeight: 600 }}>{user.phone}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Medical Conditions */}
      <Section title="Medical Conditions">
        <div className="stack stack-2">
          {user.conditions.map((c, i) => (
            <div key={i} className="card card-body row gap-2" style={{ padding: '10px 14px' }}>
              <AlertCircle size={15} color="var(--red)" aria-hidden="true" />
              <p style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{c}</p>
              <span className="badge badge--critical" style={{ fontSize: 11 }}>Active</span>
            </div>
          ))}
          <button className="btn btn--ghost btn--sm row gap-1" style={{ width: '100%', justifyContent: 'center' }}>
            <Plus size={14} aria-hidden="true" /> Add Condition
          </button>
        </div>
      </Section>

      {/* Medical Devices */}
      <Section title="Medical Devices">
        <div className="stack stack-2">
          {user.devices.map(d => (
            <div key={d.id} className="card card-body" style={{ padding: '12px 14px' }}>
              <div className="row row-between gap-2">
                <p style={{ fontSize: 15, fontWeight: 600 }}>{d.name}</p>
                {d.critical && <span className="badge badge--critical" style={{ fontSize: 11 }}>Critical</span>}
              </div>
              <div className="row gap-2 mt-2">
                {d.requiresPower && (
                  <span className="amenity-tag amenity-tag--yes">
                    <Zap size={11} aria-hidden="true" /> Needs Power
                  </span>
                )}
                {d.requiresRefrigeration && (
                  <span className="amenity-tag amenity-tag--yes">
                    <Thermometer size={11} aria-hidden="true" /> Needs Cold
                  </span>
                )}
              </div>
            </div>
          ))}
          <button className="btn btn--ghost btn--sm row gap-1" style={{ width: '100%', justifyContent: 'center' }}>
            <Plus size={14} aria-hidden="true" /> Add Device
          </button>
        </div>
      </Section>

      {/* Medications */}
      <Section title="Medications">
        <div className="stack stack-2">
          {user.medications.map(m => (
            <div key={m.id} className="card card-body" style={{ padding: '12px 14px' }}>
              <div className="row row-between gap-2">
                <p style={{ fontSize: 15, fontWeight: 600 }}>{m.name}</p>
                {m.critical && <span className="badge badge--critical" style={{ fontSize: 11 }}>Critical</span>}
              </div>
              <div className="row gap-2 mt-2">
                {m.requiresRefrigeration && (
                  <span className="amenity-tag amenity-tag--yes">
                    <Thermometer size={11} aria-hidden="true" /> Refrigerated
                  </span>
                )}
                <span className="amenity-tag" style={{ background: 'var(--blue-100)', color: 'var(--blue)' }}>
                  {m.daysSupply}d supply
                </span>
              </div>
            </div>
          ))}
          <button className="btn btn--ghost btn--sm row gap-1" style={{ width: '100%', justifyContent: 'center' }}>
            <Plus size={14} aria-hidden="true" /> Add Medication
          </button>
        </div>
      </Section>

      {/* Emergency Contact */}
      <Section title="Emergency Contact">
        <div className="card card-body stack stack-2">
          <div className="row gap-2">
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--blue-100)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <User size={18} color="var(--blue)" aria-hidden="true" />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700 }}>{user.emergencyContact.name}</p>
              <p className="text-sm text-muted">{user.emergencyContact.relationship}</p>
            </div>
          </div>
          <a
            href={`tel:${user.emergencyContact.phone}`}
            className="btn btn--ghost btn--sm row gap-2"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Phone size={14} aria-hidden="true" />
            {user.emergencyContact.phone}
          </a>
        </div>
      </Section>

      {/* Download Care Card */}
      <div className="section" style={{ paddingTop: 0, paddingBottom: 24 }}>
        <button className="btn btn--teal btn--block btn--lg" onClick={handlePrint}>
          <FileText size={20} aria-hidden="true" />
          {printed ? 'Preparing…' : 'Download / Print Care Card'}
        </button>
        <p className="text-xs text-muted mt-2" style={{ textAlign: 'center', lineHeight: 1.5 }}>
          Generates a printable one-page summary for offline emergencies
        </p>
      </div>
    </div>
  )
}
