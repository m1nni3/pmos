import { useState } from 'react'
import { FileText, Download, BarChart3 } from 'lucide-react'
import { apiClient, exportCSV } from '../lib/utils'
import { useCache } from '../lib/cache'

const REPORT_TYPES = [
  { id: 'portfolio', label: 'Portfolio Summary', icon: BarChart3, desc: 'All properties with names, addresses and unit counts' },
  { id: 'cashflow', label: 'Cash Flow', icon: FileText, desc: 'Rental ledger entries (last 500)' },
  { id: 'reconciliation', label: 'Reconciliation', icon: FileText, desc: 'Reconciliation status per period' },
  { id: 'maintenance', label: 'Maintenance', icon: FileText, desc: 'Work orders with status and costs' },
]

export default function ReportsPage() {
  const { properties } = useCache()
  const [type, setType] = useState('portfolio')
  const [filterProp, setFilterProp] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[] | null>(null)

  const runReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterProp) params.set('property_id', filterProp)
      const res = await apiClient.get(`/reports/${type}?${params}`)
      setData(Array.isArray(res) ? res : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const downloadCSV = () => {
    if (!data || data.length === 0) return
    const reportType = REPORT_TYPES.find(r => r.id === type)
    exportCSV(`${reportType?.label || type}-${new Date().toISOString().split('T')[0]}.csv`, data)
  }

  const labels: Record<string, string> = {
    name: 'Property Name', address: 'Address', scheme_name: 'Scheme', unit_count: 'Units',
    date: 'Date', description: 'Description', debit: 'Debit', credit: 'Credit', balance: 'Balance',
    period: 'Period', ledger_amount: 'Ledger Amount', bank_amount: 'Bank Amount', variance: 'Variance', status: 'Status',
    urgency: 'Urgency', liability: 'Liability', cost_estimate: 'Cost Est.', actual_cost: 'Actual Cost', raised_at: 'Raised At',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Reports</h2>
          <p className="text-xs text-gray-500">Generate and download portfolio, cashflow, reconciliation and maintenance reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {REPORT_TYPES.map(rt => (
          <button key={rt.id} onClick={() => { setType(rt.id); setData(null) }}
            className={`card text-left hover:ring-2 transition-all ${type === rt.id ? 'ring-2 ring-pomp-blue/30 border-pomp-blue/30' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-2"><rt.icon size={16} /></div>
            <p className="font-semibold text-sm text-pomp-navy">{rt.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{rt.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <select value={filterProp} onChange={e => setFilterProp(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Properties</option>
          {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={runReport} disabled={loading} className="btn-primary text-sm flex items-center gap-1.5">
          {loading ? 'Running...' : 'Run Report'}
        </button>
        {data && data.length > 0 && (
          <button onClick={downloadCSV} className="btn-primary text-sm flex items-center gap-1.5">
            <Download size={16} /> Download CSV
          </button>
        )}
      </div>

      {data && (
        <div className="card overflow-x-auto">
          <p className="text-xs text-gray-400 mb-2">{data.length} rows</p>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs border-b">
              {Object.keys(data[0] || {}).slice(0, 8).map(k => <th key={k} className="pb-2 pr-3 whitespace-nowrap">{labels[k] || k}</th>)}
            </tr></thead>
            <tbody>
              {data.slice(0, 100).map((row: any, i: number) => (
                <tr key={i} className="border-b border-gray-50">
                  {Object.keys(row).slice(0, 8).map(k => (
                    <td key={k} className="py-1.5 pr-3 whitespace-nowrap text-xs">{String(row[k] ?? '—')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 100 && <p className="text-xs text-gray-400 mt-2">Showing first 100 rows. Download CSV for full data.</p>}
        </div>
      )}
    </div>
  )
}
