import { useState, useRef, useEffect } from 'react'
import { Send, Bot, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { activeDisaster } from '../data/mockData'

const SUGGESTIONS = [
  'How long can my insulin go without refrigeration?',
  'What should I pack for the shelter?',
  'Is Franklin Community Center accessible?',
  'How do I keep my insulin pump safe during a tornado?',
  'What do I tell emergency responders about my CGM?',
]

function buildSystemPrompt(user) {
  return `You are CareCard's AI assistant, helping ${user.name} during an active ${activeDisaster.title} in ${activeDisaster.location}.

USER'S CARE PROFILE:
- Name: ${user.name}, Age ${user.age}
- Zone: ${user.zone} (currently affected by the warning)
- Medical conditions: ${user.conditions.join(', ')}
- Medical devices: ${user.devices.map(d => `${d.name}${d.requiresPower ? ' (needs power)' : ''}${d.requiresRefrigeration ? ' (needs cold)' : ''}`).join(', ')}
- Medications: ${user.medications.map(m => `${m.name}${m.requiresRefrigeration ? ' (refrigerated)' : ''}, ${m.daysSupply}-day supply`).join('; ')}
- Emergency contact: ${user.emergencyContact.name} (${user.emergencyContact.relationship}), ${user.emergencyContact.phone}

CURRENT EMERGENCY:
- Event: ${activeDisaster.title} — ${activeDisaster.severity} severity
- Location: ${activeDisaster.location}
- Wind speed: ${activeDisaster.windSpeed}
- Nearest best shelter: Franklin Community Center (0.8 mi, fully accessible, has power and refrigeration)

GUIDELINES:
- Be concise, calm, and actionable. This is a crisis — no fluff.
- Prioritize life-safety above everything.
- Reference her specific devices and medications when relevant.
- When answering medical questions, be helpful but note to consult her doctor when possible.
- Use plain language; avoid jargon.
- If asked about shelters, Franklin Community Center is the best match (wheelchair accessible, refrigeration, power).`
}

export default function Assistant() {
  const { user } = useApp()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user.name.split(' ')[0]}, I'm your CareCard assistant. I know about your insulin pump, power wheelchair, and CGM — and I'm aware of the active Tornado Warning in Zone ${user.zone}.\n\nI can help you figure out what to do right now, what to pack, shelter options, or any medical questions. What do you need?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const send = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setInput('')
    setApiError(null)
    const userMsg = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/anthropic/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: buildSystemPrompt(user),
          messages: apiMessages,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 401) {
          throw new Error('API key not configured. Add ANTHROPIC_API_KEY to your .env file and restart the dev server.')
        }
        throw new Error(err?.error?.message || `Request failed (${res.status})`)
      }

      const data = await res.json()
      const reply = data.content?.[0]?.text

      if (!reply) throw new Error('Unexpected response format from API.')

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setApiError(err.message)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--banner-height) - var(--nav-height))' }}>
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'white',
          flexShrink: 0,
        }}
      >
        <div className="row gap-2">
          <div
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--blue-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bot size={18} color="var(--blue)" aria-hidden="true" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700 }}>CareCard AI Assistant</p>
            <p className="text-xs text-muted">Powered by Claude · Context-aware for your care profile</p>
          </div>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--red-50)',
            borderBottom: '1px solid var(--red-200)',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <AlertCircle size={15} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p className="text-sm" style={{ color: 'var(--red)', lineHeight: 1.4 }}>{apiError}</p>
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'var(--bg)',
        }}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble chat-bubble--${msg.role}`}
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble chat-bubble--typing" aria-label="Assistant is typing">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length <= 2 && (
        <div style={{ padding: '8px 0', borderTop: '1px solid var(--border)', background: 'white', flexShrink: 0 }}>
          <div className="suggestion-chips">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="suggestion-chip" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: 10,
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          background: 'white',
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your medications, shelter, evacuation…"
          disabled={isLoading}
          aria-label="Message input"
          style={{ flex: 1, minHeight: 48 }}
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          style={{ padding: '0 16px', minHeight: 48, flexShrink: 0 }}
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
