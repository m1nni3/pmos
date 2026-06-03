import React, { useEffect, useState, useCallback } from 'react'
import { MessageSquare, CheckCircle2 } from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'
import { useCache } from '../lib/cache'
import { DataTable, Column } from '../components/DataTable'
import { Pagination } from '../components/Pagination'
import { FilterBar, PropertyFilter } from '../components/FilterBar'
import { Modal } from '../components/Modal'

const LEDGER_TYPES = [
  { key: 'rental', label: 'Rental vs Bank' },
  { key: 'levy', label: 'Levy vs Bank' },
]

export default function Reconciliation() {
  const { properties } = useCache()
  const [items, setItems] = useState<any[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 100, totalPages: 1 })
  const [summary, setSummary] = useState<any>(null)
  const [running, setRunning] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [propFilter, setPropFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [noteItem, setNoteItem] = useState<any | null>(null)
  const [noteText, setNoteText] = useState('')

  const fetchData = useCallback(async (page = 1) => {
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('ledger_type', typeFilter)
    if (propFilter !== 'all') params.set('property_id', propFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    params.set('page', String(page))
    params.set('pageSize', '100')
    const data = await apiClient.get(`/reconciliation?${params}`)
    const rows = Array.isArray(data) ? data : (data.entries || [])
    setItems(rows)
    setMeta({ total: Array.isArray(data) ? data.length : (data.total || 0), page: 1, pageSize: 100, totalPages: 1 })
    apiClient.get('/reconciliation/summary').then(setSummary)
  }, [typeFilter, propFilter, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const runReconciliation = async () => {
    setRunning(true)
    await apiClient.post('/reconciliation/run', { property_id: 'all', preserve: true })
    fetchData()
    setRunning(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await apiClient.put(`/reconciliation/${id}`, { status })
    fetchData()
  }

  const saveNote = async () => {
    if (!noteItem) return
    await apiClient.put(`/reconciliation/${noteItem.id}`, { notes: noteText })
    setNoteItem(null)
    fetchData()
  }

  const columns: Column<any>[] = [
    { key: 'period', label: 'Period', sortable: true, format: (v: string) => <span className="font-medium whitespace-nowrap">{v}</span> },
    { key: 'property_name', label: 'Property', sortable: true, format: (v: string) => v || '—' },
    { key: 'ledger_type', label: 'Type', sortable: true, format: (v: string) => <span className={v === 'rental' ? 'badge-blue' : 'badge-orange'}>{v}</span> },
    { key: 'ledger_amount', label: 'Ledger', align: 'right', sortable: true, format: (v: number) => formatRand(v || 0) },
    { key: 'bank_amount', label: 'Bank', align: 'right', sortable: true, format: (v: number) => formatRand(v || 0) },
    { key: 'variance', label: 'Variance', align: 'right', sortable: true, format: (v: number) => {
      const abs = Math.abs(v || 0)
      return <span className={`font-medium whitespace-nowrap ${abs < 1 ? 'text-green-600' : 'text-red-600'}`}>{(v || 0) >= 0 ? '+' : ''}{formatRand(v || 0)}</span>
    }},
    { key: 'status', label: 'Status', sortable: true, format: (v: string, row: any) => (
      <select value={v} onChange={e => updateStatus(row.id, e.target.value)}
        className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${v === 'matched' ? 'bg-green-100 text-green-700' : v === 'exception' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
        <option value="matched">matched</option>
        <option value="exception">exception</option>
        <option value="resolved">resolved</option>
      </select>
    )},
    { key: '_actions', label: '', align: 'right', format: (_: any, row: any) => (
      <button onClick={e => { e.stopPropagation(); setNoteItem(row); setNoteText(row.notes || '') }}
        className="p-1 text-gray-400 hover:text-pomp-blue rounded relative" title="Notes">
        <MessageSquare size={14} />
        {row.notes && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-pomp-blue" />}
      </button>
    )},
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Reconciliation</h2>
          <p className="text-xs text-gray-500 mt-1">Rental & levy ledger vs bank statement matching</p>
        </div>
        <button onClick={runReconciliation} disabled={running} className="btn-primary text-sm">
          {running ? 'Running…' : 'Run Full Reconciliation'}
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {LEDGER_TYPES.map(lt => {
            const s = summary[lt.key]
            if (!s) return null
            return (
              <div key={lt.key} className="card">
                <h4 className="font-heading font-semibold text-pomp-navy mb-3 text-sm">{lt.label}</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-green-700 font-bold">{s.matched || 0}</p>
                    <p className="text-xs text-gray-500">Matched</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-red-700 font-bold">{s.exception || 0}</p>
                    <p className="text-xs text-gray-500">Exceptions</p>
                  </div>
                  <div className="bg-pomp-light rounded-lg p-2">
                    <p className="text-pomp-navy font-bold">{formatRand(Math.abs(s.totalVariance || 0))}</p>
                    <p className="text-xs text-gray-500">Variance</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card">
        <FilterBar>
          <PropertyFilter value={propFilter} onChange={setPropFilter} properties={properties} />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="all">All Types</option>
            <option value="rental">Rental vs Bank</option>
            <option value="levy">Levy vs Bank</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="all">All Statuses</option>
            <option value="matched">Matched</option>
            <option value="exception">Exception</option>
            <option value="resolved">Resolved</option>
          </select>
        </FilterBar>
        <DataTable columns={columns} data={items} rowKey={(r: any) => r.id} emptyMessage="No reconciliation data. Run reconciliation to populate." defaultSort={{ key: 'period', dir: 'desc' }} />
      </div>

      <Modal open={!!noteItem} onClose={() => setNoteItem(null)} title="Reconciliation Notes" size="sm">
        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            {noteItem?.period} · {noteItem?.ledger_type} · Variance: {formatRand((noteItem?.bank_amount || 0) - (noteItem?.ledger_amount || 0))}
          </div>
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" rows={4}
            placeholder="Add notes about this reconciliation exception…" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setNoteItem(null)} className="btn-secondary">Cancel</button>
            <button onClick={saveNote} className="btn-primary text-sm flex items-center gap-1">
              <CheckCircle2 size={14} /> Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
