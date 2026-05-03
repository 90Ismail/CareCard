import { useState } from 'react'
import {
  CheckCircle2, AlertOctagon, Navigation, Phone, MapPin, User,
  Save, Zap, Thermometer, Move, Wind, Eye, Volume2, Activity, HeartPulse,
  X, Plus,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { NEEDS } from '../data/mockData'

/* Map icon string → Lucide component */
const ICON_MAP = { Zap, Thermometer, Move, Wind, Eye, Volume2, Activity, HeartPulse }

const STATUS_OPTS = [
  {
    id: 'safe',
    label: "I'm Safe",
    Icon: CheckCircle2,
    iconColor: '#065F46',
    iconBg: '#D1FAE5',
    activeClass: 'active-safe',
  },
  {
    id: 'need-help',
    label: 'I Need Help',
    Icon: AlertOctagon,
    iconColor: '#991B1B',
    iconBg: '#FEE2E2',
    activeClass: 'active-need-help',
  },
  {
    id: 'evacuating',
    label: 'Evacuating',
    Icon: Navigation,
    iconColor: '#92400E',
    iconBg: '#FEF3C7',
    activeClass: 'active-evacuating',
  },
]

const LABEL_MAP = { safe: 'Safe', 'need-help': 'Needs Help', evacuating: 'Evacuating' }

/* ── ID Card Preview ─────────────────────────────────────────── */
function IdCardPreview({ card }) {
  const needMap = Object.fromEntries(NEEDS.map(n => [n.id, n]))

  return (
    <div className="id-card" role="region" aria-label="Your care card">
      <div className="id-card__header">
        <div className="id-card__header-top">
          <div className="id-card__org">
            <ShieldIcon />
            CareCard · Emergency ID
          </div>
          {card.zone && (
            <span className="id-card__zone">Zone {card.zone}</span>
          )}
        </div>

        <div className="id-card__name-row">
          <div>
            {card.name
              ? <p className="id-card__name">{card.name}</p>
              : <p className="id-card__name-placeholder">Your name</p>
            }
            {card.address && (
              <p className="id-card__address">{card.address}</p>
            )}
          </div>

          <div
            className={`id-status id-status--${card.status}`}
            aria-label={`Status: ${LABEL_MAP[card.status]}`}
          >
            <div className="id-status__dot" />
            {LABEL_MAP[card.status]}
          </div>
        </div>
      </div>

      <div className="id-card__body">
        {/* Needs */}
        {card.needs.length > 0 && (
          <div>
            <p className="id-card__section-label">Needs</p>
            <div className="needs-grid">
              {card.needs.map(id => {
                const n = needMap[id]
                if (!n) return null
                const Icon = ICON_MAP[n.icon]
                return (
                  <span
                    key={id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 9999,
                      fontSize: 12, fontWeight: 600,
                      background: n.bg, color: n.color,
                      border: `1px solid ${n.color}30`,
                    }}
                  >
                    {Icon && <Icon size={11} aria-hidden="true" />}
                    {n.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Devices */}
        {card.devices.length > 0 && (
          <div>
            <p className="id-card__section-label">Devices & Medications</p>
            <div className="needs-grid">
              {card.devices.map((d, i) => (
                <span key={i} className="device-chip" aria-label={d}>{d}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {card.medicalNotes && (
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--r-sm)',
            padding: '10px 12px',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <Activity size={13} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.5 }}>
              {card.medicalNotes}
            </p>
          </div>
        )}
      </div>

      {(card.emergencyContact || card.phone) && (
        <div className="id-card__footer">
          <div>
            <p className="id-card__footer-label">Emergency contact</p>
            <p className="id-card__footer-val">{card.emergencyContact || '—'}</p>
          </div>
          {card.emergencyPhone && (
            <div style={{ textAlign: 'right' }}>
              <p className="id-card__footer-label">Phone</p>
              <p className="id-card__footer-val">{card.emergencyPhone}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export default function MyCard() {
  const { myCard, setMyCard, updateStatus } = useApp()
  const [saved, setSaved] = useState(false)
  const [deviceInput, setDeviceInput] = useState('')

  const update = (field, val) => {
    setSaved(false)
    setMyCard(p => ({ ...p, [field]: val }))
  }

  const toggleNeed = (id) => {
    setSaved(false)
    setMyCard(p => ({
      ...p,
      needs: p.needs.includes(id) ? p.needs.filter(n => n !== id) : [...p.needs, id],
    }))
  }

  const addDevice = () => {
    const v = deviceInput.trim()
    if (!v) return
    update('devices', [...myCard.devices, v])
    setDeviceInput('')
  }

  const removeDevice = (i) => update('devices', myCard.devices.filter((_, idx) => idx !== i))

  return (
    <div>
      {/* ── Status ── */}
      <div className="section">
        <p className="section-hd">Your Current Status</p>
        <div className="status-row" role="group" aria-label="Set your status">
          {STATUS_OPTS.map(({ id, label, Icon, iconColor, iconBg, activeClass }) => (
            <button
              key={id}
              className={`status-card ${myCard.status === id ? activeClass : ''}`}
              onClick={() => updateStatus(id)}
              aria-pressed={myCard.status === id}
            >
              <div className="status-card__icon" style={{ background: iconBg }}>
                <Icon
                  size={20}
                  color={iconColor}
                  strokeWidth={2.5}
                  aria-hidden="true"
                  style={id === 'need-help' && myCard.status === id
                    ? { animation: 'status-pulse 1.3s infinite' }
                    : undefined
                  }
                />
              </div>
              <span
                className="status-card__label"
                style={{ color: myCard.status === id ? iconColor : 'var(--text-2)' }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Card Preview ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <p className="section-hd">Your Care Card</p>
        <IdCardPreview card={myCard} />
      </div>

      <div className="divider" />

      {/* ── Personal Info ── */}
      <div className="section">
        <p className="section-hd">Personal Information</p>
        <div className="stack gap-3">
          <div className="form-field">
            <label className="form-label" htmlFor="cc-name">
              <User size={11} style={{ display:'inline', marginRight: 4 }} aria-hidden="true" />
              Full Name
            </label>
            <input
              id="cc-name"
              className="input"
              value={myCard.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Full legal name"
              autoComplete="name"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px', gap: 8 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="cc-address">
                <MapPin size={11} style={{ display:'inline', marginRight: 4 }} aria-hidden="true" />
                Address
              </label>
              <input
                id="cc-address"
                className="input"
                value={myCard.address}
                onChange={e => update('address', e.target.value)}
                placeholder="Street address, city"
                autoComplete="street-address"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cc-zone">Zone</label>
              <input
                id="cc-zone"
                className="input"
                value={myCard.zone}
                onChange={e => update('zone', e.target.value.toUpperCase())}
                placeholder="A–D"
                maxLength={1}
                style={{ textAlign: 'center', textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="cc-phone">
              <Phone size={11} style={{ display:'inline', marginRight: 4 }} aria-hidden="true" />
              Your Phone
            </label>
            <input
              id="cc-phone"
              className="input"
              type="tel"
              value={myCard.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="(xxx) xxx-xxxx"
              autoComplete="tel"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="cc-ec">Emergency Contact</label>
              <input
                id="cc-ec"
                className="input"
                value={myCard.emergencyContact}
                onChange={e => update('emergencyContact', e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cc-ep">Their Phone</label>
              <input
                id="cc-ep"
                className="input"
                type="tel"
                value={myCard.emergencyPhone}
                onChange={e => update('emergencyPhone', e.target.value)}
                placeholder="(xxx) xxx-xxxx"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* ── Needs ── */}
      <div className="section">
        <p className="section-hd">Special Needs</p>
        <p className="fs-12 tm" style={{ marginBottom: 10, lineHeight: 1.5 }}>
          Select everything that applies. This information is shown to responders and volunteers.
        </p>
        <div className="needs-grid">
          {NEEDS.map(n => {
            const Icon = ICON_MAP[n.icon]
            const isOn = myCard.needs.includes(n.id)
            return (
              <button
                key={n.id}
                className={`need-tag ${isOn ? 'on' : ''}`}
                onClick={() => toggleNeed(n.id)}
                aria-pressed={isOn}
              >
                {Icon && <Icon size={12} aria-hidden="true" />}
                {n.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="divider" />

      {/* ── Devices ── */}
      <div className="section">
        <p className="section-hd">Devices & Medications</p>
        <div className="needs-grid" style={{ marginBottom: 10 }}>
          {myCard.devices.map((d, i) => (
            <span key={i} className="device-chip">
              {d}
              <button
                className="device-chip__remove"
                onClick={() => removeDevice(i)}
                aria-label={`Remove ${d}`}
              >
                <X size={9} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={deviceInput}
            onChange={e => setDeviceInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDevice() } }}
            placeholder="Ventilator, Insulin, CPAP…"
            style={{ flex: 1 }}
            aria-label="Add device or medication"
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={addDevice}
            style={{ flexShrink: 0 }}
          >
            <Plus size={14} aria-hidden="true" />
            Add
          </button>
        </div>
      </div>

      <div className="divider" />

      {/* ── Notes ── */}
      <div className="section">
        <p className="section-hd">Medical Notes</p>
        <div className="form-field">
          <label className="form-label" htmlFor="cc-notes">
            Key information for emergency responders
          </label>
          <textarea
            id="cc-notes"
            className="input"
            value={myCard.medicalNotes}
            onChange={e => update('medicalNotes', e.target.value)}
            placeholder="Allergies, special handling instructions, critical care details…"
            rows={3}
          />
        </div>
      </div>

      {/* ── Save ── */}
      <div className="section" style={{ paddingTop: 0, paddingBottom: 32 }}>
        <button
          className={`btn btn--lg btn--block ${saved ? 'btn--accent' : 'btn--primary'}`}
          onClick={() => setSaved(true)}
        >
          {saved
            ? <><CheckCircle2 size={18} aria-hidden="true" /> Card Saved — Visible to Responders</>
            : <><Save size={18} aria-hidden="true" /> Save My Care Card</>
          }
        </button>
      </div>
    </div>
  )
}
