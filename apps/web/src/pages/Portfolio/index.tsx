import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function Portfolio() {
  const [props, setProps] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.properties.list().then(data => { setProps(data); setLoading(false) })
  }, [])

  if (loading) return <p style={s.muted}>Loading…</p>

  return (
    <div style={s.layout}>
      <div style={s.list}>
        <h1 style={s.h1}>Portfolio</h1>
        {props.length === 0 && <p style={s.muted}>No properties found.</p>}
        {props.map(p => (
          <div
            key={p.id}
            style={{ ...s.card, borderLeft: `3px solid ${selected?.id === p.id ? '#6366f1' : '#e5e7eb'}` }}
            onClick={() => setSelected(p)}
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

function PropertyDetail({ property: p }: { property: any }) {
  const [units, setUnits] = useState<any[]>([])

  useEffect(() => {
    api.properties.units(p.id).then(data => setUnits(data))
  }, [p.id])

  return (
    <div>
      <h2 style={s.h2}>{p.name}</h2>
      <dl style={s.dl}>
        <Row label="Address"     value={p.address} />
        <Row label="Scheme"      value={p.scheme_name ?? '—'} />
        <Row label="Units"       value={String(p.unit_count)} />
        <Row label="Created"     value={new Date(p.created_at).toLocaleDateString('en-ZA')} />
      </dl>

      <h3 style={s.h3}>Units</h3>
      {units.length === 0
        ? <p style={s.muted}>No units captured.</p>
        : (
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
        )
      }
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={s.dt}>{label}</dt>
      <dd style={s.dd}>{value}</dd>
    </>
  )
}

const s: Record<string, React.CSSProperties> = {
  layout:    { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', height: '100%' },
  list:      { overflowY: 'auto' },
  h1:        { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' },
  h2:        { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' },
  h3:        { fontSize: '0.95rem', fontWeight: 600, margin: '1.25rem 0 0.5rem' },
  card:      { background: '#fff', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '0.5rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.06)' },
  cardTitle: { fontWeight: 600, fontSize: '0.9rem' },
  cardSub:   { fontSize: '0.78rem', color: '#6b7280', marginTop: 2 },
  badge:     { fontSize: '0.72rem', color: '#6366f1', marginTop: 4 },
  detail:    { background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflowY: 'auto' },
  dl:        { display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '0.4rem', fontSize: '0.85rem' },
  dt:        { color: '#6b7280', fontWeight: 500 },
  dd:        { margin: 0 },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th:        { textAlign: 'left', padding: '0.4rem 0.6rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 500 },
  td:        { padding: '0.4rem 0.6rem', borderBottom: '1px solid #f3f4f6' },
  muted:     { color: '#9ca3af', fontSize: '0.85rem' },
}
