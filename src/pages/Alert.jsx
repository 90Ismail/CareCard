import { useEffect, useState } from 'react'
import { AlertTriangle, Wind, MapPin, Clock, CheckCircle2 } from 'lucide-react'
import { activeDisaster } from '../data/mockData'
import { useApp } from '../context/AppContext'

const categoryMeta = {
  shelter: { label: 'Shelter', color: 'var(--blue)', bg: 'var(--blue-50)', border: 'var(--blue-200)' },
  medical: { label: 'Medical', color: 'var(--red)', bg: 'var(--red-50)', border: 'var(--red-200)' },
  devices: { label: 'Devices', color: 'var(--orange)', bg: 'var(--orange-50)', border: 'var(--orange-200)' },
  contact: { label: 'Contacts', color: 'var(--teal)', bg: 'var(--teal-50)', border: 'var(--teal-200)' },
}

export default function Alert() {
  const { user } = useApp()
  const [timeLeft, setTimeLeft] = useState(0)
  const [checked, setChecked] = useState({})

  useEffect(() => {
    const calc = () => {
      const diff = new Date(activeDisaster.expiresAt) - new Date()
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)))
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  const m = Math.floor(timeLeft / 60)
  const s = timeLeft % 60

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const criticalItems = activeDisaster.actionChecklist.filter(i => i.critical)
  const nonCriticalItems = activeDisaster.actionChecklist.filter(i => !i.critical)
  const total = activeDisaster.actionChecklist.length
  const done = Object.values(checked).filter(Boolean).length

  return (
    <div>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)',
          padding: '28px 16px 24px',
          color: 'white',
        }}
      >
        <div className="row gap-2 mb-2">
          <AlertTriangle size={28} strokeWidth={2.5} aria-hidden="true" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
            {activeDisaster.title}
          </h1>
        </div>
        <div className="row gap-2 mt-2">
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12 }}>
            Zone {user.zone} — Affected
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12 }}>
            {activeDisaster.issuedBy}
          </span>
        </div>

        {/* Countdown */}
        <div
          style={{
            marginTop: 20,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 'var(--r)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>WARNING EXPIRES IN</p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 44,
                fontWeight: 800,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-1px',
              }}
              aria-live="polite"
              aria-label={`${m} minutes and ${s} seconds remaining`}
            >
              {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </p>
          </div>
          <div style={{ textAlign: 'right', opacity: 0.8 }}>
            <div className="row gap-1">
              <Wind size={14} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{activeDisaster.windSpeed}</span>
            </div>
            <div className="row gap-1 mt-1">
              <MapPin size={14} aria-hidden="true" />
              <span style={{ fontSize: 12 }}>{activeDisaster.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="section">
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {activeDisaster.description}
        </p>
      </div>

      <div className="divider" />

      {/* Checklist progress */}
      <div className="section">
        <div className="row row-between gap-2 mb-2">
          <p className="section__title" style={{ margin: 0 }}>
            Your Personalized Action Checklist
          </p>
          <span className="badge badge--teal">{done}/{total} done</span>
        </div>
        <div className="progress-bar mb-2" style={{ height: 8 }}>
          <div
            className="progress-bar__fill pb--teal"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted">Based on your care profile — insulin pump, wheelchair, CGM</p>
      </div>

      {/* Critical items */}
      <div className="section" style={{ paddingTop: 0 }}>
        <p className="section__title" style={{ color: 'var(--red)' }}>Critical — Do First</p>
        <div className="stack stack-2">
          {criticalItems.map(item => {
            const isChecked = checked[item.id]
            return (
              <div key={item.id} className={`checklist-item ${isChecked ? '' : 'checklist-item--critical'}`}>
                <button
                  className={`checklist-item__check ${isChecked ? 'checked' : ''}`}
                  onClick={() => toggle(item.id)}
                  aria-label={isChecked ? `Uncheck: ${item.text}` : `Check: ${item.text}`}
                >
                  {isChecked && <CheckCircle2 size={14} color="white" strokeWidth={3} aria-hidden="true" />}
                </button>
                <p className={`checklist-item__text ${isChecked ? 'checked' : ''}`}>{item.text}</p>
                <span
                  className="badge"
                  style={{
                    background: categoryMeta[item.category]?.bg,
                    color: categoryMeta[item.category]?.color,
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {categoryMeta[item.category]?.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Non-critical items */}
      <div className="section" style={{ paddingTop: 0, paddingBottom: 24 }}>
        <p className="section__title">Also Recommended</p>
        <div className="stack stack-2">
          {nonCriticalItems.map(item => {
            const isChecked = checked[item.id]
            return (
              <div key={item.id} className="checklist-item">
                <button
                  className={`checklist-item__check ${isChecked ? 'checked' : ''}`}
                  onClick={() => toggle(item.id)}
                  aria-label={isChecked ? `Uncheck: ${item.text}` : `Check: ${item.text}`}
                >
                  {isChecked && <CheckCircle2 size={14} color="white" strokeWidth={3} aria-hidden="true" />}
                </button>
                <p className={`checklist-item__text ${isChecked ? 'checked' : ''}`}>{item.text}</p>
                <span
                  className="badge badge--muted"
                  style={{ fontSize: 11, flexShrink: 0 }}
                >
                  {categoryMeta[item.category]?.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
