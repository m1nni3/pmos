import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function Dashboard() {
  const [kpi, setKpi] = useState<{ properties: number; units: number; contacts: number; openWorkOrders: number; pendingRecon: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.dashboard.kpis().then(setKpi).catch(() => setError('Failed to load dashboard data'))
  }, [])

  if (error) return <p style={s.error}>{error}</p>
  if (!kpi) return <p style={s.muted}>Loading…</p>

  const tiles: { label: string; value: number; warn?: boolean }[] = [
    { label: 'Properties',      value: kpi.properties },
    { label: 'Units',           value: kpi.units },
    { label: 'Contacts',        value: kpi.contacts },
    { label: 'Open Work Orders',value: kpi.openWorkOrders, warn: kpi.openWorkOrders > 0 },
    { label: 'Pending Recon',   value: kpi.pendingRecon,   warn: kpi.pendingRecon > 0 },
  ]

  return (
    <div>
      <h1 style={s.h1}>Dashboard</h1>
      <div style={s.grid}>
        {tiles.map(t => (
          <div key={t.label} style={{ ...s.tile, borderTop: `3px solid ${t.warn ? '#ef4444' : '#6366f1'}` }}>
            <div style={s.val}>{t.value}</div>
            <div style={s.label}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  h1:    { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' },
  tile:  { background: '#fff', borderRadius: 8, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  val:   { fontSize: '2rem', fontWeight: 700, color: '#1a1a2e' },
  label: { fontSize: '0.8rem', color: '#6b7280', marginTop: 4 },
  muted: { color: '#9ca3af' },
  error: { color: '#ef4444' },
}
