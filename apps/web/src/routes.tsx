import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import PortfolioOverview from './pages/Portfolio/Overview'
import PropertyListing from './pages/Portfolio/PropertyListing'
import PropertyDetail from './pages/Portfolio/PropertyDetail'
import PortfolioFinancials from './pages/Portfolio/Financials'
import PortfolioInsurance from './pages/Portfolio/Insurance'
import PortfolioDocuments from './pages/Portfolio/Documents'
import Directory from './pages/Directory'
import Finance from './pages/Finance'
import Reconciliation from './pages/Reconciliation'
import Maintenance from './pages/Maintenance'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/portfolio/overview" replace />} />
        <Route path="portfolio">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<PortfolioOverview />} />
          <Route path="properties" element={<PropertyListing />} />
          <Route path="properties/:propertyId/*" element={<PropertyDetail />} />
          <Route path="financials" element={<PortfolioFinancials />} />
          <Route path="insurance" element={<PortfolioInsurance />} />
          <Route path="documents" element={<PortfolioDocuments />} />
          <Route path="contacts" element={<Directory />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="directory/*" element={<Navigate to="/portfolio/contacts" replace />} />
        <Route path="finance/*" element={<Finance />} />
        <Route path="reconciliation/*" element={<Reconciliation />} />
        <Route path="maintenance/*" element={<Maintenance />} />
        <Route path="reports/*" element={<Navigate to="/portfolio/reports" replace />} />
        <Route path="settings/*" element={<Settings />} />
      </Route>
    </Routes>
  )
}
