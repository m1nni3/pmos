const MODULE_NAMES = {
  dashboard: 'Overview',
  operations: 'Operations',
  verification: 'Verification',
  reconciliation: 'Reconciliation',
  reporting: 'Reporting',
  administration: 'Administration',
  settings: 'Settings',
  help: 'Help',
}

export default function Header({ activeSection }) {
  const moduleName = MODULE_NAMES[activeSection] || 'Dashboard'
  return (
    <header className="app-header">
      <span className="app-name"><span className="accent-line"></span>BINOS</span>
      <span className="separator">/</span>
      <span className="module">{moduleName}</span>
      <span className="separator">/</span>
      <span className="workspace-label">Workspace</span>
      <div className="spacer" />
      <span className="env-badge">Production</span>
    </header>
  )
}
