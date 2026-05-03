import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

const RANK_COLOR = (p) => {
  if (p <= 2) return '#e5736b'
  if (p <= 4) return '#d4aa3a'
  return '#5fad7e'
}

export default function AITriage({ cards, mode }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError]     = useState(null)

  if (mode !== 'responder') return null

  const activeCards = cards.filter(c => c.status !== 'safe')

  const MOCK_RESULTS = [
    {
      id: 'c1',
      name: 'David Chen',
      priority: 1,
      urgency_reason: 'Ventilator-dependent ALS patient — any power interruption is immediately life-threatening.',
      action: 'Dispatch generator unit or evacuate to powered medical shelter within 30 minutes.',
    },
    {
      id: 'c2',
      name: 'Ruth Patel',
      priority: 2,
      urgency_reason: 'Dementia + heart failure, lives alone, oxygen concentrator dependent — cannot self-evacuate.',
      action: 'Send escort team; coordinate cardiac-aware transport to nearest medical shelter.',
    },
    {
      id: 'c3',
      name: 'Eleanor Vasquez',
      priority: 3,
      urgency_reason: 'End-stage renal disease requiring dialysis — equipment must travel with her, already evacuating.',
      action: 'Confirm dialysis machine is secured for transport; verify receiving shelter has power.',
    },
    {
      id: 'c5',
      name: 'Thomas Mbeki',
      priority: 4,
      urgency_reason: 'Blind with PTSD — disoriented in debris and noise, unable to navigate evacuation route alone.',
      action: 'Assign calm, verbal-only guide; avoid physical contact without consent per medical notes.',
    },
  ]

  const analyze = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    await new Promise(r => setTimeout(r, 1800))
    const ids = new Set(activeCards.map(c => c.id))
    setResults(MOCK_RESULTS.filter(r => ids.has(r.id)))
    setLoading(false)
  }

  return (
    <div className="ai-triage">
      {/* Header toggle */}
      <button className="ai-triage__header" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} color="#fdd663" aria-hidden="true" />
          <span className="ai-triage__title">AI Triage Analysis</span>
          <span className="ai-triage__badge">{activeCards.length} active</span>
        </div>
        {open
          ? <ChevronUp  size={14} color="var(--text-4)" aria-hidden="true" />
          : <ChevronDown size={14} color="var(--text-4)" aria-hidden="true" />
        }
      </button>

      {open && (
        <div className="ai-triage__body">
          <p className="ai-triage__desc">
            Claude AI reads every active care card — medical notes, devices, needs, and status —
            and returns a ranked triage order with specific guidance for each person.
          </p>

          <button
            className="btn btn--ai btn--sm"
            onClick={analyze}
            disabled={loading || activeCards.length === 0}
          >
            {loading ? (
              <>
                <span className="ai-spin" aria-hidden="true">✦</span> Analyzing…
              </>
            ) : (
              <>
                <Sparkles size={12} aria-hidden="true" /> Run Triage
              </>
            )}
          </button>

          {error && (
            <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 10, lineHeight: 1.5 }}>
              {error}
            </p>
          )}

          {results && (
            <div className="ai-triage__list">
              {results.map(r => (
                <div key={r.id} className="ai-triage__item">
                  <div
                    className="ai-triage__rank"
                    style={{ color: RANK_COLOR(r.priority) }}
                    aria-label={`Priority ${r.priority}`}
                  >
                    {r.priority}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="ai-triage__name">{r.name}</p>
                    <p className="ai-triage__reason">{r.urgency_reason}</p>
                    <p className="ai-triage__action">→ {r.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !results && !error && activeCards.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 8 }}>
              No active cards to analyze.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
