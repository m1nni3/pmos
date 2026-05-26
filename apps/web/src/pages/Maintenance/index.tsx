import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Property } from '../../types/property'

type WOStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

interface WorkOrder {
  id: string
  property_id: string
  unit_id: string | null
  contractor_id: string | null
  description: string
  status: WOStatus
  raised_at: string
  completed_at: string | null
  cost: number | null
}

interface Contractor { id: string; name: string }
interface Unit { id: string; unit_number: string }

const STATUS_COLORS: Record<WOStatus, string> = {
  open:        '#f59e0b',
  in_progress: '#6366f1',
  completed:   '#22c55e',
  cancelled:   '#9ca3af',
}

const STATUSES: WOStatus[] = ['open', 'in_progress', 'completed', 'cancelled']

export default function Maintenance() {
  const [properties, setProperties]   = useState<Property[]>([])
  const [propertyId, setPropertyId]   = useState('')
  const [units, setUnits]             = useState<Unit[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [orders, setOrders]           = useState<WorkOrder[]>([])
  const [filter, setFilter]           = useState<WOStatus | 'all'>('all')
  const [loading, setLoading]         = useState(false)
  const [form, setForm]               = useState<Partial<WorkOrder> | null>(null)
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('properties').select('id,name').order('name'),
      supabase.from('contacts').select('id,name').eq('role', 'contractor').order('name'),
    ]).then(([p, c]) => {
      const props = (p.data ?? []) as Property[]
      setProperties(props)
      setContractors((c.data ?? []) as Contractor[])
      if (props.length) setPropertyId(props[0].id)
    })
  }, [])

  useEffect(() => {
    if (!propertyId) return
    supabase.from('units').select('id,unit_number').eq('property_id', propertyId).order('unit_number')
      .then(({ data }) => setUnits((data ?? []) as Unit[]))
    fetchOrders()
  }, [propertyId, filter])

  function fetchOrders() {
    setLoading(true)
    let q = supabase.from('work_orders').select('*').eq('property_id', propertyId).order('raised_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => { setOrders((data ?? []) as WorkOrder[]); setLoading(false) })
  }

  async function save() {
    if (!form?.description?.trim()) return
    setSaving(true)
    const payload = { ...form, property_id: propertyId }
    if (form.id) {
      const { data } = await supabase.from('work_orders').update(payload).eq('id', form.id).select().single()
      setOrders(prev => prev.map(o => o.id === form.id ? data as WorkOrder : o))
    } else {
      const { data } = await supabase.from('work_orders').insert({ status: 'open', ...payload }).select().single()
      setOrders(prev => [data as WorkOrder, ...prev])
    }
    setSaving(false)
    setForm(null)
  }

  async function updateStatus(id: string, status: WOStatus) {
    const extra = status === 'completed' ? { completed_at: new Date().toISOString() } : {}
    await supabase.from('work_orders').update({ status, ...extra }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, ...extra } : o))
  }

  const counts = orders.reduce((a, o) => { a[o.status] = (a[o.status] ?? 0) + 1; return a }, {} as Record<string, number>)

  return (
    <div>
      <div style={s.toolbar}>
        <h1 style={s.h1}>Maintenance</h1>
        <select style={s.sel} value={propertyId} onChange={e => setPropertyId(e.target.value)}>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button style={s.btn} onClick={() => setForm({ property_id: propertyId })}>+ Work Order</button>
      </div>

      <div style={s.pills}>
        {(['all', ...STATUSES] as const).map(f => (
          <button key={f} style={{ ...s.pill, ...(filter === f ? s.pillActive : {}), borderColor: f !== 'all' ? STATUS_COLORS[f as WOStatus] : '#e5e7eb' }}
            onClick={() => setFilter(f)}>
            {f.replace('_', ' ')}
            <span style={s.badge}>{f === 'all' ? orders.length : (counts[f] ?? 0)}</span>
          </button>
        ))}
      </div>

      {form && (
        <div style={s.formBox}>
          <div style={s.formGrid}>
            <label style={s.lbl}>
              <span style={s.lblTxt}>Description *</span>
              <input style={{ ...s.input, gridColumn: 'span 2' }} value={form.description ?? ''}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </label>
            <label style={s.lbl}>
              <span style={s.lblTxt}>Unit</span>
              <select style={s.input} value={form.unit_id ?? ''} onChange={e => setForm(p => ({ ...p, unit_id: e.target.value || null }))}>
                <option value="">— none —</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
              </select>
            </label>
            <label style={s.lbl}>
              <span style={s.lblTxt}>Contractor</span>
              <select style={s.input} value={form.contractor_id ?? ''} onChange={e => setForm(p => ({ ...p, contractor_id: e.target.value || null }))}>
                <option value="">— none —</option>
                {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label style={s.lbl}>
              <span style={s.lblTxt}>Cost (R)</span>
              <input style={s.input} type="number" value={form.cost ?? ''} onChange={e => setForm(p => ({ ...p, cost: e.target.value ? Number(e.target.value) : null }))} />
            </label>
            {form.id && (
              <label style={s.lbl}>
                <span style={s.lblTxt}>Status</span>
                <select style={s.input} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as WOStatus }))}>
                  {STATUSES.map(st => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
                </select>
              </label>
            )}
          </div>
          <div style={s.formActions}>
            <button style={s.btn} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button style={s.btnGhost} onClick={() => setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {loading
        ? <p style={s.muted}>Loading…</p>
        : orders.length === 0
          ? <p style={s.muted}>No work orders found.</p>
          : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>{['Raised','Description','Unit','Contractor','Cost','Status',''].map(h =>
                    <th key={h} style={s.th}>{h}</th>
                  )}</tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={s.td}>{new Date(o.raised_at).toLocaleDateString('en-ZA')}</td>
                      <td style={{ ...s.td, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.description}</td>
                      <td style={s.td}>{units.find(u => u.id === o.unit_id)?.unit_number ?? '—'}</td>
                      <td style={s.td}>{contractors.find(c => c.id === o.contractor_id)?.name ?? '—'}</td>
                      <td style={{ ...s.td, textAlign: 'right' }}>{o.cost != null ? `R ${Number(o.cost).toLocaleString('en-ZA')}` : '—'}</td>
                      <td style={s.td}>
                        <select
                          style={{ ...s.sel, borderColor: STATUS_COLORS[o.status], color: STATUS_COLORS[o.status], fontSize: '0.78rem' }}
                          value={o.status}
                          onChange={e => updateStatus(o.id, e.target.value as WOStatus)}
                        >
                          {STATUSES.map(st => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td style={s.td}>
                        <span style={s.action} onClick={() => setForm(o)}>Edit</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  toolbar:    { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
  h1:         { fontSize: '1.25rem', fontWeight: 600, marginRight: 'auto' },
  sel:        { padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.85rem' },
  btn:        { padding: '0.35rem 0.9rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  btnGhost:   { padding: '0.35rem 0.9rem', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  pills:      { display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  pill:       { padding: '0.3rem 0.75rem', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 },
  pillActive: { background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' },
  badge:      { background: '#e5e7eb', borderRadius: 10, padding: '0 5px', fontSize: '0.72rem', color: '#374151' },
  formBox:    { background: '#fff', borderRadius: 8, padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  formGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' },
  lbl:        { display: 'flex', flexDirection: 'column', gap: 3 },
  lblTxt:     { fontSize: '0.75rem', color: '#6b7280' },
  input:      { padding: '0.35rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: '0.85rem' },
  formActions:{ display: 'flex', gap: '0.5rem' },
  tableWrap:  { overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th:         { textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' },
  td:         { padding: '0.4rem 0.75rem', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' },
  action:     { cursor: 'pointer', color: '#6366f1', fontSize: '0.78rem' },
  muted:      { color: '#9ca3af', fontSize: '0.85rem' },
}
