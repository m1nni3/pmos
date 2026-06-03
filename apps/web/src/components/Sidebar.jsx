import { useNavigate, useLocation } from 'react-router-dom'
import { FONT } from '../styles'

const SECTIONS = [
  {
    label: 'Property',
    items: [
      {
        key: 'portfolio', label: 'Portfolio', path: '/',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      },
      {
        key: 'property-details', label: 'Property Details', path: '/property-details',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
      },
      {
        key: 'financials', label: 'Financials', path: '/financials',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      },
      {
        key: 'reports', label: 'Reports', path: '/reports',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      },
    ],
  },
  {
    label: 'Enthuse Trust',
    items: [],
  },
  {
    label: 'TaskWhizz',
    items: [
      {
        key: 'petty-cash', label: 'Petty Cash', path: '/petty-cash',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M12 14h4"/></svg>
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        key: 'settings', label: 'Settings', path: '/settings',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      },
    ],
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === '/' ? 'portfolio' : location.pathname.split('/')[1] || 'portfolio'

  return (
    <aside style={{
      width: 'var(--sidebar-w, 226px)',
      background: '#232a36',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100,
      fontFamily: FONT,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
    }}>

      {/* Logo */}
      <div onClick={() => navigate('/')} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate('/')}
        style={{ padding: '0', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src="https://i.ibb.co/mrYmb099/image-removebg-preview-12.png" alt="BINOS" style={{ height: 100, width: 'auto' }} />
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1, padding: '10px 12px', overflowY: 'auto' }}>
        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: si < SECTIONS.length - 1 ? 14 : 0 }}>
            <div style={{
              padding: '13px 14px 5px',
              fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: '#cfd1d4',
            }}>
              {section.label}
            </div>
            {section.items.map(item => {
              const isActive = active === item.key
              return (
                <div key={item.key} role="button" tabIndex={0}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => navigate(item.path)}
                  onKeyDown={e => e.key === 'Enter' && navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '12px 14px', borderRadius: 8, marginBottom: 2,
                    cursor: 'pointer',
                    color: isActive ? '#ffffff' : '#e3e3e3',
                    background: isActive ? 'rgba(37,99,235,0.18)' : 'transparent',
                    fontSize: 15, fontWeight: isActive ? 600 : 400,
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#ffffff' } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e3e3e3' } }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                  {isActive && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />}
                </div>
              )
            })}
            {section.items.length === 0 && (
              <div style={{ padding: '12px 14px', fontSize: 14, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                Coming soon
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>B</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>BINOS</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>v0.2 · Production</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
