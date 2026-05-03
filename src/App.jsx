import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Nav from './components/Nav'
import AlertBanner from './components/AlertBanner'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Alert from './pages/Alert'
import Shelters from './pages/Shelters'
import Assistant from './pages/Assistant'
import Responder from './pages/Responder'
import CheckIn from './pages/CheckIn'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <AlertBanner />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/alert" element={<Alert />} />
              <Route path="/shelters" element={<Shelters />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/responder" element={<Responder />} />
              <Route path="/checkin" element={<CheckIn />} />
            </Routes>
          </main>
          <Nav />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
