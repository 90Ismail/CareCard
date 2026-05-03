import { createContext, useContext, useState } from 'react'
import { currentUser as initialUser, responderResidents as initialResidents } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(initialUser)
  const [residents, setResidents] = useState(initialResidents)

  const updateStatus = (status) => {
    const now = new Date().toISOString()
    setUser(prev => ({ ...prev, status, lastCheckIn: now }))
    setResidents(prev =>
      prev.map(r => r.id === 'r1' ? { ...r, status, lastCheckIn: now } : r)
    )
  }

  const markResident = (id, field) => {
    setResidents(prev =>
      prev.map(r => r.id === id ? { ...r, [field]: true } : r)
    )
  }

  return (
    <AppContext.Provider value={{ user, setUser, residents, setResidents, updateStatus, markResident }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
