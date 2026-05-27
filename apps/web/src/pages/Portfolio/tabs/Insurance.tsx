import { useEffect, useState } from 'react'
import { api } from '../../../api'

interface Props { property: any }

export default function Insurance({ property }: Props) {
  const [policies, setPolicies] = useState<any[]>([])
  useEffect(() => { api.propertyResource.list(property.id, 'insurance-policies').then(setPolicies).catch(console.error) }, [property.id])

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Insurance Policies</h3>
      {policies.length === 0
        ? <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No insurance policies recorded.</p>
        : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr>{['Insurer', 'Policy #', 'Type', 'Premium', 'Excess', 'Expiry'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>{policies.map(p => {
              const expiring = p.expiry_date && new Date(p.expiry_date) < new Date(Date.now() + 90 * 86400000)
              return <tr key={p.id} style={expiring ? { background: '#fffbeb' } : {}}>
                {[p.insurer, p.policy_number, p.insurance_type, p.premium ? `R ${Number(p.premium).toLocaleString()}` : '—', p.excess ? `R ${Number(p.excess).toLocaleString()}` : '—', p.expiry_date ? `${new Date(p.expiry_date).toLocaleDateString()}${expiring ? ' ⚠' : ''}` : '—'].map((v, i) => <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{v || '—'}</td>)}
              </tr>
            })}</tbody>
          </table>
      }
    </div>
  )
}
