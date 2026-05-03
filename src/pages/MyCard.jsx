import { useState } from 'react'
import {
  CheckCircle2, AlertOctagon, Navigation,
  Phone, MapPin, User, Save,
  Zap, Thermometer, Move, Wind, Eye, Volume2, Activity, HeartPulse, X, Plus,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { NEEDS } from '../data/mockData'
import { CareCardLogo, PersonAvatar } from '../components/CareCardBrand'

const ICON_MAP = { Zap, Thermometer, Move, Wind, Eye, Volume2, Activity, HeartPulse }

const STATUS_OPTS = [
  { id: 'safe',       label: "I'm Safe",   Icon: CheckCircle2, color: '#81c995', bg: '#0d2b1a', cls: 'active-safe'       },
  { id: 'need-help',  label: 'Need Help',  Icon: AlertOctagon, color: '#f28b82', bg: '#2d1111', cls: 'active-need-help'  },
  { id: 'evacuating', label: 'Evacuating', Icon: Navigation,   color: '#fdd663', bg: '#2a2008', cls: 'active-evacuating' },
]

const STATUS_LABELS = { safe: 'Safe', 'need-help': 'Needs Help', evacuating: 'Evacuating' }

/* ── ID Card preview ──────────────────────────────────────────── */
function IdCard({ card }) {
  const needMeta = Object.fromEntries(NEEDS.map(n => [n.id, n]))

  return (
    <div className="id-card">

      {/* ── Branded header ── */}
      <div className="id-card__header">
        <div className="id-card__header-brand">
          <CareCardLogo size={26} color="white" />
          <div>
            <p className="id-card__header-wordmark">CARECARD</p>
            <p className="id-card__header-sub">Emergency Medical ID</p>
          </div>
        </div>
        <div
          className={`status-badge status-badge--${card.status}`}
          aria-label={`Status: ${STATUS_LABELS[card.status]}`}
        >
          <div className="status-badge__dot" />
          {STATUS_LABELS[card.status]}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="id-card__body">
        {/* Avatar + name row */}
        <div className="id-card__name-row">
          <div className="id-card__avatar-wrap">
            <PersonAvatar
              name={card.name || '?'}
              status={card.status}
              size={46}
            />
          </div>
          <div className="f1">
            {card.name
              ? <p className="id-card__name">{card.name}</p>
              : <p className="id-card__name--empty">Your name</p>
            }
            {card.address && (
              <p className="id-card__addr">
                {card.address}{card.zone ? ` · Zone ${card.zone}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Needs */}
        {card.needs.length > 0 && (
          <>
            <div className="id-card__divider" />
            <p className="id-card__row-label">Special Needs</p>
            <div className="needs-wrap">
              {card.needs.map(id => {
                const n = needMeta[id]
                if (!n) return null
                const Icon = ICON_MAP[n.icon]
                return (
                  <span key={id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 9999,
                    fontSize: 12, fontWeight: 500,
                    background: n.bg, color: n.color,
                    border: `1px solid ${n.color}30`,
                  }}>
                    {Icon && <Icon size={11} aria-hidden="true" />}
                    {n.label}
                  </span>
                )
              })}
            </div>
          </>
        )}

        {/* Devices */}
        {card.devices.length > 0 && (
          <>
            <div className="id-card__divider" />
            <p className="id-card__row-label">Devices &amp; Medications</p>
            <div className="needs-wrap">
              {card.devices.map((d, i) => (
                <span key={i} className="device-chip">{d}</span>
              ))}
            </div>
          </>
        )}

        {/* Notes */}
        {card.medicalNotes && (
          <>
            <div className="id-card__divider" />
            <div className="note-block">
              <Activity size={13} color="#fdd663" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{card.medicalNotes}</p>
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      {(card.emergencyContact || card.phone) && (
        <div className="id-card__footer">
          <div>
            <p className="id-card__footer-key">Emergency contact</p>
            <p className="id-card__footer-val">{card.emergencyContact || '—'}</p>
          </div>
          {card.emergencyPhone && (
            <div style={{ textAlign: 'right' }}>
              <p className="id-card__footer-key">Phone</p>
              <p className="id-card__footer-val">{card.emergencyPhone}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
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

  return (
    <div>
      {/* Status */}
      <div className="section">
        <p className="section-hd">Your Status</p>
        <div className="status-row" role="group" aria-label="Set your status">
          {STATUS_OPTS.map(({ id, label, Icon, color, bg, cls }) => (
            <button
              key={id}
              className={`status-card ${myCard.status === id ? cls : ''}`}
              onClick={() => updateStatus(id)}
              aria-pressed={myCard.status === id}
            >
              <div className="status-card__icon" style={{ background: myCard.status === id ? bg : '#f8f9fa' }}>
                <Icon size={18} color={myCard.status === id ? color : '#9aa0a6'} strokeWidth={2} aria-hidden="true" />
              </div>
              <span className="status-card__label" style={{ color: myCard.status === id ? color : undefined }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Card preview */}
      <div className="section" style={{ paddingTop: 0 }}>
        <p className="section-hd">Your Care Card</p>
        <IdCard card={myCard} />
      </div>

      <div className="divider" />

      {/* Personal info */}
      <div className="section">
        <p className="section-hd">Personal Information</p>
        <div className="stack gap-3">
          <div className="form-field">
            <label className="form-label" htmlFor="cc-name">Full Name</label>
            <input id="cc-name" className="input" value={myCard.name}
              onChange={e => update('name', e.target.value)} placeholder="Full legal name" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 68px', gap: 8 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="cc-addr">Address</label>
              <input id="cc-addr" className="input" value={myCard.address}
                onChange={e => update('address', e.target.value)} placeholder="Street, city, state" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cc-zone">Zone</label>
              <input id="cc-zone" className="input" value={myCard.zone}
                onChange={e => update('zone', e.target.value.toUpperCase())}
                placeholder="A" maxLength={1}
                style={{ textAlign: 'center', textTransform: 'uppercase' }} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="cc-phone">Your Phone</label>
            <input id="cc-phone" className="input" type="tel" value={myCard.phone}
              onChange={e => update('phone', e.target.value)} placeholder="(xxx) xxx-xxxx" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="cc-ec">Emergency Contact</label>
              <input id="cc-ec" className="input" value={myCard.emergencyContact}
                onChange={e => update('emergencyContact', e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cc-ep">Their Phone</label>
              <input id="cc-ep" className="input" type="tel" value={myCard.emergencyPhone}
                onChange={e => update('emergencyPhone', e.target.value)} placeholder="(xxx) xxx-xxxx" />
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Needs */}
      <div className="section">
        <p className="section-hd">Special Needs</p>
        <p className="fs-12 tm" style={{ marginBottom: 10, lineHeight: 1.5 }}>
          Select all that apply — shown to responders and volunteers.
        </p>
        <div className="needs-wrap">
          {NEEDS.map(n => {
            const Icon = ICON_MAP[n.icon]
            const isOn = myCard.needs.includes(n.id)
            return (
              <button key={n.id} className={`need-tag ${isOn ? 'on' : ''}`}
                onClick={() => toggleNeed(n.id)} aria-pressed={isOn}>
                {Icon && <Icon size={12} aria-hidden="true" />}
                {n.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="divider" />

      {/* Devices */}
      <div className="section">
        <p className="section-hd">Devices &amp; Medications</p>
        <div className="needs-wrap" style={{ marginBottom: 10 }}>
          {myCard.devices.map((d, i) => (
            <span key={i} className="device-chip">
              {d}
              <button className="device-chip__rm" onClick={() => update('devices', myCard.devices.filter((_, j) => j !== i))}
                aria-label={`Remove ${d}`}>
                <X size={9} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={deviceInput}
            onChange={e => setDeviceInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDevice() } }}
            placeholder="e.g. Ventilator, Insulin, CPAP…"
            style={{ flex: 1 }}
            aria-label="Add device or medication" />
          <button className="btn btn--primary btn--sm" onClick={addDevice} style={{ flexShrink: 0 }}>
            <Plus size={13} aria-hidden="true" /> Add
          </button>
        </div>
      </div>

      <div className="divider" />

      {/* Notes */}
      <div className="section">
        <p className="section-hd">Medical Notes</p>
        <div className="form-field">
          <label className="form-label" htmlFor="cc-notes">Key information for emergency responders</label>
          <textarea id="cc-notes" className="input" value={myCard.medicalNotes}
            onChange={e => update('medicalNotes', e.target.value)}
            placeholder="Allergies, handling instructions, critical details…" rows={3} />
        </div>
      </div>

      {/* Save */}
      <div className="section" style={{ paddingTop: 0, paddingBottom: 36 }}>
        <button
          className={`btn btn--lg btn--block ${saved ? 'btn--success' : 'btn--primary'}`}
          onClick={() => setSaved(true)}
        >
          {saved
            ? <><CheckCircle2 size={17} aria-hidden="true" /> Saved — Visible to Responders</>
            : <><Save size={17} aria-hidden="true" /> Save My Care Card</>
          }
        </button>
      </div>
    </div>
  )
}
