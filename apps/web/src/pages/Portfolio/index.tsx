import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function Portfolio() {
  const [props, setProps] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.properties.list().then(data => { setProps(data); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!selectedId) { setSelected(null); return }
    api.properties.get(selectedId).then(setSelected)
  }, [selectedId])

  if (loading) return <p style={s.muted}>Loading…</p>

  return (
    <div style={s.layout}>
      <div style={s.list}>
        <h1 style={s.h1}>Portfolio</h1>
        {props.length === 0 && <p style={s.muted}>No properties found.</p>}
        {props.map(p => (
          <div
            key={p.id}
            style={{ ...s.card, borderLeft: `3px solid ${selectedId === p.id ? '#6366f1' : '#e5e7eb'}` }}
            onClick={() => setSelectedId(p.id)}
          >
            <div style={s.cardTitle}>{p.name}</div>
            <div style={s.cardSub}>{p.address}</div>
            <div style={s.badge}>{p.unit_count} unit{p.unit_count !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>
      <div style={s.detail}>
        {selected ? <PropertyDetail property={selected} /> : <p style={s.muted}>Select a property.</p>}
      </div>
    </div>
  )
}

function PropertyDetail({ property }: { property: any }) {
  const p = property
  const d = p.details || {}

  const sections: { title: string; rows: { label: string; value: any }[] }[] = [
    {
      title: 'General',
      rows: [
        ['Address', p.address],
        ['Scheme', p.scheme_name],
        ['Unit / Door', d.unit_number && d.door_number ? `${d.unit_number} / ${d.door_number}` : d.unit_number || d.door_number],
        ['ERF Number', d.erf_number],
        ['Size', d.size_sqm ? `${d.size_sqm} m²` : null],
        ['Bedrooms', d.bedrooms],
        ['Bathrooms', d.bathrooms],
        ['Parking', d.parking_bays],
        ['Suburb', d.suburb],
        ['Township', d.township],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
    {
      title: 'Purchase & Valuation',
      rows: [
        ['Purchase Date', d.purchase_date],
        ['Purchase Price', d.purchase_price != null ? fmt(d.purchase_price) : null],
        ['Current Market Value', d.current_market_value != null ? fmt(d.current_market_value) : null],
        ['Title Deed', d.title_deed_reference],
        ['Owner', d.owner_name],
        ['Registered Owner', d.registered_owner],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
    {
      title: 'Municipality',
      rows: [
        ['Municipality', d.municipality_name],
        ['Valuation', d.municipal_valuation],
        ['Valuation Year', d.municipal_valuation_year],
        ['Account No.', d.municipal_account_number],
        ['Paid By', d.municipal_paid_by],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
    {
      title: 'Management',
      rows: [
        ['Agency', d.agency],
        ['Managing Agent', d.managing_agent_name],
        ['Portfolio Manager', d.portfolio_manager],
        ['Email', d.agent_email],
        ['Phone', d.agent_phone],
        ['Account Admin', d.account_administrator],
        ['Maintenance Manager', d.maintenance_manager],
        ['Department Head', d.department_head],
        ['Management Fee', d.management_fee],
        ['Payment Method', d.payment_method],
        ['Branch', d.branch],
        ['Branch Code', d.branch_code],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
    {
      title: 'Tenant',
      rows: [
        ['Tenant', d.tenant_name],
        ['Phone', d.tenant_phone],
        ['Email', d.tenant_email],
        ['Notes', d.tenant_notes],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
    {
      title: 'Body Corporate',
      rows: [
        ['Name', d.bc_name],
        ['Registration', d.bc_registration_number],
        ['Bank', d.bc_bank],
        ['Account Name', d.bc_account_name],
        ['Branch', d.bc_branch],
        ['Branch Code', d.bc_branch_code],
        ['Levy Reference', d.bc_levy_reference],
        ['Levy Payment', d.bc_levy_payment_method],
        ['Contact', d.bc_contact_name],
        ['Contact Phone', d.bc_contact_phone],
        ['Contact Email', d.bc_contact_email],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
    {
      title: 'Bond',
      rows: [
        ['Bank', d.bond_bank],
        ['Account No.', d.bond_account_number],
        ['Original Amount', d.original_bond_amount != null ? fmt(d.original_bond_amount) : null],
        ['Monthly Payment', d.monthly_bond_payment != null ? fmt(d.monthly_bond_payment) : null],
        ['Expected Payoff', d.expected_payoff_date],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
    {
      title: 'Insurance',
      rows: [
        ['Insurer', d.insurer],
        ['Broker', d.broker],
        ['Policy No.', d.policy_number],
        ['Policy Holder', d.policy_holder],
        ['Geyser Excess', d.geyser_excess != null ? fmt(d.geyser_excess) : null],
        ['Annual Renewal', d.annual_renewal_date],
        ['Contact', d.insurance_contact],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
    {
      title: 'Emergency Contact',
      rows: [
        ['Name', d.emergency_contact_name],
        ['Phone', d.emergency_contact_phone],
        ['Email', d.emergency_contact_email],
        ['Notes', d.emergency_contact_notes],
      ].filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value })),
    },
  ]

  const [units, setUnits] = useState<any[]>([])
  useEffect(() => { api.properties.units(p.id).then(setUnits) }, [p.id])

  return (
    <div>
      <h2 style={s.h2}>{p.name}</h2>
      <div style={s.grid}>
        {sections.filter(s => s.rows.length > 0).map(section => (
          <div key={section.title} style={s.section}>
            <h3 style={s.sectionTitle}>{section.title}</h3>
            <dl style={s.dl}>
              {section.rows.map(r => (
                <div key={r.label} style={s.row}>
                  <dt style={s.dt}>{r.label}</dt>
                  <dd style={s.dd}>{r.value ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {units.length > 0 && (
        <>
          <h3 style={s.unitTitle}>Units</h3>
          <table style={s.table}>
            <thead>
              <tr>{['Unit','Tenant','Rental','Lease Start','Lease End'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {units.map(u => (
                <tr key={u.id}>
                  <td style={s.td}>{u.unit_number}</td>
                  <td style={s.td}>{u.tenant_name ?? '—'}</td>
                  <td style={s.td}>R {Number(u.monthly_rental).toLocaleString('en-ZA')}</td>
                  <td style={s.td}>{u.lease_start ?? '—'}</td>
                  <td style={s.td}>{u.lease_end ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

const fmt = (v: number | string) =>
  'R\u00a0' + Number(v).toLocaleString('en-ZA', { minimumFractionDigits: 2 })

const s: Record<string, React.CSSProperties> = {
  layout:    { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', height: '100%' },
  list:      { overflowY: 'auto' },
  h1:        { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' },
  h2:        { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' },
  card:      { background: '#fff', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '0.5rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.06)' },
  cardTitle: { fontWeight: 600, fontSize: '0.9rem' },
  cardSub:   { fontSize: '0.78rem', color: '#6b7280', marginTop: 2 },
  badge:     { fontSize: '0.72rem', color: '#6366f1', marginTop: 4 },
  detail:    { background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflowY: 'auto' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  section:   { background: '#f9fafb', borderRadius: 8, padding: '0.75rem 1rem' },
  sectionTitle: { fontSize: '0.8rem', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.4rem' },
  dl:        { margin: 0 },
  row:       { display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem' },
  dt:        { color: '#6b7280', flex: '0 0 auto' },
  dd:        { margin: 0, color: '#1a1a2e', fontWeight: 500, textAlign: 'right' as const },
  unitTitle: { fontSize: '0.95rem', fontWeight: 600, margin: '1rem 0 0.5rem' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th:        { textAlign: 'left', padding: '0.4rem 0.6rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 500 },
  td:        { padding: '0.4rem 0.6rem', borderBottom: '1px solid #f3f4f6' },
  muted:     { color: '#9ca3af', fontSize: '0.85rem' },
}
