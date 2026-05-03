import { useState } from 'react'
import { MapPin, Zap, Thermometer, Accessibility, Star, Phone, Users } from 'lucide-react'
import { shelters as initialShelters } from '../data/mockData'

const FILTERS = [
  { id: 'wheelchairAccessible', label: 'Accessible', icon: Accessibility },
  { id: 'hasPowerOutlets', label: 'Power', icon: Zap },
  { id: 'hasRefrigeration', label: 'Refrigeration', icon: Thermometer },
  { id: 'hasSpecialNeedsUnit', label: 'Special Needs', icon: Star },
]

function scoreColor(score) {
  if (score >= 85) return { color: 'var(--teal)', bg: 'var(--teal-50)' }
  if (score >= 60) return { color: 'var(--yellow)', bg: 'var(--yellow-50)' }
  return { color: 'var(--red)', bg: 'var(--red-50)' }
}

function occupancyColor(pct) {
  if (pct < 60) return 'pb--green'
  if (pct < 85) return 'pb--orange'
  return 'pb--red'
}

export default function Shelters() {
  const [activeFilters, setActiveFilters] = useState([])
  const [headingTo, setHeadingTo] = useState(null)
  const [shelterList] = useState(initialShelters)

  const toggleFilter = (id) => {
    setActiveFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const filtered = shelterList
    .filter(s => activeFilters.every(f => s[f]))
    .sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div>
      <div className="page-header" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">Find Shelter</h1>
        <p className="page-subtitle">Sorted by best match for your care profile</p>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ paddingBottom: 16 }}>
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`filter-chip ${activeFilters.includes(id) ? 'active-teal' : ''}`}
            onClick={() => toggleFilter(id)}
            aria-pressed={activeFilters.includes(id)}
          >
            <Icon size={13} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Shelter cards */}
      <div className="section" style={{ paddingTop: 0 }}>
        {filtered.length === 0 ? (
          <div className="card card-body" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No shelters match all selected filters.</p>
            <button
              className="btn btn--ghost btn--sm mt-3"
              onClick={() => setActiveFilters([])}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="stack stack-3">
            {filtered.map((s, idx) => {
              const sc = scoreColor(s.matchScore)
              const pct = Math.round((s.currentOccupancy / s.capacity) * 100)
              const isHeading = headingTo === s.id

              return (
                <div key={s.id} className="card" style={{ overflow: 'visible' }}>
                  {idx === 0 && (
                    <div
                      style={{
                        background: 'var(--teal)',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: 'var(--r) var(--r) 0 0',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Best Match for Your Needs
                    </div>
                  )}

                  <div className="card-body">
                    {/* Header row */}
                    <div className="row row-between gap-2" style={{ alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{s.name}</p>
                        <div className="row gap-1 mt-1">
                          <MapPin size={12} color="var(--text-muted)" aria-hidden="true" />
                          <p className="text-xs text-muted">{s.distance} mi · {s.address.split(',')[0]}</p>
                        </div>
                      </div>
                      {/* Match score */}
                      <div
                        className="match-score"
                        style={{ background: sc.bg, padding: '6px 10px', borderRadius: 'var(--r-sm)' }}
                        aria-label={`${s.matchScore}% match`}
                      >
                        <p className="match-score__num" style={{ color: sc.color }}>{s.matchScore}%</p>
                        <p className="match-score__label" style={{ color: sc.color }}>match</p>
                      </div>
                    </div>

                    {/* Occupancy */}
                    <div className="mt-3">
                      <div className="row row-between gap-1 mb-1">
                        <div className="row gap-1">
                          <Users size={12} color="var(--text-muted)" aria-hidden="true" />
                          <p className="text-xs text-muted">Occupancy</p>
                        </div>
                        <p className="text-xs font-semibold" style={{ color: pct > 85 ? 'var(--red)' : 'var(--text-secondary)' }}>
                          {s.currentOccupancy} / {s.capacity}
                        </p>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-bar__fill ${occupancyColor(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="amenity-row mt-3">
                      <span className={`amenity-tag ${s.wheelchairAccessible ? 'amenity-tag--yes' : 'amenity-tag--no'}`}>
                        <Accessibility size={11} aria-hidden="true" /> Accessible
                      </span>
                      <span className={`amenity-tag ${s.hasPowerOutlets ? 'amenity-tag--yes' : 'amenity-tag--no'}`}>
                        <Zap size={11} aria-hidden="true" /> Power
                      </span>
                      <span className={`amenity-tag ${s.hasRefrigeration ? 'amenity-tag--yes' : 'amenity-tag--no'}`}>
                        <Thermometer size={11} aria-hidden="true" /> Refrigeration
                      </span>
                      {s.hasSpecialNeedsUnit && (
                        <span className="amenity-tag amenity-tag--yes">
                          <Star size={11} aria-hidden="true" /> Special Needs Unit
                        </span>
                      )}
                    </div>

                    {/* Match reason */}
                    <div
                      className="mt-3"
                      style={{
                        background: sc.bg,
                        borderRadius: 'var(--r-sm)',
                        padding: '10px 12px',
                      }}
                    >
                      <p className="text-sm" style={{ color: sc.color, lineHeight: 1.45 }}>
                        {s.matchReason}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="row gap-2 mt-3">
                      <button
                        className={`btn btn--sm ${isHeading ? 'btn--teal' : 'btn--ghost'}`}
                        style={{ flex: 1 }}
                        onClick={() => setHeadingTo(isHeading ? null : s.id)}
                        aria-pressed={isHeading}
                      >
                        {isHeading ? '✓ Heading There' : "I'm heading here"}
                      </button>
                      <a
                        href={`tel:${s.phone}`}
                        className="btn btn--ghost btn--sm"
                        aria-label={`Call ${s.name}`}
                      >
                        <Phone size={14} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
