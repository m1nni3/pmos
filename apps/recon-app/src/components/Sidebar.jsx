import { useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    section: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '◫' },
      { id: 'operations', label: 'Operations', icon: '⚙' },
      { id: 'verification', label: 'Verification', icon: '☑' },
      { id: 'reconciliation', label: 'Reconciliation', icon: '⇄' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { id: 'reporting', label: 'Reporting', icon: '▤' },
      { id: 'administration', label: 'Administration', icon: '⚬' },
    ],
  },
]

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'help', label: 'Help & Support', icon: '?' },
]

export default function Sidebar({ activeSection, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="name"><span className="accent-dot"></span>BINOS</div>
        <div className="env">Production · v1.0</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(group => (
          <div key={group.section}>
            <div className="sidebar-section-title">{group.section}</div>
            {group.items.map(item => (
              <div
                key={item.id}
                className={`sidebar-item${activeSection === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {BOTTOM_ITEMS.map(item => (
          <div key={item.id} className="sidebar-item" onClick={() => onNavigate(item.id)}>
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
