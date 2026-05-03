import { NavLink } from 'react-router-dom'
import { Home, User, AlertTriangle, MapPin, MessageCircle, Users, CheckCircle } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/alert', label: 'Alert', icon: AlertTriangle, alert: true },
  { to: '/shelters', label: 'Shelters', icon: MapPin },
  { to: '/assistant', label: 'AI Chat', icon: MessageCircle },
  { to: '/checkin', label: 'Check In', icon: CheckCircle },
  { to: '/responder', label: 'Responder', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Nav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {links.map(({ to, label, icon: Icon, alert }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            'nav-item' +
            (isActive ? (alert ? ' active-red' : ' active') : '')
          }
          aria-label={label}
        >
          <div style={{ position: 'relative' }}>
            <Icon size={20} strokeWidth={2} />
            {alert && <span className="nav-badge" aria-hidden="true" />}
          </div>
          <span className="nav-item__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
