import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'

type ViewMode = 'grid' | 'list'

export default function PropertyListing() {
  const [properties, setProperties] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>('grid')

  useEffect(() => { api.properties.list().then(setProperties).catch(console.error) }, [])

  const filtered = properties.filter(p =>
    !search || [p.name, p.city, p.address, p.type].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Properties</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.85rem' }}>{filtered.length} properties</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Search properties…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.85rem', width: 220 }} />
          <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
            {view === 'grid' ? '⊞ List' : '⊟ Grid'}
          </button>
        </div>
      </div>

      {filtered.length === 0 && <p style={{ color: '#9ca3af' }}>No properties found.</p>}

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map(p => (
            <Link key={p.id} to={`/portfolio/properties/${p.id}`} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ height: 160, background: `url(https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(p.name)}) center/cover` }} />
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{p.name}</h3>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: '#6b7280' }}>{p.address}, {p.city}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: '#374151' }}>
                  {p.purchase_price && <span>R {Number(p.purchase_price).toLocaleString()}</span>}
                  {p.type && <span>{p.type}</span>}
                  {p.status && <span style={{ color: p.status === 'Active' ? '#10b981' : '#f59e0b' }}>{p.status}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 8, padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>
            <span>Name</span><span>Location</span><span>Type</span><span>Purchase</span><span>Status</span>
          </div>
          {filtered.map(p => (
            <Link key={p.id} to={`/portfolio/properties/${p.id}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 8, padding: '0.6rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem', borderRadius: 6, background: '#f9fafb', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>{p.name}</span>
              <span style={{ color: '#6b7280' }}>{p.city}</span>
              <span>{p.type || '—'}</span>
              <span>{p.purchase_price ? `R ${Number(p.purchase_price).toLocaleString()}` : '—'}</span>
              <span style={{ color: p.status === 'Active' ? '#10b981' : '#6b7280' }}>{p.status || '—'}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
