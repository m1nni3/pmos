import React from 'react'
import {
  Building2, Users, Banknote, AlertTriangle, TrendingUp, DollarSign,
} from 'lucide-react'
import { formatRand } from '../lib/utils'
import { useCache } from '../lib/cache'

export default function Overview() {
  const { dashboard: data } = useCache()
  if (!data) return <div className="text-gray-400 text-sm">Loading...</div>

  const recon = data.reconciliation || {}
  const rentalException = recon.rental_exception?.count || 0
  const rentVar = recon.rental_exception?.variance || 0
  const levyException = recon.levy_exception?.count || 0
  const levyVar = recon.levy_exception?.variance || 0

  const kpis = [
    { label: 'Properties', value: data.totalProperties, icon: Building2, color: 'border-pomp-blue', sub: `${data.totalUnits} units` },
    { label: 'Total Value', value: formatRand(data.totalValue || 0), icon: TrendingUp, color: 'border-pomp-green', sub: 'Current market value' },
    { label: 'Rental Income', value: formatRand(data.rentalIncome || 0), icon: Banknote, color: 'border-pomp-orange', sub: `${formatRand(data.rentalExpenses || 0)} expenses` },
    { label: 'Levy Income', value: formatRand(data.levyIncome || 0), icon: DollarSign, color: 'border-purple-500', sub: `${formatRand(data.levyExpenses || 0)} expenses` },
    { label: 'Bank Deposits', value: formatRand(data.bankDeposits || 0), icon: TrendingUp, color: 'border-pomp-blue', sub: `${formatRand(data.bankWithdrawals || 0)} withdrawals` },
    { label: 'Exceptions', value: rentalException + levyException, icon: AlertTriangle, color: rentalException + levyException > 0 ? 'border-red-500' : 'border-pomp-green', sub: `R:${rentalException} L:${levyException}` },
  ]

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-pomp-navy mb-2">Overview</h2>
      <p className="text-sm text-gray-500 mb-6">Portfolio financial snapshot & property list</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`kpi-card ${kpi.color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon size={18} className="text-gray-400" />
            </div>
            <p className="text-xl font-bold text-pomp-navy">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-heading font-semibold text-pomp-navy mb-4">Reconciliation Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-pomp-light">
              <div>
                <p className="text-sm font-medium">Rental Ledger</p>
                <p className="text-xs text-gray-500">{recon.rental_matched?.count || 0} matched periods</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-orange-600">{rentalException} exceptions</p>
                <p className="text-xs text-gray-500">{formatRand(Math.abs(rentVar))} variance</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-pomp-light">
              <div>
                <p className="text-sm font-medium">Levy Ledger</p>
                <p className="text-xs text-gray-500">{recon.levy_matched?.count || 0} matched periods</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-orange-600">{levyException} exceptions</p>
                <p className="text-xs text-gray-500">{formatRand(Math.abs(levyVar))} variance</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => apiClient.post('/reconciliation/run', { property_id: 'all' }).then(() => window.location.reload())}
            className="mt-4 text-xs text-pomp-blue hover:underline"
          >
            Run reconciliation
          </button>
        </div>

        <div className="card">
          <h3 className="font-heading font-semibold text-pomp-navy mb-4">Financial Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Rental Income</span><span className="font-semibold">{formatRand(data.rentalIncome || 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Levy Income</span><span className="font-semibold">{formatRand(data.levyIncome || 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Bank Deposits</span><span className="font-semibold">{formatRand(data.bankDeposits || 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Municipality Levy Total</span><span className="font-semibold">{formatRand(data.municipalityTotal || 0)}</span></div>
            <hr className="my-2" />
            <div className="flex justify-between"><span className="text-gray-500">Portfolio Value</span><span className="font-semibold text-pomp-green">{formatRand(data.totalValue || 0)}</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-heading font-semibold text-pomp-navy mb-4">Properties</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase tracking-wider"><th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Scheme</th><th className="pb-3 pr-4">Units</th><th className="pb-3 pr-4">Value</th><th className="pb-3">Suburb</th></tr></thead>
            <tbody>
              {data.properties?.filter((p: any) => p.name).map((p: any) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-pomp-light/50">
                  <td className="py-3 pr-4 font-medium">{p.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{p.scheme_name || '-'}</td>
                  <td className="py-3 pr-4">{p.unit_count || 1}</td>
                  <td className="py-3 pr-4">{formatRand(p.current_market_value || 0)}</td>
                  <td className="py-3 text-gray-500">{p.suburb || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
