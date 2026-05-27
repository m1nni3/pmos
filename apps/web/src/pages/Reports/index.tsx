import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Property } from '../../types/property'

type ReportType = 'portfolio' | 'cashflow' | 'reconciliation' | 'maintenance'

const REPORTS: { key: ReportType; label: string; desc: string }[] = [
  { key: 'portfolio',      label: 'Portfolio Summary',     desc: 'All properties, units, occupancy' },
  { key: 'cashflow',       label: 'Cashflow Report',       desc: 'Rental vs bank receipts per period' },
  { key: 'reconciliation', label: 'Reconciliation Report', desc: 'Matched, unmatched and exceptions' },
  { key: 'maintenance',    label: 'Maintenance Report',    desc: 'Work orders by status and cost' },
]

export default function Reports() {
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyId, setPropertyId] = useState('all')
  const [type, setType] = useState<ReportType>('portfolio')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('properties').select('id,name').order('name').then(({ data }) => {
      setProperties((data ?? []) as Property[])
    })
  }, [])

  async function run() {
    setLoading(true)
    setData([])
    const pid = propertyId !== 'all' ? propertyId : null

    let q: any
    if (type === 'portfolio') {
      q = supabase.from('properties').select('name, address, scheme_name, unit_count, created_at')
      if (pid) q = q.eq('id', pid)
    } else if (type === 'cashflow') {
      q = supabase.from('rental_ledger').select('date, description, debit, credit, balance, reference')
      if (pid) q = q.eq('property_id', pid)
      q = q.order('date', { ascending: false }).limit(500)
    } else if (type === 'reconciliation') {
      q = supabase.from('reconciliation').select('period, rental_amount, bank_amount, variance, status, notes')
      if (pid) q = q.eq('property_id', pid)
      q = q.order('period', { ascending: false })
    } else {
      q = supabase.from('work_orders').select('raised_at, description, status, cost, completed_at')
      if (pid) q = q.eq('property_id', pid)
      q = q.order('raised_at', { ascending: false })
    }

    const { data: rows } = await q
    setData(rows ?? [])
    setLoading(false)
  }

  const cols = data.length ? Object.keys(data[0]) : []

  return (
    <div>
      <div style={s.toolbar}>
        <h1 style={s.h1}>Reports</h1>
      </div>

      <div style={s.cards}>
        {REPORTS.map(r => (
          <div key={r.key} style={{ ...s.card, ...(type === r.key ? s.cardActive : {}) }} onClick={() => setType(r.key)}>
            <div style={s.cardTitle}>{r.label}</div>
            <div style={s.cardDesc}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div style={s.controls}>
        <select style={s.sel} value={propertyId} onChange={e => setPropertyId(e.target.value)}>
          <option value="all">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button style={s.btn} onClick={run} disabled={loading}>{loading ? 'Running…' : 'Run Report'}</button>
        {data.length > 0 && (
          <button style={s.btnGhost} onClick={() => exportCsv(data, type)}>Export CSV</button>
        )}
        {data.length > 0 && <span style={s.count}>{data.length} rows</span>}
      </div>

      {!loading && data.length === 0 && <p style={s.muted}>Select a report and click Run.</p>}

      {data.length > 0 && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>{cols.map(c => <th key={c} style={s.th}>{c.replace(/_/g, ' ')}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {cols.map(c => <td key={c} style={s.td}>{row[c] ?? '—'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function exportCsv(data: any[], name: string) {
  const cols = Object.keys(data[0])
  const csv = [cols.join(','), ...data.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `${name}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

const s: Record<string, React.CSSProperties> = {
  toolbar:    { display: 'flex', alignItems: 'center', marginBottom: '1.25rem' },
  h1:         { fontSize: '1.25rem', fontWeight: 600 },
  cards:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' },
  card:       { background: '#fff', borderRadius: 8, padding: '1rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.06)', borderLeft: '3px solid #e5e7eb' },
  cardActive: { borderLeftColor: '#6366f1', background: '#f5f5ff' },
  cardTitle:  { fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 },
  cardDesc:   { fontSize: '0.76rem', color: '#6b7280' },
  controls:   { display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' },
  sel:        { padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.85rem' },
  btn:        { padding: '0.35rem 0.9rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  btnGhost:   { padding: '0.35rem 0.9rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  count:      { color: '#9ca3af', fontSize: '0.78rem', marginLeft: 'auto' },
  tableWrap:  { overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th:         { textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap', textTransform: 'capitalize' },
  td:         { padding: '0.4rem 0.75rem', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' },
  muted:      { color: '#9ca3af', fontSize: '0.85rem' },
}
