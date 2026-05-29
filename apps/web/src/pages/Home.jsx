import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../api'
import { C, fmt, fmtM, ICON, FONT, R, SHADOW, EASE, T } from '../styles'
import { Spinner, Empty, Skeleton, StatCard, Input } from '../components/UI'

export default function Home() {
  const [dash, setDash] = useState(null)
  const [props, setProps] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [view, setView] = useState('grid')
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(timerRef.current)
  }, [search])

  useEffect(() => {
    Promise.all([
      get('/dashboard').catch(() => null),
      get('/properties').catch(() => []),
    ]).then(([d, p]) => { setDash(d); setProps(p); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={80} style={{ borderRadius: R.md }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {[1,2,3,4].map(i => <Skeleton key={i} height={240} style={{ borderRadius: R.md }} />)}
      </div>
    </div>
  )

  const filtered = !debouncedSearch ? props : props.filter(p =>
    [p.name, p.address, p.suburb].some(f => f?.toLowerCase().includes(debouncedSearch.toLowerCase()))
  )

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, fontFamily: FONT }}>
      {dash && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <StatCard label="Total Portfolio Value" value={fmtM(dash.totalPortfolioValue || 0)} accent={C.green} />
          <StatCard label="Total Purchase" value={fmtM(dash.totalPurchaseValue || 0)} />
          <StatCard label="Bond Exposure" value={fmtM(dash.totalBondExposure || 0)} accent={C.warn} />
          <StatCard label="Monthly Bond Payments" value={fmt(dash.monthlyBondPayments || 0)} sub="per month" />
          <StatCard label="Net Yield" value={`${dash.netYield || '0.0'}%`} accent={C.green} />
          <StatCard label="Properties" value={String(dash.propertiesOwned || props.length)} sub={`${dash.totalUnits || 0} units`} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: C.text, fontWeight: 600 }}>Portfolio</h2>
          {search && (
            <span style={{ fontSize: T.xs, color: C.muted, background: C.bg, padding: '0.2rem 0.5rem', borderRadius: R.sm }}>
              {filtered.length} of {props.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input value={search} onChange={setSearch} placeholder="Search properties…" style={{ width: 220 }} />
          <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
            style={{
              padding: '0.4rem 0.75rem', borderRadius: R.md,
              border: `1px solid ${C.border}`, background: C.card,
              cursor: 'pointer', fontSize: T.sm, color: C.text,
              transition: `background ${EASE}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.bg }}
            onMouseLeave={e => { e.currentTarget.style.background = C.card }}>
            {view === 'grid' ? '☰ List' : '⊞ Grid'}
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <Empty
          icon={search ? '🔍' : '🏘'}
          msg={search ? `No properties match "${search}". Try a different search term.` : 'No properties found.'}
        />
      )}

      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map(p => (
            <Link key={p.id} to={`/property/${p.id}`}
              style={{
                background: C.card, borderRadius: R.md,
                border: `1px solid ${C.border}`,
                overflow: 'hidden', textDecoration: 'none', color: 'inherit',
                boxShadow: SHADOW.sm, transition: `transform ${EASE}, box-shadow ${EASE}`,
                display: 'block',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = SHADOW.md }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW.sm }}>
              <div style={{ height: 160, background: `#e2e8f0 url(${ICON}) center/40px no-repeat`, position: 'relative' }}>
                <span style={{
                  position: 'absolute', bottom: 8, left: 8,
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  background: C.navy + 'cc', color: C.white,
                  padding: '0.15rem 0.5rem', borderRadius: R.sm,
                }}>{p.scheme_name || 'Property'}</span>
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: 15, fontWeight: 600 }}>{p.name}</h3>
                <p style={{ margin: '0 0 0.5rem', fontSize: T.xs, color: C.muted }}>{p.address || 'No address'}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: T.xs, color: C.text, flexWrap: 'wrap' }}>
                  {p.purchase_price ? <span style={{ fontWeight: 600 }}>{fmt(p.purchase_price)}</span> : null}
                  <span style={{ color: C.muted }}>{(dash?.totalUnits || 0) > 0 ? `${p.unit_count || 1} unit${(p.unit_count || 1) > 1 ? 's' : ''}` : ''}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 60px', gap: 8,
            padding: '0.5rem 1rem', fontWeight: 600, fontSize: T.xs, color: C.muted,
            textTransform: 'uppercase', borderBottom: `2px solid ${C.border}`,
          }}>
            <span>Name</span><span>Scheme</span><span>Address</span><span>Units</span><span>Purchase</span><span />
          </div>
          {filtered.map(p => (
            <Link key={p.id} to={`/property/${p.id}`}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 60px', gap: 8,
                padding: '0.6rem 1rem', textDecoration: 'none', color: 'inherit',
                fontSize: T.sm, borderRadius: R.sm, background: '#f9fafb',
                alignItems: 'center', transition: `background ${EASE}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb' }}>
              <span style={{ fontWeight: 500 }}>{p.name}</span>
              <span style={{ color: C.muted }}>{p.scheme_name || '—'}</span>
              <span style={{ color: C.muted }}>{p.address || '—'}</span>
              <span>{p.unit_count || 1}</span>
              <span>{p.purchase_price ? fmt(p.purchase_price) : '—'}</span>
              <img src={ICON} style={{ width: 20, height: 20, justifySelf: 'center' }} alt="" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
