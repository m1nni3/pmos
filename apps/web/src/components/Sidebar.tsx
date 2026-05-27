import { NavLink } from 'react-router-dom'

const links = [
  { to: '/portfolio/overview', label: 'Portfolio' },
  { to: '/portfolio/properties', label: 'Properties' },
  { to: '/portfolio/financials', label: 'Financials' },
  { to: '/portfolio/insurance', label: 'Insurance' },
  { to: '/portfolio/contacts', label: 'Contacts' },
  { to: '/portfolio/documents', label: 'Documents' },
  { to: '/portfolio/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <nav style={s.nav}>
      <div style={s.logo}>PMOS</div>
      <div style={s.section}>Portfolio Management</div>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })} end>
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}

const s: Record<string, React.CSSProperties> = {
  nav:     { width: 220, background: '#1a1a2e', color: '#fff', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: 2 },
  logo:    { padding: '0 1rem 1rem', fontSize: '1.2rem', fontWeight: 800, letterSpacing: 2, color: '#6366f1' },
  section:{ padding: '0.5rem 1rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280' },
  link:   { display: 'block', padding: '0.45rem 1rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.85rem', borderLeft: '3px solid transparent' },
  active: { color: '#fff', background: 'rgba(99,102,241,0.15)', borderLeftColor: '#6366f1' },
}
