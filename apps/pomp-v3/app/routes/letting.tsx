import React, { useEffect, useState } from 'react'
import { UserCheck } from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'
import { useCache } from '../lib/cache'

export default function LettingAgent() {
  const { properties } = useCache()
  const [ledger, setLedger] = useState<any[]>([])

  useEffect(() => {
    apiClient.get('/ledger/rental_ledger?property_id=all&pageSize=2000').then((data: any) => {
      setLedger(data.entries || data)
    })
  }, [])

  const byProperty: Record<string, { income: number, expenses: number, entries: number, lastDate: string }> = {}
  for (const e of ledger) {
    if (!byProperty[e.property_id]) byProperty[e.property_id] = { income: 0, expenses: 0, entries: 0, lastDate: '' }
    byProperty[e.property_id].income += e.credit || 0
    byProperty[e.property_id].expenses += e.debit || 0
    byProperty[e.property_id].entries++
    if (e.date > byProperty[e.property_id].lastDate) byProperty[e.property_id].lastDate = e.date
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-pomp-navy mb-2">Letting Agent</h2>
      <p className="text-sm text-gray-500 mb-6">Rental income and letting agent performance per property</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((prop: any) => {
          const stats = byProperty[prop.id]
          return (
            <div key={prop.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pomp-blue to-pomp-teal flex items-center justify-center">
                  <UserCheck size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-pomp-navy">{prop.name}</h3>
                  <p className="text-xs text-gray-500">{prop.scheme_name || 'No scheme'}</p>
                </div>
              </div>
              {stats ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Total Rental Income</p>
                    <p className="font-semibold text-green-600">{formatRand(stats.income)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Expenses</p>
                    <p className="font-semibold text-red-600">{formatRand(stats.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Entries</p>
                    <p className="font-semibold">{stats.entries}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Entry</p>
                    <p className="font-semibold">{stats.lastDate || '—'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No rental data yet.</p>
              )}
              <div className="mt-3 pt-3 border-t border-pomp-border text-xs text-gray-400">
                <p>Address: {prop.address || '—'}</p>
                <p>Value: {formatRand(prop.current_market_value || 0)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
