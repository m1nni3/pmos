import { useEffect, useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { apiClient, formatRand } from '../lib/utils'
import { toast } from 'sonner'
import { ConfirmModal } from '../components'
import { useCache } from '../lib/cache'
import type { Property, PettyCashData, PettyCashEntry } from '../types'

interface IncomeForm {
  date: string
  description: string
  amount: string
  category: string
  notes: string
}

interface ExpenseForm {
  date: string
  description: string
  amount: string
  category: string
  supplier: string
  vat_inclusive: boolean
  notes: string
}

const EMPTY_INCOME: IncomeForm = { date: '', description: '', amount: '', category: '', notes: '' }
const EMPTY_EXPENSE: ExpenseForm = { date: '', description: '', amount: '', category: '', supplier: '', vat_inclusive: true, notes: '' }

export default function PettyCashPage() {
  const { properties } = useCache()
  const [data, setData] = useState<PettyCashData | null>(null)
  const [filterProp, setFilterProp] = useState('')
  const [showIncome, setShowIncome] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [incForm, setIncForm] = useState<IncomeForm>(EMPTY_INCOME)
  const [expForm, setExpForm] = useState<ExpenseForm>(EMPTY_EXPENSE)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'income' | 'expense' } | null>(null)

  const load = () => {
    const params = new URLSearchParams()
    if (filterProp) params.set('property_id', filterProp)
    apiClient.get<PettyCashData>(`/petty-cash?${params}`).then(d => setData(d))
  }
  useEffect(() => { load() }, [filterProp])

  const addIncome = async () => {
    try {
      await apiClient.post('/petty-cash/income', { ...incForm, amount: parseFloat(incForm.amount) || 0 })
      toast.success('Income added')
      setShowIncome(false)
      setIncForm(EMPTY_INCOME)
      load()
    } catch { toast.error('Failed to add income') }
  }

  const addExpense = async () => {
    try {
      await apiClient.post('/petty-cash/expenses', { ...expForm, amount: parseFloat(expForm.amount) || 0 })
      toast.success('Expense added')
      setShowExpense(false)
      setExpForm(EMPTY_EXPENSE)
      load()
    } catch { toast.error('Failed to add expense') }
  }

  const deleteInc = async (id: string) => {
    try {
      await apiClient.delete(`/petty-cash/income/${id}`)
      toast.success('Income entry deleted')
      setConfirmDelete(null)
      load()
    } catch { toast.error('Failed to delete entry') }
  }

  const deleteExp = async (id: string) => {
    try {
      await apiClient.delete(`/petty-cash/expenses/${id}`)
      toast.success('Expense entry deleted')
      setConfirmDelete(null)
      load()
    } catch { toast.error('Failed to delete entry') }
  }

  const calcVAT = (amount: number, inclusive: boolean) =>
    inclusive ? amount * 15 / 115 : amount * 0.15

  const allEntries: PettyCashEntry[] = [
    ...(data?.income || []).map(r => ({ ...r, type: 'income' as const })),
    ...(data?.expenses || []).map(r => ({ ...r, type: 'expense' as const })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Petty Cash</h2>
          <p className="text-xs text-gray-400">Track income and expenses</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto mt-3">
        <div className="kpi-row mb-4">
          <div className="kpi-card border-t-green-500">
            <p className="text-gray-500 text-xs uppercase">Total Income</p>
            <p className="text-xl font-bold text-green-600">{formatRand(data?.totalIncome || 0)}</p>
          </div>
          <div className="kpi-card border-t-red-500">
            <p className="text-gray-500 text-xs uppercase">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">{formatRand(data?.totalExpenses || 0)}</p>
          </div>
          <div className="kpi-card border-t-pomp-blue">
            <p className="text-gray-500 text-xs uppercase">Balance</p>
            <p className={`text-xl font-bold ${(data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRand(data?.balance || 0)}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap items-center justify-between">
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="pc-filter-prop">Filter by property</label>
            <select id="pc-filter-prop" value={filterProp} onChange={e => setFilterProp(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="">All Properties</option>
              {properties.filter((p: Property) => p.name !== 'The Studio').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowIncome(true)} className="btn-primary text-sm flex items-center gap-1.5"><Plus size={16} /> Add Income</button>
            <button onClick={() => setShowExpense(true)} className="btn-primary text-sm flex items-center gap-1.5"><Plus size={16} /> Add Expense</button>
          </div>
        </div>

        {showIncome && (
          <div className="card mb-4 border-2 border-green-500/30" role="region" aria-label="New income form">
            <h4 className="font-semibold text-sm text-green-600 mb-3">New Income</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="sr-only" htmlFor="inc-date">Date</label>
              <input id="inc-date" type="date" value={incForm.date} onChange={e => setIncForm({...incForm, date: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="sr-only" htmlFor="inc-desc">Description</label>
              <input id="inc-desc" placeholder="Description" value={incForm.description} onChange={e => setIncForm({...incForm, description: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="sr-only" htmlFor="inc-amount">Amount</label>
              <input id="inc-amount" type="number" step="0.01" placeholder="Amount" value={incForm.amount} onChange={e => setIncForm({...incForm, amount: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="sr-only" htmlFor="inc-cat">Category</label>
              <input id="inc-cat" placeholder="Category" value={incForm.category} onChange={e => setIncForm({...incForm, category: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="sr-only" htmlFor="inc-notes">Notes</label>
              <input id="inc-notes" placeholder="Notes" value={incForm.notes} onChange={e => setIncForm({...incForm, notes: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={addIncome} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700">Save</button>
              <button onClick={() => setShowIncome(false)} className="text-sm text-gray-500">Cancel</button>
            </div>
          </div>
        )}

        {showExpense && (
          <div className="card mb-4 border-2 border-red-500/30" role="region" aria-label="New expense form">
            <h4 className="font-semibold text-sm text-red-600 mb-3">New Expense</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="sr-only" htmlFor="exp-date">Date</label>
              <input id="exp-date" type="date" value={expForm.date} onChange={e => setExpForm({...expForm, date: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="sr-only" htmlFor="exp-desc">Description</label>
              <input id="exp-desc" placeholder="Description" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="sr-only" htmlFor="exp-amount">Amount</label>
              <input id="exp-amount" type="number" step="0.01" placeholder="Amount" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="sr-only" htmlFor="exp-cat">Category</label>
              <input id="exp-cat" placeholder="Category" value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="sr-only" htmlFor="exp-supplier">Supplier</label>
              <input id="exp-supplier" placeholder="Supplier" value={expForm.supplier} onChange={e => setExpForm({...expForm, supplier: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={expForm.vat_inclusive} onChange={e => setExpForm({...expForm, vat_inclusive: e.target.checked})} />
                VAT Inclusive
              </label>
              <label className="sr-only" htmlFor="exp-notes">Notes</label>
              <input id="exp-notes" placeholder="Notes" value={expForm.notes} onChange={e => setExpForm({...expForm, notes: e.target.value})}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
            {expForm.amount && expForm.vat_inclusive && (
              <p className="text-xs text-gray-400 mt-2">
                VAT: {formatRand(calcVAT(parseFloat(expForm.amount) || 0, true))} | Excl: {formatRand((parseFloat(expForm.amount) || 0) - calcVAT(parseFloat(expForm.amount) || 0, true))}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={addExpense} className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700">Save</button>
              <button onClick={() => setShowExpense(false)} className="text-sm text-gray-500">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {allEntries.map(e => {
            const isInc = e.type === 'income'
            const propName = properties.find((p: Property) => p.id === e.property_id)?.name || ''
            return (
              <div key={`${e.type}-${e.id}`} className={`card flex items-start justify-between py-2.5 ${isInc ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-red-400'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isInc ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {isInc ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-pomp-navy">{e.description}</p>
                    <p className="text-xs text-gray-400">{e.date} {propName && `· ${propName}`} {e.category && `· ${e.category}`}</p>
                    {e.type === 'expense' && e.supplier && <p className="text-xs text-gray-400">Supplier: {e.supplier}</p>}
                    {e.type === 'expense' && (
                      <p className="text-xs text-gray-400">VAT: {formatRand(calcVAT(e.amount, e.vat_inclusive))} | {e.vat_inclusive ? 'Incl' : 'Excl'}</p>
                    )}
                    {e.notes && <p className="text-xs text-gray-400 mt-0.5">{e.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${isInc ? 'text-green-600' : 'text-red-600'}`}>{isInc ? '+' : '-'}{formatRand(e.amount)}</span>
                  <button onClick={() => setConfirmDelete({ id: e.id, type: e.type })} aria-label="Delete entry" className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
          {allEntries.length === 0 && <p className="text-sm text-gray-400">No entries yet. Add income or expenses above.</p>}
        </div>

        <ConfirmModal
          open={confirmDelete !== null}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => { if (confirmDelete) confirmDelete.type === 'income' ? deleteInc(confirmDelete.id) : deleteExp(confirmDelete.id) }}
          title="Delete Entry"
          message="Are you sure you want to delete this entry? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
        />
      </div>
    </div>
  )
}
