import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { GitCompare, Play, Filter, Search, CheckCircle, Clock, AlertTriangle, X, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import type { ReconciliationEntry, ReconciliationStatus } from '@/types';

function formatZAR(n: number) { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(n); }

const STATUS_COLORS: Record<ReconciliationStatus, string> = {
  'Verified': 'badge-success', 'Pending': 'badge-warning', 'Partial Match': 'badge-warning',
  'Mismatch': 'badge-danger', 'Missing': 'badge-danger', 'Overpayment': 'badge-warning'
};

const STATUS_ICONS: Record<ReconciliationStatus, typeof CheckCircle> = {
  'Verified': CheckCircle, 'Pending': Clock, 'Partial Match': AlertTriangle,
  'Mismatch': AlertTriangle, 'Missing': AlertTriangle, 'Overpayment': AlertTriangle
};

export default function ReconciliationPage() {
  const { 
    properties, reconciliationEntries, rentalTransactions, levyTransactions,
    municipalityTransactions, bankTransactions, runReconciliation 
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterProp, setFilterProp] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const entries = useMemo(() => {
    let data = reconciliationEntries;
    if (filterProp) data = data.filter(e => e.propertyId === filterProp);
    if (filterStatus) data = data.filter(e => e.status === filterStatus);
    if (filterSource) data = data.filter(e => e.sourceLedger === filterSource);
    if (search) data = data.filter(e => e.notes.toLowerCase().includes(search.toLowerCase()));
    return data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reconciliationEntries, filterProp, filterStatus, filterSource, search]);

  const stats = useMemo(() => {
    const total = reconciliationEntries.length;
    const verified = reconciliationEntries.filter(e => e.status === 'Verified').length;
    const missing = reconciliationEntries.filter(e => e.status === 'Missing').length;
    const mismatched = reconciliationEntries.filter(e => e.status === 'Mismatch' || e.status === 'Partial Match').length;
    const health = total > 0 ? Math.round((verified / total) * 100) : 100;
    return { total, verified, missing, mismatched, health };
  }, [reconciliationEntries]);

  const getPropertyName = (id: string) => { const p = properties.find(p => p.id === id); return p ? `${p.unitNumber} ${p.schemeName}` : id; };

  const ledgerColor = (l: string) => {
    switch(l) { case 'Rental': return 'bg-accent-100 text-accent-700'; case 'Levy': return 'bg-success-50 text-success-700'; case 'Municipality': return 'bg-warning-50 text-warning-700'; case 'Bank': return 'bg-brand-100 text-brand-700'; default: return 'badge-neutral'; }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Reconciliation Engine</h1>
          <p className="text-sm text-brand-500 mt-1">Cross-ledger transaction matching and verification</p>
        </div>
        <button onClick={() => runReconciliation()} className="btn btn-primary">
          <RefreshCw className="w-4 h-4" />Run Reconciliation
        </button>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-5 gap-4">
        <div className="card p-4 col-span-2">
          <p className="text-xs text-brand-500 mb-2">Reconciliation Health Score</p>
          <div className="flex items-end gap-3">
            <span className={`text-4xl font-bold ${stats.health >= 80 ? 'text-success-700' : stats.health >= 50 ? 'text-warning-700' : 'text-danger-700'}`}>{stats.health}%</span>
            <span className="text-sm text-brand-500 mb-1">{stats.verified}/{stats.total} verified</span>
          </div>
          <div className="mt-3 w-full bg-brand-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${stats.health >= 80 ? 'bg-success-500' : stats.health >= 50 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{width: `${stats.health}%`}} />
          </div>
        </div>
        <div className="card p-4"><p className="text-xs text-brand-500">Total Entries</p><p className="text-2xl font-bold text-brand-900">{stats.total}</p></div>
        <div className="card p-4"><p className="text-xs text-brand-500">Missing</p><p className="text-2xl font-bold text-danger-700">{stats.missing}</p></div>
        <div className="card p-4"><p className="text-xs text-brand-500">Mismatched</p><p className="text-2xl font-bold text-warning-700">{stats.mismatched}</p></div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input className="input pl-10" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={filterProp} onChange={e => setFilterProp(e.target.value)}>
          <option value="">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.unitNumber} {p.schemeName}</option>)}
        </select>
        <select className="input w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Verified</option><option>Pending</option><option>Partial Match</option><option>Mismatch</option><option>Missing</option><option>Overpayment</option>
        </select>
        <select className="input w-40" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="">All Ledgers</option>
          <option>Rental</option><option>Levy</option><option>Municipality</option><option>Bank</option>
        </select>
      </div>

      {/* Entries Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Source → Target</th>
              <th className="px-4 py-3 font-medium text-right">Expected</th>
              <th className="px-4 py-3 font-medium text-right">Actual</th>
              <th className="px-4 py-3 font-medium text-right">Diff</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {entries.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-16 text-center">
                <GitCompare className="w-10 h-10 text-brand-300 mx-auto mb-3" />
                <p className="text-brand-500 font-medium">No reconciliation entries yet</p>
                <p className="text-brand-400 text-sm mt-1">Click "Run Reconciliation" to match transactions across ledgers</p>
              </td></tr>
            ) : entries.map(e => {
              const Icon = STATUS_ICONS[e.status];
              return (
                <tr key={e.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3 text-brand-600">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{getPropertyName(e.propertyId)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`badge ${ledgerColor(e.sourceLedger)}`}>{e.sourceLedger}</span>
                      <ArrowRight className="w-3 h-3 text-brand-400" />
                      <span className={`badge ${ledgerColor(e.targetLedger)}`}>{e.targetLedger}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatZAR(e.expectedAmount)}</td>
                  <td className="px-4 py-3 text-right">{e.actualAmount != null ? formatZAR(e.actualAmount) : '—'}</td>
                  <td className={`px-4 py-3 text-right font-medium ${e.difference !== 0 ? 'text-danger-700' : 'text-success-700'}`}>
                    {e.difference !== 0 ? formatZAR(e.difference) : 'R0'}
                  </td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[e.status]} gap-1`}><Icon className="w-3 h-3" />{e.status}</span></td>
                  <td className="px-4 py-3 text-brand-500 max-w-[200px] truncate">{e.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* How it works */}
      <div className="card p-6">
        <h3 className="text-brand-900 mb-3">How Reconciliation Works</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-brand-600">
          <div className="flex gap-3">
            <RefreshCw className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
            <div><p className="font-medium text-brand-800">Automated Matching</p><p>The system compares rental deductions against corresponding entries in the Levy, Municipality and Bank ledgers — matching on amount, property, and date range.</p></div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-success-600 shrink-0 mt-0.5" />
            <div><p className="font-medium text-brand-800">Verified</p><p>When amounts match within the expected window, the entry is marked Verified — confirming the deduction reached its destination.</p></div>
          </div>
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
            <div><p className="font-medium text-brand-800">Exceptions</p><p>Mismatched or missing entries automatically generate exceptions for investigation in the Exceptions Center.</p></div>
          </div>
          <div className="flex gap-3">
            <GitCompare className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div><p className="font-medium text-brand-800">Continuous Oversight</p><p>Run reconciliation any time — it only processes unreconciled transactions, keeping the system up to date.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
