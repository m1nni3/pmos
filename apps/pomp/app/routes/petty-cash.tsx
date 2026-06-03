import { useEffect, useState } from 'react'
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'
import { useCache } from '../lib/cache'

export default function PettyCashPage() {
  const { properties } = useCache()
  const [data, setData] = useState<any>(null)
  const [filterProp, setFilterProp] = useState('')
  const [showIncome, setShowIncome] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [incForm, setIncForm] = useState({ date: '', description: '', amount: '', category: '', notes: '' })
  const [expForm, setExpForm] = useState({ date: '', description: '', amount: '', category: '', supplier: '', vat_inclusive: true, notes: '' })

  const load = () => {
    const params = new URLSearchParams()
    if (filterProp) params.set('property_id', filterProp)
    apiClient.get(`/petty-cash?${params}`).then(setData)
  }
  useEffect(load, [filterProp])

  const addIncome = async () => {
    await apiClient.post('/petty-cash/income', { ...incForm, amount: parseFloat(incForm.amount) || 0 })
    setShowIncome(false)
    setIncForm({ date: '', description: '', amount: '', category: '', notes: '' })
    load()
  }

  const addExpense = async () => {
    await apiClient.post('/petty-cash/expenses', { ...expForm, amount: parseFloat(expForm.amount) || 0 })
    setShowExpense(false)
    setExpForm({ date: '', description: '', amount: '', category: '', supplier: '', vat_inclusive: true, notes: '' })
    load()
  }

  const deleteInc = async (id: string) => { await apiClient.delete(`/petty-cash/income/${id}`); load() }
  const deleteExp = async (id: string) => { await apiClient.delete(`/petty-cash/expenses/${id}`); load() }

  function calcVAT(amount: number, inclusive: boolean) {
    return inclusive ? amount * 15 / 115 : amount * 0.15
  }

  const allEntries = [
    ...(data?.income || []).map((r: any) => ({ ...r, type: 'income' })),
    ...(data?.expenses || []).map((r: any) => ({ ...r, type: 'expense' })),
  ].sort((a: any, b: any) => b.date?.localeCompare(a.date) || 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Petty Cash Tracker</h2>
          <p className="text-xs text-gray-500">Track income and expenses with VAT calculation</p>
        </div>
      </div>

      <div className="kpi-row mb-4">
        <div className="kpi-card border-t-green-500"><p className="text-gray-500 text-xs uppercase">Total Income</p><p className="text-xl font-bold text-green-600">{formatRand(data?.totalIncome || 0)}</p></div>
        <div className="kpi-card border-t-red-500"><p className="text-gray-500 text-xs uppercase">Total Expenses</p><p className="text-xl font-bold text-red-600">{formatRand(data?.totalExpenses || 0)}</p></div>
        <div className="kpi-card border-t-pomp-blue"><p className="text-gray-500 text-xs uppercase">Balance</p><p className={`text-xl font-bold ${(data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRand(data?.balance || 0)}</p></div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          <select value={filterProp} onChange={e => setFilterProp(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <option value="">All Properties</option>
            {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowIncome(true)} className="btn-primary text-sm flex items-center gap-1.5"><Plus size={16} /> Add Income</button>
          <button onClick={() => setShowExpense(true)} className="btn-primary text-sm flex items-center gap-1.5"><Plus size={16} /> Add Expense</button>
        </div>
      </div>

      {showIncome && (
        <div className="card mb-4 border-2 border-green-500/30">
          <h4 className="font-semibold text-sm text-green-600 mb-3">New Income</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="date" value={incForm.date} onChange={e => setIncForm({...incForm, date: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Description" value={incForm.description} onChange={e => setIncForm({...incForm, description: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input type="number" step="0.01" placeholder="Amount" value={incForm.amount} onChange={e => setIncForm({...incForm, amount: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Category" value={incForm.category} onChange={e => setIncForm({...incForm, category: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Notes" value={incForm.notes} onChange={e => setIncForm({...incForm, notes: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addIncome} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700">Save</button>
            <button onClick={() => setShowIncome(false)} className="text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {showExpense && (
        <div className="card mb-4 border-2 border-red-500/30">
          <h4 className="font-semibold text-sm text-red-600 mb-3">New Expense</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="date" value={expForm.date} onChange={e => setExpForm({...expForm, date: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Description" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input type="number" step="0.01" placeholder="Amount" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Category" value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <input placeholder="Supplier" value={expForm.supplier} onChange={e => setExpForm({...expForm, supplier: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={expForm.vat_inclusive} onChange={e => setExpForm({...expForm, vat_inclusive: e.target.checked})} /> VAT Inclusive</label>
            <input placeholder="Notes" value={expForm.notes} onChange={e => setExpForm({...expForm, notes: e.target.value})} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          {expForm.amount && expForm.vat_inclusive && <p className="text-xs text-gray-400 mt-2">VAT: {formatRand(calcVAT(parseFloat(expForm.amount) || 0, true))} | Excl: {formatRand((parseFloat(expForm.amount) || 0) - calcVAT(parseFloat(expForm.amount) || 0, true))}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={addExpense} className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700">Save</button>
            <button onClick={() => setShowExpense(false)} className="text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {allEntries.map((e: any) => {
          const isInc = e.type === 'income'
          const propName = properties.find((p: any) => p.id === e.property_id)?.name || ''
          return (
            <div key={e.id} className={`card flex items-start justify-between py-2.5 ${isInc ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-red-400'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isInc ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {isInc ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div>
                  <p className="font-medium text-sm text-pomp-navy">{e.description}</p>
                  <p className="text-xs text-gray-400">{e.date} {propName && `· ${propName}`} {e.category && `· ${e.category}`}</p>
                  {e.supplier && <p className="text-xs text-gray-400">Supplier: {e.supplier}</p>}
                  {e.vat_inclusive !== undefined && <p className="text-xs text-gray-400">VAT: {formatRand(calcVAT(e.amount, !!e.vat_inclusive))} | {e.vat_inclusive ? 'Incl' : 'Excl'}</p>}
                  {e.notes && <p className="text-xs text-gray-400 mt-0.5">{e.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${isInc ? 'text-green-600' : 'text-red-600'}`}>{isInc ? '+' : '-'}{formatRand(e.amount)}</span>
                <button onClick={() => isInc ? deleteInc(e.id) : deleteExp(e.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
        {allEntries.length === 0 && <p className="text-sm text-gray-400">No entries yet. Add income or expenses above.</p>}
      </div>
    </div>
  )
}
