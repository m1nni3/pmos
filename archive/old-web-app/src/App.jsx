import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import PropertyDetails from './pages/PropertyDetails'
import Financials from './pages/Financials'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import PettyCash from './pages/PettyCash'
import { PageTitleProvider } from './PageTitleContext'
import { AuthProvider } from './AuthContext'
import './styles.css'

function Shell() {
  const [finTab, setFinTab] = useState('dashboard')

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header finTab={finTab} setFinTab={setFinTab} />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property-details" element={<PropertyDetails />} />
            <Route path="/financials/*" element={<Financials finTab={finTab} setFinTab={setFinTab} />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/petty-cash" element={<PettyCash />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageTitleProvider>
          <Shell />
        </PageTitleProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
