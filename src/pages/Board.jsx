import { useState, useMemo } from 'react'
import {
  Phone, CheckCircle2, UserCheck, X, Clock,
  Zap, Thermometer, Move, Wind, Eye, Volume2, Activity, HeartPulse,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { NEEDS } from '../data/mockData'

const ICON_MAP = { Zap, Thermometer, Move, Wind, Eye, Volume2, Activity, HeartPulse }

const STATUS_META = {
  'need-help': { label: 'Needs Help', badgeClass: 'badge--danger',  order: 0 },
  evacuating:  { label: 'Evacuating', badgeClass: 'badge--warning', order: 1 },
  safe:        { label: 'Safe',        badgeClass: 'badge--success', order: 2 },
}

const ZONES = ['All', 'A', 'B', 'C', 'D']
const needMap = Object.fromEntries(NEEDS.map(n => [n.id, n]))

function elapsed(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  return `${Math.floor(s/3600)}h ago`
}

function NeedPill({ id }) {
  const n = needMap[id]
  if (!n) return null
  const Icon = ICON_MAP[n.icon]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
      background: n.bg, color: n.color, border: `1px solid ${n.color}25`,
    }}>
      {Icon && <Icon size={10} aria-hidden="true" />}
      {n.label}
    </span>
  )
}

function BoardCard({ card, mode, onClaim, onUnclaim, onReach }) {
  const sm = STATUS_META[card.status] || STATUS_META.safe
  const isClaimed = !!card.claimedBy
  const myName = mode === 'responder' ? 'Dispatcher Jordan' : 'Volunteer You'
  const isMine = card.claimedBy?.name === myName

  return (
    <div className="bcard" role="article" aria-label={`Care card for ${card.name}`}>
      <div className={`bcard__stripe bcard__stripe--${card.status}`} aria-hidden="true" />
      <div className="bcard__body">
        <div className="bcard__main">
          {/* Name + status */}
          <div className="row sb gap-2" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div className="f1">
              <div className="row gap-2 wrap">
                <span style={{ fontSize: 15, fontWeight: 700 }}>{card.name}</span>
                <span className={`badge ${sm.badgeClass}`}>{sm.label}</span>
                {card.reached && <span className="badge badge--reached">Reached</span>}
              </div>
              <div className="row gap-1 mt-1">
                <MapPin12 />
                <span className="fs-12 tm">{card.address}</span>
              </div>
            </div>
            <a
              href={`tel:${card.phone}`}
              className="btn btn--ghost-sm btn--sm"
              aria-label={`Call ${card.name} at ${card.phone}`}
            >
              <Phone size={13} aria-hidden="true" />
              <span className="fs-12">{card.phone}</span>
            </a>
          </div>

          {/* Needs */}
          {card.needs.length > 0 && (
            <div className="needs-grid mt-2">
              {card.needs.map(id => <NeedPill key={id} id={id} />)}
            </div>
          )}

          {/* Medical notes */}
          {card.medicalNotes && (
            <div
              className="mt-2"
              style={{
                background: '#FFFBEB', border: '1px solid #FDE68A',
                borderRadius: 'var(--r-sm)', padding: '8px 11px',
                display: 'flex', gap: 7, alignItems: 'flex-start',
              }}
            >
              <Activity size={12} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.4 }}>
                {card.medicalNotes}
              </p>
            </div>
          )}

          {/* Claim info */}
          {isClaimed && (
            <div className="row gap-1 mt-2" style={{ color: 'var(--success)' }}>
              <UserCheck size={12} aria-hidden="true" />
              <span className="fs-12 fw-6">
                {isMine ? 'Claimed by you' : `Claimed by ${card.claimedBy.name}`}
                {' · '}{elapsed(card.claimedBy.time)}
              </span>
            </div>
          )}

          <div className="row gap-1 mt-1">
            <Clock size={11} color="var(--text-4)" aria-hidden="true" />
            <span className="fs-11 tm">Posted {elapsed(card.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="bcard__footer">
          {mode === 'responder' ? (
            <>
              <button
                className={`btn btn--sm ${isClaimed ? 'btn--ghost' : 'btn--primary'}`}
                style={{ flex: 1 }}
                onClick={() => isClaimed ? onUnclaim(card.id) : onClaim(card.id, 'Dispatcher Jordan')}
              >
                {isClaimed
                  ? <><X size={12} aria-hidden="true" /> Unclaim</>
                  : <><UserCheck size={12} aria-hidden="true" /> Claim Card</>
                }
              </button>
              <button
                className={`btn btn--sm ${card.reached ? 'btn--success' : 'btn--ghost'}`}
                style={{ flex: 1 }}
                disabled={card.reached}
                onClick={() => onReach(card.id)}
              >
                <CheckCircle2 size={12} aria-hidden="true" />
                {card.reached ? 'Reached' : 'Mark Reached'}
              </button>
            </>
          ) : (
            <button
              className={`btn btn--sm ${isMine ? 'btn--ghost' : 'btn--accent'}`}
              style={{ flex: 1 }}
              onClick={() => isMine ? onUnclaim(card.id) : onClaim(card.id, 'Volunteer You')}
            >
              {isMine
                ? <><X size={12} aria-hidden="true" /> Remove Claim</>
                : <><UserCheck size={12} aria-hidden="true" /> Volunteer to Help</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MapPin12() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

export default function Board({ mode }) {
  const { cards, claimCard, unclaimCard, markReached } = useApp()
  const [zone, setZone] = useState('All')
  const [needFilter, setNeedFilter] = useState(null)
  const [view, setView] = useState('all')

  const isResponder = mode === 'responder'
  const onClass = isResponder ? 'on-blue' : 'on-teal'
  const myName = isResponder ? 'Dispatcher Jordan' : 'Volunteer You'

  const filtered = useMemo(() => {
    return cards
      .filter(c => zone === 'All' || c.address.includes(`Zone ${zone}`))
      .filter(c => !needFilter || c.needs.includes(needFilter))
      .filter(c => {
        if (view === 'unclaimed') return !c.claimedBy
        if (view === 'mine') return c.claimedBy?.name === myName
        return true
      })
      .sort((a, b) => {
        const ao = STATUS_META[a.status]?.order ?? 9
        const bo = STATUS_META[b.status]?.order ?? 9
        return ao !== bo ? ao - bo : new Date(a.createdAt) - new Date(b.createdAt)
      })
  }, [cards, zone, needFilter, view, myName])

  const stats = useMemo(() => ({
    urgent:   cards.filter(c => c.status === 'need-help').length,
    unclaimed: cards.filter(c => !c.claimedBy && c.status !== 'safe').length,
    mine:     cards.filter(c => c.claimedBy?.name === myName).length,
  }), [cards, myName])

  return (
    <div>
      {/* Hero */}
      <div className={`board-hero board-hero--${mode}`}>
        <div>
          <p className="board-hero__eyebrow">
            {isResponder ? 'Emergency Coordinator' : 'Community Volunteer'}
          </p>
          <p className="board-hero__title">
            {isResponder ? 'Responder Dashboard' : 'Help Your Neighbors'}
          </p>
        </div>

        <div className="stat-row">
          {[
            { key: 'Needs Help',  val: stats.urgent,   color: '#FCA5A5' },
            { key: 'Unclaimed',   val: stats.unclaimed, color: '#FDE68A' },
            { key: 'Your Claims', val: stats.mine,      color: '#6EE7B7' },
          ].map(({ key, val, color }) => (
            <div key={key} className="stat-box">
              <p className="stat-box__val" style={{ color }}>{val}</p>
              <p className="stat-box__key">{key}</p>
            </div>
          ))}
        </div>
      </div>

      {/* View toggle */}
      <div className="filterbar">
        {[
          { id: 'all',       label: 'All Cards' },
          { id: 'unclaimed', label: 'Unclaimed' },
          { id: 'mine',      label: 'My Claims' },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={`chip ${view === id ? onClass : ''}`}
            onClick={() => setView(id)}
            aria-pressed={view === id}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Zone filter */}
      <div className="filterbar" style={{ paddingTop: 8 }}>
        {ZONES.map(z => (
          <button
            key={z}
            className={`chip ${zone === z ? onClass : ''}`}
            onClick={() => setZone(z)}
            aria-pressed={zone === z}
          >
            {z === 'All' ? 'All Zones' : `Zone ${z}`}
          </button>
        ))}
      </div>

      {/* Need filter */}
      <div className="filterbar" style={{ paddingTop: 8, paddingBottom: 4 }}>
        <button
          className={`chip ${!needFilter ? onClass : ''}`}
          onClick={() => setNeedFilter(null)}
          aria-pressed={!needFilter}
        >
          All Needs
        </button>
        {NEEDS.map(n => {
          const Icon = ICON_MAP[n.icon]
          return (
            <button
              key={n.id}
              className={`chip ${needFilter === n.id ? onClass : ''}`}
              onClick={() => setNeedFilter(needFilter === n.id ? null : n.id)}
              aria-pressed={needFilter === n.id}
            >
              {Icon && <Icon size={12} aria-hidden="true" />}
              {n.label}
            </button>
          )
        })}
      </div>

      {/* Card list */}
      <div className="section">
        <p className="section-hd" style={{ marginBottom: 12 }}>
          {filtered.length} card{filtered.length !== 1 ? 's' : ''}
          {view !== 'all' ? ` · ${view === 'unclaimed' ? 'unclaimed' : 'your assignments'}` : ''}
        </p>

        {filtered.length === 0 ? (
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)',
            padding: '40px 16px', textAlign: 'center',
          }}>
            <CheckCircle2 size={32} color="var(--text-4)" style={{ margin: '0 auto 12px', display:'block' }} aria-hidden="true" />
            <p className="fw-7 tc" style={{ fontSize: 15 }}>
              {view === 'mine' ? 'No active claims' : 'No cards match'}
            </p>
            <p className="fs-13 tm mt-1">
              {view === 'mine' ? 'Claim a card to start helping.' : 'Try adjusting the filters above.'}
            </p>
          </div>
        ) : (
          <div className="stack gap-2">
            {filtered.map(card => (
              <BoardCard
                key={card.id}
                card={card}
                mode={mode}
                onClaim={claimCard}
                onUnclaim={unclaimCard}
                onReach={markReached}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
