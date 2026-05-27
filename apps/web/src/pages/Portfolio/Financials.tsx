import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function PortfolioFinancials() {
  const [props, setProps] = useState<any[]>([])
  useEffect(() => { api.properties.list().then(setProps).catch(console.error) }, [])

  const totalValue = props.reduce((s, p) => s + Number(p.property_details?.current_value || 0), 0)
  const totalBond = props.reduce((s, p) => s + Number(p.property_details?.bond_amount || 0), 0)
  const totalRental = props.reduce((s, p) => s + Number(p.property_details?.gross_rental || 0), 0)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200 }}>
      <h1 style={{ margin: '0 0 0.25rem' }}>Financials</h1>
      <p style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>Portfolio-wide financial overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Card label="Total Portfolio Value" value={`R ${(totalValue / 1e6).toFixed(2)}M`} />
        <Card label="Total Bond Exposure" value={`R ${(totalBond / 1e6).toFixed(2)}M`} />
        <Card label="Total Gross Rental" value={`R ${totalRental.toLocaleString()}/mo`} />
        <Card label="Properties" value={String(props.length)} />
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Property Summary</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead><tr>{['Property', 'Purchase', 'Current Value', 'Bond', 'Gross Rental', 'Net Rental'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
          <tbody>{props.map(p => {
            const d = p.property_details || {}
            return <tr key={p.id}>{[p.name, d.purchase_price ? `R ${Number(d.purchase_price).toLocaleString()}` : '—', d.current_value ? `R ${Number(d.current_value).toLocaleString()}` : '—', d.bond_amount ? `R ${Number(d.bond_amount).toLocaleString()}` : '—', d.gross_rental ? `R ${Number(d.gross_rental).toLocaleString()}` : '—', d.net_rental ? `R ${Number(d.net_rental).toLocaleString()}` : '—'].map((v, i) => <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{v}</td>)}</tr>
          })}</tbody>
        </table>
      </div>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151' }}>{value}</div>
  </div>
}
