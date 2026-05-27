import { useEffect, useState } from 'react'
import { api } from '../../../api'

interface Props { property: any }

export default function Finance({ property }: Props) {
  const [bonds, setBonds] = useState<any[]>([])
  const [valuations, setValuations] = useState<any[]>([])

  useEffect(() => {
    api.propertyResource.list(property.id, 'bonds').then(setBonds).catch(console.error)
    api.propertyResource.list(property.id, 'valuations').then(setValuations).catch(console.error)
  }, [property.id])

  const d = property.property_details || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Bonds</h3>
        {(bonds.length === 0)
          ? d.bond_amount
            ? <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Bond: R {Number(d.bond_amount).toLocaleString()} ({d.bond_holder})</div>
            : <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No bonds recorded.</p>
          : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr>{['Holder', 'Amount', 'Rate', 'Start', 'End'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>{bonds.map(b => <tr key={b.id}>{[b.bond_holder, `R ${Number(b.bond_amount).toLocaleString()}`, b.interest_rate ? `${b.interest_rate}%` : '—', b.start_date, b.end_date].map((v, i) => <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{v || '—'}</td>)}</tr>)}</tbody>
            </table>
        }
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Valuation History</h3>
        {valuations.length === 0
          ? <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No valuations recorded.</p>
          : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr>{['Date', 'Value', 'Valuator', 'Type'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>{valuations.map(v => <tr key={v.id}>{[v.valuation_date, `R ${Number(v.valuation_value).toLocaleString()}`, v.valuator, v.valuation_type].map((val, i) => <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{val || '—'}</td>)}</tr>)}</tbody>
            </table>
        }
      </div>
    </div>
  )
}
