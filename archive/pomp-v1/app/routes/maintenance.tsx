import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react'
import { apiClient, formatRand, exportCSV } from '../lib/utils'
import { DataTable, Column } from '../components/DataTable'
import { Pagination } from '../components/Pagination'
import { FilterBar, PropertyFilter } from '../components/FilterBar'
import { Modal } from '../components/Modal'
import { useCache } from '../lib/cache'

const STATUSES = ['open', 'in_progress', 'completed', 'disputed']
const URGENCIES = ['routine', 'urgent', 'emergency']
const LIABILITIES = ['trust', 'tenant', 'body_corp', 'contractor']

function WorkOrderForm({ initial, props, onSave, onClose }: { initial?: any, props: any[], onSave: (data: any) => Promise<void>, onClose: () => void }) {
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
    await onSave({
      ...form,
      cost_estimate: form.cost_estimate ? Number(form.cost_estimate) : null,
      actual_cost: form.actual_cost ? Number(form.actual_cost) : null,
      completed_at: form.completed_at || null,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="text-gray-600">Property *</span>
          <select value={form.property_id} onChange={e => set('property_id', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
            <option value="">Select…</option>
            {props.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Urgency</span>
          <select value={form.urgency} onChange={e => set('urgency', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
            {URGENCIES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-gray-600">Description *</span>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" rows={3} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="text-gray-600">Status</span>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Liability</span>
          <select value={form.liability} onChange={e => set('liability', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
            <option value="">—</option>
            {LIABILITIES.map(l => <option key={l} value={l}>{l.replace('_', ' ')}</option>)}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="text-gray-600">Cost Estimate (R)</span>
          <input type="number" value={form.cost_estimate} onChange={e => set('cost_estimate', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="0.00" />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Actual Cost (R)</span>
          <input type="number" value={form.actual_cost} onChange={e => set('actual_cost', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="0.00" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.receipt_received === 1}
            onChange={e => set('receipt_received', e.target.checked ? 1 : 0)}
            className="rounded border-gray-300" />
          <span className="text-gray-600">Receipt received</span>
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Completed</span>
          <input type="date" value={form.completed_at} onChange={e => set('completed_at', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={submit} disabled={saving || !form.property_id || !form.description} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}

export default function Maintenance() {
  const { properties } = useCache()
  const [orders, setOrders] = useState<any[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 50, totalPages: 1 })
  const [propFilter, setPropFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any | null>(null)

  const fetchData = useCallback(async (page = 1) => {
    const params = new URLSearchParams()
    if (propFilter !== 'all') params.set('property_id', propFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    params.set('page', String(page))
    params.set('pageSize', '50')
    const data = await apiClient.get(`/work-orders?${params}`)
    setOrders(data.entries || [])
    setMeta({ total: data.total || 0, page: data.page || 1, pageSize: data.pageSize || 50, totalPages: data.totalPages || 1 })
  }, [propFilter, statusFilter])

  useEffect(() => { fetchData(1) }, [fetchData])

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiClient.put(`/work-orders/${editItem.id}`, data)
    } else {
      await apiClient.post('/work-orders', data)
    }
    await fetchData(meta.page)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this work order?')) return
    await apiClient.del(`/work-orders/${id}`)
    await fetchData(meta.page)
  }

  const urgencyBadge = (u: string) => {
    if (u === 'emergency') return 'badge-red'
    if (u === 'urgent') return 'badge-orange'
    return 'badge-blue'
  }
  const statusBadge = (s: string) => {
    if (s === 'completed') return 'badge-green'
    if (s === 'open') return 'badge-orange'
    if (s === 'disputed') return 'badge-red'
    return 'badge-blue'
  }

  const columns: Column<any>[] = [
    { key: 'raised_at', label: 'Date', sortable: true, format: (v: string) => <span className="text-gray-600 whitespace-nowrap">{v?.slice(0, 10) || '—'}</span> },
    { key: 'property_name', label: 'Property', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'urgency', label: 'Urgency', sortable: true, format: (v: string) => <span className={urgencyBadge(v)}>{v}</span> },
    { key: 'liability', label: 'Liability', format: (v: string) => <span className="text-gray-600">{v ? v.replace('_', ' ') : '—'}</span> },
    { key: 'cost_estimate', label: 'Estimate', align: 'right', format: (v: number) => v ? formatRand(v) : '—' },
    { key: 'actual_cost', label: 'Actual', align: 'right', sortable: true, format: (v: number) => v ? formatRand(v) : '—' },
    { key: 'status', label: 'Status', sortable: true, format: (v: string) => <span className={statusBadge(v)}>{v?.replace('_', ' ')}</span> },
    { key: '_actions', label: '', align: 'right', format: (_: any, row: any) => (
      <div className="flex items-center gap-1 justify-end">
        <button onClick={e => { e.stopPropagation(); setEditItem(row); setShowForm(true) }} className="p-1 text-gray-400 hover:text-pomp-blue rounded"><Pencil size={14} /></button>
        <button onClick={e => { e.stopPropagation(); handleDelete(row.id) }} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Maintenance</h2>
          <p className="text-xs text-gray-500 mt-1">{meta.total} work order{meta.total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCSV('maintenance.csv', orders.map(o => ({
            date: o.raised_at?.slice(0,10), property: o.property_name, description: o.description,
            urgency: o.urgency, liability: o.liability, estimate: o.cost_estimate, actual: o.actual_cost,
            status: o.status, receipt: o.receipt_received ? 'yes' : 'no',
          })))} className="btn-secondary text-xs">Export CSV</button>
          <button onClick={() => { setEditItem(null); setShowForm(true) }} className="btn-primary flex items-center gap-1 text-sm">
            <Plus size={14} /> New Work Order
          </button>
        </div>
      </div>

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search descriptions…">
        <PropertyFilter value={propFilter} onChange={setPropFilter} properties={properties} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </FilterBar>

      <div className="card">
        <DataTable
          columns={columns}
          data={orders.filter(o => !search || o.description?.toLowerCase().includes(search.toLowerCase()))}
          rowKey={(r: any) => r.id}
          emptyMessage="No work orders found"
          defaultSort={{ key: 'raised_at', dir: 'desc' }}
        />
        <Pagination {...meta} onChange={fetchData} />
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditItem(null) }} title={editItem ? 'Edit Work Order' : 'New Work Order'} size="md">
        <WorkOrderForm initial={editItem} props={properties} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null) }} />
      </Modal>
    </div>
  )
}
