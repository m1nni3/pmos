import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/directory', label: 'Directory' },
  { to: '/finance', label: 'Finance' },
  { to: '/reconciliation', label: 'Reconciliation' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <nav style={{ width: 220, background: '#1a1a2e', color: '#fff', padding: '1rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>PMOS</h2>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} style={{ display: 'block', padding: '0.5rem 0', color: '#ccc', textDecoration: 'none' }}>
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
