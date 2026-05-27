import { useEffect, useState } from 'react'
import { api } from '../../../api'

interface Props { property: any }

export default function History({ property }: Props) {
  const [history, setHistory] = useState<any[]>([])
  useEffect(() => { api.history.list(property.id).then(setHistory).catch(console.error) }, [property.id])

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Property History</h3>
      {history.length === 0
        ? <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No history recorded.</p>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((h: any, i: number) => (
              <div key={h.id || i} style={{ fontSize: '0.85rem', padding: '0.75rem', background: '#f9fafb', borderRadius: 6, borderLeft: '3px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong>{h.event || h.action || 'Event'}</strong>
                  <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>{h.date || h.created_at ? new Date(h.date || h.created_at).toLocaleDateString() : ''}</span>
                </div>
                {h.description && <p style={{ margin: 0, color: '#4b5563' }}>{h.description}</p>}
                {h.changed_by && <small style={{ color: '#9ca3af' }}>by {h.changed_by}</small>}
              </div>
            ))}
          </div>
      }
    </div>
  )
}
