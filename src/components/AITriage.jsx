import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

const RANK_COLOR = (p) => {
  if (p <= 2) return '#f28b82'
  if (p <= 4) return '#fdd663'
  return '#81c995'
}

export default function AITriage({ cards, mode }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError]     = useState(null)

  if (mode !== 'responder') return null

  const activeCards = cards.filter(c => c.status !== 'safe')

  const analyze = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch('/api/anthropic/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system:
            'You are an emergency medical coordinator during a severe tornado in Minneapolis. ' +
            'Triage care cards for people with disabilities by medical urgency. ' +
            'Respond with valid JSON only — no markdown, no explanation outside the JSON array.',
          messages: [{
            role: 'user',
            content:
              `Rank these active care cards from most to least critical. ` +
              `Consider life-critical devices (ventilator, pacemaker, insulin), ` +
              `mobility limitations, cognitive needs, and current status.\n\n` +
              `Cards:\n${JSON.stringify(activeCards.map(c => ({
                id: c.id, name: c.name, status: c.status,
                needs: c.needs, devices: c.devices,
                medicalNotes: c.medicalNotes,
              })), null, 2)}\n\n` +
              `Return format (sorted by priority, 1 = most critical):\n` +
              `[{"id":"...","name":"...","priority":1,"urgency_reason":"one sentence why","action":"immediate step needed"}]`,
          }],
        }),
      })

      const data = await res.json()
      const text = data.content?.[0]?.text ?? ''
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        setResults(JSON.parse(match[0]))
      } else {
        setError('Could not parse AI response — check API key in .env')
      }
    } catch {
      setError('AI triage unavailable — add ANTHROPIC_API_KEY to .env and restart dev server')
    }
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
