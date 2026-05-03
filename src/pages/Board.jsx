import { useState, useMemo } from 'react'
import {
  Phone, CheckCircle2, UserCheck, X, Clock,
  Zap, Thermometer, Move, Wind, Eye, Volume2, Activity, HeartPulse,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { NEEDS } from '../data/mockData'

const ICON_MAP = { Zap, Thermometer, Move, Wind, Eye, Volume2, Activity, HeartPulse }

const STATUS_ORDER = { 'need-help': 0, evacuating: 1, safe: 2 }
const STATUS_META = {
  'need-help': { label: 'Needs Help', cls: 'badge--danger'  },
  evacuating:  { label: 'Evacuating', cls: 'badge--warning' },
  safe:        { label: 'Safe',       cls: 'badge--success' },
}

const needMap = Object.fromEntries(NEEDS.map(n => [n.id, n]))

function elapsed(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

function NeedPill({ id }) {
  const n = needMap[id]
  if (!n) return null
  const Icon = ICON_MAP[n.icon]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 9999,
      fontSize: 11, fontWeight: 500,
      background: n.bg, color: n.color,
      border: `1px solid ${n.color}25`,
    }}>
      {Icon && <Icon size={10} aria-hidden="true" />}
      {n.label}
    </span>
  )
}

function BoardCard({ card, mode, onClaim, onUnclaim, onReach }) {
  const sm = STATUS_META[card.status] || STATUS_META.safe
  const myName = mode === 'responder' ? 'Dispatcher Jordan' : 'Volunteer You'
  const isMine = card.claimedBy?.name === myName
  const isClaimed = !!card.claimedBy

  return (
    <div className="bcard">
      <div className="bcard__main">
        {/* Header */}
        <div className="row sb gap-2" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="f1">
            <div className="row gap-2 wrap">
              <span style={{ fontSize: 15, fontWeight: 500 }}>{card.name}</span>
              <span className={`badge ${sm.cls}`}>{sm.label}</span>
              {card.reached && <span className="badge badge--accent">Reached</span>}
            </div>
            <div className="row gap-1 mt-1">
              <MapPin10 />
              <span className="fs-12 tm">{card.address}</span>
            </div>
          </div>
          <a href={`tel:${card.phone}`} className="btn btn--ghost btn--sm"
            aria-label={`Call ${card.name}`}>
            <Phone size={13} aria-hidden="true" />
            <span className="fs-12">{card.phone}</span>
          </a>
        </div>

        {/* Needs */}
        {card.needs.length > 0 && (
          <div className="needs-wrap mt-2">
            {card.needs.map(id => <NeedPill key={id} id={id} />)}
          </div>
        )}

        {/* Notes */}
        {card.medicalNotes && (
          <div className="note-block mt-2">
            <Activity size={12} color="#b06000" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.45 }}>{card.medicalNotes}</p>
          </div>
        )}

        {/* Claimed */}
        {isClaimed && (
          <div className="claim-row">
            <UserCheck size={12} aria-hidden="true" />
            {isMine ? 'Claimed by you' : `Claimed by ${card.claimedBy.name}`}
            <span className="t4">· {elapsed(card.claimedBy.time)}</span>
          </div>
        )}

        <div className="row gap-1 mt-1">
          <Clock size={10} color="var(--text-4)" aria-hidden="true" />
          <span className="fs-11 t4">Posted {elapsed(card.createdAt)}</span>
        </div>
      </div>

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
            className={`btn btn--sm ${isMine ? 'btn--ghost' : 'btn--primary'}`}
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
  )
}

function MapPin10() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

const ZONES = ['All', 'A', 'B', 'C', 'D']

export default function Board({ mode }) {
  const { cards, claimCard, unclaimCard, markReached } = useApp()
  const [zone, setZone] = useState('All')
  const [needFilter, setNeedFilter] = useState(null)
  const [view, setView] = useState('all')

  const isResponder = mode === 'responder'
  const onClass = isResponder ? 'on-blue' : 'on-green'
  const myName = isResponder ? 'Dispatcher Jordan' : 'Volunteer You'

  const filtered = useMemo(() => cards
    .filter(c => zone === 'All' || c.address.includes(`Zone ${zone}`))
    .filter(c => !needFilter || c.needs.includes(needFilter))
    .filter(c => {
      if (view === 'unclaimed') return !c.claimedBy
      if (view === 'mine') return c.claimedBy?.name === myName
      return true
    })
    .sort((a, b) => {
      const ao = STATUS_ORDER[a.status] ?? 9
      const bo = STATUS_ORDER[b.status] ?? 9
      return ao !== bo ? ao - bo : new Date(a.createdAt) - new Date(b.createdAt)
    }), [cards, zone, needFilter, view, myName])

  const stats = useMemo(() => ({
    urgent:   cards.filter(c => c.status === 'need-help').length,
    unclaimed: cards.filter(c => !c.claimedBy && c.status !== 'safe').length,
    mine:     cards.filter(c => c.claimedBy?.name === myName).length,
  }), [cards, myName])

  return (
    <div>
      {/* Header */}
      <div className="board-top">
        <p className="board-top__label">
          {isResponder ? 'Emergency Coordinator' : 'Community Volunteer'}
        </p>
        <p className="board-top__title">
          {isResponder ? 'Responder Dashboard' : 'Help Your Neighbors'}
        </p>
        <div className="stat-row">
          <div className="stat-box">
            <p className={`stat-box__val ${stats.urgent > 0 ? 'stat-box__val--danger' : ''}`}>
              {stats.urgent}
            </p>
            <p className="stat-box__key">Needs Help</p>
          </div>
          <div className="stat-box">
            <p className={`stat-box__val ${stats.unclaimed > 0 ? 'stat-box__val--warning' : ''}`}>
              {stats.unclaimed}
            </p>
            <p className="stat-box__key">Unclaimed</p>
          </div>
          <div className="stat-box">
            <p className={`stat-box__val ${stats.mine > 0 ? 'stat-box__val--success' : ''}`}>
              {stats.mine}
            </p>
            <p className="stat-box__key">Your Claims</p>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="filterbar">
        {[
          { id: 'all',       label: 'All Cards' },
          { id: 'unclaimed', label: 'Unclaimed'  },
          { id: 'mine',      label: 'My Claims'  },
        ].map(({ id, label }) => (
          <button key={id} className={`chip ${view === id ? onClass : ''}`}
            onClick={() => setView(id)} aria-pressed={view === id}>{label}</button>
        ))}
      </div>

      {/* Zone */}
      <div className="filterbar" style={{ paddingTop: 8 }}>
        {ZONES.map(z => (
          <button key={z} className={`chip ${zone === z ? onClass : ''}`}
            onClick={() => setZone(z)} aria-pressed={zone === z}>
            {z === 'All' ? 'All Zones' : `Zone ${z}`}
          </button>
        ))}
      </div>

      {/* Needs */}
      <div className="filterbar" style={{ paddingTop: 8, paddingBottom: 4 }}>
        <button className={`chip ${!needFilter ? onClass : ''}`}
          onClick={() => setNeedFilter(null)}>All Needs</button>
        {NEEDS.map(n => {
          const Icon = ICON_MAP[n.icon]
          return (
            <button key={n.id}
              className={`chip ${needFilter === n.id ? onClass : ''}`}
              onClick={() => setNeedFilter(needFilter === n.id ? null : n.id)}
              aria-pressed={needFilter === n.id}>
              {Icon && <Icon size={11} aria-hidden="true" />}
              {n.label}
            </button>
          )
        })}
      </div>

      {/* Cards */}
      <div className="section">
        <p className="section-hd" style={{ marginBottom: 10 }}>
          {filtered.length} card{filtered.length !== 1 ? 's' : ''}
          {view === 'unclaimed' ? ' · unclaimed' : ''}
          {view === 'mine' ? ' · your assignments' : ''}
        </p>

        {filtered.length === 0 ? (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r)', padding: '36px 16px', textAlign: 'center',
          }}>
            <CheckCircle2 size={28} color="var(--text-4)" style={{ margin: '0 auto 10px', display: 'block' }} aria-hidden="true" />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>
              {view === 'mine' ? 'No active claims' : 'No cards match'}
            </p>
            <p className="fs-13 tm mt-1">
              {view === 'mine' ? 'Claim a card to get started.' : 'Adjust filters above.'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map(card => (
              <BoardCard key={card.id} card={card} mode={mode}
                onClaim={claimCard} onUnclaim={unclaimCard} onReach={markReached} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
