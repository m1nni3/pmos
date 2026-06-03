import { useEffect, useState } from 'react'
import { TrendingDown, DollarSign } from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'
import { useCache } from '../lib/cache'

export default function PnlPage() {
  const { properties } = useCache()
  const [data, setData] = useState<any>(null)
  const [filterProp, setFilterProp] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))

  useEffect(() => {
    const params = new URLSearchParams({ year })
    if (filterProp) params.set('property_id', filterProp)
    apiClient.get(`/pnl?${params}`).then(setData)
  }, [filterProp, year])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  function sum(arr: any[], key: string) {
    return (arr || []).reduce((s: number, r: any) => s + (r[key] || 0), 0)
  }

  const totalIncome = sum(data?.income || [], 'amount')
  const totalExpenses = sum(data?.expenses || [], 'amount')
  const totalMun = sum(data?.mun || [], 'amount')
  const netProfit = totalIncome - totalExpenses - totalMun
  const totalBudget = sum(data?.budgets?.filter((b: any) => b.category === 'rental') || [], 'budget_amount')
  const variance = totalIncome - totalBudget

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Profit & Loss</h2>
          <p className="text-xs text-gray-500">Budget vs actuals per month per property</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <select value={filterProp} onChange={e => setFilterProp(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Properties</option>
          {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="kpi-row mb-4">
        <div className="kpi-card border-t-green-500"><p className="text-gray-500 text-xs uppercase">Rental Income</p><p className="text-xl font-bold text-green-600">{formatRand(totalIncome)}</p></div>
        <div className="kpi-card border-t-orange-500"><p className="text-gray-500 text-xs uppercase">Expenses</p><p className="text-xl font-bold text-orange-600">{formatRand(totalExpenses)}</p></div>
        <div className="kpi-card border-t-red-500"><p className="text-gray-500 text-xs uppercase">Municipal</p><p className="text-xl font-bold text-red-600">{formatRand(totalMun)}</p></div>
        <div className="kpi-card border-t-purple-500"><p className="text-gray-500 text-xs uppercase">Variance</p><p className={`text-xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRand(variance)}</p></div>
        <div className="kpi-card border-t-pomp-navy"><p className="text-gray-500 text-xs uppercase">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p><p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRand(Math.abs(netProfit))}</p></div>
      </div>

      <div className="card">
        <h4 className="font-semibold text-pomp-navy text-sm mb-3">Monthly Summary ({year})</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs border-b">
              <th className="pb-2">Category</th>
              {months.map(m => <th key={m} className="pb-2 text-right">{m}</th>)}
              <th className="pb-2 text-right font-bold">Total</th>
            </tr></thead>
            <tbody>
              {[
                { label: 'Rental Income', data: data?.income || [], color: 'text-green-600' },
                { label: 'Bank Expenses', data: data?.expenses || [], color: 'text-orange-600' },
                { label: 'Municipal', data: data?.mun || [], color: 'text-red-600' },
              ].map(row => (
                <tr key={row.label} className="border-b border-gray-100">
                  <td className={`py-2 font-medium ${row.color}`}>{row.label}</td>
                  {months.map((m, i) => {
                    const monthStr = String(i + 1).padStart(2, '0')
                    const val = row.data.find((r: any) => r.month === monthStr)?.amount || 0
                    return <td key={m} className="py-2 text-right">{formatRand(val)}</td>
                  })}
                  <td className="py-2 text-right font-bold">{formatRand(row.data.reduce((s: number, r: any) => s + (r.amount || 0), 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
