import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  DollarSign, Plus, TrendingUp, TrendingDown, Building2, Landmark,
  Banknote, Search, X, CheckCircle, Clock, AlertTriangle, Trash2, Filter
} from 'lucide-react';
import type { RentalTransaction, LevyTransaction, MunicipalityTransaction, BankTransaction, Property } from '@/types';

const LEDGERS = ['Rental', 'Levy', 'Municipality', 'Bank'] as const;
type LedgerTab = typeof LEDGERS[number];

function formatZAR(n: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'Verified' ? 'badge-success' : status === 'Pending' ? 'badge-warning' : 'badge-danger';
  const Icon = status === 'Verified' ? CheckCircle : status === 'Pending' ? Clock : AlertTriangle;
  return <span className={`badge ${cls} gap-1`}><Icon className="w-3 h-3" />{status}</span>;
}

export default function FinancialPage() {
  const {
    properties, rentalTransactions, levyTransactions, municipalityTransactions, bankTransactions,
    addRentalTransaction, deleteRentalTransaction,
    addLevyTransaction, deleteLevyTransaction,
    addMunicipalityTransaction, deleteMunicipalityTransaction,
    addBankTransaction, deleteBankTransaction,
  } = useStore();

  const [tab, setTab] = useState<LedgerTab>('Rental');
  const [search, setSearch] = useState('');
  const [filterProp, setFilterProp] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  // Add form state
  const [form, setForm] = useState({
    propertyId: '', description: '', amount: '', date: new Date().toISOString().slice(0,10),
    referenceNumber: '', type: '', category: '', notes: '', statementRef: '', invoiceNumber: '', balance: ''
  });

  const getPropName = (id: string) => properties.find(p => p.id === id)?.unitNumber + ' ' + (properties.find(p => p.id === id)?.schemeName || '') || id;

  const rentals = useMemo(() => {
    let data = rentalTransactions;
    if (filterProp) data = data.filter(t => t.propertyId === filterProp);
    if (search) data = data.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.referenceNumber.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [rentalTransactions, filterProp, search]);

  const levies = useMemo(() => {
    let data = levyTransactions;
    if (filterProp) data = data.filter(t => t.propertyId === filterProp);
    if (search) data = data.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.referenceNumber.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [levyTransactions, filterProp, search]);

  const munis = useMemo(() => {
    let data = municipalityTransactions;
    if (filterProp) data = data.filter(t => t.propertyId === filterProp);
    if (search) data = data.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.referenceNumber.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [municipalityTransactions, filterProp, search]);

  const banks = useMemo(() => {
    let data = bankTransactions;
    if (filterProp) data = data.filter(t => t.propertyId === filterProp);
    if (search) data = data.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.referenceNumber.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [bankTransactions, filterProp, search]);

  const rentalIncome = rentals.filter(t => t.type === 'Rent Received' || t.type === 'Other Income').reduce((s,t) => s + t.amount, 0);
  const rentalDeductions = rentals.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
  const rentalPending = rentals.filter(t => !t.reconciled).length;

  const levyCharges = levies.filter(t => t.type === 'Levy Charge' || t.type === 'Special Levy').reduce((s,t) => s + Math.abs(t.amount), 0);
  const levyPayments = levies.filter(t => t.type === 'Levy Payment').reduce((s,t) => s + Math.abs(t.amount), 0);

  const muniCharges = munis.reduce((s,t) => s + (t.amount > 0 ? t.amount : 0), 0);
  const muniPayments = munis.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);

  const bankRepayments = banks.filter(t => t.type === 'Loan Repayment').reduce((s,t) => s + Math.abs(t.amount), 0);
  const bankInterest = banks.filter(t => t.type === 'Interest').reduce((s,t) => s + Math.abs(t.amount), 0);
  const bankBalance = banks.length > 0 ? banks[banks.length-1].loanBalance : 0;

  const handleAdd = () => {
    const now = new Date().toISOString();
    const base = {
      propertyId: form.propertyId || properties[0]?.id || '',
      description: form.description,
      amount: parseFloat(form.amount) || 0,
      date: form.date,
      referenceNumber: form.referenceNumber,
      reconciled: false,
      reconciliationStatus: 'Pending' as const,
      notes: form.notes,
    };
    if (tab === 'Rental') {
      addRentalTransaction({
        ...base,
        type: (form.type || 'Rent Received') as RentalTransaction['type'],
      });
    } else if (tab === 'Levy') {
      addLevyTransaction({
        ...base,
        type: (form.type || 'Levy Payment') as LevyTransaction['type'],
        statementRef: form.statementRef,
        balance: parseFloat(form.balance) || 0,
      });
    } else if (tab === 'Municipality') {
      addMunicipalityTransaction({
        ...base,
        category: (form.category || 'Rates') as MunicipalityTransaction['category'],
        invoiceNumber: form.invoiceNumber,
        balance: parseFloat(form.balance) || 0,
      });
    } else {
      addBankTransaction({
        ...base,
        type: (form.type || 'Loan Repayment') as BankTransaction['type'],
        loanBalance: parseFloat(form.balance) || 0,
      });
    }
    setShowAdd(false);
    setForm({ propertyId: '', description: '', amount: '', date: new Date().toISOString().slice(0,10), referenceNumber: '', type: '', category: '', notes: '', statementRef: '', invoiceNumber: '', balance: '' });
  };

  const handleDelete = (id: string) => {
    if (tab === 'Rental') deleteRentalTransaction(id);
    else if (tab === 'Levy') deleteLevyTransaction(id);
    else if (tab === 'Municipality') deleteMunicipalityTransaction(id);
    else deleteBankTransaction(id);
    setConfirmDel(null);
  };

  const icons = { Rental: DollarSign, Levy: Building2, Municipality: Landmark, Bank: Banknote };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-brand-900">Financial Oversight</h1>
          <p className="text-sm text-brand-500 mt-1">Four linked ledgers — rental, levy, municipality, and bank</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus className="w-4 h-4" />Add Transaction</button>
      </div>

      {/* Ledger Tabs */}
      <div className="flex gap-1 bg-brand-100 rounded-lg p-1">
        {LEDGERS.map(l => {
          const Icon = icons[l];
          const counts = { Rental: rentalTransactions.length, Levy: levyTransactions.length, Municipality: municipalityTransactions.length, Bank: bankTransactions.length };
          return (
            <button key={l} onClick={() => setTab(l)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === l ? 'bg-white text-accent-700 shadow-sm' : 'text-brand-600 hover:text-brand-800'}`}>
              <Icon className="w-4 h-4" />{l}<span className="text-xs opacity-60">({counts[l]})</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input className="input pl-10" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-64" value={filterProp} onChange={e => setFilterProp(e.target.value)}>
          <option value="">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.unitNumber} {p.schemeName}</option>)}
        </select>
      </div>

      {/* RENTAL LEDGER */}
      {tab === 'Rental' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4"><p className="text-xs text-brand-500">Total Received</p><p className="text-xl font-bold text-success-700">{formatZAR(rentalIncome)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Total Deductions</p><p className="text-xl font-bold text-danger-700">{formatZAR(rentalDeductions)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Net Position</p><p className={`text-xl font-bold ${rentalIncome - rentalDeductions >= 0 ? 'text-accent-700' : 'text-danger-700'}`}>{formatZAR(rentalIncome - rentalDeductions)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Pending Reconciliation</p><p className="text-xl font-bold text-warning-700">{rentalPending}</p></div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-brand-600 text-left">
                <tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Property</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium">Reference</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium w-10"></th></tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {rentals.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-brand-400">No rental transactions recorded.{' '}<button onClick={() => setShowAdd(true)} className="text-accent-600 hover:underline">Add one</button></td></tr>
                ) : rentals.map(t => (
                  <tr key={t.id} className="hover:bg-brand-50/50">
                    <td className="px-4 py-3 text-brand-600">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{getPropName(t.propertyId)}</td>
                    <td className="px-4 py-3"><span className={`badge ${t.amount >= 0 ? 'badge-success' : 'badge-danger'}`}>{t.type}</span></td>
                    <td className="px-4 py-3">{t.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${t.amount >= 0 ? 'text-success-700' : 'text-danger-700'}`}>{formatZAR(t.amount)}</td>
                    <td className="px-4 py-3 text-brand-500 font-mono text-xs">{t.referenceNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.reconciliationStatus} /></td>
                    <td className="px-4 py-3"><button onClick={() => setConfirmDel(t.id)} className="btn btn-ghost p-1 text-brand-400 hover:text-danger-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEVY LEDGER */}
      {tab === 'Levy' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4"><p className="text-xs text-brand-500">Total Charges</p><p className="text-xl font-bold text-danger-700">{formatZAR(levyCharges)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Total Payments</p><p className="text-xl font-bold text-success-700">{formatZAR(levyPayments)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Outstanding</p><p className={`text-xl font-bold ${levyCharges - levyPayments > 0 ? 'text-warning-700' : 'text-success-700'}`}>{formatZAR(Math.max(0, levyCharges - levyPayments))}</p></div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-brand-600 text-left">
                <tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Property</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium">Reference</th><th className="px-4 py-3 font-medium">Statement</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium w-10"></th></tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {levies.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-brand-400">No levy transactions recorded.</td></tr>
                ) : levies.map(t => (
                  <tr key={t.id} className="hover:bg-brand-50/50">
                    <td className="px-4 py-3 text-brand-600">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{getPropName(t.propertyId)}</td>
                    <td className="px-4 py-3"><span className={`badge ${t.type === 'Levy Payment' ? 'badge-success' : 'badge-warning'}`}>{t.type}</span></td>
                    <td className="px-4 py-3">{t.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${t.amount >= 0 ? 'text-success-700' : 'text-danger-700'}`}>{formatZAR(t.amount)}</td>
                    <td className="px-4 py-3 text-brand-500 font-mono text-xs">{t.referenceNumber}</td>
                    <td className="px-4 py-3 text-brand-500 text-xs">{t.statementRef}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.reconciliationStatus} /></td>
                    <td className="px-4 py-3"><button onClick={() => setConfirmDel(t.id)} className="btn btn-ghost p-1 text-brand-400 hover:text-danger-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MUNICIPALITY LEDGER */}
      {tab === 'Municipality' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4"><p className="text-xs text-brand-500">Total Charges</p><p className="text-xl font-bold text-danger-700">{formatZAR(muniCharges)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Total Payments</p><p className="text-xl font-bold text-success-700">{formatZAR(muniPayments)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Outstanding</p><p className={`text-xl font-bold ${muniCharges - muniPayments > 0 ? 'text-warning-700' : 'text-success-700'}`}>{formatZAR(Math.max(0, muniCharges - muniPayments))}</p></div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-brand-600 text-left">
                <tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Property</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium">Reference</th><th className="px-4 py-3 font-medium">Invoice</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium w-10"></th></tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {munis.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-brand-400">No municipality transactions recorded.</td></tr>
                ) : munis.map(t => (
                  <tr key={t.id} className="hover:bg-brand-50/50">
                    <td className="px-4 py-3 text-brand-600">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{getPropName(t.propertyId)}</td>
                    <td className="px-4 py-3"><span className="badge badge-neutral">{t.category}</span></td>
                    <td className="px-4 py-3">{t.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${t.amount >= 0 ? 'text-success-700' : 'text-danger-700'}`}>{formatZAR(t.amount)}</td>
                    <td className="px-4 py-3 text-brand-500 font-mono text-xs">{t.referenceNumber}</td>
                    <td className="px-4 py-3 text-brand-500 text-xs">{t.invoiceNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.reconciliationStatus} /></td>
                    <td className="px-4 py-3"><button onClick={() => setConfirmDel(t.id)} className="btn btn-ghost p-1 text-brand-400 hover:text-danger-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BANK LEDGER */}
      {tab === 'Bank' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4"><p className="text-xs text-brand-500">Total Repayments</p><p className="text-xl font-bold text-accent-700">{formatZAR(bankRepayments)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Total Interest</p><p className="text-xl font-bold text-warning-700">{formatZAR(bankInterest)}</p></div>
            <div className="card p-4"><p className="text-xs text-brand-500">Loan Balance</p><p className="text-xl font-bold text-brand-900">{formatZAR(bankBalance)}</p></div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-brand-600 text-left">
                <tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Property</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium">Reference</th><th className="px-4 py-3 font-medium">Balance</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium w-10"></th></tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {banks.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-brand-400">No bank transactions recorded.</td></tr>
                ) : banks.map(t => (
                  <tr key={t.id} className="hover:bg-brand-50/50">
                    <td className="px-4 py-3 text-brand-600">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{getPropName(t.propertyId)}</td>
                    <td className="px-4 py-3"><span className="badge badge-neutral">{t.type}</span></td>
                    <td className="px-4 py-3">{t.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${t.amount >= 0 ? 'text-success-700' : 'text-danger-700'}`}>{formatZAR(t.amount)}</td>
                    <td className="px-4 py-3 text-brand-500 font-mono text-xs">{t.referenceNumber}</td>
                    <td className="px-4 py-3 font-medium">{formatZAR(t.loanBalance)}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.reconciliationStatus} /></td>
                    <td className="px-4 py-3"><button onClick={() => setConfirmDel(t.id)} className="btn btn-ghost p-1 text-brand-400 hover:text-danger-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <h3>Add {tab} Transaction</h3>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label">Property</label>
                <select className="input" value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})}>
                  <option value="">Select property...</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.unitNumber} {p.schemeName}</option>)}
                </select>
              </div>
              {(tab === 'Rental' || tab === 'Levy' || tab === 'Bank') && (
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {tab === 'Rental' && <><option>Rent Received</option><option>Levy Deduction</option><option>Municipality Deduction</option><option>Agent Commission</option><option>Bank Payment</option><option>Insurance Payment</option><option>Maintenance Payment</option><option>Other Income</option><option>Other Expense</option><option>Net Payment</option></>}
                    {tab === 'Levy' && <><option>Levy Payment</option><option>Special Levy</option><option>Levy Charge</option><option>Other</option></>}
                    {tab === 'Bank' && <><option>Loan Repayment</option><option>Interest</option><option>Debit Order</option><option>Transfer</option><option>Fee</option><option>Other</option></>}
                  </select>
                </div>
              )}
              {tab === 'Municipality' && (
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option>Rates</option><option>Refuse</option><option>Water</option><option>Sewerage</option><option>Other</option>
                  </select>
                </div>
              )}
              <div>
                <label className="label">Description</label>
                <input className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Monthly rent for June 2025" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Amount (R)</label>
                  <input className="input" type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="12000" />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Reference Number</label>
                <input className="input" value={form.referenceNumber} onChange={e => setForm({...form, referenceNumber: e.target.value})} placeholder="REF-2025-0601" />
              </div>
              {(tab === 'Levy' || tab === 'Municipality') && (
                <div>
                  <label className="label">{tab === 'Levy' ? 'Statement Ref' : 'Invoice Number'}</label>
                  <input className="input" value={tab === 'Levy' ? form.statementRef : form.invoiceNumber} onChange={e => tab === 'Levy' ? setForm({...form, statementRef: e.target.value}) : setForm({...form, invoiceNumber: e.target.value})} />
                </div>
              )}
              {(tab === 'Levy' || tab === 'Municipality' || tab === 'Bank') && (
                <div>
                  <label className="label">{tab === 'Bank' ? 'Loan Balance' : 'Balance'} (R)</label>
                  <input className="input" type="number" step="0.01" value={form.balance} onChange={e => setForm({...form, balance: e.target.value})} />
                </div>
              )}
              <div>
                <label className="label">Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowAdd(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleAdd} className="btn btn-primary" disabled={!form.propertyId || !form.description || !form.amount}>Add Transaction</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <AlertTriangle className="w-10 h-10 text-danger-500 mx-auto mb-3" />
            <p className="text-center font-medium text-brand-900">Delete this transaction?</p>
            <p className="text-center text-sm text-brand-500 mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={() => setConfirmDel(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(confirmDel)} className="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
