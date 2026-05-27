import { useEffect, useState } from 'react'
import { api } from '../../api'

type Source = 'rental_ledger' | 'levy_ledger' | 'municipality_ledger' | 'bank_ledger'

const SOURCES: { key: Source; label: string }[] = [
  { key: 'rental_ledger',       label: 'Rental' },
  { key: 'levy_ledger',         label: 'Levy' },
  { key: 'municipality_ledger', label: 'Municipality' },
  { key: 'bank_ledger',         label: 'Bank' },
]

export default function Finance() {
  const [properties, setProperties] = useState<any[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [source, setSource] = useState<Source>('rental_ledger')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.properties.list().then(data => {
      setProperties(data)
      if (data.length) setPropertyId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!propertyId) return
    setLoading(true)
    api.ledger.list(source, propertyId).then(data => { setEntries(data); setLoading(false) })
  }, [propertyId, source])

  const totalDebit  = entries.reduce((s, e) => s + Number(e.debit),  0)
  const totalCredit = entries.reduce((s, e) => s + Number(e.credit), 0)

  return (
    <div>
      <div style={s.toolbar}>
        <h1 style={s.h1}>Finance</h1>
        <div style={s.controls}>
          <select style={s.sel} value={propertyId} onChange={e => setPropertyId(e.target.value)}>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div style={s.tabs}>
            {SOURCES.map(src => (
              <button
                key={src.key}
                style={{ ...s.tab, ...(source === src.key ? s.tabActive : {}) }}
                onClick={() => setSource(src.key)}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={s.summary}>
        <Chip label="Debits"  value={totalDebit}  color="#ef4444" />
        <Chip label="Credits" value={totalCredit} color="#22c55e" />
        <Chip label="Net"     value={totalCredit - totalDebit} color="#6366f1" />
        <span style={s.count}>{entries.length} rows</span>
      </div>

      {loading
        ? <p style={s.muted}>Loading…</p>
        : entries.length === 0
          ? <p style={s.muted}>No entries found.</p>
          : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>{['Date','Description','Reference','Debit','Credit','Balance'].map(h =>
                    <th key={h} style={s.th}>{h}</th>
                  )}</tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id}>
                      <td style={s.td}>{e.date}</td>
                      <td style={s.td}>{e.description}</td>
                      <td style={s.td}>{e.reference ?? '—'}</td>
                      <td style={{ ...s.td, ...s.num, color: '#ef4444' }}>{e.debit  ? fmt(e.debit)  : ''}</td>
                      <td style={{ ...s.td, ...s.num, color: '#22c55e' }}>{e.credit ? fmt(e.credit) : ''}</td>
                      <td style={{ ...s.td, ...s.num }}>{fmt(e.balance)}</td>
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

function Chip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={s.chip}>
      <span style={s.chipLabel}>{label}</span>
      <span style={{ ...s.chipVal, color }}>{fmt(value)}</span>
    </div>
  )
}

const fmt = (v: number | string) =>
  'R\u00a0' + Number(v).toLocaleString('en-ZA', { minimumFractionDigits: 2 })

const s: Record<string, React.CSSProperties> = {
  toolbar:   { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' },
  h1:        { fontSize: '1.25rem', fontWeight: 600, marginRight: 'auto' },
  controls:  { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  sel:       { padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.85rem' },
  tabs:      { display: 'flex', gap: 2 },
  tab:       { padding: '0.35rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: '0.82rem' },
  tabActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },
  summary:   { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' },
  chip:      { background: '#fff', borderRadius: 6, padding: '0.4rem 0.75rem', boxShadow: '0 1px 2px rgba(0,0,0,.06)', fontSize: '0.82rem' },
  chipLabel: { color: '#6b7280', marginRight: 6 },
  chipVal:   { fontWeight: 600 },
  count:     { color: '#9ca3af', fontSize: '0.78rem', marginLeft: 'auto' },
  tableWrap: { overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th:        { textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' },
  td:        { padding: '0.4rem 0.75rem', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' },
  num:       { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  muted:     { color: '#9ca3af', fontSize: '0.85rem' },
}
