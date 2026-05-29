import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { C } from './styles'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import Financials from './pages/Financials'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 230, overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/financials/*" element={<Financials />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
