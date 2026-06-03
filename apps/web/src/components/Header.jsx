import { useNavigate, useLocation } from 'react-router-dom'

const FIN_TABS = [
  { key: 'dashboard',      label: 'Dashboard' },
  { key: 'ledgers',        label: 'Ledgers' },
  { key: 'pnl',            label: 'P&L' },
  { key: 'maintenance',    label: 'Maintenance' },
  { key: 'reconciliation', label: 'Reconciliation' },
]

const NAVY = '#133B68'

const secTabStyle = (isActive) => ({
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: isActive ? 700 : 600,
  fontSize: '0.78rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: isActive ? '#FE880B' : '#666',
  padding: '10px 14px',
  cursor: 'pointer',
  border: 'none',
  borderBottom: isActive ? '3px solid #FE880B' : '3px solid transparent',
  background: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 0.18s',
  userSelect: 'none',
  flexShrink: 0,
})

export default function Header({ finTab, setFinTab }) {
  const navigate = useNavigate()
  const location = useLocation()

  const page = location.pathname === '/' ? 'portfolio'
    : location.pathname.startsWith('/financials') ? 'financials'
    : location.pathname.startsWith('/property-details') ? 'property-details'
    : location.pathname.split('/')[1] || 'portfolio'

  const isFinancials = page === 'financials'

  const pageLabel = page === 'portfolio' ? 'Portfolio'
    : page === 'financials' ? 'Financials'
    : page === 'property-details' ? 'Property Details'
    : page === 'reports' ? 'Reports'
    : page === 'petty-cash' ? 'Petty Cash'
    : page === 'settings' ? 'Settings'
    : ''

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: NAVY, padding: '0 20px',
        display: 'flex', alignItems: 'center', height: 46,
      }}>
        <div onClick={() => navigate('/')} style={{
          cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, marginRight: 4,
        }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg,#FE880B,#0E90AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>B</div>
        </div>
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)', margin: '0 6px', flexShrink: 0 }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#fff' }}>{pageLabel}</span>
      </div>

      {isFinancials && (
        <div style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', padding: '0 20px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {FIN_TABS.map(t => {
            const isActive = finTab === t.key
            return (
              <button key={t.key} onClick={() => setFinTab?.(t.key)} style={secTabStyle(isActive)}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#111' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#666' } }}
              >{t.label}</button>
            )
          })}
        </div>
      )}
    </header>
  )
}
