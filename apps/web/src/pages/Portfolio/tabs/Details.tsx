interface Props { property: any }

const fields = [
  ['General', ['property_type', 'status', 'registration_date', 'purchase_price', 'current_value', 'bond_amount', 'bond_holder', 'bond_end_date']],
  ['Location', ['address', 'city', 'province', 'postal_code', 'erf_number']],
  ['Municipality', ['municipality', 'rates_and_taxes', 'rates_account', 'levy', 'levy_account']],
  ['Management', ['management_company', 'management_fee', 'agent', 'agent_contact']],
  ['Tenant', ['tenant_name', 'tenant_contact', 'gross_rental', 'net_rental', 'lease_start', 'lease_end', 'deposit', 'escalation']],
  ['BC', ['bc_company', 'bc_name', 'bc_contact', 'bc_expiry']],
  ['Title Deed', ['title_deed_number', 'title_deed_holder']],
]

const labelMap: Record<string, string> = {
  property_type: 'Type', registration_date: 'Registration Date', purchase_price: 'Purchase Price',
  current_value: 'Current Value', bond_amount: 'Bond Amount', bond_holder: 'Bond Holder',
  bond_end_date: 'Bond End Date', address: 'Address', city: 'City', province: 'Province',
  postal_code: 'Postal Code', erf_number: 'ERF Number', municipality: 'Municipality',
  rates_and_taxes: 'Rates & Taxes', rates_account: 'Rates Account', levy: 'Levy',
  levy_account: 'Levy Account', management_company: 'Management Company', management_fee: 'Management Fee',
  agent: 'Agent', agent_contact: 'Agent Contact', tenant_name: 'Tenant Name',
  tenant_contact: 'Tenant Contact', gross_rental: 'Gross Rental', net_rental: 'Net Rental',
  lease_start: 'Lease Start', lease_end: 'Lease End', deposit: 'Deposit',
  escalation: 'Escalation', bc_company: 'BC Company', bc_name: 'BC Name',
  bc_contact: 'BC Contact', bc_expiry: 'BC Expiry', title_deed_number: 'Title Deed Number',
  title_deed_holder: 'Title Deed Holder',
}

export default function Details({ property }: Props) {
  const d = property.property_details || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {fields.map(([section, keys]) => {
        const entries = (keys as string[]).filter(k => d[k] || property[k])
        if (entries.length === 0) return null
        return (
          <div key={section as string} style={{ background: '#fff', borderRadius: 8, padding: '1rem 1.25rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#374151' }}>{section as string}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
              {(entries as string[]).map(k => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
                  <span style={{ color: '#6b7280' }}>{labelMap[k] || k}</span>
                  <span style={{ fontWeight: 500 }}>{d[k] || property[k] || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
