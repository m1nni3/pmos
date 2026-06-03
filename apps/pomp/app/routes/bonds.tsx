import React, { useEffect, useState } from 'react'
import { Landmark, Calendar, Percent, TrendingDown, Wallet } from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'
import { PropertyFilter } from '../components/FilterBar'

export default function Bonds() {
  const [bonds, setBonds] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>('all')

  useEffect(() => {
    // Fetch both bonds and properties
    Promise.all([
      apiClient.get('/bonds'),
      apiClient.get('/properties')
    ]).then(([bondsData, propertiesData]) => {
      setBonds(bondsData)
      setProperties(propertiesData)
    })
  }, [])

  // Filter bonds by selected property
  const filteredBonds = selectedProperty === 'all' 
    ? bonds 
    : bonds.filter(bond => bond.property_id === selectedProperty)

  const totalOriginal = filteredBonds.reduce((s, b) => s + (b.original_amount || 0), 0)
  const totalMonthly = filteredBonds.reduce((s, b) => s + (b.monthly_payment || 0), 0)
  const totalRemaining = filteredBonds.reduce((s, b) => s + (b.balance_remaining || 0), 0)
  const totalInterest = filteredBonds.reduce((s, b) => s + (b.total_interest || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Bonds</h2>
          <p className="text-xs text-gray-500 mt-1">Bond balances, amortization, and monthly commitments</p>
        </div>
        <div className="flex items-center space-x-4">
          <PropertyFilter 
            value={selectedProperty} 
            onChange={setSelectedProperty} 
            properties={properties} 
          />
        </div>
      </div>

      <div className="kpi-row mb-6">
        <div className="kpi-card border-t-pomp-blue">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Total Bonded</span>
            <Landmark size={16} className="text-gray-400" />
          </div>
          <p className="text-xl font-bold text-pomp-navy">{formatRand(totalOriginal)}</p>
          <p className="text-xs text-gray-400 mt-1">Original loan principal</p>
        </div>
        <div className="kpi-card border-t-pomp-red">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Outstanding</span>
            <TrendingDown size={16} className="text-gray-400" />
          </div>
          <p className="text-xl font-bold text-red-600">{formatRand(totalRemaining)}</p>
          <p className="text-xs text-gray-400 mt-1">Estimated balance</p>
        </div>
        <div className="kpi-card border-t-pomp-orange">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Monthly Total</span>
            <Wallet size={16} className="text-gray-400" />
          </div>
          <p className="text-xl font-bold text-pomp-navy">{formatRand(totalMonthly)}</p>
          <p className="text-xs text-gray-400 mt-1">All bond payments</p>
        </div>
        <div className="kpi-card border-t-purple-500">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Projected Interest</span>
            <Percent size={16} className="text-gray-400" />
          </div>
          <p className="text-xl font-bold text-purple-700">{formatRand(totalInterest)}</p>
          <p className="text-xs text-gray-400 mt-1">Total to be paid</p>
        </div>
      </div>

      <div className="space-y-4">
        {bonds.length === 0 ? (
          <div className="card">
            <p className="text-sm text-gray-400 italic">No bond data yet. Import bond records to populate.</p>
          </div>
        ) : bonds.map((b: any) => {
          const monthsRemaining = b.total_months_remaining || 0
          const monthsPaid = b.months_paid || 0
          const total = (monthsRemaining + monthsPaid) || 1
          const progressPct = Math.min(100, (monthsPaid / total) * 100)
          return (
            <div key={b.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-pomp-navy text-base flex items-center gap-2">
                    <Landmark size={16} className="text-pomp-blue" />
                    {b.bank || 'Unknown Bank'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{b.property_name} · {b.scheme_name || 'No scheme'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Account</p>
                  <p className="text-xs font-mono">{b.account_number || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Original</p>
                  <p className="font-semibold text-pomp-navy">{formatRand(b.original_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="font-semibold text-red-600">{formatRand(b.balance_remaining || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monthly</p>
                  <p className="font-semibold">{formatRand(b.monthly_payment || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payoff</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar size={12} />
                    {b.expected_payoff_date || '—'}
                  </p>
                </div>
              </div>

              {/* Amortization progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress: {monthsPaid} of {total} months</span>
                  <span>{progressPct.toFixed(1)}% paid</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pomp-blue to-pomp-green transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {b.payment_method && (
                <p className="text-xs text-gray-400 mt-2">Payment: {b.payment_method}</p>
              )}
              {b.provider_name && (
                <p className="text-xs text-gray-400">Contact: {b.provider_name}{b.provider_phone ? ` · ${b.provider_phone}` : ''}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
