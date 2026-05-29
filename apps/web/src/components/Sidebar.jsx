import { useNavigate, useLocation } from 'react-router-dom'
import { C, FONT, EASE } from '../styles'

const NAV = [
  { key: 'portfolio', label: 'Portfolio', path: '/', icon: '🏘' },
  { key: 'financials', label: 'Financials', path: '/financials', icon: '📈' },
  { key: 'reports', label: 'Reports', path: '/reports', icon: '📄' },
  { key: 'settings', label: 'Settings', path: '/settings', icon: '⚙' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === '/' ? 'portfolio' : location.pathname.split('/')[1] || 'portfolio'

  return (
    <aside style={{
      width: 230, background: C.navy, color: C.white,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100,
      fontFamily: FONT,
    }}>
      <div onClick={() => navigate('/')}
        tabIndex={0} role="button" aria-label="Go to home"
        onKeyDown={e => { if (e.key === 'Enter') navigate('/') }}
        style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          cursor: 'pointer', transition: `opacity ${EASE}`,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
        <div style={{
          width: '100%', height: 56, borderRadius: 10,
          background: 'rgba(255,255,255,0.08)',
          border: '1.5px dashed rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>[LOGO]</span>
        </div>
      </div>

      <div style={{ padding: '0.75rem 0', flex: 1 }}>
        {NAV.map(item => (
          <div key={item.key}
            tabIndex={0} role="button"
            aria-label={`Navigate to ${item.label}`}
            aria-current={active === item.key ? 'page' : undefined}
            onClick={() => navigate(item.path)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(item.path) }}
            style={{
              padding: '0.7rem 1.25rem',
              cursor: 'pointer',
              color: C.white,
              fontSize: 14,
              fontWeight: active === item.key ? 700 : 400,
              background: active === item.key ? C.navyL : 'transparent',
              borderLeft: active === item.key ? `3px solid ${C.blue}` : '3px solid transparent',
              transition: `background ${EASE}, border-color ${EASE}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
            onMouseEnter={e => { if (active !== item.key) e.currentTarget.style.background = C.navyL }}
            onMouseLeave={e => { if (active !== item.key) e.currentTarget.style.background = 'transparent' }}
            onFocus={e => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,0.15)' }}
            onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}>
            <span style={{ fontSize: 16, opacity: 0.8 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </aside>
  )
}
