import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Operations from './pages/Operations.jsx'
import Verification from './pages/Verification.jsx'
import Reconciliation from './pages/Reconciliation.jsx'
import Reporting from './pages/Reporting.jsx'
import Administration from './pages/Administration.jsx'

const PAGES = {
  dashboard: Dashboard,
  operations: Operations,
  verification: Verification,
  reconciliation: Reconciliation,
  reporting: Reporting,
  administration: Administration,
}

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const PageComponent = PAGES[activeSection] || Dashboard

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <div className="main-area">
        <Header activeSection={activeSection} />
        <div className="content-area">
          <PageComponent />
        </div>
        <Footer />
      </div>
    </div>
  )
}
