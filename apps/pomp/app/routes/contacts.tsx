import React, { useEffect, useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { apiClient, exportCSV } from '../lib/utils'
import { useCache } from '../lib/cache'
import { PageHeader, FormSelect, FormInput, FormModal, Button, CardGrid, ConfirmModal, Pagination, ContactCard, EmptyState } from '../components'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router'
import type { Contact, ContactCategory } from '../types'

interface ContactForm {
  property_id: string
  category: ContactCategory
  subcategory: string
  name: string
  phone: string
  email: string
  notes: string
}

const EMPTY_FORM: ContactForm = {
  property_id: '', category: 'emergency', subcategory: '',
  name: '', phone: '', email: '', notes: '',
}

export default function Contacts() {
  const { properties } = useCache()
  const [searchParams, setSearchParams] = useSearchParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filterProp, setFilterProp] = useState(searchParams.get('property_id') || '')
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = () => {
    const params = new URLSearchParams()
    if (filterProp) params.set('property_id', filterProp)
    if (filterCat) params.set('category', filterCat)
    apiClient.get<Contact[]>(`/property-contacts?${params}`).then(d => setContacts(d ?? []))
  }

  useEffect(load, [filterProp, filterCat])

  // Sync filter changes to URL so deep-links from other pages work
  useEffect(() => {
    const next = new URLSearchParams()
    if (filterProp) next.set('property_id', filterProp)
    if (filterCat) next.set('category', filterCat)
    setSearchParams(next, { replace: true })
  }, [filterProp, filterCat])

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

  const saveContact = async () => {
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      if (editingId) {
        await apiClient.put(`/property-contacts/${editingId}`, form)
        toast.success('Contact updated')
      } else {
        await apiClient.post('/property-contacts', form)
        toast.success('Contact added')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      setErrors({})
      load()
    } catch {
      toast.error('Failed to save contact')
      setErrors({ submit: 'Failed to save contact' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const editContact = (c: Contact) => {
    setEditingId(c.id)
    setForm({
      property_id: c.property_id || '',
      category: c.category || 'emergency',
      subcategory: c.subcategory || '',
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      notes: c.notes || '',
    })
    setErrors({})
    setShowForm(true)
  }

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const deleteContact = async (id: string) => {
    try {
      await apiClient.delete(`/property-contacts/${id}`)
      toast.success('Contact deleted')
      setConfirmDelete(null)
      load()
    } catch {
      toast.error('Failed to delete contact')
    }
  }

  const [page, setPage] = useState(1)
  const pageSize = 12
  const paginatedContacts = useMemo(() => {
    const start = (page - 1) * pageSize
    return contacts.slice(start, start + pageSize)
  }, [contacts, page])
  const totalPages = Math.max(1, Math.ceil(contacts.length / pageSize))

  useEffect(() => { setPage(1) }, [filterProp, filterCat])

  const propOptions = [
    { value: '', label: 'All Properties' },
    ...properties.filter(p => p.name !== 'The Studio').map(p => ({ value: p.id, label: p.name }))
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'service_provider', label: 'Service Provider' },
    { value: 'professional', label: 'Professional' }
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Property Contacts"
        subtitle="Emergency, service and professional contacts per property"
        action={
          <div className="flex gap-2">
            <Button onClick={() => { exportCSV('contacts.csv', contacts, [{ key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'category', label: 'Category' }]) }} variant="outline" size="default">
              Export CSV
            </Button>
          <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true) }} variant="primary" size="default">
            <Plus size={16} /> Add Contact
          </Button>
          </div>
        }
      />

      <div className="flex gap-2 mb-4 flex-wrap shrink-0">
        <FormSelect
          value={filterProp}
          onChange={v => setFilterProp(String(v))}
          options={propOptions}
          placeholder="Filter by property"
          className="flex-1 min-w-[180px]"
        />
        <FormSelect
          value={filterCat}
          onChange={v => setFilterCat(String(v))}
          options={categoryOptions}
          placeholder="Filter by category"
          className="flex-1 min-w-[180px]"
        />
      </div>

      <FormModal
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingId(null)
          setErrors({})
        }}
        title={editingId ? 'Edit Contact' : 'Add New Contact'}
        submitLabel={editingId ? 'Save Changes' : 'Save Contact'}
        isLoading={isSubmitting}
        onSubmit={saveContact}
        size="md"
      >
        <FormSelect
          label="Property"
          value={form.property_id}
          onChange={v => setForm({ ...form, property_id: v as string })}
          options={properties.filter(p => p.name !== 'The Studio').map(p => ({ value: p.id, label: p.name }))}
          required
          error={errors.property_id}
        />
        <FormSelect
          label="Category"
          value={form.category}
          onChange={v => setForm({ ...form, category: String(v) as ContactCategory })}
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

      <div className="flex-1 min-h-0 overflow-y-auto">
        <CardGrid cols={2} gap="md">
          {paginatedContacts.length === 0 ? (
            <div className="col-span-full">
              <EmptyState message="No contacts found. Add one to get started." />
            </div>
          ) : (
            paginatedContacts.map(c => {
              const propName = properties.find(p => p.id === c.property_id)?.name || c.property_id
              return (
                <ContactCard
                  key={c.id}
                  contact={c}
                  propertyName={propName}
                  onEdit={editContact}
                  onDelete={(contact) => setConfirmDelete(contact.id)}
                />
              )
            })
          )}
        </CardGrid>

        <Pagination page={page} pageSize={pageSize} total={contacts.length} totalPages={totalPages} onChange={setPage} />

        <ConfirmModal
          open={confirmDelete !== null}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => deleteContact(confirmDelete!)}
          title="Delete Contact"
          message="Are you sure you want to delete this contact? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
        />
      </div>
    </div>
  )
}
