interface Props { property: any }

export default function Overview({ property }: Props) {
  const d = property.property_details || {}

  const metrics = [
    { label: 'Purchase Price', value: d.purchase_price ? `R ${Number(d.purchase_price).toLocaleString()}` : '—' },
    { label: 'Current Value', value: d.current_value ? `R ${Number(d.current_value).toLocaleString()}` : '—' },
    { label: 'Bond Amount', value: d.bond_amount ? `R ${Number(d.bond_amount).toLocaleString()}` : '—' },
    { label: 'Bond Holder', value: d.bond_holder || '—' },
    { label: 'Gross Rental', value: d.gross_rental ? `R ${Number(d.gross_rental).toLocaleString()}` : '—' },
    { label: 'Levy', value: d.levy ? `R ${Number(d.levy).toLocaleString()}` : '—' },
    { label: 'Rates & Taxes', value: d.rates_and_taxes ? `R ${Number(d.rates_and_taxes).toLocaleString()}` : '—' },
    { label: 'Status', value: d.status || property.status || '—' },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: '#fff', borderRadius: 8, padding: '1rem', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn}>Edit Details</button>
          <button style={btn}>Add Document</button>
          <button style={btn}>Record Payment</button>
        </div>
      </div>
    </div>
  )
}

const btn: React.CSSProperties = { padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontSize: '0.85rem' }
