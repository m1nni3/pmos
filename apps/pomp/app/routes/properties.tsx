import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  ArrowLeft, MapPin, Edit3, Save, X, ChevronRight, FileText,
  Users, ExternalLink, Users as UsersIcon,
} from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'
import { useCache } from '../lib/cache'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
import {
  PROPERTY_DETAIL_TABS,
  PROPERTY_SECTIONS,
  EDIT_SECTION_ORDER,
} from '../lib/propertySections'
import { TAB_CONTACT_FILTERS, type PropertyDetailTab, type DetailTab, type Contact, type Document, type PropertyDetail, type Bond } from '../types'
import { ContactCard, DefinitionList } from '../components'

type Tab = PropertyDetailTab

interface PropColor { from: string; to: string; hex: string }
const DEFAULT_COLOR: PropColor = { from: 'from-gray-600', to: 'to-gray-800', hex: '#6b7280' }

const SCHEME_MAP: Record<string, { agent: string; province: string }> = {
  Oakdale:  { agent: 'Trafalgar',     province: 'Western Cape' },
  Malindi:  { agent: 'Kemprent',      province: 'Gauteng'      },
  Indaba:   { agent: 'HuurKor Admin', province: 'Gauteng'      },
  Villeroy: { agent: 'Trafalgar',     province: 'Gauteng'      },
}

const PROP_COLORS: Record<string, PropColor> = {
  Oakdale:  { from: 'from-blue-600',    to: 'to-blue-800',    hex: '#2563eb' },
  Malindi:  { from: 'from-emerald-600', to: 'to-emerald-800', hex: '#059669' },
  Indaba:   { from: 'from-violet-600',  to: 'to-violet-800',  hex: '#7c3aed' },
  Villeroy: { from: 'from-orange-500',  to: 'to-orange-700',  hex: '#f97316' },
}

const R2_IMAGES  = 'https://pub-d66179a93f094dd788fadc511338b676.r2.dev'
const R2_GALLERY = 'https://pub-d973b33a485c4c33b4da9c059732fda8.r2.dev'
const propThumb  = (id: string) => `${R2_IMAGES}/${id}/thumb.jpg`
const propBanner = (id: string) => `${R2_IMAGES}/${id}/banner.jpg`
const galleryImg = (pid: string, f: string) => `${R2_GALLERY}/${pid}/gallery/${f}`

function propColor(name?: string | null): PropColor {
  return (name && PROP_COLORS[name]) || DEFAULT_COLOR
}

// ── Property card (grid view) ──────────────────────────────
function PropertyCard({ p, selected, onClick }: {
  p: { id: string; name: string; suburb?: string | null; address?: string | null; scheme_name?: string | null; current_market_value?: number | null; purchase_price?: number | null }
  selected: boolean
  onClick: () => void
}) {
  const c = propColor(p.name)
  const [imgErr, setImgErr] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`bg-white rounded-card overflow-hidden text-left transition-all duration-200
        hover:-translate-y-1 hover:shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)]
        ${selected ? 'ring-2 shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)]' : 'shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.07)]'}`}
      style={{ '--tw-ring-color': c.hex } as React.CSSProperties}
    >
      <div className="relative h-36 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${c.from} ${c.to}`} />
        {!imgErr && (
          <img src={propThumb(p.id)} alt={p.name} className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgErr(true)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: c.hex }} />
        {selected && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg" style={{ background: c.hex }}>✓</div>
        )}
        <div className="absolute bottom-2.5 left-3 right-3">
          <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{p.scheme_name || '—'}</p>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-heading font-bold text-pomp-navy text-sm mb-0.5">{p.name}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <MapPin size={10} aria-hidden /><span>{p.suburb || p.address || '—'}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="bg-gray-50 rounded px-2 py-1.5">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider">Value</p>
            <p className="font-bold text-gray-800 tabular-nums">{formatRand(p.current_market_value || 0)}</p>
          </div>
          <div className="bg-gray-50 rounded px-2 py-1.5">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider">Bought</p>
            <p className="font-bold text-gray-800 tabular-nums">{formatRand(p.purchase_price || 0)}</p>
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Gallery (lightbox) ─────────────────────────────────────
function Gallery({ propId, images, onClose }: { propId: string; images: string[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const total = images.length
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])
  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowRight')  next()
      if (e.key === 'ArrowLeft')   prev()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, next, prev])

  return (
    <div className="fixed inset-0 bg-black/92 z-[500] flex flex-col" onClick={onClose} role="dialog" aria-label="Property gallery">
      <div className="flex items-center px-5 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white text-sm font-semibold">Gallery</span>
        <span className="text-gray-400 text-xs ml-2">{idx + 1} / {total}</span>
        <div className="flex-1" />
        <button type="button" onClick={onClose} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors" aria-label="Close gallery">×</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-14 relative min-h-0" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={prev} className="absolute left-4 w-11 h-11 rounded-full bg-white/12 hover:bg-white/22 text-white text-2xl flex items-center justify-center transition-colors" aria-label="Previous image">‹</button>
        <img key={idx} src={galleryImg(propId, images[idx])} alt={`Image ${idx + 1} of ${total}`} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
        <button type="button" onClick={next} className="absolute right-4 w-11 h-11 rounded-full bg-white/12 hover:bg-white/22 text-white text-2xl flex items-center justify-center transition-colors" aria-label="Next image">›</button>
      </div>
      <div className="flex gap-2 px-5 py-3 overflow-x-auto shrink-0 justify-center" onClick={e => e.stopPropagation()}>
        {images.map((img, i) => (
          <button type="button" key={i} onClick={() => setIdx(i)} aria-label={`Go to image ${i + 1}`}
            className={`w-16 h-12 rounded-md overflow-hidden shrink-0 cursor-pointer transition-all ${i === idx ? 'ring-2 ring-pomp-blue opacity-100' : 'opacity-50 hover:opacity-75'}`}>
            <img src={galleryImg(propId, img)} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Quick-view slide panel ─────────────────────────────────
function SlidePanel({ p, detail, loading, onClose, onNavigate }: {
  p: { id: string; name: string; address?: string | null; scheme_name?: string | null }
  detail: PropertyDetail | null
  loading: boolean
  onClose: () => void
  onNavigate: () => void
}) {
  const c = propColor(p.name)
  const [imgErr, setImgErr] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const gallery: string[] = detail?.gallery_images || []
  const d = detail ?? {} as PropertyDetail

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-[200] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[201] flex flex-col shadow-[−8px_0_48px_rgba(0,0,0,.18)]"
        style={{ animation: 'slideInRight 0.26s cubic-bezier(0.22,1,0.36,1)' }}
        role="dialog" aria-label={`${p.name} quick view`}>
        <div className="relative h-48 shrink-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${c.from} ${c.to}`} />
          {!imgErr && (
            <img src={propBanner(p.id)} alt={p.name} className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgErr(true)} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: c.hex }} />
          <button type="button" onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors text-lg" aria-label="Close panel">×</button>
          {gallery.length > 0 && (
            <button type="button" onClick={() => setShowGallery(true)} className="absolute top-3 left-3 h-7 px-2.5 rounded-md bg-black/30 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1 hover:bg-black/50 transition-colors">
              🖼 Gallery ({gallery.length})
            </button>
          )}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-white font-heading font-bold text-lg leading-tight">{p.name}</h2>
            <p className="text-white/70 text-xs mt-0.5">{p.address || d.suburb || '—'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {[80, 60, 100, 80].map((h, i) => <div key={i} className="skeleton rounded-lg" style={{ height: h }} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Market Value', value: formatRand(d.current_market_value || 0), color: 'text-green-600' },
                  { label: 'Purchase Price', value: formatRand(d.purchase_price || 0), color: 'text-pomp-navy' },
                  { label: 'Size', value: d.size_sqm ? `${d.size_sqm} m²` : '—', color: 'text-pomp-navy' },
                  { label: 'Bedrooms', value: d.bedrooms || '—', color: 'text-pomp-navy' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className={`font-bold text-sm mt-0.5 tabular-nums ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Overview</p>
                <div className="bg-gray-50 rounded-lg px-3 py-1 border border-gray-100 divide-y divide-gray-100">
                  <DefinitionList rows={[
                    { label: 'Scheme',         value: d.scheme_name || p.scheme_name },
                    { label: 'Suburb',         value: d.suburb },
                    { label: 'Owner',          value: d.owner_name },
                    { label: 'Managing Agent', value: d.managing_agent_name },
                    { label: 'Municipality',   value: d.municipality_name },
                    { label: 'Tenant',         value: d.tenant_name },
                    { label: 'BC',             value: d.bc_name },
                  ]} />
                </div>
              </div>

              {detail && detail.bonds && detail.bonds.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bond</p>
                  <div className="bg-gray-50 rounded-lg px-3 py-1 border border-gray-100">
                    {detail.bonds.map(b => (
                      <DefinitionList key={b.id} rows={[
                        { label: 'Bank',    value: b.bank },
                        { label: 'Monthly', value: b.monthly_payment ? formatRand(b.monthly_payment) : null },
                      ]} />
                    ))}
                  </div>
                </div>
              )}

              {gallery.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Gallery</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {gallery.slice(0, 5).map((img, i) => (
                      <button type="button" key={i} onClick={() => setShowGallery(true)} aria-label={`Open image ${i + 1}`}
                        className="w-20 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border border-gray-200 hover:opacity-80 transition-opacity">
                        <img src={galleryImg(p.id, img)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button type="button" onClick={() => setShowGallery(true)} aria-label="View all gallery images"
                      className="w-20 h-14 rounded-lg border-2 border-dashed border-gray-200 shrink-0 cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:border-pomp-blue hover:text-pomp-blue transition-colors text-xs font-medium">
                      <span className="text-lg leading-none">+</span>All
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
          <button type="button" onClick={onNavigate}
            className="flex-1 h-10 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
            style={{ background: c.hex }}>
            Full Property Details <ChevronRight size={14} aria-hidden />
          </button>
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>

      {showGallery && gallery.length > 0 && (
        <Gallery propId={p.id} images={gallery} onClose={() => setShowGallery(false)} />
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ── Tab content ────────────────────────────────────────────
function TabContent({ tab, detail, propContacts, propId, onViewAll }: {
  tab: Tab
  detail: PropertyDetail | null
  propContacts: Contact[]
  propId: string | null
  onViewAll: () => void
}) {
  const filterFn = TAB_CONTACT_FILTERS[tab]
  const tabContacts = useMemo(
    () => (filterFn && propContacts.length > 0 ? propContacts.filter(c => filterFn(c.subcategory || '')) : []),
    [filterFn, propContacts],
  )

  if (tab === 'Documents') {
    return <DocumentsTab detail={detail} />
  }

  const fields = PROPERTY_SECTIONS[tab as DetailTab]

  return (
    <div className="space-y-3">
      <div className="card-flush">
        <div className="card-header">
          <h4 className="text-sm font-semibold text-pomp-navy">{tab}</h4>
        </div>
        <div className="card-body">
          <DefinitionList
            rows={fields.map(f => {
              const v = detail?.[f.key]
              if (v == null || v === '') return null
              const display = f.format === 'currency' && typeof v === 'number' ? formatRand(v) : String(v)
              return { label: f.label, value: display }
            })}
          />
        </div>
      </div>
      {tabContacts.length > 0 && (
        <div className="card-flush">
          <div className="card-header">
            <h4 className="text-sm font-semibold text-pomp-navy flex items-center gap-1.5">
              <Users size={14} aria-hidden /> {tab} Contacts
              <span className="text-[10px] text-gray-400 font-normal">({tabContacts.length})</span>
            </h4>
            <button type="button" onClick={onViewAll}
              className="text-[11px] text-pomp-blue hover:underline flex items-center gap-0.5">
              View all <ExternalLink size={10} aria-hidden />
            </button>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tabContacts.map(c => (
                <ContactCard
                  key={c.id}
                  contact={c}
                  variant="mini"
                  onClick={onViewAll}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DocumentsTab({ detail }: { detail: { id: string } | null }) {
  const [docs, setDocs] = useState<Document[]>([])

  useEffect(() => {
    if (!detail?.id) return
    apiClient.get<Document[]>(`/documents?property_id=${detail.id}`).then(d => setDocs(d ?? [])).catch(() => setDocs([]))
  }, [detail?.id])

  return (
    <div className="card-flush">
      <div className="card-header">
        <h4 className="text-sm font-semibold text-pomp-navy">Documents</h4>
        <span className="text-xs text-gray-400">{docs.length} files</span>
      </div>
      <div className="card-body">
        {docs.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No documents for this property.</p>
        ) : (
          <ul className="divide-y divide-gray-100" role="list">
            {docs.map((d: Document) => (
              <li key={d.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-gray-400 shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-medium text-pomp-navy truncate">{d.name}</p>
                    <p className="text-xs text-gray-400 truncate">{d.category}{d.expiry_date ? ` · Exp: ${d.expiry_date}` : ''}</p>
                  </div>
                </div>
                {d.file_url && (
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-pomp-blue hover:underline shrink-0">Open</a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Edit form (sectioned, collapsible) ─────────────────────
function EditForm({ editForm, setEditForm, saving, onSave }: {
  editForm: Record<string, any>
  setEditForm: React.Dispatch<React.SetStateAction<Record<string, any>>>
  saving: boolean
  onSave: () => void
}) {
  return (
    <div className="card-flush mb-3 border-2 border-pomp-blue/20">
      <div className="card-header">
        <h4 className="text-sm font-semibold text-pomp-navy">Edit Property Details</h4>
        <button type="button" onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
          <Save size={13} aria-hidden />{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
      <div className="card-body">
        <div className="max-h-[480px] overflow-y-auto pr-1 space-y-4">
          {EDIT_SECTION_ORDER.map(sectionKey => {
            const fields = PROPERTY_SECTIONS[sectionKey]
            return (
              <details key={sectionKey} open={sectionKey === 'Overview'} className="border border-gray-100 rounded-lg">
                <summary className="cursor-pointer text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 py-2 bg-gray-50 hover:bg-gray-100 select-none">
                  {sectionKey}
                </summary>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
                  {fields.map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-0.5">{f.label}</label>
                      <input
                        type={f.type || 'text'}
                        value={editForm[f.key] ?? ''}
                        onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-pomp-blue outline-none"
                      />
                    </div>
                  ))}
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function Properties() {
  const { properties: props } = useCache()
  const navigate = useNavigate()
  const [selected, setSelected]     = useState<{ id: string; name: string } | null>(null)
  const [detail,   setDetail]       = useState<PropertyDetail | null>(null)
  const [slideLoading, setLoading]  = useState(false)
  const [detailView, setDetailView] = useState(false)
  const [tab,      setTab]          = useState<Tab>('Overview')
  const [editing,  setEditing]      = useState(false)
  const [editForm, setEditForm]     = useState<Record<string, unknown>>({})
  const [saving,   setSaving]       = useState(false)
  const [propId,   setPropId]       = useState<string | null>(null)
  const [propContacts, setPropContacts] = useState<Contact[]>([])

  const handleCardClick = useCallback(async (p: { id: string; name: string }) => {
    if (selected?.id === p.id) { setSelected(null); setDetail(null); return }
    setSelected(p); setPropId(p.id); setDetail(null); setLoading(true)
    try { setDetail(await apiClient.get<PropertyDetail>(`/properties/${p.id}`)) } catch { setDetail(null) }
    setLoading(false)
  }, [selected])

  const closePanel = useCallback(() => { setSelected(null); setDetail(null) }, [])
  const closeDetailView = useCallback(() => { setDetailView(false); setDetail(null) }, [])

  const openDetailView = useCallback(() => {
    setDetailView(true)
    setSelected(null)
    setTab('Overview')
    setEditing(false)
  }, [])

  useEffect(() => {
    if (detailView && propId) {
      apiClient.get<Contact[]>(`/property-contacts?property_id=${propId}`).then(d => setPropContacts(d ?? [])).catch(() => setPropContacts([]))
    } else if (!detailView) {
      setPropContacts([])
    }
  }, [detailView, propId])

  const saveDetails = useCallback(async () => {
    if (!detail || !propId) return
    setSaving(true)
    try {
      await apiClient.put(`/properties/${propId}/details`, editForm)
      toast.success('Property details saved')
      setEditing(false)
      const updated = await apiClient.get<PropertyDetail>(`/properties/${propId}`)
      setDetail(updated)
      setEditForm((updated ?? {}) as Record<string, unknown>)
    } catch {
      toast.error('Failed to save property details')
    } finally {
      setSaving(false)
    }
  }, [detail, propId, editForm])

  const goToContacts = useCallback(() => {
    if (propId) navigate(`/contacts?property_id=${propId}`)
  }, [navigate, propId])

  const colors = propColor(detail?.name)
  const province = detail ? (SCHEME_MAP[detail.name]?.province || '') : ''

  if (!detailView) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0 mb-3">
          <h2 className="page-title">Properties</h2>
          <p className="page-sub">Enthuse Trust portfolio — {props.length} properties</p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {props.map(p => (
              <PropertyCard key={p.id} p={p} selected={selected?.id === p.id} onClick={() => handleCardClick(p)} />
            ))}
          </div>
          {selected && (
            <SlidePanel
              p={selected} detail={detail} loading={slideLoading}
              onClose={closePanel}
              onNavigate={openDetailView}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="shrink-0 mb-3">
        <button type="button" onClick={closeDetailView} className="flex items-center gap-1 text-sm text-pomp-blue hover:underline">
          <ArrowLeft size={14} aria-hidden /> All Properties
        </button>
      </div>

      <div className="shrink-0">
        <div className={`bg-gradient-to-r ${colors.from} ${colors.to} rounded-card p-5 mb-3`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-heading font-bold text-2xl">{detail?.name}</h2>
              <p className="text-white/70 text-sm mt-0.5">{detail?.address}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={12} className="text-white/60" aria-hidden />
                <span className="text-white/80 text-xs">{detail?.suburb || '—'}, {province}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={goToContacts}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <UsersIcon size={13} aria-hidden /> Contacts
              </button>
              <button type="button"
                onClick={() => { setEditing(prev => !prev); if (!editing) setEditForm((detail ?? {}) as Record<string, unknown>) }}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                {editing ? <><X size={13} aria-hidden /> Cancel</> : <><Edit3 size={13} aria-hidden /> Edit</>}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Market Value',   value: formatRand(detail?.current_market_value || 0) },
              { label: 'Purchase Price', value: formatRand(detail?.purchase_price || 0) },
              { label: 'Letting Agent',  value: detail?.managing_agent_name?.split(' ')[0] || SCHEME_MAP[detail?.name || '']?.agent || '—' },
              { label: 'Municipality',   value: detail?.municipality_name || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-lg px-3 py-2">
                <p className="text-white/60 text-xs">{label}</p>
                <p className="text-white font-semibold text-sm mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {editing && (
          <EditForm editForm={editForm} setEditForm={setEditForm} saving={saving} onSave={saveDetails} />
        )}
      </div>

      <div className="tab-bar shrink-0" role="tablist" aria-label="Property sections">
        {PROPERTY_DETAIL_TABS.map(t => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`tab-panel-${t}`}
            onClick={() => setTab(t)}
            className={`tab-item ${tab === t ? 'tab-item-active' : 'tab-item-inactive'}`}
          >{t}</button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto mt-3" id={`tab-panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {detail && (
          <TabContent
            tab={tab}
            detail={detail}
            propContacts={propContacts}
            propId={propId}
            onViewAll={goToContacts}
          />
        )}
      </div>
    </div>
  )
}
