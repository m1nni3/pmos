import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function PortfolioInsurance() {
  const [properties, setProperties] = useState<any[]>([])
  const [allPolicies, setAllPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.properties.list().then(async props => {
      setProperties(props)
      const policyList: any[] = []
      for (const p of props) {
        try {
          const policies = await api.propertyResource.list(p.id, 'insurance-policies')
          policyList.push(...policies.map((pol: any) => ({ ...pol, property_name: p.name })))
        } catch {}
      }
      setAllPolicies(policyList)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const expiring = allPolicies.filter(p => p.expiry_date && new Date(p.expiry_date) < new Date(Date.now() + 90 * 86400000))

  if (loading) return <p style={{ padding: '2rem', color: '#6b7280' }}>Loading…</p>

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200 }}>
      <h1 style={{ margin: '0 0 0.25rem' }}>Insurance</h1>
      <p style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>Portfolio-wide insurance overview</p>

      {expiring.length > 0 && (
        <div style={{ background: '#fffbeb', borderRadius: 8, padding: '1rem 1.25rem', border: '1px solid #fde68a', marginBottom: '1.5rem' }}>
          <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>⚠ {expiring.length} polic{expiring.length === 1 ? 'y is' : 'ies are'} expiring within 90 days</strong>
          {expiring.map(p => <div key={p.id} style={{ fontSize: '0.85rem', color: '#78350f', marginTop: 4 }}>{p.property_name}: {p.policy_number} — {new Date(p.expiry_date).toLocaleDateString()}</div>)}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>All Policies</h3>
        {allPolicies.length === 0
          ? <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No insurance policies recorded.</p>
          : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr>{['Property', 'Insurer', 'Policy #', 'Type', 'Premium', 'Expiry'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>{allPolicies.map(p => {
                const isExpiring = p.expiry_date && new Date(p.expiry_date) < new Date(Date.now() + 90 * 86400000)
                return <tr key={p.id} style={isExpiring ? { background: '#fffbeb' } : {}}>
                  {[p.property_name, p.insurer, p.policy_number, p.insurance_type, p.premium ? `R ${Number(p.premium).toLocaleString()}` : '—', p.expiry_date ? `${new Date(p.expiry_date).toLocaleDateString()}${isExpiring ? ' ⚠' : ''}` : '—'].map((v, i) => <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{v || '—'}</td>)}
                </tr>
              })}</tbody>
            </table>
        }
      </div>
    </div>
  )
}
