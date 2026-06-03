import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Phone, Mail, Wrench, AlertTriangle, UserCheck } from 'lucide-react'
import { apiClient } from '../lib/utils'
import { useCache } from '../lib/cache'
import { PageHeader, FormSelect, FormInput, FormModal, Button, CardGrid } from '../components'

export default function Contacts() {
  const { properties } = useCache()
  const [contacts, setContacts] = useState<any[]>([])
  const [filterProp, setFilterProp] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ 
    property_id: '', 
    category: 'emergency', 
    subcategory: '', 
    name: '', 
    phone: '', 
    email: '', 
    notes: '' 
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = () => {
    const params = new URLSearchParams()
    if (filterProp) params.set('property_id', filterProp)
    if (filterCat) params.set('category', filterCat)
    apiClient.get(`/property-contacts?${params}`).then(setContacts)
  }

  useEffect(load, [filterProp, filterCat])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!form.property_id) newErrors.property_id = 'Property is required'
    if (!form.name) newErrors.name = 'Name is required'
    if (form.phone && !/^[\d\s\-\+\(\)]+$/.test(form.phone)) {
      newErrors.phone = 'Invalid phone number'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addContact = async () => {
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      await apiClient.post('/property-contacts', form)
      setShowForm(false)
      setForm({ 
        property_id: '', 
        category: 'emergency', 
        subcategory: '', 
        name: '', 
        phone: '', 
        email: '', 
        notes: '' 
      })
      setErrors({})
      load()
    } catch (error) {
      setErrors({ submit: 'Failed to add contact' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteContact = async (id: string) => {
    if (confirm('Delete this contact?')) {
      try {
        await apiClient.delete(`/property-contacts/${id}`)
        load()
      } catch (error) {
        console.error('Failed to delete contact:', error)
      }
    }
  }

  const catIcon: Record<string, any> = { 
    emergency: AlertTriangle, 
    service_provider: Wrench, 
    professional: UserCheck 
  }
  const catColors: Record<string, string> = { 
    emergency: 'text-red-500 bg-red-50', 
    service_provider: 'text-orange-500 bg-orange-50', 
    professional: 'text-blue-500 bg-blue-50' 
  }

  const propOptions = [
    { value: '', label: 'All Properties' },
    ...properties.map((p: any) => ({ value: p.id, label: p.name }))
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'service_provider', label: 'Service Provider' },
    { value: 'professional', label: 'Professional' }
  ]

  return (
    <div>
      <PageHeader
        title="Property Contacts"
        subtitle="Emergency, service and professional contacts per property"
        action={
          <Button onClick={() => setShowForm(true)} variant="primary" size="default">
            <Plus size={16} /> Add Contact
          </Button>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        <FormSelect
          value={filterProp}
          onChange={setFilterProp}
          options={propOptions}
          placeholder="Filter by property"
          className="flex-1 min-w-[180px]"
        />
        <FormSelect
          value={filterCat}
          onChange={setFilterCat}
          options={categoryOptions}
          placeholder="Filter by category"
          className="flex-1 min-w-[180px]"
        />
      </div>

      <FormModal
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setErrors({})
        }}
        title="Add New Contact"
        submitLabel="Save Contact"
        isLoading={isSubmitting}
        onSubmit={addContact}
        size="md"
      >
        <FormSelect
          label="Property"
          value={form.property_id}
          onChange={v => setForm({ ...form, property_id: v as string })}
          options={properties.map((p: any) => ({ value: p.id, label: p.name }))}
          required
          error={errors.property_id}
        />
        <FormSelect
          label="Category"
          value={form.category}
          onChange={v => setForm({ ...form, category: v as string })}
          options={[
            { value: 'emergency', label: 'Emergency' },
            { value: 'service_provider', label: 'Service Provider' },
            { value: 'professional', label: 'Professional' }
          ]}
        />
        <FormInput
          label="Subcategory"
          placeholder="e.g. Plumber, Electrician"
          value={form.subcategory}
          onChange={v => setForm({ ...form, subcategory: v as string })}
        />
        <FormInput
          label="Name"
          placeholder="Contact name"
          value={form.name}
          onChange={v => setForm({ ...form, name: v as string })}
          required
          error={errors.name}
        />
        <FormInput
          label="Phone"
          type="tel"
          placeholder="Phone number"
          value={form.phone}
          onChange={v => setForm({ ...form, phone: v as string })}
          error={errors.phone}
        />
        <FormInput
          label="Email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={v => setForm({ ...form, email: v as string })}
          error={errors.email}
        />
        <FormInput
          label="Notes"
          placeholder="Additional notes"
          value={form.notes}
          onChange={v => setForm({ ...form, notes: v as string })}
          rows={3}
        />
      </FormModal>

      <CardGrid cols={2} gap="md">
        {contacts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">No contacts found. Add one to get started.</p>
          </div>
        ) : (
          contacts.map((c: any) => {
            const Icon = catIcon[c.category] || Phone
            const colorClass = catColors[c.category] || 'text-gray-500 bg-gray-50'
            const propName = properties.find((p: any) => p.id === c.property_id)?.name || c.property_id

            return (
              <div key={c.id} className="card flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-pomp-navy truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{propName} — {c.subcategory || c.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                    title="Delete contact"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex flex-col gap-2 text-xs text-gray-600">
                  {c.phone && (
                    <span className="flex items-center gap-1 truncate">
                      <Phone size={12} className="flex-shrink-0" />
                      <a href={`tel:${c.phone}`} className="hover:text-pomp-blue truncate">
                        {c.phone}
                      </a>
                    </span>
                  )}
                  {c.email && (
                    <span className="flex items-center gap-1 truncate">
                      <Mail size={12} className="flex-shrink-0" />
                      <a href={`mailto:${c.email}`} className="hover:text-pomp-blue truncate">
                        {c.email}
                      </a>
                    </span>
                  )}
                </div>
                {c.notes && <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">{c.notes}</p>}
              </div>
            )
          })
        )}
      </CardGrid>
    </div>
  )
}
