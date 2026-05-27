import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'
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
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="portfolio/*"    element={<Portfolio />} />
        <Route path="directory/*"    element={<Directory />} />
        <Route path="finance/*"      element={<Finance />} />
        <Route path="reconciliation/*" element={<Reconciliation />} />
        <Route path="maintenance/*"  element={<Maintenance />} />
        <Route path="reports/*"      element={<Reports />} />
        <Route path="settings/*"     element={<Settings />} />
      </Route>
    </Routes>
  )
}
