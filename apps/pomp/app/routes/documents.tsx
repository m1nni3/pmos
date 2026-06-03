import React, { useEffect, useState } from 'react'
import { Plus, Trash2, FileText, FolderOpen } from 'lucide-react'
import { apiClient } from '../lib/utils'
import { useCache } from '../lib/cache'

export default function Documents() {
  const { properties } = useCache()
  const [docs, setDocs] = useState<any[]>([])
  const [filterProp, setFilterProp] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ property_id: '', name: '', category: 'legal', file_url: '', notes: '' })

  const load = () => {
    const params = new URLSearchParams()
    if (filterProp) params.set('property_id', filterProp)
    if (filterCat) params.set('category', filterCat)
    apiClient.get(`/property-documents?${params}`).then(setDocs)
  }
  useEffect(load, [filterProp, filterCat])

  const addDoc = async () => {
    await apiClient.post('/property-documents', form)
    setShowForm(false)
    setForm({ property_id: '', name: '', category: 'legal', file_url: '', notes: '' })
    load()
  }

  const deleteDoc = async (id: string) => {
    await apiClient.delete(`/property-documents/${id}`)
    load()
  }

  const catColors: Record<string, string> = { legal: 'badge-purple', lease: 'badge-blue', insurance: 'badge-green', financial: 'badge-orange', other: 'badge-gray' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Property Documents</h2>
          <p className="text-xs text-gray-500">Title deeds, leases, insurance policies and other documents per property</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm flex items-center gap-1.5"><Plus size={16} /> Add Document</button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <select value={filterProp} onChange={e => setFilterProp(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Properties</option>
          {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Categories</option>
          <option value="legal">Legal</option>
          <option value="lease">Lease</option>
          <option value="insurance">Insurance</option>
          <option value="financial">Financial</option>
          <option value="other">Other</option>
        </select>
      </div>

      {showForm && (
        <div className="card mb-4 border-2 border-pomp-blue/30">
          <h4 className="font-semibold text-pomp-navy text-sm mb-3">New Document</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.property_id} onChange={e => setForm({...form, property_id: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="">Select Property</option>
              {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input placeholder="Document name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="legal">Legal</option>
              <option value="lease">Lease</option>
              <option value="insurance">Insurance</option>
              <option value="financial">Financial</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="File URL (optional)" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm md:col-span-2" />
            <input placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addDoc} className="btn-primary text-sm">Save</button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {docs.map((d: any) => {
          const propName = properties.find((p: any) => p.id === d.property_id)?.name || d.property_id
          return (
            <div key={d.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><FileText size={16} /></div>
                  <div>
                    <p className="font-semibold text-sm text-pomp-navy">{d.name}</p>
                    <p className="text-xs text-gray-400">{propName} — {d.category}</p>
                  </div>
                </div>
                <button onClick={() => deleteDoc(d.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
              {d.notes && <p className="text-xs text-gray-400 mt-2">{d.notes}</p>}
              {d.file_url && <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-pomp-blue hover:underline mt-1 inline-block">Open file →</a>}
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${catColors[d.category] || 'badge-gray'}`}>{d.category}</span>
            </div>
          )
        })}
        {docs.length === 0 && <p className="text-sm text-gray-400 col-span-2">No documents yet.</p>}
      </div>
    </div>
  )
}
