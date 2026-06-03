import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../api'
import { fmt, FONT } from '../styles'
import { Skeleton, Empty } from '../components/UI'
import { usePageTitle } from '../PageTitleContext'

const PROPERTY_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669']

const BANNER_PH  = '/images/banner-placeholder.png'
const CARD_PH    = '/images/card-placeholder.png'
const R2_ASSETS  = 'https://pub-f1adfe5768d547be912ee54c35b33163.r2.dev'
const R2_IMAGES  = 'https://pub-d66179a93f094dd788fadc511338b676.r2.dev'
const R2_GALLERY = 'https://pub-d973b33a485c4c33b4da9c059732fda8.r2.dev'

function propBanner(id) { return `${R2_IMAGES}/${id}/banner.jpg` }
function propThumb(id)  { return `${R2_ASSETS}/thumbnails/${id}/thumb.jpg` }
function galleryImg(pid, f) { return `${R2_GALLERY}/${pid}/gallery/${f}` }

/* ── Fallback image ────────────────────────────────────────────── */
function Img({ src, fallback, alt, style, ...rest }) {
  const [err, setErr] = useState(false)
  return <img src={err ? fallback : src} alt={alt} style={style} onError={() => setErr(true)} {...rest} />
}

/* ── Stat pill ─────────────────────────────────────────────────── */
function StatPill({ label, value, color }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: color || '#0d1117', letterSpacing: '-0.2px' }}>{value}</div>
    </div>
  )
}

/* ── Info row ──────────────────────────────────────────────────── */
function InfoRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 12, color: '#9ca3af', minWidth: 150, fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#111827', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

/* ── Image gallery lightbox ────────────────────────────────────── */
function Gallery({ propertyId, images, onClose }) {
  const [active, setActive] = useState(0)
  const total = images.length

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setActive(a => (a + 1) % total)
      if (e.key === 'ArrowLeft') setActive(a => (a - 1 + total) % total)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [total, onClose])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 400,
      display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Gallery</span>
        <span style={{ color: '#9ca3af', fontSize: 12, marginLeft: 10 }}>{active + 1} / {total}</span>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 8, border: 'none',
          background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>

      {/* Main image */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', minHeight: 0 }}>
        <button onClick={() => setActive(a => (a - 1 + total) % total)} style={{
          position: 'absolute', left: 16, width: 44, height: 44, borderRadius: '50%',
          border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff',
          fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
           onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>‹</button>

        <img
          key={active}
          src={galleryImg(propertyId, images[active])}
          alt={`Property image ${active + 1}`}
          onError={e => { e.target.src = CARD_PH }}
          style={{
            maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
            borderRadius: 10, animation: 'fadeIn 0.18s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        />

        <button onClick={() => setActive(a => (a + 1) % total)} style={{
          position: 'absolute', right: 16, width: 44, height: 44, borderRadius: '50%',
          border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff',
          fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
           onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>›</button>
      </div>

      {/* Thumbnails */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 20px', overflowX: 'auto', flexShrink: 0, justifyContent: 'center' }}>
        {images.map((img, i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            width: 64, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
            border: i === active ? '2px solid #2563eb' : '2px solid transparent',
            cursor: 'pointer', opacity: i === active ? 1 : 0.55,
            transition: 'all 0.15s',
          }}>
            <img src={galleryImg(propertyId, img)} alt="" onError={e => { e.target.src = CARD_PH }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Property card ─────────────────────────────────────────────── */
function PropertyCard({ p, index, isSelected, onClick }) {
  const color = PROPERTY_COLORS[index % PROPERTY_COLORS.length]

  return (
    <div
      onClick={() => onClick(p)}
      style={{
        background: '#fff', borderRadius: 12,
        border: isSelected ? `2px solid ${color}` : '1px solid #e5e7eb',
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: isSelected ? `0 0 0 3px ${color}20` : '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.2s ease',
        animation: `fadeIn 0.3s ease-out ${index * 60}ms both`,
      }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)' } }}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' } }}
    >
      {/* Property image / banner */}
      <div style={{ height: 140, position: 'relative', overflow: 'hidden', background: '#f3f4f6' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, zIndex: 2 }} />
        <Img
          src={propThumb(p.id)}
          fallback={CARD_PH}
          alt={p.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
        }} />
        {/* Scheme badge */}
        <div style={{
          position: 'absolute', bottom: 8, left: 10, zIndex: 2,
          fontSize: 9, fontWeight: 700, color: '#fff',
          background: `${color}cc`, padding: '2px 8px', borderRadius: 20,
          textTransform: 'uppercase', letterSpacing: '0.5px',
          backdropFilter: 'blur(4px)',
        }}>{p.scheme_name || 'Property'}</div>
        {isSelected && (
          <div style={{
            position: 'absolute', top: 10, right: 10, zIndex: 2,
            width: 22, height: 22, borderRadius: '50%',
            background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}>✓</div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px 14px' }}>
        <h3 style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: '#0d1117' }}>{p.name}</h3>
        <p style={{ margin: '0 0 10px', fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{p.address || 'No address on record'}</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {p.purchase_price ? (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#f0fdf4', padding: '2px 7px', borderRadius: 5, border: '1px solid #bbf7d0' }}>
              {fmt(p.purchase_price)}
            </span>
          ) : null}
          <span style={{ fontSize: 11, color: '#6b7280', background: '#f9fafb', padding: '2px 7px', borderRadius: 5, border: '1px solid #e5e7eb' }}>
            {p.unit_count || 1} unit{(p.unit_count || 1) > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Slide panel ───────────────────────────────────────────────── */
function PropertyPanel({ property, detail, loading, onClose, onOpenFull, color, index }) {
  const d = detail?.details || {}
  const bonds = detail?.bonds || []
  const policies = detail?.insurance_policies || []
  // Placeholder gallery filenames — real ones come from R2 later
  const galleryImages = detail?.gallery_images || []
  const [showGallery, setShowGallery] = useState(false)

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)',
        zIndex: 200, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease',
      }} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 460,
        background: '#fff', zIndex: 201,
        boxShadow: '-8px 0 48px rgba(0,0,0,0.16)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.28s cubic-bezier(0.22,1,0.36,1)',
        overflow: 'hidden',
      }}>

        {/* Banner image */}
        <div style={{ height: 180, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <Img
            src={propBanner(property.id)}
            fallback={BANNER_PH}
            alt={property.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
          }} />
          {/* Top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />
          {/* Close btn */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
          {/* Gallery button — show if images available or always as placeholder */}
          <button onClick={() => setShowGallery(true)} style={{
            position: 'absolute', top: 12, left: 12,
            height: 28, padding: '0 10px', borderRadius: 6, border: 'none',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span>🖼</span> Gallery {galleryImages.length > 0 ? `(${galleryImages.length})` : ''}
          </button>
          {/* Property name overlay */}
          <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {property.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {property.address}
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[80,60,120,80].map((h,i) => <Skeleton key={i} height={h} style={{ borderRadius: 8 }} />)}
            </div>
          ) : (
            <>
              {/* Stat pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <StatPill label="Market Value" value={fmt(d.current_market_value || 0)} color="#059669" />
                <StatPill label="Purchase Price" value={fmt(d.purchase_price || 0)} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <StatPill label="Size" value={d.size_sqm ? `${d.size_sqm} m²` : '—'} />
                <StatPill label="Bedrooms" value={d.bedrooms || '—'} />
                <StatPill label="Bathrooms" value={d.bathrooms || '—'} />
                <StatPill label="Parking" value={d.parking_bays || '—'} />
              </div>

              {/* Overview */}
              <Section title="Overview">
                <InfoRow label="Scheme" value={property.scheme_name} />
                <InfoRow label="Suburb" value={d.suburb} />
                <InfoRow label="Owner" value={d.owner_name} />
                <InfoRow label="Managing Agent" value={d.managing_agent_name} />
                <InfoRow label="Municipality" value={d.municipality_name} />
                <InfoRow label="Tenant" value={d.tenant_name} />
              </Section>

              {/* Bond */}
              {bonds.length > 0 && (
                <Section title="Bond">
                  {bonds.map(b => (
                    <div key={b.id}>
                      <InfoRow label="Bank" value={b.bank} />
                      <InfoRow label="Account" value={b.account_number} />
                      <InfoRow label="Monthly Payment" value={b.monthly_payment ? fmt(b.monthly_payment) : '—'} />
                    </div>
                  ))}
                </Section>
              )}

              {/* Insurance */}
              {policies.length > 0 && (
                <Section title="Insurance">
                  {policies.map(pol => (
                    <div key={pol.id}>
                      <InfoRow label="Insurer" value={pol.insurer} />
                      <InfoRow label="Policy #" value={pol.policy_number} />
                      <InfoRow label="Renewal" value={pol.renewal_date} />
                    </div>
                  ))}
                </Section>
              )}

              {/* Gallery preview strip */}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                  Gallery
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {galleryImages.length > 0 ? galleryImages.slice(0, 6).map((img, i) => (
                    <div key={i} onClick={() => setShowGallery(true)} style={{
                      width: 80, height: 60, borderRadius: 8, overflow: 'hidden',
                      flexShrink: 0, cursor: 'pointer', border: '1px solid #e5e7eb',
                    }}>
                      <img src={galleryImg(property.id, img)} alt="" onError={e => { e.target.src = CARD_PH }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )) : (
                    /* Placeholder strip */
                    [0,1,2].map(i => (
                      <div key={i} onClick={() => setShowGallery(true)} style={{
                        width: 80, height: 60, borderRadius: 8, overflow: 'hidden',
                        flexShrink: 0, cursor: 'pointer', border: '1px solid #e5e7eb',
                        background: '#f9fafb', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#d1d5db', fontSize: 20,
                      }}>🏠</div>
                    ))
                  )}
                  <div onClick={() => setShowGallery(true)} style={{
                    width: 80, height: 60, borderRadius: 8, flexShrink: 0,
                    border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#9ca3af',
                    fontSize: 11, fontWeight: 600, flexDirection: 'column', gap: 3,
                  }}>
                    <span style={{ fontSize: 18 }}>+</span>
                    <span>View All</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', flexShrink: 0, background: '#fafafa', display: 'flex', gap: 8 }}>
          <button onClick={onOpenFull} style={{
            flex: 1, height: 40, borderRadius: 8, border: 'none',
            background: color, color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Full Property Details →
          </button>
          <button onClick={onClose} style={{
            height: 40, padding: '0 16px', borderRadius: 8,
            border: '1px solid #e5e7eb', background: '#fff',
            fontSize: 13, color: '#6b7280', cursor: 'pointer',
          }}>Close</button>
        </div>
      </div>

      {/* Gallery lightbox */}
      {showGallery && (
        <Gallery
          propertyId={property.id}
          images={galleryImages.length > 0 ? galleryImages : ['placeholder']}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{title}</div>
      <div style={{ background: '#f9fafb', borderRadius: 10, padding: '4px 12px', border: '1px solid #f3f4f6' }}>{children}</div>
    </div>
  )
}

/* ── Main ──────────────────────────────────────────────────────── */
export default function Home() {
  const { setPageTitle, setPageSubtitle } = usePageTitle()
  const navigate = useNavigate()
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setPageTitle('Portfolio')
    setPageSubtitle('Overview of all managed properties')
  }, [])

  useEffect(() => {
    get('/properties').then(setProps).catch(() => []).finally(() => setLoading(false))
  }, [])

  const handleCardClick = useCallback(async (p) => {
    if (selected?.id === p.id) { setSelected(null); setDetail(null); return }
    setSelected(p)
    setDetail(null)
    setDetailLoading(true)
    try { setDetail(await get(`/properties/${p.id}`)) } catch { setDetail(null) }
    setDetailLoading(false)
  }, [selected])

  const handleClose = () => { setSelected(null); setDetail(null) }
  const handleOpenFull = () => { if (selected) navigate(`/property/${selected.id}`) }
  const selectedIndex = selected ? props.findIndex(p => p.id === selected.id) : 0
  const color = PROPERTY_COLORS[selectedIndex % PROPERTY_COLORS.length]

  if (loading) return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} height={260} style={{ borderRadius: 12 }} />)}
      </div>
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1300, fontFamily: FONT }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0d1117', letterSpacing: '-0.4px', marginBottom: 4 }}>Property Portfolio</h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          {props.length} propert{props.length === 1 ? 'y' : 'ies'} under management · click a property to preview
        </p>
      </div>

      {props.length === 0 && <Empty msg="No properties found." />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {props.map((p, i) => (
          <PropertyCard key={p.id} p={p} index={i} isSelected={selected?.id === p.id} onClick={handleCardClick} />
        ))}
      </div>

      {selected && (
        <PropertyPanel
          property={selected} detail={detail} loading={detailLoading}
          onClose={handleClose} onOpenFull={handleOpenFull}
          color={color} index={selectedIndex}
        />
      )}
    </div>
  )
}
