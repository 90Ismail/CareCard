import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import ModeBar from './components/ModeBar'
import MyCard from './pages/MyCard'
import Board from './pages/Board'

function Shell() {
  const [mode, setMode] = useState('user')
  const { myCard } = useApp()

  return (
    <div className="phone-frame">
      <div className="phone-bezel">
        <div className="phone-island" />
        <div className="phone-screen">
          <div className="app-shell">
            <ModeBar mode={mode} setMode={setMode} userStatus={myCard.status} />
            <main className="page-content">
              {mode === 'user' ? <MyCard /> : <Board mode={mode} />}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
