import React, { useEffect, useState } from 'react'
import { ShieldCheck, Info, AlertCircle } from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'

export default function Insurance() {
  const [policies, setPolicies] = useState<any[]>([])

  useEffect(() => { apiClient.get('/insurance').then(setPolicies) }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-heading text-xl font-bold text-pomp-navy">Insurance (Reference)</h2>
        <span className="badge-blue text-[10px]">BC-managed</span>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Insurance policies are held by the body corporate / managing agent, not the trust. This is a read-only reference view.
      </p>

      <div className="card mb-4 bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-900">
            Body corporate insurance is managed by the managing agent (Trafalgar / Kemprent / HuurKor).
            Coverage details and claims should be coordinated through them. This page is informational only.
          </p>
        </div>
      </div>

      <div className="card">
        {policies.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 italic">
            <AlertCircle size={14} />
            <span>No insurance policy data on file. Manage with your body corporate agent.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-pomp-border">
                  <th className="pb-2 font-medium">Property</th>
                  <th className="pb-2 font-medium">Insurer</th>
                  <th className="pb-2 font-medium">Broker</th>
                  <th className="pb-2 font-medium">Policy</th>
                  <th className="pb-2 font-medium text-right">Coverage</th>
                  <th className="pb-2 font-medium text-right">Premium</th>
                  <th className="pb-2 font-medium">Renewal</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.id} className="border-b border-pomp-border/50">
                    <td className="py-2 font-medium">{p.property_name || p.property_id}</td>
                    <td className="py-2">{p.insurer || '—'}</td>
                    <td className="py-2 text-gray-600">{p.broker || '—'}</td>
                    <td className="py-2 font-mono text-xs">{p.policy_number || '—'}</td>
                    <td className="py-2 text-right">{formatRand(p.coverage_amount || 0)}</td>
                    <td className="py-2 text-right">{formatRand(p.premium || 0)}</td>
                    <td className="py-2 text-gray-600">{p.renewal_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
