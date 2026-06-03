import React, { useEffect, useState } from 'react'
import { ShieldCheck, Info } from 'lucide-react'
import { Link } from 'react-router'
import { apiClient, formatRand } from '../lib/utils'

const SCHEMES = [
  { scheme: 'Oakdale BC', agent: 'Trafalgar', propertyName: 'Oakdale' },
  { scheme: 'George Rennie BC', agent: 'Kemprent', propertyName: 'Malindi' },
  { scheme: 'Indaba BC SS310/1995', agent: 'HuurKor Admin', propertyName: 'Indaba' },
  { scheme: 'SS Villeroy', agent: 'Trafalgar', propertyName: 'Villeroy' },
]

export default function Management() {
  const [props, setProps] = useState<any[]>([])
  const [insurance, setInsurance] = useState<any[]>([])

  useEffect(() => {
    apiClient.get('/properties').then(setProps)
    apiClient.get('/insurance').then(setInsurance)
  }, [])

  const getProp = (name: string) => props.find((p: any) => p.name === name)

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-pomp-navy mb-2">Management</h2>
      <p className="text-sm text-gray-500 mb-6">Managing agents, body corporate schemes, and governance</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {SCHEMES.map(bc => {
          const prop = getProp(bc.propertyName)
          return (
            <div key={bc.scheme} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pomp-purple to-pomp-magenta flex items-center justify-center">
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-pomp-navy">{bc.scheme}</h3>
                  <p className="text-xs text-gray-500">{bc.agent}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Property: {bc.propertyName}</p>
                <p>Address: {prop?.address || '—'}</p>
                <p>Scheme: {prop?.scheme_name || '—'}</p>
                {prop?.current_market_value && <p>Market Value: {formatRand(prop.current_market_value)}</p>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-pomp-navy">BC Insurance (Reference)</h3>
          <Link to="/insurance" className="text-xs text-pomp-blue hover:underline">View all →</Link>
        </div>
        <div className="flex items-start gap-2 mb-3 p-2 bg-blue-50/50 rounded">
          <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-900">
            Body corporate insurance is managed by the managing agent, not the trust. View-only reference.
          </p>
        </div>
        {insurance.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No insurance policies on file.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {insurance.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-t border-pomp-border/50">
                <div>
                  <p className="font-medium">{p.insurer || '—'}</p>
                  <p className="text-xs text-gray-500">{p.property_name || ''} · Policy: {p.policy_number || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Coverage</p>
                  <p className="font-semibold">{formatRand(p.coverage_amount || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
