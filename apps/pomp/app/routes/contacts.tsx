import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Phone, Mail, Wrench, AlertTriangle, UserCheck } from 'lucide-react'
import { apiClient } from '../lib/utils'
import { useCache } from '../lib/cache'

export default function Contacts() {
  const { properties } = useCache()
  const [contacts, setContacts] = useState<any[]>([])
  const [filterProp, setFilterProp] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ property_id: '', category: 'emergency', subcategory: '', name: '', phone: '', email: '', notes: '' })

  const load = () => {
    const params = new URLSearchParams()
    if (filterProp) params.set('property_id', filterProp)
    if (filterCat) params.set('category', filterCat)
    apiClient.get(`/property-contacts?${params}`).then(setContacts)
  }
  useEffect(load, [filterProp, filterCat])

  const addContact = async () => {
    await apiClient.post('/property-contacts', form)
    setShowForm(false)
    setForm({ property_id: '', category: 'emergency', subcategory: '', name: '', phone: '', email: '', notes: '' })
    load()
  }

  const deleteContact = async (id: string) => {
    await apiClient.delete(`/property-contacts/${id}`)
    load()
  }

  const catIcon: Record<string, any> = { emergency: AlertTriangle, service_provider: Wrench, professional: UserCheck }
  const catColors: Record<string, string> = { emergency: 'text-red-500 bg-red-50', service_provider: 'text-orange-500 bg-orange-50', professional: 'text-blue-500 bg-blue-50' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Property Contacts</h2>
          <p className="text-xs text-gray-500">Emergency, service and professional contacts per property</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm flex items-center gap-1.5"><Plus size={16} /> Add Contact</button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <select value={filterProp} onChange={e => setFilterProp(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Properties</option>
          {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Categories</option>
          <option value="emergency">Emergency</option>
          <option value="service_provider">Service Provider</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      {showForm && (
        <div className="card mb-4 border-2 border-pomp-blue/30">
          <h4 className="font-semibold text-pomp-navy text-sm mb-3">New Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.property_id} onChange={e => setForm({...form, property_id: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="">Select Property</option>
              {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="emergency">Emergency</option>
              <option value="service_provider">Service Provider</option>
              <option value="professional">Professional</option>
            </select>
            <input placeholder="Subcategory (e.g. Plumber, Electrician)" value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addContact} className="btn-primary text-sm">Save</button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {contacts.map((c: any) => {
          const Icon = catIcon[c.category] || Phone
          const colorClass = catColors[c.category] || 'text-gray-500 bg-gray-50'
          const propName = properties.find((p: any) => p.id === c.property_id)?.name || c.property_id
          return (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}><Icon size={16} /></div>
                  <div>
                    <p className="font-semibold text-sm text-pomp-navy">{c.name}</p>
                    <p className="text-xs text-gray-400">{propName} — {c.subcategory || c.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <button onClick={() => deleteContact(c.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
              <div className="flex gap-3 text-xs text-gray-600">
                {c.phone && <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                {c.email && <span className="flex items-center gap-1"><Mail size={12} />{c.email}</span>}
              </div>
              {c.notes && <p className="text-xs text-gray-400 mt-1">{c.notes}</p>}
            </div>
          )
        })}
        {contacts.length === 0 && <p className="text-sm text-gray-400 col-span-2">No contacts found. Add one using the button above.</p>}
      </div>
    </div>
  )
}
