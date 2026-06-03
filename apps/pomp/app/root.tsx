import React, { useState, lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router'
import {
  LayoutDashboard, Building2, Landmark, UserCheck, ShieldCheck,
  Banknote, Wrench, Scale, Phone, FolderOpen, LogOut, Coins, FileText, Menu, X,
  Settings as SettingsIcon, Upload,
} from 'lucide-react'
import './styles.css'
import { CacheProvider } from './lib/cache'

const Overview = lazy(() => import('./routes/overview'))
const Properties = lazy(() => import('./routes/properties'))
const Finances = lazy(() => import('./routes/finances'))
const LettingAgent = lazy(() => import('./routes/letting'))
const Management = lazy(() => import('./routes/management'))
const LeviesBanking = lazy(() => import('./routes/levies'))
const Insurance = lazy(() => import('./routes/insurance'))
const Bonds = lazy(() => import('./routes/bonds'))
const Maintenance = lazy(() => import('./routes/maintenance'))
const Reconciliation = lazy(() => import('./routes/reconciliation'))
const Contacts = lazy(() => import('./routes/contacts'))
const Documents = lazy(() => import('./routes/documents'))
const Portals = lazy(() => import('./routes/portals'))
const Settings = lazy(() => import('./routes/settings'))
const Import = lazy(() => import('./routes/import'))
import Login from './routes/login'

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pomp-navy"></div>
    </div>
  )
}

const tabs = [
  { name: 'Overview', path: '/overview', icon: LayoutDashboard },
  { name: 'Properties', path: '/properties', icon: Building2 },
  { name: 'Finances', path: '/finances', icon: Landmark },
  { name: 'Letting Agent', path: '/letting', icon: UserCheck },
  { name: 'Management', path: '/management', icon: ShieldCheck },
  { name: 'Levies & Banking', path: '/levies', icon: Banknote },
  { name: 'Bonds', path: '/bonds', icon: Coins },
  { name: 'Insurance', path: '/insurance', icon: FileText },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Reconciliation', path: '/reconciliation', icon: Scale },
  { name: 'Contacts', path: '/contacts', icon: Phone },
  { name: 'Documents', path: '/documents', icon: FolderOpen },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
  { name: 'Portals', path: '/portals', icon: LogOut },
  { name: 'Import', path: '/import', icon: Upload },
]

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const authed = typeof window !== 'undefined' && sessionStorage.getItem('pomp_auth')?.trim() !== ''
  if (!authed) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-50 lg:z-auto w-[240px] lg:w-[14%] lg:min-w-[220px] bg-pomp-navy flex flex-col transition-transform duration-200`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-heading font-bold text-lg tracking-tight">P.O.M.P</h1>
            <p className="text-white/40 text-xs mt-0.5">Property Oversight</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1"><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <tab.icon size={18} />
              <span>{tab.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => { sessionStorage.removeItem('pomp_auth'); window.location.href = '/login' }}
            className="sidebar-link w-full"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-pomp-navy p-1"><Menu size={20} /></button>
          <span className="font-heading font-bold text-pomp-navy">P.O.M.P</span>
        </div>
        <div className="p-4 lg:p-6">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/overview" element={<Overview />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/letting" element={<LettingAgent />} />
              <Route path="/management" element={<Management />} />
              <Route path="/levies" element={<LeviesBanking />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/bonds" element={<Bonds />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/reconciliation" element={<Reconciliation />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/import" element={<Import />} />
              <Route path="/portals" element={<Portals />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CacheProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </CacheProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
