import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Property } from '../../types/property'
import type { ReconciliationRecord, ReconciliationStatus } from '../../types/reconciliation'

const STATUS_COLORS: Record<ReconciliationStatus, string> = {
  matched:   '#22c55e',
  unmatched: '#f59e0b',
  exception: '#ef4444',
  pending:   '#6b7280',
}

export default function Reconciliation() {
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [filter, setFilter] = useState<ReconciliationStatus | 'all'>('all')
  const [records, setRecords] = useState<ReconciliationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<ReconciliationRecord | null>(null)

  useEffect(() => {
    supabase.from('properties').select('id,name').order('name').then(({ data }) => {
      const list = (data ?? []) as Property[]
      setProperties(list)
      if (list.length) setPropertyId(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!propertyId) return
    setLoading(true)
    let q = supabase.from('reconciliation').select('*').eq('property_id', propertyId).order('period', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => { setRecords((data ?? []) as ReconciliationRecord[]); setLoading(false) })
  }, [propertyId, filter])

  const counts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  async function saveNote(id: string, notes: string) {
    await supabase.from('reconciliation').update({ notes }).eq('id', id)
    setRecords(prev => prev.map(r => r.id === id ? { ...r, notes } : r))
    setEditing(null)
  }

  async function setStatus(id: string, status: ReconciliationStatus) {
    await supabase.from('reconciliation').update({ status }).eq('id', id)
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  return (
    <div>
      <div style={s.toolbar}>
        <h1 style={s.h1}>Reconciliation</h1>
        <select style={s.sel} value={propertyId} onChange={e => setPropertyId(e.target.value)}>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={s.summary}>
        {(['all', 'matched', 'unmatched', 'exception', 'pending'] as const).map(f => (
          <button
            key={f}
            style={{ ...s.pill, ...(filter === f ? s.pillActive : {}), ...(f !== 'all' ? { borderColor: STATUS_COLORS[f as ReconciliationStatus] } : {}) }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && counts[f] ? <span style={s.badge}>{counts[f]}</span> : null}
            {f === 'all' && <span style={s.badge}>{records.length}</span>}
          </button>
        ))}
      </div>

      {loading
        ? <p style={s.muted}>Loading…</p>
        : records.length === 0
          ? <p style={s.muted}>No records found.</p>
          : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>{['Period','Rental Amt','Bank Amt','Variance','Status','Notes',''].map(h =>
                    <th key={h} style={s.th}>{h}</th>
                  )}</tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td style={s.td}>{r.period}</td>
                      <td style={{ ...s.td, ...s.num }}>{fmt(r.rental_amount)}</td>
                      <td style={{ ...s.td, ...s.num }}>{fmt(r.bank_amount)}</td>
                      <td style={{ ...s.td, ...s.num, color: Number(r.variance) !== 0 ? '#ef4444' : '#22c55e' }}>
                        {fmt(r.variance)}
                      </td>
                      <td style={s.td}>
                        <select
                          style={{ ...s.sel, borderColor: STATUS_COLORS[r.status], color: STATUS_COLORS[r.status], fontSize: '0.78rem' }}
                          value={r.status}
                          onChange={e => setStatus(r.id, e.target.value as ReconciliationStatus)}
                        >
                          {(['matched','unmatched','exception','pending'] as ReconciliationStatus[]).map(st =>
                            <option key={st} value={st}>{st}</option>
                          )}
                        </select>
                      </td>
                      <td style={{ ...s.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {editing?.id === r.id
                          ? <NoteEditor record={r} onSave={saveNote} onCancel={() => setEditing(null)} />
                          : <span onClick={() => setEditing(r)} style={s.noteText}>{r.notes ?? <em style={s.muted}>add note</em>}</span>
                        }
                      </td>
                      <td style={s.td} />
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

function NoteEditor({ record, onSave, onCancel }: { record: ReconciliationRecord; onSave: (id: string, n: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState(record.notes ?? '')
  return (
    <span style={{ display: 'flex', gap: 4 }}>
      <input style={s.input} value={val} onChange={e => setVal(e.target.value)} autoFocus />
      <button style={s.btnSm} onClick={() => onSave(record.id, val)}>✓</button>
      <button style={s.btnSm} onClick={onCancel}>✕</button>
    </span>
  )
}

const fmt = (v: number | string | null | undefined) =>
  v == null ? '—' : 'R\u00a0' + Number(v).toLocaleString('en-ZA', { minimumFractionDigits: 2 })

const s: Record<string, React.CSSProperties> = {
  toolbar:   { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
  h1:        { fontSize: '1.25rem', fontWeight: 600, marginRight: 'auto' },
  sel:       { padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.85rem' },
  summary:   { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  pill:      { padding: '0.3rem 0.75rem', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 },
  pillActive:{ background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' },
  badge:     { background: '#e5e7eb', borderRadius: 10, padding: '0 5px', fontSize: '0.72rem', color: '#374151' },
  tableWrap: { overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th:        { textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' },
  td:        { padding: '0.4rem 0.75rem', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' },
  num:       { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  noteText:  { cursor: 'pointer', color: '#6b7280', fontSize: '0.8rem' },
  input:     { padding: '0.2rem 0.4rem', border: '1px solid #6366f1', borderRadius: 4, fontSize: '0.8rem', width: 140 },
  btnSm:     { padding: '0.15rem 0.4rem', border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', background: '#fff' },
  muted:     { color: '#9ca3af', fontSize: '0.85rem' },
}
