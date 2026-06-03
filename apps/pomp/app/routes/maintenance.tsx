import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react'
import { apiClient, formatRand, exportCSV } from '../lib/utils'
import { DataTable, Column } from '../components/DataTable'
import { Pagination } from '../components/Pagination'
import { FilterBar, PropertyFilter } from '../components/FilterBar'
import { Modal } from '../components/Modal'
import { useCache } from '../lib/cache'
import { PageHeader, FormSelect, FormInput, Button, Section } from '../components'

const STATUSES = ['open', 'in_progress', 'completed', 'disputed']
const URGENCIES = ['routine', 'urgent', 'emergency']
const LIABILITIES = ['trust', 'tenant', 'body_corp', 'contractor']

interface WorkOrderFormProps {
  initial?: any
  props: any[]
  onSave: (data: any) => Promise<void>
  onClose: () => void
}

function WorkOrderForm({ initial, props, onSave, onClose }: WorkOrderFormProps) {
  const [form, setForm] = useState({
    property_id: initial?.property_id || '',
    description: initial?.description || '',
    status: initial?.status || 'open',
    urgency: initial?.urgency || 'routine',
    liability: initial?.liability || '',
    cost_estimate: initial?.cost_estimate || '',
    actual_cost: initial?.actual_cost || '',
    receipt_received: initial?.receipt_received ? 1 : 0,
    completed_at: initial?.completed_at?.slice(0, 10) || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async () => {
    if (!form.property_id || !form.description) return
    setSaving(true)
    try {
      await onSave({
        ...form,
        cost_estimate: form.cost_estimate ? Number(form.cost_estimate) : null,
        actual_cost: form.actual_cost ? Number(form.actual_cost) : null,
        completed_at: form.completed_at || null,
      })
      onClose()
    } catch (error) {
      console.error('Error saving work order:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <FormSelect
        label="Property"
        value={form.property_id}
        onChange={v => set('property_id', v)}
        options={props.map((p: any) => ({ value: p.id, label: p.name }))}
        required
      />
      <FormInput
        label="Description"
        value={form.description}
        onChange={v => set('description', v)}
        placeholder="Work order description"
        rows={3}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          label="Urgency"
          value={form.urgency}
          onChange={v => set('urgency', v)}
          options={URGENCIES.map(u => ({ value: u, label: u }))}
        />
        <FormSelect
          label="Status"
          value={form.status}
          onChange={v => set('status', v)}
          options={STATUSES.map(s => ({ value: s, label: s }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="Cost Estimate"
          type="number"
          value={form.cost_estimate}
          onChange={v => set('cost_estimate', v)}
          placeholder="0.00"
        />
        <FormInput
          label="Actual Cost"
          type="number"
          value={form.actual_cost}
          onChange={v => set('actual_cost', v)}
          placeholder="0.00"
        />
      </div>
      <FormInput
        label="Completed Date"
        type="date"
        value={form.completed_at}
        onChange={v => set('completed_at', v)}
      />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" isLoading={saving} onClick={submit}>Save</Button>
      </div>
    </div>
  )
}

export default function Maintenance() {
  const { properties } = useCache()
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 50, totalPages: 1 })
  const [propFilter, setPropFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<any>(null)

  const fetchWorkOrders = useCallback(async (page = 1) => {
    const params = new URLSearchParams()
    if (propFilter !== 'all') params.set('property_id', propFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    params.set('page', String(page))
    params.set('pageSize', '50')
    const data = await apiClient.get(`/work-orders?${params}`)
    setWorkOrders(data.entries || data)
    setMeta({ total: data.total || 0, page: data.page || 1, pageSize: data.pageSize || 50, totalPages: data.totalPages || 1 })
  }, [propFilter, statusFilter, search])

  useEffect(() => { fetchWorkOrders(1) }, [fetchWorkOrders])

  const saveWorkOrder = async (data: any) => {
    if (editingId) {
      await apiClient.put(`/work-orders/${editingId}`, data)
      setEditingId(null)
    } else {
      await apiClient.post('/work-orders', data)
    }
    setShowForm(false)
    fetchWorkOrders()
  }

  const deleteWorkOrder = async (id: string) => {
    if (confirm('Delete this work order?')) {
      await apiClient.delete(`/work-orders/${id}`)
      fetchWorkOrders()
    }
  }

  const columns: Column<any>[] = [
    { key: 'id', label: 'ID', format: (v) => <span className="font-mono text-xs">{v.slice(0, 8)}</span> },
    { key: 'description', label: 'Description' },
    { key: 'urgency', label: 'Urgency', format: (v) => <span className={`text-xs px-2 py-1 rounded-full ${v === 'emergency' ? 'bg-red-50 text-red-700' : v === 'urgent' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-700'}`}>{v}</span> },
    { key: 'status', label: 'Status', format: (v) => <span className={`text-xs px-2 py-1 rounded-full ${v === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{v}</span> },
    { key: 'actual_cost', label: 'Cost', align: 'right', format: (v) => <span>{v ? formatRand(v) : '—'}</span> },
    { key: 'completed_at', label: 'Completed' },
  ]

  return (
    <div>
      <PageHeader
        title="Maintenance Work Orders"
        subtitle="Track property maintenance requests and completion"
        action={
          <Button onClick={() => { setEditingId(null); setEditingData(null); setShowForm(true) }} variant="primary">
            <Plus size={16} /> New Work Order
          </Button>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        <PropertyFilter value={propFilter} onChange={setPropFilter} properties={properties} />
        <FormSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: '', label: 'All Status' }, ...STATUSES.map(s => ({ value: s, label: s }))]}
          className="flex-1 min-w-[150px]"
        />
      </div>

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingId(null)
          setEditingData(null)
        }}
        title={editingId ? 'Edit Work Order' : 'New Work Order'}
        size="md"
      >
        <WorkOrderForm
          initial={editingData}
          props={properties}
          onSave={saveWorkOrder}
          onClose={() => {
            setShowForm(false)
            setEditingId(null)
            setEditingData(null)
          }}
        />
      </Modal>

      <Section title="Work Orders">
        <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search descriptions…" />
        <DataTable
          columns={columns}
          data={workOrders}
          rowKey={(r: any) => r.id}
          emptyMessage="No work orders found"
          defaultSort={{ key: 'completed_at', dir: 'desc' }}
        />
        <Pagination {...meta} onChange={fetchWorkOrders} />
      </Section>
    </div>
  )
}
