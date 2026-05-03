import { createContext, useContext, useState } from 'react'
import { initialMyCard, communityCards as initialCards } from '../data/mockData'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [myCard, setMyCard] = useState(initialMyCard)
  const [cards, setCards] = useState(initialCards)

  const updateStatus = (status) => setMyCard(p => ({ ...p, status }))

  const claimCard = (id, claimerName) =>
    setCards(p => p.map(c =>
      c.id === id ? { ...c, claimedBy: { name: claimerName, time: new Date().toISOString() } } : c
    ))

  const unclaimCard = (id) =>
    setCards(p => p.map(c => c.id === id ? { ...c, claimedBy: null } : c))

  const markReached = (id) =>
    setCards(p => p.map(c => c.id === id ? { ...c, reached: true } : c))

  return (
    <Ctx.Provider value={{ myCard, setMyCard, updateStatus, cards, claimCard, unclaimCard, markReached }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
