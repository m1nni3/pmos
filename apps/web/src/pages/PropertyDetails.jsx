import { useEffect, useState, memo, useCallback } from 'react'
import { get, put } from '../api'
import { C, FONT, T, R, EASE, fmt, SHADOW } from '../styles'

const DETAIL_TABS = [
  { key: 'overview',  label: 'Overview',       icon: '🏠' },
  { key: 'financing', label: 'Financing',       icon: '💰' },
  { key: 'letting',   label: 'Letting Agent',   icon: '🤝' },
  { key: 'bodycorp',  label: 'Managing Agent',  icon: '🏢' },
  { key: 'portals',   label: 'Portals',         icon: '🔗' },
]

const PROPS_EXCLUDE = new Set(['p1000000-0000-0000-0000-000000000005','p1000000-0000-0000-0000-000000000006','p1000000-0000-0000-0000-000000000007'])
const NUM = v => v === '' ? '' : Number(v)

const PROPERTY_COLORS = ['#2563eb','#7c3aed','#0891b2','#059669']

const R2_IMAGES = 'https://pub-d66179a93f094dd788fadc511338b676.r2.dev'
const BANNER_PH = '/images/banner-placeholder.png'

function propBanner(id) { return `${R2_IMAGES}/${id}/banner.jpg` }

export default function PropertyDetails() {
  const [allProps, setAllProps] = useState([])
  const [propIndex, setPropIndex] = useState(0)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    get('/properties').then(props => setAllProps(props.filter(p => !PROPS_EXCLUDE.has(p.id)))).catch(() => {})
  }, [])

  const load = useCallback(() => {
    const p = allProps[propIndex]
    if (!p) return
    get(`/properties/${p.id}`).then(d => { setData(d); setForm(buildForm(d)) }).catch(() => {})
  }, [propIndex, allProps])

  useEffect(() => { load() }, [load])

  const current = allProps[propIndex]
  const d = data?.details || {}
  const bonds = data?.bonds || []
  const policies = data?.insurance_policies || []
  const color = PROPERTY_COLORS[propIndex % PROPERTY_COLORS.length]

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])

  const cancel = useCallback(() => {
    if (data) setForm(buildForm(data))
    setEditing(false); setMsg(null)
  }, [data])

  const save = useCallback(async () => {
    setSaving(true); setMsg(null)
    try {
      const payload = {}; const details = {}
      for (const [k, v] of Object.entries(form)) {
        (k.startsWith('prop_') ? payload : details)[k.startsWith('prop_') ? k.slice(5) : k] = v
      }
      await put(`/properties/${current.id}`, { ...payload, details })
      const b = bonds[0]
      if (b && form.bond_bank != null) {
        await put(`/properties/${current.id}/bonds/${b.id}`, {
          bank: form.bond_bank, account_number: form.bond_account_number,
          original_amount: NUM(form.original_bond_amount) || 0,
          monthly_payment: NUM(form.monthly_bond_payment) || 0,
          expected_payoff_date: form.expected_payoff_date,
        }).catch(() => {})
      }
      const p = policies[0]
      if (p && form.insurer != null) {
        await put(`/properties/${current.id}/insurance-policies/${p.id}`, {
          insurer: form.insurer, broker: form.broker,
          policy_number: form.policy_number, policy_holder: form.policy_holder,
          renewal_date: form.annual_renewal_date,
          geyser_excess: NUM(form.geyser_excess) || 0,
          notes: form.insurance_contact || form.insurance_notes,
        }).catch(() => {})
      }
      setMsg({ type: 'success', text: 'Changes saved successfully' })
      setEditing(false); await load()
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Save failed' })
    }
    setSaving(false)
  }, [form, current, bonds, policies, load])

  if (!allProps.length || !data) return (
    <div style={{ padding: '2rem', fontFamily: FONT, color: C.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.primary, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      Loading property data...
    </div>
  )

  return (
    <div style={{ fontFamily: FONT, background: '#f5f6f8', minHeight: '100%' }}>

      {/* Hero banner */}
      <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#1e293b' }}>
        <img src={propBanner(current?.id)} alt={current?.name}
          onError={e => { e.target.src = BANNER_PH }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}88 0%, rgba(0,0,0,0.7) 100%)` }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />

        {/* Property switcher overlaid on banner */}
        <div style={{ position: 'absolute', top: 16, left: 24, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allProps.map((p, i) => (
            <button key={p.id} onClick={() => { setPropIndex(i); setTab('overview'); setEditing(false); setMsg(null) }}
              style={{
                height: 30, padding: '0 14px', borderRadius: 20,
                border: propIndex === i ? `2px solid #fff` : '2px solid rgba(255,255,255,0.3)',
                background: propIndex === i ? '#fff' : 'rgba(0,0,0,0.3)',
                color: propIndex === i ? color : '#fff',
                fontSize: 12, fontWeight: propIndex === i ? 700 : 500,
                cursor: 'pointer', backdropFilter: 'blur(8px)', transition: `all ${EASE}`,
              }}>{p.name}</button>
          ))}
        </div>

        {/* Property name + address */}
        <div style={{ position: 'absolute', bottom: 16, left: 24, right: 160 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px', textShadow: '0 2px 8px rgba(0,0,0,0.4)', lineHeight: 1.2 }}>
            {current?.name}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            {current?.address}
          </div>
        </div>

        {/* Edit / Save buttons */}
        <div style={{ position: 'absolute', bottom: 16, right: 24, display: 'flex', gap: 8 }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{
              height: 34, padding: '0 18px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.6)',
              background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', backdropFilter: 'blur(8px)', transition: `all ${EASE}`,
            }}>✏️ Edit</button>
          ) : (
            <>
              <button onClick={cancel} disabled={saving} style={{
                height: 34, padding: '0 16px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.4)',
                background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', backdropFilter: 'blur(8px)',
              }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{
                height: 34, padding: '0 18px', borderRadius: 8, border: 'none',
                background: saving ? '#6b7280' : '#10b981', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: `all ${EASE}`,
              }}>{saving ? 'Saving...' : '✓ Save'}</button>
            </>
          )}
        </div>
      </div>

      {/* Stat strip */}
      {data && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', overflowX: 'auto' }}>
          {[
            { label: 'Market Value',    value: fmt(d.current_market_value || 0), color: '#059669' },
            { label: 'Purchase Price',  value: fmt(d.purchase_price || 0),       color: '#374151' },
            { label: 'Size',            value: d.size_sqm ? `${d.size_sqm} m²` : '—', color: '#374151' },
            { label: 'Bedrooms',        value: d.bedrooms || '—',                color: '#374151' },
            { label: 'Bathrooms',       value: d.bathrooms || '—',               color: '#374151' },
            { label: 'Parking',         value: d.parking_bays || '—',            color: '#374151' },
            { label: 'Tenant',          value: d.tenant_name || '—',             color: '#2563eb' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 20px', borderRight: '1px solid #f3f4f6', flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.color, letterSpacing: '-0.2px' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content area */}
      <div style={{ padding: '0 24px 32px', maxWidth: 1200 }}>

        {/* Message banner */}
        {msg && (
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: msg.type === 'success' ? '#15803d' : '#dc2626',
            border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{msg.type === 'success' ? '✓' : '⚠'}</span> {msg.text}
            <button onClick={() => setMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>×</button>
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb', marginTop: 16, marginBottom: 20, background: '#fff', borderRadius: '8px 8px 0 0', overflow: 'hidden', boxShadow: SHADOW.sm }}>
          {DETAIL_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, height: 44, border: 'none', background: tab === t.key ? '#fff' : '#f9fafb',
              fontSize: 12, fontWeight: tab === t.key ? 600 : 500,
              color: tab === t.key ? color : '#6b7280', cursor: 'pointer',
              borderBottom: tab === t.key ? `2px solid ${color}` : '2px solid transparent',
              borderRight: '1px solid #f3f4f6', transition: `all ${EASE}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Edit mode indicator */}
        {editing && (
          <div style={{ marginBottom: 16, padding: '8px 14px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
            ✏️ <strong>Edit mode</strong> — make your changes then click Save
          </div>
        )}

        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {tab === 'overview'  && <OverviewTab  d={d} form={form} set={set} editing={editing} color={color} />}
          {tab === 'financing' && <FinancingTab form={form} set={set} editing={editing} color={color} />}
          {tab === 'letting'   && <LettingTab   form={form} set={set} editing={editing} color={color} />}
          {tab === 'bodycorp'  && <BodyCorpTab  d={d} policies={policies} form={form} set={set} editing={editing} color={color} />}
          {tab === 'portals'   && <PortalsTab   color={color} />}
        </div>
      </div>
    </div>
  )
}

/* ─── helpers ─── */
function buildForm(data) {
  const d = data.details || {}
  return { prop_name: data.name || '', prop_address: data.address || '', prop_scheme_name: data.scheme_name || '', prop_unit_count: data.unit_count || 1, ...d }
}

/* ─── shared components ─── */

const Input = memo(({ label, value, onChange, type = 'text', disabled, large }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    {disabled ? (
      <div style={{ fontSize: 13, color: value ? '#111827' : '#d1d5db', padding: '6px 0', minHeight: 28, wordBreak: 'break-word', borderBottom: '1px solid #f3f4f6' }}>
        {value || '—'}
      </div>
    ) : large ? (
      <textarea value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: FONT, resize: 'vertical', minHeight: 72, outline: 'none', transition: 'border-color 0.15s' }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
    ) : (
      <input type={type} value={value ?? ''} onChange={e => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: FONT, outline: 'none', transition: 'border-color 0.15s', background: '#fff' }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
    )}
  </div>
))

const Card = memo(({ title, icon, children, accent, style }) => (
  <div style={{
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
    borderTop: `3px solid ${accent || '#2563eb'}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', ...style,
  }}>
    {title && (
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', gap: 8,
        background: `linear-gradient(135deg, ${accent || '#2563eb'}08 0%, transparent 100%)`,
      }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.2px' }}>{title}</span>
      </div>
    )}
    <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
  </div>
))

const FieldRow = memo(({ children, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '6px 16px', alignItems: 'start' }}>{children}</div>
))

const TwoCol = memo(({ left, right, leftSpan, rightSpan }) => (
  <div style={{ display: 'grid', gridTemplateColumns: leftSpan && rightSpan ? `${leftSpan}fr ${rightSpan}fr` : '1fr 1fr', gap: 16, alignItems: 'start' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{left}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{right}</div>
  </div>
))

/* ═══ OVERVIEW ═══ */
const OverviewTab = memo(({ d, form, set, editing, color }) => (
  <TwoCol
    left={
      <Card title="Property" icon="🏠" accent={color}>
        <FieldRow>
          <Input label="Property Name" value={form.prop_name} onChange={v => set('prop_name', v)} disabled={!editing} />
          <Input label="Scheme Name" value={form.prop_scheme_name} onChange={v => set('prop_scheme_name', v)} disabled={!editing} />
        </FieldRow>
        <Input label="Address" value={form.prop_address} onChange={v => set('prop_address', v)} disabled={!editing} large />
        <FieldRow>
          <Input label="Unit" value={form.unit_number} onChange={v => set('unit_number', v)} disabled={!editing} />
          <Input label="Door" value={form.door_number} onChange={v => set('door_number', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="ERF Number" value={form.erf_number} onChange={v => set('erf_number', v)} disabled={!editing} />
          <Input label="Scheme #" value={form.scheme_number} onChange={v => set('scheme_number', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Size (m²)" value={form.size_sqm} onChange={v => set('size_sqm', v)} disabled={!editing} />
          <Input label="Suburb" value={form.suburb} onChange={v => set('suburb', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Township" value={form.township} onChange={v => set('township', v)} disabled={!editing} />
          <Input label="Size Detail" value={form.size_detail} onChange={v => set('size_detail', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow cols={3}>
          <Input label="Bedrooms" value={form.bedrooms} onChange={v => set('bedrooms', v)} disabled={!editing} />
          <Input label="Bathrooms" value={form.bathrooms} onChange={v => set('bathrooms', v)} disabled={!editing} />
          <Input label="Parking" value={form.parking_bays} onChange={v => set('parking_bays', v)} disabled={!editing} />
        </FieldRow>
      </Card>
    }
    right={
      <Card title="Ownership" icon="📋" accent="#10b981">
        <FieldRow>
          <Input label="Registered Owner" value={form.registered_owner} onChange={v => set('registered_owner', v)} disabled={!editing} />
          <Input label="Owner ID" value={form.owner_id} onChange={v => set('owner_id', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Owner Name" value={form.owner_name} onChange={v => set('owner_name', v)} disabled={!editing} />
          <Input label="Title Deed Ref" value={form.title_deed_reference} onChange={v => set('title_deed_reference', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Purchase Date" value={form.purchase_date} onChange={v => set('purchase_date', v)} disabled={!editing} />
          <Input label="Purchase Price" value={form.purchase_price} onChange={v => set('purchase_price', v)} type="number" disabled={!editing} />
        </FieldRow>
        <Input label="Current Market Value" value={form.current_market_value} onChange={v => set('current_market_value', v)} type="number" disabled={!editing} />
      </Card>
    }
  />
))

/* ═══ FINANCING ═══ */
const FinancingTab = memo(({ form, set, editing, color }) => (
  <TwoCol
    left={
      <Card title="Bond Details" icon="🏦" accent="#f59e0b">
        <FieldRow>
          <Input label="Bond Bank" value={form.bond_bank} onChange={v => set('bond_bank', v)} disabled={!editing} />
          <Input label="Account Number" value={form.bond_account_number} onChange={v => set('bond_account_number', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Original Amount" value={form.original_bond_amount} onChange={v => set('original_bond_amount', v)} type="number" disabled={!editing} />
          <Input label="Monthly Payment" value={form.monthly_bond_payment} onChange={v => set('monthly_bond_payment', v)} type="number" disabled={!editing} />
        </FieldRow>
        <Input label="Expected Payoff Date" value={form.expected_payoff_date} onChange={v => set('expected_payoff_date', v)} disabled={!editing} />
      </Card>
    }
    right={
      <Card title="Owner Rental Account" icon="🏛" accent="#0E90AA">
        <FieldRow>
          <Input label="Bank" value="Nedbank" disabled />
          <Input label="Branch Code" value="198765" disabled />
        </FieldRow>
        <Input label="Account Name" value="The Enthuse Trust" disabled />
        <Input label="Account Number" value="204656214" disabled />
      </Card>
    }
  />
))

/* ═══ LETTING AGENT ═══ */
const LettingTab = memo(({ form, set, editing, color }) => (
  <TwoCol
    left={
      <Card title="Agency & Management" icon="🏢" accent="#8b5cf6">
        <Input label="Agency" value={form.agency} onChange={v => set('agency', v)} disabled={!editing} />
        <FieldRow>
          <Input label="Managing Agent" value={form.managing_agent_name} onChange={v => set('managing_agent_name', v)} disabled={!editing} />
          <Input label="Portfolio Manager" value={form.portfolio_manager} onChange={v => set('portfolio_manager', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Email" value={form.agent_email} onChange={v => set('agent_email', v)} disabled={!editing} />
          <Input label="Phone" value={form.agent_phone} onChange={v => set('agent_phone', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Management Fee" value={form.management_fee} onChange={v => set('management_fee', v)} type="number" disabled={!editing} />
          <Input label="Payment Method" value={form.payment_method} onChange={v => set('payment_method', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Account Admin" value={form.account_administrator} onChange={v => set('account_administrator', v)} disabled={!editing} />
          <Input label="Maintenance Mgr" value={form.maintenance_manager} onChange={v => set('maintenance_manager', v)} disabled={!editing} />
        </FieldRow>
        <FieldRow>
          <Input label="Dept Head" value={form.department_head} onChange={v => set('department_head', v)} disabled={!editing} />
          <Input label="Branch / Code" value={[form.branch, form.branch_code].filter(Boolean).join(' / ')} disabled />
        </FieldRow>
      </Card>
    }
    right={
      <Card title="Current Tenant" icon="👤" accent="#4BAF3E">
        <Input label="Tenant Name" value={form.tenant_name} onChange={v => set('tenant_name', v)} disabled={!editing} />
        <FieldRow>
          <Input label="Phone" value={form.tenant_phone} onChange={v => set('tenant_phone', v)} disabled={!editing} />
          <Input label="Email" value={form.tenant_email} onChange={v => set('tenant_email', v)} disabled={!editing} />
        </FieldRow>
        <Input label="Notes" value={form.tenant_notes} onChange={v => set('tenant_notes', v)} disabled={!editing} large />
      </Card>
    }
  />
))

/* ═══ MANAGING AGENT ═══ */
const BodyCorpTab = memo(({ d, policies, form, set, editing, color }) => {
  const p = policies[0] || {}
  return (
    <TwoCol
      left={
        <>
          <Card title="Body Corporate" icon="🏘" accent="#ef4444">
            <FieldRow>
              <Input label="BC Name" value={form.bc_name} onChange={v => set('bc_name', v)} disabled={!editing} />
              <Input label="Reg Number" value={form.bc_registration_number} onChange={v => set('bc_registration_number', v)} disabled={!editing} />
            </FieldRow>
            <FieldRow>
              <Input label="Contact Name" value={form.bc_contact_name} onChange={v => set('bc_contact_name', v)} disabled={!editing} />
              <Input label="Contact Phone" value={form.bc_contact_phone} onChange={v => set('bc_contact_phone', v)} disabled={!editing} />
            </FieldRow>
            <Input label="Contact Email" value={form.bc_contact_email} onChange={v => set('bc_contact_email', v)} disabled={!editing} />
            <Input label="Levy Payment Method" value={form.bc_levy_payment_method} onChange={v => set('bc_levy_payment_method', v)} disabled={!editing} />
          </Card>
          <Card title="Insurance" icon="🛡" accent="#f59e0b">
            <FieldRow>
              <Input label="Insurer" value={form.insurer || p.insurer} onChange={v => set('insurer', v)} disabled={!editing} />
              <Input label="Broker" value={form.broker || p.broker} onChange={v => set('broker', v)} disabled={!editing} />
            </FieldRow>
            <FieldRow>
              <Input label="Policy Number" value={form.policy_number || p.policy_number} onChange={v => set('policy_number', v)} disabled={!editing} />
              <Input label="Policy Holder" value={form.policy_holder || p.policy_holder} onChange={v => set('policy_holder', v)} disabled={!editing} />
            </FieldRow>
            <FieldRow>
              <Input label="Geyser Excess" value={form.geyser_excess || p.geyser_excess} onChange={v => set('geyser_excess', v)} type="number" disabled={!editing} />
              <Input label="Renewal Date" value={form.annual_renewal_date || p.renewal_date} onChange={v => set('annual_renewal_date', v)} disabled={!editing} />
            </FieldRow>
            <Input label="Contact / Notes" value={form.insurance_contact || p.notes} onChange={v => set('insurance_contact', v)} disabled={!editing} large />
          </Card>
        </>
      }
      right={
        <>
          <Card title="Levies" icon="💳" accent="#0E90AA">
            <FieldRow>
              <Input label="Bank" value={form.bc_bank} onChange={v => set('bc_bank', v)} disabled={!editing} />
              <Input label="Account Name" value={form.bc_account_name} onChange={v => set('bc_account_name', v)} disabled={!editing} />
            </FieldRow>
            <FieldRow>
              <Input label="Branch" value={form.bc_branch} onChange={v => set('bc_branch', v)} disabled={!editing} />
              <Input label="Branch Code" value={form.bc_branch_code} onChange={v => set('bc_branch_code', v)} disabled={!editing} />
            </FieldRow>
            <Input label="Payment Reference" value={form.bc_levy_reference} onChange={v => set('bc_levy_reference', v)} disabled={!editing} />
          </Card>
          <Card title="Municipal" icon="🏛" accent="#8b5cf6">
            <Input label="Municipality" value={form.municipality_name} onChange={v => set('municipality_name', v)} disabled={!editing} />
            <FieldRow>
              <Input label="Account Number" value={form.municipal_account_number} onChange={v => set('municipal_account_number', v)} disabled={!editing} />
              <Input label="Paid By" value={form.municipal_paid_by} onChange={v => set('municipal_paid_by', v)} disabled={!editing} />
            </FieldRow>
            <FieldRow>
              <Input label="Municipal Valuation" value={form.municipal_valuation} onChange={v => set('municipal_valuation', v)} type="number" disabled={!editing} />
              <Input label="Valuation Year" value={form.municipal_valuation_year} onChange={v => set('municipal_valuation_year', v)} disabled={!editing} />
            </FieldRow>
          </Card>
        </>
      }
    />
  )
})

/* ═══ PORTALS ═══ */
const PortalsTab = memo(({ color }) => (
  <TwoCol
    left={
      <Card title="Letting Agent Portal" icon="🔐" accent="#A0C226">
        <Input label="URL" value="https://trafalgar-app.unibase.solutions" disabled />
        <FieldRow>
          <Input label="Username" value="binostribe@gmail.com" disabled />
          <Input label="Password" value="*default" disabled />
        </FieldRow>
      </Card>
    }
    right={
      <Card title="Levy Portal" icon="🔐" accent="#0E90AA">
        <Input label="URL" value="TBA" disabled />
        <FieldRow>
          <Input label="Username" value="TBA" disabled />
          <Input label="Password" value="TBA" disabled />
        </FieldRow>
      </Card>
    }
  />
))
