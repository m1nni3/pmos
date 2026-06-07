import React, { useEffect, useState, useCallback, useRef } from 'react'
import { apiClient, formatRand } from '../lib/utils'
import { useCache } from '../lib/cache'
import { toast } from 'sonner'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, Line } from 'recharts'

import type { PLCategory, PLCategoryKey, PLBudget, PLMonthly, PLEntry } from '../types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const

const CATEGORIES: readonly PLCategory[] = [
  { key: 'rentalIncome', label: 'Rental Income', sign: 1 },
  { key: 'levy',         label: 'Levy',          sign: -1 },
  { key: 'bondPayments', label: 'Bond Payment',  sign: -1 },
  { key: 'commission',   label: 'Commission',    sign: -1 },
  { key: 'maintenance',  label: 'Maintenance',   sign: -1 },
  { key: 'municipal',    label: 'Municipal',     sign: -1 },
  { key: 'misc',         label: 'Misc',          sign: -1 },
] as const

const EXPENSE_CATEGORIES: readonly PLCategory[] = CATEGORIES.filter(c => c.sign === -1)

function toArray(items: Array<{ month: number; amount?: number }>, key: 'amount' = 'amount'): number[] {
  const arr = Array(12).fill(0)
  for (const r of items || []) {
    const idx = r.month - 1
    if (idx >= 0 && idx < 12) arr[idx] += r[key] || 0
  }
  return arr
}

const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0)

interface ActualRow {
  label: string
  monthly: number[]
  entryCount: number
}

export default function Finances() {
  const { properties } = useCache()
  const [plData, setPlData] = useState<PLBudget[]>([])
  const [monthlyData, setMonthlyData] = useState<PLMonthly[]>([])
  const [entries, setEntries] = useState<PLEntry[]>([])
  const [filterProp, setFilterProp] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [editMode, setEditMode] = useState(false)
  const [editCell, setEditCell] = useState<{ catKey: PLCategoryKey; month: number } | null>(null)
  const [editVal, setEditVal] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const savingRef = useRef(false)

  const load = useCallback(() => {
    const params = new URLSearchParams({ year })
    if (filterProp) params.set('property_id', filterProp)
    apiClient.get<PLBudget[]>(`/pl?${params}`).then(d => { setPlData(d ?? []); setLoading(false) }).catch(() => setLoading(false))
    apiClient.get<PLMonthly[]>(`/pl-monthly?${params}`).then(d => setMonthlyData(d ?? [])).catch(() => setMonthlyData([]))
    apiClient.get<PLEntry[]>(`/pl-entries?${params}`).then(d => setEntries(d ?? [])).catch(() => setEntries([]))
  }, [filterProp, year])

  useEffect(() => { load() }, [load])

  const saveBudget = async (category: string, budget_amount: number | null) => {
    try {
      await apiClient.post('/pl', { property_id: filterProp || null, year, category, budget_amount, actual_override: undefined })
      toast.success(budget_amount != null ? 'Budget updated' : 'Budget cleared')
      load()
    } catch { toast.error('Failed to save budget') }
  }

  const saveActual = async (catKey: PLCategoryKey, month: number, amountOverride?: string) => {
    if (savingRef.current) return
    savingRef.current = true
    const record = monthlyData.find(r => r.category_key === catKey && r.month === month)
    const amount = parseFloat(amountOverride ?? editVal) || 0
    try {
      if (record) {
        await apiClient.put(`/pl-monthly/${record.id}`, { amount })
      } else {
        await apiClient.post('/pl-monthly', { property_id: filterProp || null, year, month, category_key: catKey, amount })
      }
      toast.success('Actual updated')
      setEditCell(null)
      load()
    } catch { toast.error('Failed to update actual') }
    savingRef.current = false
  }

  const plBudget = (catKey: PLCategoryKey): number | null => {
    if (!filterProp) {
      const global = plData.find(r => r.category === catKey && !r.property_id)
      return global?.budget_amount ?? null
    }
    return plData.find(r => r.category === catKey)?.budget_amount ?? null
  }

  const actualRows: ActualRow[] = CATEGORIES.map(cat => {
    const catRows = monthlyData.filter(r => r.category_key === cat.key)
    const entryRows = entries.filter(r => r.category_key === cat.key)
    const monthly = toArray(catRows)
    const entryMonthly = toArray(entryRows)
    for (let m = 0; m < 12; m++) monthly[m] += entryMonthly[m]
    return { label: cat.label, monthly, entryCount: entryRows.length }
  })

  const actualNetts = Array(12).fill(0)
  for (const row of actualRows) {
    const sign = CATEGORIES.find(c => c.label === row.label)?.sign || 0
    for (let m = 0; m < 12; m++) actualNetts[m] += row.monthly[m] * sign
  }

  const budgetRows = CATEGORIES.map(cat => ({
    label: cat.label,
    monthly: (() => {
      const annual = plBudget(cat.key)
      return annual != null ? Array(12).fill(Math.round(annual / 12 * 100) / 100) : Array(12).fill(0)
    })(),
  }))

  const budgetNetts = Array(12).fill(0)
  for (const row of budgetRows) {
    const sign = CATEGORIES.find(c => c.label === row.label)?.sign || 0
    for (let m = 0; m < 12; m++) budgetNetts[m] += row.monthly[m] * sign
  }

  const varianceMonthly = budgetNetts.map((b, i) => b - actualNetts[i])

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    Income: Math.round(actualRows.filter(r => r.label === 'Rental Income')[0]?.monthly[i] || 0),
    Expenses: Math.round(actualRows.filter(r => r.label !== 'Rental Income').reduce((s, r) => s + (r.monthly[i] || 0), 0)),
    Net: Math.round(actualNetts[i]),
    BudgetNet: Math.round(budgetNetts[i]),
  }))

  if (loading && monthlyData.length === 0 && plData.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400 italic">Loading…</div>
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h2 className="page-title">Profit & Loss</h2>
          <p className="page-sub">Portfolio-wide profitability</p>
        </div>
      </div>

      <div className="flex gap-2 items-center shrink-0 mt-3">
        <label className="sr-only" htmlFor="pl-filter-prop">Filter by property</label>
        <select id="pl-filter-prop" value={filterProp} onChange={e => setFilterProp(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-[13px] bg-white">
          <option value="">All Properties</option>
          {properties.filter(p => p.name !== 'The Studio').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <label className="sr-only" htmlFor="pl-year">Year</label>
        <select id="pl-year" value={year} onChange={e => setYear(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-[13px] bg-white">
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="flex gap-3 mt-3 shrink-0 min-h-0">
        <div className="flex-1 bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] p-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Income vs Expenses</h4>
          <ResponsiveContainer width="100%" height={130}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={(v: number) => [formatRand(v)]} />
              <Bar dataKey="Income" fill="#16a34a" radius={[3, 3, 0, 0]} maxBarSize={16} />
              <Bar dataKey="Expenses" fill="#dc2626" radius={[3, 3, 0, 0]} maxBarSize={16} />
              <Line dataKey="Net" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] p-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Budget vs Actual</h4>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={(v: number) => [formatRand(v)]} />
              <Bar dataKey="BudgetNet" fill="#94a3b8" radius={[3, 3, 0, 0]} maxBarSize={16} />
              <Bar dataKey="Net" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-[220px] shrink-0 bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] p-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Budget</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map(cat => (
              <BudgetCard
                key={cat.key}
                label={cat.label}
                budget={plBudget(cat.key)}
                isIncome={cat.sign === 1}
                onSave={(val) => saveBudget(cat.key, val)}
                compact
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 mt-3 flex flex-col">
        <div className="flex items-center justify-between shrink-0 mb-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actual</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)}
              className="text-xs px-2 py-1 rounded bg-pomp-blue text-white hover:bg-pomp-navy">
              + Add
            </button>
            {filterProp && (
              <button onClick={() => { setEditMode(!editMode); setEditCell(null) }}
                className={`text-xs px-2 py-1 rounded ${editMode ? 'bg-pomp-blue text-white' : 'text-gray-400 border border-gray-300 hover:bg-gray-50'}`}>
                {editMode ? 'Done' : 'Edit'}
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col card-flush">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#cacbcc] text-left sticky top-0 z-10">
                  <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-36">Category</th>
                  {MONTHS.map(m => <th key={m} scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">{m}</th>)}
                  <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Annual</th>
                </tr>
              </thead>
              <tbody>
                {actualRows.map(row => {
                  const cat = CATEGORIES.find(c => c.label === row.label)
                  const catKey = cat?.key
                  if (!catKey) return null
                  return (
                    <tr key={row.label} className="border-b border-[#cacbcc]/40 hover:bg-gray-50/50">
                      <th scope="row" className="px-3 py-1.5 font-medium text-left">{row.label}</th>
                      {row.monthly.map((v, i) => {
                        const editing = editMode && editCell?.catKey === catKey && editCell?.month === i + 1
                        return (
                          <td key={i} className="px-3 py-1.5 text-right tabular-nums text-gray-700">
                            {editing ? (
                              <input type="number" step="0.01" value={editVal} autoFocus aria-label={`${catKey} ${MONTHS[i]} actual`}
                                onChange={e => setEditVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveActual(catKey, i + 1, e.currentTarget.value); if (e.key === 'Escape') setEditCell(null) }}
                                className="w-full border border-pomp-blue rounded px-1 py-0.5 text-[13px] tabular-nums outline-none text-right" />
                            ) : editMode ? (
                              <button onClick={() => { setEditCell({ catKey, month: i + 1 }); setEditVal(String(v || '')) }}
                                className="hover:bg-gray-100 px-1 -mx-1 rounded cursor-pointer text-inherit text-right w-full">
                                {formatRand(v)}
                              </button>
                            ) : (
                              <span>{formatRand(v)}</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-3 py-1.5 text-right tabular-nums font-semibold text-gray-800">{formatRand(sum(row.monthly))}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50/80 border-t-2 border-[#cacbcc] sticky bottom-0">
                  <td className="px-3 py-1.5 text-[11px] font-bold uppercase text-pomp-navy">Nett Income</td>
                  {actualNetts.map((v, i) => (
                    <td key={i} className={`px-3 py-1.5 text-right tabular-nums font-bold ${v >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRand(v)}</td>
                  ))}
                  <td className={`px-3 py-1.5 text-right tabular-nums font-bold ${sum(actualNetts) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRand(sum(actualNetts))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1 shrink-0">Variance</p>
        <div className="shrink-0 card-flush">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#cacbcc] text-left">
                  <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-36">Month</th>
                  {MONTHS.map(m => <th key={m} scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">{m}</th>)}
                  <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Annual</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#cacbcc]/40">
                  <th scope="row" className="px-3 py-1.5 font-medium text-left">Variance</th>
                  {varianceMonthly.map((v, i) => (
                    <td key={i} className={`px-3 py-1.5 text-right tabular-nums font-medium ${v >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRand(v)}</td>
                  ))}
                  <td className={`px-3 py-1.5 text-right tabular-nums font-bold ${sum(varianceMonthly) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRand(sum(varianceMonthly))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="shrink-0 mt-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 shrink-0">Entries</p>
            <div className="card-flush max-h-[240px] overflow-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#cacbcc] text-left sticky top-0 z-10">
                    <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-16">Month</th>
                    <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Deducted Expenses</th>
                    <th scope="col" className="px-3 py-1.5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => {
                    const cat = CATEGORIES.find(c => c.key === e.category_key)
                    const deducted: string[] = (() => { try { return JSON.parse(e.deducted_expenses || '[]') } catch { return [] } })()
                    const deductedLabels = deducted.map(k => CATEGORIES.find(c => c.key === k)?.label).filter(Boolean)
                    return (
                      <tr key={e.id} className="border-b border-[#cacbcc]/40 hover:bg-gray-50/50">
                        <td className="px-3 py-1.5 text-gray-600">{MONTHS[e.month - 1]}</td>
                        <td className="px-3 py-1.5 font-medium">{cat?.label || e.category_key}</td>
                        <td className={`px-3 py-1.5 text-right tabular-nums font-medium ${cat?.sign === 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatRand(e.amount)}
                        </td>
                        <td className="px-3 py-1.5 text-gray-500 text-[12px] max-w-[160px] truncate">{e.description || '—'}</td>
                        <td className="px-3 py-1.5 text-[12px] text-gray-500">
                          {deductedLabels.length > 0 ? deductedLabels.join(', ') : '—'}
                        </td>
                        <td className="px-3 py-1.5">
                          <button onClick={async () => {
                            await apiClient.delete(`/pl-entries/${e.id}`)
                            toast.success('Entry deleted')
                            load()
                          }} className="text-[10px] text-gray-300 hover:text-red-500">del</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddEntryModal
          year={year}
          properties={properties}
          filterProp={filterProp}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); load() }}
        />
      )}
    </div>
  )
}

function AddEntryModal({ year, properties, filterProp, onClose, onSaved }: {
  year: string
  properties: Array<{ id: string; name: string }>
  filterProp: string
  onClose: () => void
  onSaved: () => void
}) {
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [categoryKey, setCategoryKey] = useState<PLCategoryKey>('rentalIncome')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [deductedExpenses, setDeductedExpenses] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const toggleDeducted = (key: string) => {
    setDeductedExpenses(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleSave = async () => {
    if (!amount || !month) { toast.error('Month and amount required'); return }
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        year,
        month: parseInt(month, 10),
        category_key: categoryKey,
        amount: parseFloat(amount),
        description,
      }
      if (filterProp) body.property_id = filterProp
      if (categoryKey === 'rentalIncome') {
        body.deducted_expenses = deductedExpenses
      }
      await apiClient.post('/pl-entries', body)
      toast.success('Entry added')
      onSaved()
    } catch {
      toast.error('Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  const isRentalIncome = categoryKey === 'rentalIncome'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-entry-title">
      <div className="bg-white rounded-card shadow-xl w-[440px] max-w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h3 id="add-entry-title" className="text-[15px] font-bold text-pomp-navy">Add Entry</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-300 hover:text-gray-500 text-lg leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="entry-month" className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Month</label>
              <select id="entry-month" value={month} onChange={e => setMonth(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-[13px] bg-white mt-1">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="entry-cat" className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Category</label>
              <select id="entry-cat" value={categoryKey} onChange={e => setCategoryKey(e.target.value as PLCategoryKey)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-[13px] bg-white mt-1">
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="entry-amount" className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Amount (R)</label>
            <input id="entry-amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-[13px] mt-1" />
          </div>
          <div>
            <label htmlFor="entry-desc" className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <input id="entry-desc" type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Optional note…"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-[13px] mt-1" />
          </div>

          {isRentalIncome && (
            <fieldset className="bg-yellow-50 border border-yellow-200 rounded p-3 space-y-2">
              <legend className="text-[11px] font-semibold text-yellow-800 uppercase tracking-wider px-1">Deducted Expenses</legend>
              <p className="text-[11px] text-yellow-700">Check which expenses have already been deducted from this income:</p>
              <div className="space-y-1">
                {EXPENSE_CATEGORIES.map(cat => (
                  <label key={cat.key} className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" checked={deductedExpenses.includes(cat.key)}
                      onChange={() => toggleDeducted(cat.key)}
                      className="rounded border-gray-300 text-pomp-blue focus:ring-pomp-blue" />
                    {cat.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button onClick={onClose}
            className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="text-xs px-3 py-1.5 rounded bg-pomp-blue text-white hover:bg-pomp-navy disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BudgetCard({ label, budget, isIncome, onSave, compact }: {
  label: string
  budget: number | null
  isIncome: boolean
  onSave: (val: number | null) => void
  compact?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  const commit = (v: string) => {
    onSave(v ? parseFloat(v) : null)
    setEditing(false)
  }

  if (compact) {
    return (
      <div className={`rounded border-l-2 pl-1.5 ${isIncome ? 'border-l-green-500' : 'border-l-red-400'}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-wider truncate ${isIncome ? 'text-green-700' : 'text-red-700'}`}>{label}</p>
        {editing ? (
          <input type="number" value={value} onChange={e => setValue(e.target.value)} aria-label={`${label} budget`}
            onKeyDown={e => { if (e.key === 'Enter') commit(value); if (e.key === 'Escape') setEditing(false) }}
            className="w-full border border-pomp-blue rounded px-1 py-0.5 text-[11px] tabular-nums outline-none" autoFocus />
        ) : (
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[12px] font-bold tabular-nums ${budget != null ? 'text-gray-800' : 'text-gray-300'}`}>
              {budget != null ? formatRand(budget) : '—'}
            </span>
            <button onClick={() => { setValue(budget != null ? String(budget) : ''); setEditing(true) }}
              className="text-[9px] text-gray-300 hover:text-pomp-blue leading-none">edit</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] p-[15px] space-y-2 border-t-4 ${isIncome ? 'border-t-green-500' : 'border-t-red-400'}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${isIncome ? 'text-green-700' : 'text-red-700'}`}>{label}</p>
      {editing ? (
        <input type="number" value={value} onChange={e => setValue(e.target.value)} aria-label={`${label} budget`}
          onKeyDown={e => { if (e.key === 'Enter') commit(value); if (e.key === 'Escape') setEditing(false) }}
          className="w-full border border-pomp-blue rounded px-1.5 py-1 text-[13px] tabular-nums outline-none" autoFocus />
      ) : (
        <div className="flex items-center justify-between">
          <span className={`text-[15px] font-bold tabular-nums ${budget != null ? 'text-gray-800' : 'text-gray-300'}`}>
            {budget != null ? formatRand(budget) : '—'}
          </span>
          <button onClick={() => { setValue(budget != null ? String(budget) : ''); setEditing(true) }}
            className="text-[10px] text-gray-300 hover:text-pomp-blue">edit</button>
        </div>
      )}
    </div>
  )
}
