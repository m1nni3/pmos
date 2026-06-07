import React, { useState, lazy, Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router'
import {
  Building2, Phone, Landmark, Wallet, Globe,
  LogOut, Menu, X, ShieldCheck,
  MessageSquare, CheckSquare, Clock,
} from 'lucide-react'
import { Toaster } from 'sonner'
import './styles.css'
import { CacheProvider } from './lib/cache'
import { ErrorBoundary } from './components'
import { useNotificationCount } from './lib/useNotificationCount'

const Properties     = lazy(() => import('./routes/properties'))
const Finances       = lazy(() => import('./routes/finances'))
const Contacts       = lazy(() => import('./routes/contacts'))
const Governance     = lazy(() => import('./routes/governance'))
const PettyCash      = lazy(() => import('./routes/petty-cash'))

const Debrief        = lazy(() => import('./routes/debrief'))
const Tasks          = lazy(() => import('./routes/tasks'))
const Portals        = lazy(() => import('./routes/portals'))
const ActivityPage   = lazy(() => import('./routes/activity'))
import Login from './routes/login'

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pomp-blue"></div>
    </div>
  )
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [display, setDisplay] = React.useState(children)
  const [anim, setAnim] = React.useState('opacity-100')

  useEffect(() => {
    setAnim('opacity-0 translate-y-1')
    const timer = setTimeout(() => {
      setDisplay(children)
      setAnim('opacity-100 translate-y-0')
    }, 120)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className={`transition-all duration-200 ease-out ${anim}`}>
      {display}
    </div>
  )
}

const sections = [
  {
    label: 'Prop Portfolio',
    items: [
      { name: 'Properties', path: '/properties', icon: Building2 },
      { name: 'Contacts',   path: '/contacts',   icon: Phone },
    ],
  },
  {
    label: 'Financials',
    items: [
      { name: 'P / L', path: '/finances', icon: Landmark },
    ],
  },
  {
    label: 'Governance',
    items: [
      { name: 'Governance', path: '/governance', icon: ShieldCheck },
    ],
  },
  {
    label: 'Oversight',
    items: [
      { name: 'Petty Cash', path: '/petty-cash', icon: Wallet },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Debrief', path: '/debrief', icon: MessageSquare },
      { name: 'Tasks',   path: '/tasks',   icon: CheckSquare },
    ],
  },
  {
    label: 'Portals',
    items: [
      { name: 'Portals', path: '/portals', icon: Globe },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Activity', path: '/activity', icon: Clock },
    ],
  },
]

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('pomp_auth') : null
  const authed = typeof token === 'string' && token.trim().length > 0
  const activityCount = useNotificationCount()
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
          {sections.map(section => (
            <div key={section.label}>
              <div className="text-white/50 text-xs uppercase tracking-wider font-semibold px-2 py-2">
                {section.label}
              </div>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                  {item.path === '/activity' && activityCount > 0 && (
                    <span className="ml-auto bg-pomp-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                      {activityCount > 99 ? '99+' : activityCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
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
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-pomp-navy p-1"><Menu size={20} /></button>
          <span className="font-heading font-bold text-pomp-navy">P.O.M.P</span>
        </div>
        <div className="p-4 lg:p-6 flex-1 flex flex-col min-h-0">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Routes>
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/finances"   element={<Finances />} />
                  <Route path="/contacts"   element={<Contacts />} />
                  <Route path="/governance" element={<Governance />} />
                  <Route path="/petty-cash" element={<PettyCash />} />
                  <Route path="/debrief"   element={<Debrief />} />
                  <Route path="/tasks"     element={<Tasks />} />
                  <Route path="/portals"   element={<Portals />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="*"          element={<Navigate to="/properties" replace />} />
                </Routes>
              </PageTransition>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CacheProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: { fontSize: '14px' },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </CacheProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
