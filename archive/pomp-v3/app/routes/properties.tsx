import React, { useEffect, useState } from 'react'
import {
  Home, ArrowLeft, UserCheck, DollarSign, ShieldCheck,
  Landmark, Users, History, Info, MapPin, AlertCircle
} from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'
import { useCache } from '../lib/cache'

const TABS = ['Overview', 'Letting', 'Management', 'Bonds', 'Insurance', 'Units', 'History'] as const
type Tab = typeof TABS[number]

const SCHEME_MAP: Record<string, { scheme: string; agent: string }> = {
  Oakdale:  { scheme: 'Oakdale BC',           agent: 'Trafalgar'     },
  Malindi:  { scheme: 'George Rennie BC',      agent: 'Kemprent'      },
  Indaba:   { scheme: 'Indaba BC SS310/1995',  agent: 'HuurKor Admin' },
  Villeroy: { scheme: 'SS Villeroy',           agent: 'Trafalgar'     },
}

export default function Properties() {
  const { properties: props } = useCache()
  const [selected, setSelected] = useState<any>(null)
  const [detail,   setDetail]   = useState<any>(null)
  const [rental,   setRental]   = useState<any>(null)
  const [tab,      setTab]      = useState<Tab>('Overview')

  useEffect(() => {
    if (!selected) { setDetail(null); setRental(null); return }
    setTab('Overview')
    Promise.all([
      apiClient.get(`/properties/${selected.id}`),
      apiClient.get(`/ledger/rental_ledger?property_id=${selected.id}&pageSize=2000`),
    ]).then(([d, r]) => {
      setDetail(d)
      const entries = r.entries || r || []
      const income   = entries.reduce((s: number, e: any) => s + (e.credit || 0), 0)
      const expenses = entries.reduce((s: number, e: any) => s + (e.debit  || 0), 0)
      const dates    = entries.map((e: any) => e.date).filter(Boolean).sort()
      setRental({ income, expenses, entries: entries.length, lastDate: dates[dates.length - 1] || '—' })
    })
  }, [selected])

  if (!selected) {
    return (
      <div>
        <h2 className="font-heading text-xl font-bold text-pomp-navy mb-2">Properties</h2>
        <p className="text-xs text-gray-500 mb-6">Select a property to view letting, management, bonds, insurance and more</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {props.map((p: any) => (
            <div key={p.id} className="card cursor-pointer hover:ring-2 hover:ring-pomp-blue/30 transition-all" onClick={() => setSelected(p)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pomp-blue to-pomp-teal flex items-center justify-center">
                  <Home size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-pomp-navy">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.scheme_name || SCHEME_MAP[p.name]?.scheme || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600"><MapPin size={14} /><span>{p.suburb || '—'}</span></div>
                <div className="flex items-center gap-1.5 text-gray-600"><DollarSign size={14} /><span>{formatRand(p.current_market_value || 0)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const bc = SCHEME_MAP[selected.name] || {}

  return (
    <div>
      <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-pomp-blue hover:underline mb-4">
        <ArrowLeft size={14} /> Back to properties
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pomp-blue to-pomp-teal flex items-center justify-center">
          <Home size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">{selected.name}</h2>
          <p className="text-sm text-gray-500">{selected.address}</p>
        </div>
      </div>

      <div className="kpi-row mb-4">
        <div className="kpi-card border-t-pomp-green">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Market Value</p>
          <p className="text-xl font-bold text-pomp-navy">{formatRand(selected.current_market_value || 0)}</p>
        </div>
        <div className="kpi-card border-t-pomp-blue">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Purchase Price</p>
          <p className="text-xl font-bold text-pomp-navy">{formatRand(selected.purchase_price || 0)}</p>
        </div>
        <div className="kpi-card border-t-green-500">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Rental Income</p>
          <p className="text-xl font-bold text-green-600">{rental ? formatRand(rental.income) : '—'}</p>
        </div>
        <div className="kpi-card border-t-pomp-orange">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Letting Agent</p>
          <p className="text-lg font-bold text-pomp-navy">{(detail?.managing_agent_name) || bc.agent || '—'}</p>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap mb-4 border-b border-pomp-border">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-pomp-blue text-pomp-blue' : 'border-transparent text-gray-500 hover:text-pomp-navy'}`}
          >{t}</button>
        ))}
      </div>

      {tab === 'Overview' && detail && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold text-pomp-navy text-sm mb-3">Property Details</h4>
            <dl className="space-y-1.5 text-sm">
              {([
                ['Address', detail.address], ['Suburb', detail.suburb], ['Township', detail.township],
                ['Erf Number', detail.erf_number], ['Unit Number', detail.unit_number],
                ['Scheme Number', detail.scheme_number],
                ['Size', detail.size_sqm ? `${detail.size_sqm} m²` : null],
                ['Bedrooms', detail.bedrooms], ['Bathrooms', detail.bathrooms], ['Parking', detail.parking_bays],
                ['Title Deed', detail.title_deed_reference], ['LPI Code', detail.lpi_code],
              ] as [string,any][]).filter(([,v]) => v != null && v !== '').map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card">
            <h4 className="font-semibold text-pomp-navy text-sm mb-3">Municipal</h4>
            <dl className="space-y-1.5 text-sm">
              {([
                ['Municipality', detail.municipality_name], ['Account Number', detail.municipal_account_number],
                ['Valuation', detail.municipal_valuation ? formatRand(detail.municipal_valuation) : null],
                ['Valuation Year', detail.municipal_valuation_year], ['Paid By', detail.municipal_paid_by],
              ] as [string,any][]).filter(([,v]) => v != null && v !== '').map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{val}</dd>
                </div>
              ))}
            </dl>
            <h4 className="font-semibold text-pomp-navy text-sm mb-2 mt-4">Ownership</h4>
            <dl className="space-y-1.5 text-sm">
              {([
                ['Owner', detail.owner_name], ['Owner ID', detail.owner_id],
                ['Registered Owner', detail.registered_owner], ['Purchase Date', detail.purchase_date],
              ] as [string,any][]).filter(([,v]) => v != null && v !== '').map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card">
            <h4 className="font-semibold text-pomp-navy text-sm mb-3">Tenant</h4>
            <dl className="space-y-1.5 text-sm">
              {([
                ['Name', detail.tenant_name], ['Phone', detail.tenant_phone],
                ['Email', detail.tenant_email], ['Notes', detail.tenant_notes],
              ] as [string,any][]).filter(([,v]) => v != null && v !== '').map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card">
            <h4 className="font-semibold text-pomp-navy text-sm mb-3">Emergency Contact</h4>
            <dl className="space-y-1.5 text-sm">
              {([
                ['Name', detail.emergency_contact_name], ['Phone', detail.emergency_contact_phone],
                ['Email', detail.emergency_contact_email], ['Notes', detail.emergency_contact_notes],
              ] as [string,any][]).filter(([,v]) => v != null && v !== '').map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {tab === 'Letting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3"><UserCheck size={16} className="text-pomp-blue" /><h4 className="font-semibold text-pomp-navy text-sm">Letting Agent</h4></div>
            {(() => {
              const rows = detail && ([
                ['Agent',             detail.managing_agent_name || bc.agent],
                ['Agency',            detail.agency],
                ['Portfolio Manager', detail.portfolio_manager],
                ['Email',             detail.agent_email],
                ['Phone',             detail.agent_phone],
                ['Administrator',     detail.account_administrator],
                ['Maintenance Mgr',   detail.maintenance_manager],
                ['Dept Head',         detail.department_head],
                ['Management Fee',    detail.management_fee ? formatRand(detail.management_fee) : null],
                ['Payment Method',    detail.payment_method],
                ['Branch',            detail.branch],
                ['Branch Code',       detail.branch_code],
              ] as [string,any][]).filter(([,v]) => v != null && v !== '')
              return rows?.length
                ? <dl className="space-y-1.5 text-sm">{rows.map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{val}</dd>
                    </div>
                  ))}</dl>
                : <p className="text-sm text-gray-400 italic">No letting agent details on file. Update property_details to populate.</p>
            })()}
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-3"><DollarSign size={16} className="text-green-600" /><h4 className="font-semibold text-pomp-navy text-sm">Rental Summary</h4></div>
            {rental ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Total Income</span><span className="font-semibold text-green-600">{formatRand(rental.income)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Expenses</span><span className="font-semibold text-red-600">{formatRand(rental.expenses)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Net</span><span className="font-semibold">{formatRand(rental.income - rental.expenses)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Ledger Entries</span><span className="font-semibold">{rental.entries}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Last Entry</span><span className="font-semibold">{rental.lastDate}</span></div>
              </div>
            ) : <p className="text-sm text-gray-400 italic">No rental data</p>}
          </div>
        </div>
      )}

      {tab === 'Management' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3"><ShieldCheck size={16} className="text-pomp-purple" /><h4 className="font-semibold text-pomp-navy text-sm">Body Corporate</h4></div>
            {(() => {
              const rows = detail && ([
                ['BC Name',        detail.bc_name || bc.scheme],
                ['BC Reg Number',  detail.bc_registration_number],
                ['Managing Agent', detail.managing_agent_name || bc.agent],
                ['Contact Name',   detail.bc_contact_name],
                ['Contact Phone',  detail.bc_contact_phone],
                ['Contact Email',  detail.bc_contact_email],
                ['Bank',           detail.bc_bank],
                ['Account Name',   detail.bc_account_name],
                ['Branch',         detail.bc_branch],
                ['Branch Code',    detail.bc_branch_code],
                ['Levy Reference', detail.bc_levy_reference],
                ['Payment Method', detail.bc_levy_payment_method],
              ] as [string,any][]).filter(([,v]) => v != null && v !== '')
              return rows?.length
                ? <dl className="space-y-1.5 text-sm">{rows.map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{val}</dd>
                    </div>
                  ))}</dl>
                : <p className="text-sm text-gray-400 italic">No BC details on file. Update property_details to populate.</p>
            })()}
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-3"><Info size={16} className="text-blue-600" /><h4 className="font-semibold text-pomp-navy text-sm">BC Insurance (Reference)</h4></div>
            <div className="flex items-start gap-2 mb-3 p-2 bg-blue-50/50 rounded">
              <Info size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">Managed by the BC / managing agent. View-only.</p>
            </div>
            {detail?.insurance?.length ? detail.insurance.map((i: any) => (
              <div key={i.id} className="border-t border-pomp-border/50 py-2 first:border-0 text-sm">
                <div className="flex justify-between"><span className="font-medium">{i.insurer || '—'}</span><span>{formatRand(i.coverage_amount || 0)}</span></div>
                <p className="text-xs text-gray-500">Policy: {i.policy_number || '—'} · Renewal: {i.renewal_date || '—'}</p>
              </div>
            )) : <p className="text-sm text-gray-400 italic">No insurance on file</p>}
          </div>
        </div>
      )}

      {tab === 'Bonds' && (() => {
        // Use bonds table if populated, fall back to property_details bond fields
        const bondsData = detail?.bonds?.length ? detail.bonds
          : (detail?.bond_bank ? [{ id: 'pd', bank: detail.bond_bank, account_number: detail.bond_account_number, original_amount: detail.original_bond_amount, monthly_payment: detail.monthly_bond_payment, expected_payoff_date: detail.expected_payoff_date }] : [])
        return (
          <div>
            {!bondsData.length
              ? <div className="card"><p className="text-sm text-gray-400 italic">No bond data for this property.</p></div>
              : bondsData.map((b: any) => {
                  const monthsPaid = b.months_paid || 0
                  const total = ((b.total_months_remaining || 0) + monthsPaid) || 1
                  const pct = Math.min(100, (monthsPaid / total) * 100)
                  return (
                    <div key={b.id} className="card mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-pomp-navy flex items-center gap-2"><Landmark size={16} className="text-pomp-blue" />{b.bank || 'Unknown Bank'}</h3>
                        <p className="text-xs text-gray-500">Account: {b.account_number || '—'}</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                        <div><p className="text-xs text-gray-500">Original</p><p className="font-semibold">{formatRand(b.original_amount || 0)}</p></div>
                        <div><p className="text-xs text-gray-500">Balance</p><p className="font-semibold text-red-600">{formatRand(b.balance_remaining || 0)}</p></div>
                        <div><p className="text-xs text-gray-500">Monthly</p><p className="font-semibold">{formatRand(b.monthly_payment || 0)}</p></div>
                        <div><p className="text-xs text-gray-500">Payoff</p><p className="font-semibold">{b.expected_payoff_date || '—'}</p></div>
                      </div>
                      {monthsPaid > 0 && <>
                        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{monthsPaid} of {total} months</span><span>{pct.toFixed(1)}% paid</span></div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-pomp-blue to-pomp-green" style={{ width: `${pct}%` }} />
                        </div>
                      </>}
                      {b.payment_method && <p className="text-xs text-gray-400 mt-2">Payment: {b.payment_method}</p>}
                      {b.provider_name && <p className="text-xs text-gray-400">Contact: {b.provider_name}{b.provider_phone ? ` · ${b.provider_phone}` : ''}</p>}
                    </div>
                  )
                })
            }
          </div>
        )
      })()}

      {tab === 'Insurance' && (
        <div className="card">
          <div className="flex items-start gap-2 mb-4 p-2 bg-blue-50/50 rounded">
            <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900">BC-managed insurance. View-only — coordinate claims through the managing agent.</p>
          </div>
          {!detail?.insurance?.length
            ? <div className="flex items-center gap-2 text-sm text-gray-400 italic"><AlertCircle size={14} /><span>No insurance policy data on file.</span></div>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-pomp-border">
                      {['Insurer','Broker','Policy','Coverage','Premium','Renewal'].map(h => <th key={h} className="pb-2 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.insurance.map((i: any) => (
                      <tr key={i.id} className="border-b border-pomp-border/50">
                        <td className="py-2 font-medium">{i.insurer || '—'}</td>
                        <td className="py-2 text-gray-600">{i.broker || '—'}</td>
                        <td className="py-2 font-mono text-xs">{i.policy_number || '—'}</td>
                        <td className="py-2">{formatRand(i.coverage_amount || 0)}</td>
                        <td className="py-2">{formatRand(i.premium || 0)}</td>
                        <td className="py-2 text-gray-600">{i.renewal_date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      )}

      {tab === 'Units' && (
        <div className="card">
          {!detail?.units?.length
            ? <p className="text-sm text-gray-400 italic">No units recorded.</p>
            : <div className="divide-y divide-pomp-border/50">
                {detail.units.map((u: any) => (
                  <div key={u.id} className="py-3 flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{u.unit_number || 'Unit'}</p>
                      {u.tenant_name && <p className="text-xs text-gray-500">{u.tenant_name}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'vacant' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{u.status || '—'}</span>
                      {u.monthly_rental ? <p className="text-xs text-gray-500 mt-1">{formatRand(u.monthly_rental)}/mo</p> : null}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {tab === 'History' && (
        <div className="card">
          {!detail?.history?.length
            ? <p className="text-sm text-gray-400 italic">No history recorded.</p>
            : <div className="divide-y divide-pomp-border/50">
                {detail.history.map((h: any, i: number) => (
                  <div key={i} className="py-3 flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{h.event_type || 'Event'}</p>
                      <p className="text-xs text-gray-500">{h.description || '—'}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{h.event_date || '—'}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </div>
  )
}
