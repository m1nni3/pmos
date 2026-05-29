import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { get, post, put, del } from '../api'
import { C, fmt, ICON, FONT, R, EASE, T } from '../styles'
import { Spinner, Empty, Skeleton, ErrorBanner, StatCard, Tabs, Table, Btn, Input } from '../components/UI'

const DETAIL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'details', label: 'Details' },
  { key: 'finance', label: 'Finance' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'documents', label: 'Documents' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'history', label: 'History' },
  { key: 'activity', label: 'Activity' },
]

export default function PropertyDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('overview')
  const [moreInfo, setMoreInfo] = useState(false)
  const [contacts, setContacts] = useState([])
  const [editContact, setEditContact] = useState(null)
  const [contactForm, setContactForm] = useState({ name: '', role: '', phone: '', email: '', notes: '' })
  const [contactErrors, setContactErrors] = useState({})

  const fetchData = () => {
    setLoading(true)
    setError(null)
    get(`/properties/${id}`).then(d => {
      setData(d)
      setContacts(d.contacts || [])
      setLoading(false)
    }).catch(() => {
      setError('Failed to load property data.')
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [id])

  const validateContact = () => {
    const errs = {}
    if (!contactForm.name.trim()) errs.name = 'Name is required'
    if (!contactForm.phone.trim() && !contactForm.email.trim()) errs.phone = 'Phone or email required'
    setContactErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContactSubmit = async () => {
    if (!validateContact()) return
    if (editContact) {
      const updated = await put(`/contacts/${editContact}`, contactForm).catch(e => { setContactErrors({ submit: e.message }); return null })
      if (updated) setContacts(contacts.map(c => c.id === editContact ? updated : c))
    } else {
      const created = await post('/contacts', { ...contactForm, property_id: id }).catch(e => { setContactErrors({ submit: e.message }); return null })
      if (created) setContacts([created, ...contacts])
    }
    setEditContact(null)
    setContactForm({ name: '', role: '', phone: '', email: '', notes: '' })
    setContactErrors({})
  }

  const handleContactDelete = async (contactId) => {
    if (!confirm('Delete this contact?')) return
    await del(`/contacts/${contactId}`)
    setContacts(contacts.filter(c => c.id !== contactId))
  }

  const startEdit = (c) => {
    setEditContact(c.id)
    setContactForm(c)
    setContactErrors({})
  }

  const cancelEdit = () => {
    setEditContact(null)
    setContactForm({ name: '', role: '', phone: '', email: '', notes: '' })
    setContactErrors({})
  }

  if (loading) return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, fontFamily: FONT }}>
      <Skeleton width={200} height={16} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Skeleton width={80} height={80} style={{ borderRadius: R.lg }} />
        <div>
          <Skeleton width={250} height={24} style={{ marginBottom: 8 }} />
          <Skeleton width={180} height={14} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={80} style={{ borderRadius: R.md }} />)}
      </div>
    </div>
  )

  if (error) return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, fontFamily: FONT }}>
      <ErrorBanner message={error} onRetry={fetchData} />
    </div>
  )

  if (!data) return <Empty icon="🏘" msg="Property not found." />

  const d = data.details || {}
  const bonds = data.bonds || []
  const policies = data.insurance_policies || []
  const docs = data.documents || []
  const history = data.history || []

  const tabContentStyle = { animation: 'fadeIn 0.25s ease-out' }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem', fontSize: T.sm, color: C.muted }}>
        <Link to="/" style={{ color: C.muted, textDecoration: 'none', transition: `color ${EASE}` }}
          onMouseEnter={e => { e.currentTarget.style.color = C.text }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted }}>Portfolio</Link>
        <span style={{ color: C.border }}>/</span>
        <span style={{ color: C.text, fontWeight: 500 }}>{data.name}</span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: R.lg, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
          {ICON ? <img src={ICON} style={{ width: 40, height: 40 }} alt="" /> : '🏘'}
        </div>
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: 22, fontWeight: 700 }}>{data.name}</h1>
          <p style={{ margin: 0, color: C.muted, fontSize: T.sm }}>{(data.address || '') + (d.suburb ? ` · ${d.suburb}` : '')}</p>
        </div>
      </div>

      <Btn variant="secondary" onClick={() => setMoreInfo(!moreInfo)} style={{ marginBottom: '1rem' }} size="sm">
        {moreInfo ? '▲ Less Info' : '▼ More Info'}
      </Btn>

      <Tabs tabs={DETAIL_TABS} active={tab} setActive={setTab} />

      <div style={tabContentStyle}>
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <StatCard label="Current Value" value={fmt(d.current_market_value || 0)} accent={C.green} />
            <StatCard label="Purchase Price" value={fmt(d.purchase_price || 0)} />
            <StatCard label="Size" value={d.size_sqm ? `${d.size_sqm} m²` : '—'} />
            <StatCard label="Bedrooms" value={String(d.bedrooms || '—')} />
            <StatCard label="Bathrooms" value={String(d.bathrooms || '—')} />
            <StatCard label="Parking" value={String(d.parking_bays || '—')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: T.sm, color: C.text }}>
            <InfoRow label="Scheme" value={data.scheme_name} />
            <InfoRow label="Suburb" value={d.suburb} />
            <InfoRow label="Township" value={d.township} />
            <InfoRow label="Owner" value={d.owner_name} />
            <InfoRow label="Managing Agent" value={d.managing_agent_name} />
            {moreInfo && (
              <>
                <InfoRow label="ERF Number" value={d.erf_number} />
                <InfoRow label="Scheme Number" value={d.scheme_number} />
                <InfoRow label="Purchase Date" value={d.purchase_date} />
                <InfoRow label="Title Deed" value={d.title_deed_reference} />
                <InfoRow label="Municipality" value={d.municipality_name} />
                <InfoRow label="Municipal Valuation" value={d.municipal_valuation ? fmt(d.municipal_valuation) : '—'} />
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: T.sm }}>
          {[
            ['ERF Number', d.erf_number],
            ['Scheme Number', d.scheme_number],
            ['Size (m²)', d.size_sqm],
            ['Bedrooms', d.bedrooms],
            ['Bathrooms', d.bathrooms],
            ['Parking Bays', d.parking_bays],
            ['Suburb', d.suburb],
            ['Township', d.township],
            ['LPI Code', d.lpi_code],
            ['Purchase Date', d.purchase_date],
            ['Purchase Price', d.purchase_price ? fmt(d.purchase_price) : '—'],
            ['Current Value', d.current_market_value ? fmt(d.current_market_value) : '—'],
            ['Title Deed Reference', d.title_deed_reference],
            ['Owner Name', d.owner_name],
            ['Owner ID', d.owner_id],
            ['Registered Owner', d.registered_owner],
            ['Municipality', d.municipality_name],
            ['Municipal Valuation', d.municipal_valuation ? fmt(d.municipal_valuation) : '—'],
            ['Municipal Account', d.municipal_account_number],
            ['Municipal Paid By', d.municipal_paid_by],
            ['Agency', d.agency],
            ['Managing Agent', d.managing_agent_name],
            ['Portfolio Manager', d.portfolio_manager],
            ['Agent Email', d.agent_email],
            ['Agent Phone', d.agent_phone],
            ['Account Administrator', d.account_administrator],
            ['Maintenance Manager', d.maintenance_manager],
            ['Department Head', d.department_head],
            ['Management Fee', d.management_fee ? fmt(d.management_fee) : '—'],
            ['Branch', d.branch],
            ['Tenant Name', d.tenant_name],
            ['Tenant Phone', d.tenant_phone],
            ['Tenant Email', d.tenant_email],
          ].filter(([, v]) => v !== null && v !== undefined && v !== '').map(([l, v]) => (
            <InfoRow key={l} label={l} value={v} />
          ))}
        </div>
      )}

      {tab === 'finance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <StatCard label="Current Market Value" value={fmt(d.current_market_value || 0)} accent={C.green} />
            <StatCard label="Purchase Price" value={fmt(d.purchase_price || 0)} />
            <StatCard label="Bond Amount" value={fmt(d.original_bond_amount || 0)} accent={C.warn} />
            <StatCard label="Monthly Bond Payment" value={fmt(d.monthly_bond_payment || 0)} />
            <StatCard label="Management Fee" value={fmt(d.management_fee || 0)} />
            <StatCard label="Gross Rental" value={fmt(d.gross_rental || 0)} accent={C.green} />
          </div>
          {bonds.length > 0 ? (
            <div>
              <h3 style={{ fontSize: T.base, margin: '1rem 0 0.5rem', fontWeight: 600 }}>Bonds</h3>
              <Table cols={[
                { key: 'bank', label: 'Bank' },
                { key: 'account_number', label: 'Account' },
                { key: 'original_amount', label: 'Original', render: r => r.original_amount ? fmt(r.original_amount) : '—' },
                { key: 'monthly_payment', label: 'Monthly', render: r => r.monthly_payment ? fmt(r.monthly_payment) : '—' },
                { key: 'expected_payoff_date', label: 'Payoff Date' },
              ]} rows={bonds} keyFn={r => r.id} />
            </div>
          ) : (
            <Empty icon="💰" msg="No bond information available for this property." />
          )}
        </div>
      )}

      {tab === 'insurance' && (
        <div>
          {policies.length === 0 ? (
            <Empty icon="🛡" msg="No insurance policies found." />
          ) : (
            <>
              <Table cols={[
                { key: 'insurer', label: 'Insurer' },
                { key: 'policy_number', label: 'Policy #' },
                { key: 'policy_holder', label: 'Holder' },
                { key: 'renewal_date', label: 'Renewal' },
                { key: 'status', label: 'Status' },
                { key: 'geyser_excess', label: 'Geyser Excess', render: r => r.geyser_excess ? fmt(r.geyser_excess) : '—' },
              ]} rows={policies} keyFn={r => r.id} />
              {moreInfo && policies.map(p => (
                <div key={p.id} style={{ background: C.bg, borderRadius: R.md, padding: '1rem', marginTop: '0.5rem', fontSize: T.sm, animation: 'slideDown 0.2s ease-out' }}>
                  <p><strong>Insurer:</strong> {p.insurer}</p>
                  <p><strong>Broker:</strong> {p.broker || '—'}</p>
                  <p><strong>Policy #:</strong> {p.policy_number}</p>
                  <p><strong>Holder:</strong> {p.policy_holder}</p>
                  <p><strong>Notes:</strong> {p.notes || '—'}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div>
          {docs.length === 0 ? (
            <Empty icon="📁" msg="No documents found." />
          ) : (
            <Table cols={[
              { key: 'name', label: 'Name' },
              { key: 'category', label: 'Category' },
              { key: 'mime_type', label: 'Type' },
              { key: 'created_at', label: 'Uploaded', render: r => r.created_at ? r.created_at.slice(0, 10) : '—' },
              { key: 'file_url', label: '', render: r => r.file_url
                ? <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.blue, textDecoration: 'none', fontSize: T.sm, fontWeight: 600 }}>
                    ⬇ Download
                  </a>
                : <span style={{ color: C.muted }}>—</span>
              },
            ]} rows={docs} keyFn={r => r.id} />
          )}
        </div>
      )}

      {tab === 'contacts' && (
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem', padding: '1rem', background: C.bg, borderRadius: R.md }}>
            <Input label="Name" value={contactForm.name} onChange={v => setContactForm({ ...contactForm, name: v })} error={contactErrors.name} />
            <Input label="Role" value={contactForm.role} onChange={v => setContactForm({ ...contactForm, role: v })} />
            <Input label="Phone" value={contactForm.phone} onChange={v => setContactForm({ ...contactForm, phone: v })} error={contactErrors.phone} />
            <Input label="Email" value={contactForm.email} onChange={v => setContactForm({ ...contactForm, email: v })} />
            <Btn onClick={handleContactSubmit}>{editContact ? 'Update' : 'Add'}</Btn>
            {editContact && <Btn variant="ghost" onClick={cancelEdit}>Cancel</Btn>}
            {contactErrors.submit && <div style={{ width: '100%', fontSize: T.xs, color: C.danger }}>{contactErrors.submit}</div>}
          </div>
          {contacts.length === 0 ? (
            <Empty icon="👤" msg="No contacts. Add one above." />
          ) : (
            <Table cols={[
              { key: 'name', label: 'Name' },
              { key: 'role', label: 'Role' },
              { key: 'phone', label: 'Phone' },
              { key: 'email', label: 'Email' },
              { key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                  <Btn variant="ghost" size="sm" onClick={() => startEdit(r)}>Edit</Btn>
                  <Btn variant="danger" size="sm" onClick={() => handleContactDelete(r.id)}>Delete</Btn>
                </div>
              )},
            ]} rows={contacts} keyFn={r => r.id} />
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <Empty icon="📜" msg="No history entries found." />
          ) : (
            <Table cols={[
              { key: 'event_date', label: 'Date' },
              { key: 'event_type', label: 'Type' },
              { key: 'title', label: 'Title' },
              { key: 'description', label: 'Description' },
            ]} rows={history} keyFn={r => r.id} />
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div>
          {history.length === 0 ? (
            <Empty icon="🔔" msg="No recent activity." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice(0, 20).map((h, i) => (
                <div key={h.id} style={{
                  padding: '0.75rem 1rem', background: C.bg, borderRadius: R.md, fontSize: T.sm,
                  animation: `fadeIn 0.2s ease-out`,
                  animationDelay: `${i * 30}ms`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{h.title}</strong>
                    <span style={{ color: C.muted, fontSize: T.xs }}>{h.event_date}</span>
                  </div>
                  <div style={{ color: C.muted, marginTop: 4 }}>{h.description || h.event_type}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0.4rem 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.muted, minWidth: 160, fontWeight: 500, fontSize: T.sm }}>{label}</span>
      <span style={{ fontSize: T.sm }}>{value ?? '—'}</span>
    </div>
  )
}
