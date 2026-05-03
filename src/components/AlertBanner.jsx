import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activeDisaster } from '../data/mockData'

export default function AlertBanner() {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(0)

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
  const formatted = `${m}:${String(s).padStart(2, '0')}`

  return (
    <div className="alert-banner" role="alert" aria-live="assertive">
      <div className="alert-banner__dot" aria-hidden="true" />
      <span className="alert-banner__text">
        {activeDisaster.title} — Zone {activeDisaster.affectedZones.join(', ')}
      </span>
      <span className="alert-banner__timer" aria-label={`${m} minutes ${s} seconds remaining`}>
        {formatted}
      </span>
      <button className="alert-banner__link" onClick={() => navigate('/alert')}>
        Details
      </button>
    </div>
  )
}
