import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function Portfolio() {
  const [props, setProps] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  function loadList() {
    api.properties.list().then(data => setProps(data))
  }

  useEffect(() => { loadList() }, [])

  useEffect(() => {
    if (!selectedId) { setSelected(null); return }
    api.properties.get(selectedId).then(setSelected)
  }, [selectedId])

  function openAdd() {
    setEditData({ name: '', address: '', scheme_name: '', unit_count: 1, details: {} })
    setEditOpen(true)
  }

  function openEdit() {
    if (!selected) return
    const p = selected
    setEditData({
      id: p.id, name: p.name, address: p.address, scheme_name: p.scheme_name,
      unit_count: p.unit_count, details: { ...(p.details ?? {}) },
    })
    setEditOpen(true)
  }

  async function handleSave(data: any) {
    if (data.id) {
      await api.properties.update(data.id, data)
      const updated = await api.properties.get(data.id)
      setSelected(updated)
    } else {
      await api.properties.create(data)
      setSelectedId(null)
    }
    loadList()
    setEditOpen(false)
  }

  if (loading) return <p style={s.muted}>Loading…</p>

  return (
    <div style={s.layout}>
      <div style={s.list}>
        <div style={s.listHeader}>
          <h1 style={s.h1}>Portfolio</h1>
          <button style={s.btn} onClick={openAdd}>+ Add</button>
        </div>
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
        {selected ? (
          <>
            <div style={s.detailHeader}>
              <h2 style={s.h2}>{selected.name}</h2>
              <button style={s.btnGhost} onClick={openEdit}>Edit</button>
            </div>
            <PropertyDetail property={selected} />
          </>
        ) : <p style={s.muted}>Select a property.</p>}
      </div>

      {editOpen && <PropertyForm data={editData} onSave={handleSave} onCancel={() => setEditOpen(false)} />}
    </div>
  )
}

function PropertyDetail({ property }: { property: any }) {
  const p = property
  const d = p.details || {}

  const sections: { title: string; rows: { label: string; value: any }[] }[] = [
    {
      title: 'General',
      rows: filter([
        ['Address', p.address],
        ['Scheme', p.scheme_name],
        ['Unit / Door', d.unit_number && d.door_number ? `${d.unit_number} / ${d.door_number}` : d.unit_number || d.door_number],
        ['ERF Number', d.erf_number], ['Scheme No.', d.scheme_number],
        ['Size', d.size_sqm ? `${d.size_sqm} m²` : null],
        ['Bedrooms', d.bedrooms], ['Bathrooms', d.bathrooms], ['Parking', d.parking_bays],
        ['Suburb', d.suburb], ['Township', d.township], ['LPI Code', d.lpi_code],
      ]),
    },
    {
      title: 'Purchase & Valuation',
      rows: filter([
        ['Purchase Date', d.purchase_date],
        ['Purchase Price', d.purchase_price != null ? fmt(d.purchase_price) : null],
        ['Current Market Value', d.current_market_value != null ? fmt(d.current_market_value) : null],
        ['Title Deed', d.title_deed_reference], ['Owner', d.owner_name],
        ['Owner ID', d.owner_id], ['Registered Owner', d.registered_owner],
      ]),
    },
    {
      title: 'Municipality',
      rows: filter([
        ['Municipality', d.municipality_name], ['Valuation', d.municipal_valuation],
        ['Valuation Year', d.municipal_valuation_year], ['Account No.', d.municipal_account_number],
        ['Paid By', d.municipal_paid_by],
      ]),
    },
    {
      title: 'Management',
      rows: filter([
        ['Agency', d.agency], ['Managing Agent', d.managing_agent_name],
        ['Portfolio Manager', d.portfolio_manager], ['Email', d.agent_email],
        ['Phone', d.agent_phone], ['Account Admin', d.account_administrator],
        ['Maintenance Manager', d.maintenance_manager], ['Department Head', d.department_head],
        ['Management Fee', d.management_fee], ['Payment Method', d.payment_method],
        ['Branch', d.branch], ['Branch Code', d.branch_code],
      ]),
    },
    {
      title: 'Tenant',
      rows: filter([
        ['Tenant', d.tenant_name], ['Phone', d.tenant_phone],
        ['Email', d.tenant_email], ['Notes', d.tenant_notes],
      ]),
    },
    {
      title: 'Body Corporate',
      rows: filter([
        ['Name', d.bc_name], ['Registration', d.bc_registration_number],
        ['Bank', d.bc_bank], ['Account Name', d.bc_account_name],
        ['Branch', d.bc_branch], ['Branch Code', d.bc_branch_code],
        ['Levy Reference', d.bc_levy_reference], ['Levy Payment', d.bc_levy_payment_method],
        ['Contact', d.bc_contact_name], ['Contact Phone', d.bc_contact_phone],
        ['Contact Email', d.bc_contact_email],
      ]),
    },
    {
      title: 'Bond',
      rows: filter([
        ['Bank', d.bond_bank], ['Account No.', d.bond_account_number],
        ['Original Amount', d.original_bond_amount != null ? fmt(d.original_bond_amount) : null],
        ['Monthly Payment', d.monthly_bond_payment != null ? fmt(d.monthly_bond_payment) : null],
        ['Expected Payoff', d.expected_payoff_date],
      ]),
    },
    {
      title: 'Insurance',
      rows: filter([
        ['Insurer', d.insurer], ['Broker', d.broker], ['Policy No.', d.policy_number],
        ['Policy Holder', d.policy_holder],
        ['Geyser Excess', d.geyser_excess != null ? fmt(d.geyser_excess) : null],
        ['Annual Renewal', d.annual_renewal_date], ['Contact', d.insurance_contact],
      ]),
    },
    {
      title: 'Emergency Contact',
      rows: filter([
        ['Name', d.emergency_contact_name], ['Phone', d.emergency_contact_phone],
        ['Email', d.emergency_contact_email], ['Notes', d.emergency_contact_notes],
      ]),
    },
  ]

  const [units, setUnits] = useState<any[]>([])
  useEffect(() => { api.properties.units(p.id).then(setUnits) }, [p.id])

  return (
    <div>
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

type SectionDef = { key: string; label: string; fields: { key: string; label: string; type?: string }[] }

const FORM_SECTIONS: SectionDef[] = [
  { key: 'general', label: 'General', fields: [
    { key: 'name', label: 'Property Name' },
    { key: 'address', label: 'Address' },
    { key: 'scheme_name', label: 'Scheme Name' },
    { key: 'unit_count', label: 'Unit Count', type: 'number' },
    { key: 'unit_number', label: 'Unit Number' },
    { key: 'door_number', label: 'Door Number' },
    { key: 'erf_number', label: 'ERF Number' },
    { key: 'scheme_number', label: 'Scheme Number' },
    { key: 'size_sqm', label: 'Size (m²)', type: 'number' },
    { key: 'bedrooms', label: 'Bedrooms', type: 'number' },
    { key: 'bathrooms', label: 'Bathrooms', type: 'number' },
    { key: 'parking_bays', label: 'Parking Bays', type: 'number' },
    { key: 'suburb', label: 'Suburb' },
    { key: 'township', label: 'Township' },
    { key: 'lpi_code', label: 'LPI Code' },
  ]},
  { key: 'purchase', label: 'Purchase & Valuation', fields: [
    { key: 'purchase_date', label: 'Purchase Date' },
    { key: 'purchase_price', label: 'Purchase Price (R)', type: 'number' },
    { key: 'current_market_value', label: 'Current Market Value (R)', type: 'number' },
    { key: 'title_deed_reference', label: 'Title Deed Reference' },
    { key: 'owner_name', label: 'Owner Name' },
    { key: 'owner_id', label: 'Owner ID / Reg No.' },
    { key: 'registered_owner', label: 'Registered Owner' },
  ]},
  { key: 'municipality', label: 'Municipality', fields: [
    { key: 'municipality_name', label: 'Municipality Name' },
    { key: 'municipal_valuation', label: 'Municipal Valuation' },
    { key: 'municipal_valuation_year', label: 'Valuation Year' },
    { key: 'municipal_account_number', label: 'Account Number' },
    { key: 'municipal_paid_by', label: 'Paid By' },
  ]},
  { key: 'management', label: 'Management', fields: [
    { key: 'agency', label: 'Agency' },
    { key: 'managing_agent_name', label: 'Managing Agent' },
    { key: 'portfolio_manager', label: 'Portfolio Manager' },
    { key: 'agent_email', label: 'Agent Email' },
    { key: 'agent_phone', label: 'Agent Phone' },
    { key: 'account_administrator', label: 'Account Administrator' },
    { key: 'maintenance_manager', label: 'Maintenance Manager' },
    { key: 'department_head', label: 'Department Head' },
    { key: 'management_fee', label: 'Management Fee' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'branch', label: 'Branch' },
    { key: 'branch_code', label: 'Branch Code' },
  ]},
  { key: 'tenant', label: 'Tenant', fields: [
    { key: 'tenant_name', label: 'Tenant Name' },
    { key: 'tenant_phone', label: 'Tenant Phone' },
    { key: 'tenant_email', label: 'Tenant Email' },
    { key: 'tenant_notes', label: 'Tenant Notes' },
  ]},
  { key: 'bc', label: 'Body Corporate', fields: [
    { key: 'bc_name', label: 'BC Name' },
    { key: 'bc_registration_number', label: 'Registration No.' },
    { key: 'bc_bank', label: 'Bank' },
    { key: 'bc_account_name', label: 'Account Name' },
    { key: 'bc_branch', label: 'Branch' },
    { key: 'bc_branch_code', label: 'Branch Code' },
    { key: 'bc_levy_reference', label: 'Levy Reference' },
    { key: 'bc_levy_payment_method', label: 'Levy Payment Method' },
    { key: 'bc_contact_name', label: 'Contact Name' },
    { key: 'bc_contact_phone', label: 'Contact Phone' },
    { key: 'bc_contact_email', label: 'Contact Email' },
  ]},
  { key: 'bond', label: 'Bond', fields: [
    { key: 'bond_bank', label: 'Bank' },
    { key: 'bond_account_number', label: 'Account Number' },
    { key: 'original_bond_amount', label: 'Original Amount (R)', type: 'number' },
    { key: 'monthly_bond_payment', label: 'Monthly Payment (R)', type: 'number' },
    { key: 'expected_payoff_date', label: 'Expected Payoff Date' },
  ]},
  { key: 'insurance', label: 'Insurance', fields: [
    { key: 'insurer', label: 'Insurer' },
    { key: 'broker', label: 'Broker' },
    { key: 'policy_number', label: 'Policy No.' },
    { key: 'policy_holder', label: 'Policy Holder' },
    { key: 'geyser_excess', label: 'Geyser Excess (R)', type: 'number' },
    { key: 'annual_renewal_date', label: 'Annual Renewal Date' },
    { key: 'insurance_contact', label: 'Contact' },
  ]},
  { key: 'emergency', label: 'Emergency Contact', fields: [
    { key: 'emergency_contact_name', label: 'Contact Name' },
    { key: 'emergency_contact_phone', label: 'Contact Phone' },
    { key: 'emergency_contact_email', label: 'Contact Email' },
    { key: 'emergency_contact_notes', label: 'Notes' },
  ]},
]

function PropertyForm({ data, onSave, onCancel }: { data: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...data, details: { ...(data.details ?? {}) } })
  const [saving, setSaving] = useState(false)

  function setTop(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }))
  }

  function setDetail(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, details: { ...prev.details, [key]: value } }))
  }

  async function save() {
    setSaving(true)
    const payload: any = {
      name: form.name,
      address: form.address,
      scheme_name: form.scheme_name || null,
      unit_count: Number(form.unit_count) || 1,
    }
    const detailKeys = new Set<string>()
    FORM_SECTIONS.forEach(s => s.fields.forEach(f => detailKeys.add(f.key)))
    const topLevel = new Set(['name', 'address', 'scheme_name', 'unit_count'])
    const details: any = {}
    for (const [k, v] of Object.entries(form.details ?? {})) {
      if (v !== '' && v != null) details[k] = v
    }
    payload.details = details
    await onSave(payload)
    setSaving(false)
  }

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h2 style={s.h2}>{form.id ? 'Edit Property' : 'Add Property'}</h2>
          <button style={s.btnClose} onClick={onCancel}>✕</button>
        </div>
        <div style={s.modalBody}>
          {FORM_SECTIONS.map(section => (
            <div key={section.key} style={s.formSection}>
              <h3 style={s.formSectionTitle}>{section.label}</h3>
              <div style={s.formGrid}>
                {section.fields.map(f => {
                  const isTop = ['name', 'address', 'scheme_name', 'unit_count'].includes(f.key)
                  const val = isTop ? (form as any)[f.key] : form.details?.[f.key]
                  return (
                    <label key={f.key} style={s.field}>
                      <span style={s.fieldLabel}>{f.label}</span>
                      {f.type === 'number' ? (
                        <input type="number" style={s.input} value={val ?? ''}
                          onChange={e => isTop ? setTop(f.key, e.target.value ? Number(e.target.value) : null) : setDetail(f.key, e.target.value ? Number(e.target.value) : null)} />
                      ) : (
                        <input style={s.input} value={val ?? ''}
                          onChange={e => isTop ? setTop(f.key, e.target.value) : setDetail(f.key, e.target.value)} />
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={s.modalFooter}>
          <button style={s.btn} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button style={s.btnGhost} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function filter(rows: [string, any][]): { label: string; value: any }[] {
  return rows.filter(r => r[1] != null && r[1] !== '').map(([label, value]) => ({ label, value }))
}

const fmt = (v: number | string) =>
  'R\u00a0' + Number(v).toLocaleString('en-ZA', { minimumFractionDigits: 2 })

const s: Record<string, React.CSSProperties> = {
  layout:    { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', height: '100%' },
  list:      { overflowY: 'auto' },
  listHeader:{ display: 'flex', alignItems: 'center', marginBottom: '1rem' },
  h1:        { fontSize: '1.25rem', fontWeight: 600, marginRight: 'auto' },
  h2:        { fontSize: '1.1rem', fontWeight: 600 },
  card:      { background: '#fff', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '0.5rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.06)' },
  cardTitle: { fontWeight: 600, fontSize: '0.9rem' },
  cardSub:   { fontSize: '0.78rem', color: '#6b7280', marginTop: 2 },
  badge:     { fontSize: '0.72rem', color: '#6366f1', marginTop: 4 },
  btn:       { padding: '0.35rem 0.9rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  btnGhost:  { padding: '0.35rem 0.9rem', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  detail:    { background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflowY: 'auto' },
  detailHeader: { display: 'flex', alignItems: 'center', marginBottom: '1.25rem', gap: '0.75rem' },
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
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:     { background: '#fff', borderRadius: 12, width: '90%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' },
  modalBody: { overflowY: 'auto', padding: '1rem 1.5rem', flex: 1 },
  modalFooter:{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', justifyContent: 'flex-end' },
  btnClose:  { marginLeft: 'auto', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
  formSection: { marginBottom: '1rem' },
  formSectionTitle: { fontSize: '0.82rem', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem' },
  formGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' },
  field:     { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldLabel:{ fontSize: '0.72rem', color: '#6b7280' },
  input:     { padding: '0.35rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: '0.85rem' },
}
