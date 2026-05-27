import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'

interface DashboardData {
  properties: any[]
  total_value: number
  total_purchase: number
  total_bond: number
  avg_yield: number
  recent_activity: any[]
  upcoming_renewals: any[]
}

export default function PortfolioOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  useEffect(() => { api.dashboard.get().then(setData).catch(console.error) }, [])

  if (!data) return <p style={{ padding: '2rem', color: '#6b7280' }}>Loading dashboard…</p>

  const cards = [
    { label: 'Total Value', value: `R ${(data.total_value / 1e6).toFixed(1)}M`, color: '#6366f1' },
    { label: 'Purchase Price', value: `R ${(data.total_purchase / 1e6).toFixed(1)}M`, color: '#8b5cf6' },
    { label: 'Bond Exposure', value: `R ${(data.total_bond / 1e6).toFixed(1)}M`, color: '#ec4899' },
    { label: 'Avg Yield', value: `${data.avg_yield.toFixed(2)}%`, color: '#10b981' },
    { label: 'Properties', value: String(data.properties.length), color: '#f59e0b' },
  ]

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200 }}>
      <h1 style={{ margin: '0 0 0.25rem' }}>Portfolio Overview</h1>
      <p style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>High-level view of your property portfolio</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Properties</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.properties.slice(0, 10).map((p: any) => (
              <Link key={p.id} to={`/portfolio/properties/${p.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f9fafb', borderRadius: 6, color: '#374151', textDecoration: 'none', fontSize: '0.85rem' }}>
                <span>{p.name}</span>
                <span style={{ color: '#6b7280' }}>{p.city}</span>
              </Link>
            ))}
          </div>
          <Link to="/portfolio/properties" style={{ display: 'inline-block', marginTop: 10, fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none' }}>View all properties →</Link>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Recent Activity</h3>
          {data.recent_activity.length === 0 && <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No recent activity</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.recent_activity.slice(0, 10).map((a: any, i: number) => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#374151', padding: '0.35rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280', marginRight: 8 }}>{new Date(a.created_at || a.date).toLocaleDateString()}</span>
                {a.action || a.event || a.description}
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.upcoming_renewals && data.upcoming_renewals.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: '#fffbeb', borderRadius: 8, padding: '1.25rem', border: '1px solid #fde68a' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#92400e' }}>Upcoming Insurance Renewals</h3>
          {data.upcoming_renewals.map((r: any, i: number) => (
            <div key={i} style={{ fontSize: '0.85rem', color: '#78350f', padding: '0.25rem 0' }}>
              {r.property_name || r.property}: {r.policy_number} — expires {new Date(r.expiry_date).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
