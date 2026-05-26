import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import ContactsPage from './pages/ContactsPage';
import FinancialPage from './pages/FinancialPage';
import ReconciliationPage from './pages/ReconciliationPage';
import ExceptionsPage from './pages/ExceptionsPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/reconciliation" element={<ReconciliationPage />} />
        <Route path="/exceptions" element={<ExceptionsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </Layout>
  );
}
