import React, { useEffect, useState, useCallback } from 'react'
import { Download } from 'lucide-react'
import { apiClient, formatRand, exportCSV } from '../lib/utils'
import { useCache } from '../lib/cache'
import { DataTable, Column } from '../components/DataTable'
import { Pagination } from '../components/Pagination'
import { FilterBar, PropertyFilter } from '../components/FilterBar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

export default function LeviesBanking() {
  const { dashboard, properties } = useCache()
  const [entries, setEntries] = useState<any[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 100, totalPages: 1 })
  const [propFilter, setPropFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async (page = 1) => {
    const params = new URLSearchParams()
    if (propFilter !== 'all') params.set('property_id', propFilter)
    params.set('page', String(page))
    params.set('pageSize', '100')
    if (search) params.set('search', search)
    const data = await apiClient.get(`/ledger/levy_ledger?${params}`)
    setEntries(data.entries || data)
    setMeta({ total: data.total || 0, page: data.page || 1, pageSize: data.pageSize || 100, totalPages: data.totalPages || 1 })
  }, [propFilter, search])

  useEffect(() => { fetchData(1) }, [fetchData])

  const totalLevy = entries.reduce((s, e) => s + (e.credit || 0), 0)
  const totalExp = entries.reduce((s, e) => s + (e.debit || 0), 0)

  const [chartAllData, setChartAllData] = useState<any[]>([])
  const [chartRange, setChartRange] = useState<6 | 12 | 99>(12)
  useEffect(() => {
    apiClient.get('/ledger/levy_ledger?property_id=all&pageSize=2000').then((data: any) => {
      const all = data.entries || data
      const byMonth: Record<string, { month: string, income: number, expenses: number }> = {}
      for (const e of all) {
        const m = (e.date || '').substring(0, 7)
        if (!m) continue
        if (!byMonth[m]) byMonth[m] = { month: m, income: 0, expenses: 0 }
        byMonth[m].income += e.credit || 0
        byMonth[m].expenses += e.debit || 0
      }
      setChartAllData(Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)))
    }).catch(() => {})
  }, [])
  const chartData = chartRange < 99 ? chartAllData.slice(-chartRange) : chartAllData

  const columns: Column<any>[] = [
    { key: 'date', label: 'Date', sortable: true, format: (v: string) => <span className="text-gray-600 whitespace-nowrap">{v}</span> },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category', sortable: true, format: (v: string) => <span className="badge-purple">{v || '—'}</span> },
    { key: 'debit', label: 'Debit', align: 'right', sortable: true, format: (v: number) => <span className="text-red-600 whitespace-nowrap">{v ? formatRand(v) : '—'}</span> },
    { key: 'credit', label: 'Credit', align: 'right', sortable: true, format: (v: number) => <span className="text-green-600 whitespace-nowrap">{v ? formatRand(v) : '—'}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Levies & Banking</h2>
          <p className="text-xs text-gray-500 mt-1">Body corporate levies, scheme contributions, and banking</p>
        </div>
        <button onClick={() => exportCSV('levy_ledger.csv', entries.map(e => ({
          date: e.date, description: e.description, category: e.category, debit: e.debit, credit: e.credit,
        })))} className="btn-secondary text-sm flex items-center gap-1">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="kpi-row mb-6">
        <div className="kpi-card border-t-purple-500">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Levy Income</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{formatRand(totalLevy)}</p>
        </div>
        <div className="kpi-card border-t-pomp-red">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Levy Expenses</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatRand(totalExp)}</p>
        </div>
        <div className="kpi-card border-t-pomp-blue">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Net Levy</p>
          <p className="text-xl font-bold text-pomp-navy mt-1">{formatRand(totalLevy - totalExp)}</p>
        </div>
        <div className="kpi-card border-t-pomp-green">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Municipality Total</p>
          <p className="text-xl font-bold text-green-600 mt-1">{formatRand(dashboard?.municipalityTotal || 0)}</p>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-pomp-navy text-sm">Monthly Levy Trends</h3>
            <div className="flex gap-1">
              {[6, 12, 99].map(r => (
                <button key={r} onClick={() => setChartRange(r as 6 | 12 | 99)}
                  className={`px-2 py-0.5 text-xs rounded ${chartRange === r ? 'bg-pomp-blue text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {r === 99 ? 'All' : `${r}m`}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatRand(v)} />
                <Legend />
                <Bar dataKey="income" name="Levies Received" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenses" name="Payments" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search descriptions…">
          <PropertyFilter value={propFilter} onChange={setPropFilter} properties={properties} />
        </FilterBar>
        <DataTable columns={columns} data={entries} rowKey={(r: any) => r.id} emptyMessage="No levy entries found" defaultSort={{ key: 'date', dir: 'desc' }} />
        <Pagination {...meta} onChange={fetchData} />
      </div>
    </div>
  )
}
