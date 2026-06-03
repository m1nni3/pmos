import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { apiClient } from '../lib/utils'

const ROLE_COLORS: Record<string, string> = {
  managing_agent: 'badge-purple',
  letting_agent: 'badge-blue',
  municipality: 'badge-orange',
  bank: 'badge-green',
  contractor: 'badge-red',
}

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([])
  const [roleFilter, setRoleFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: 'contractor', email: '', phone: '' })

  useEffect(() => {
    const params = roleFilter ? `?role=${roleFilter}` : ''
    apiClient.get(`/contacts${params}`).then(setContacts)
  }, [roleFilter])

  const addContact = async () => {
    await apiClient.post('/contacts', form)
    setShowForm(false)
    setForm({ name: '', role: 'contractor', email: '', phone: '' })
    apiClient.get('/contacts').then(setContacts)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-pomp-navy">Contacts</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Add Contact
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'managing_agent', 'letting_agent', 'municipality', 'bank', 'contractor'].map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              roleFilter === r ? 'bg-pomp-navy text-white border-pomp-navy' : 'bg-white text-gray-600 border-pomp-border hover:bg-gray-50'
            }`}
          >
            {r || 'All'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-4">
          <h3 className="font-semibold text-pomp-navy mb-3">New Contact</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border border-pomp-border rounded-lg text-sm" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="px-3 py-2 border border-pomp-border rounded-lg text-sm bg-white">
              <option value="contractor">Contractor</option>
              <option value="managing_agent">Managing Agent</option>
              <option value="letting_agent">Letting Agent</option>
              <option value="municipality">Municipality</option>
              <option value="bank">Bank</option>
            </select>
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 border border-pomp-border rounded-lg text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="px-3 py-2 border border-pomp-border rounded-lg text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={addContact} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {contacts.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No contacts yet.</p>
        ) : (
          <div className="grid gap-2">
            {contacts.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-pomp-light">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.email || c.phone || '—'}</p>
                </div>
                <span className={ROLE_COLORS[c.role] || 'badge-blue'}>{c.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
