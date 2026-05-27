import { useEffect, useState } from 'react'
import { api } from '../../../api'

interface Props { property: any }

export default function Activity({ property }: Props) {
  const [recent, setRecent] = useState<any[]>([])
  useEffect(() => {
    api.dashboard.get().then(d => {
      if (d.recent_activity) setRecent(d.recent_activity.filter((a: any) => a.property_id === property.id || a.property === property.id || a.property_name === property.name))
    }).catch(console.error)
  }, [property.id, property.name])

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Recent Activity</h3>
      {recent.length === 0
        ? <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No recent activity for this property.</p>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recent.map((a: any, i: number) => (
              <div key={i} style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem', background: '#f9fafb', borderRadius: 6, color: '#374151' }}>
                <span style={{ color: '#6b7280', marginRight: 8, fontSize: '0.78rem' }}>{new Date(a.created_at || a.date).toLocaleDateString()}</span>
                {a.action || a.event || a.description || 'Activity'}
              </div>
            ))}
          </div>
      }
    </div>
  )
}
