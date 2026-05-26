import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { AlertTriangle, Search, Filter, CheckCircle, Clock, X, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';
import type { Exception } from '@/types';

function formatZAR(n: number) { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(n); }

const SEVERITY_COLORS = { Low: 'badge-neutral', Medium: 'badge-warning', High: 'badge-danger', Critical: 'badge-danger' } as const;
const TYPE_ICONS: Record<string, typeof AlertTriangle> = {
  'Unverified Levy': AlertTriangle, 'Unverified Municipality': AlertTriangle,
  'Missing Bank Transaction': AlertTriangle, 'Aging Discrepancy': Clock, 'Overpayment': TrendingUp, 'Other': AlertTriangle
};

export default function ExceptionsPage() {
  const { properties, exceptions, resolveException } = useStore();
  const [search, setSearch] = useState('');
  const [filterProp, setFilterProp] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [confirmResolve, setConfirmResolve] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = exceptions;
    if (!showResolved) data = data.filter(e => !e.resolved);
    if (filterProp) data = data.filter(e => e.propertyId === filterProp);
    if (filterType) data = data.filter(e => e.type === filterType);
    if (filterSeverity) data = data.filter(e => e.severity === filterSeverity);
    if (search) data = data.filter(e => e.description.toLowerCase().includes(search.toLowerCase()));
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [exceptions, showResolved, filterProp, filterType, filterSeverity, search]);

  const stats = useMemo(() => {
    const total = exceptions.length;
    const unresolved = exceptions.filter(e => !e.resolved).length;
    const critical = exceptions.filter(e => !e.resolved && (e.severity === 'Critical' || e.severity === 'High')).length;
    const totalAmount = exceptions.filter(e => !e.resolved).reduce((s, e) => s + e.amount, 0);
    return { total, unresolved, critical, totalAmount };
  }, [exceptions]);

  const getPropertyName = (id: string) => { const p = properties.find(p => p.id === id); return p ? `${p.unitNumber} ${p.schemeName}` : id; };

  const handleResolve = (id: string) => { resolveException(id); setConfirmResolve(null); };

  const types = [...new Set(exceptions.map(e => e.type))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Exceptions Center</h1>
          <p className="text-sm text-brand-500 mt-1">Unresolved discrepancies requiring attention</p>
        </div>
        {stats.unresolved > 0 && (
          <span className="badge badge-danger text-sm px-3 py-1.5">
            <ShieldAlert className="w-4 h-4" />{stats.unresolved} Unresolved
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-brand-500">Total Exceptions</p><p className="text-2xl font-bold text-brand-900">{stats.total}</p></div>
        <div className={`card p-4 ${stats.unresolved > 0 ? 'border-danger-300 bg-danger-50/30' : ''}`}>
          <p className="text-xs text-brand-500">Unresolved</p><p className={`text-2xl font-bold ${stats.unresolved > 0 ? 'text-danger-700' : 'text-success-700'}`}>{stats.unresolved}</p>
        </div>
        <div className={`card p-4 ${stats.critical > 0 ? 'border-danger-300 bg-danger-50/30' : ''}`}>
          <p className="text-xs text-brand-500">Critical / High</p><p className={`text-2xl font-bold ${stats.critical > 0 ? 'text-danger-700' : 'text-success-700'}`}>{stats.critical}</p>
        </div>
        <div className="card p-4"><p className="text-xs text-brand-500">Total Exposure</p><p className="text-2xl font-bold text-warning-700">{formatZAR(stats.totalAmount)}</p></div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input className="input pl-10" placeholder="Search exceptions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={filterProp} onChange={e => setFilterProp(e.target.value)}>
          <option value="">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.unitNumber} {p.schemeName}</option>)}
        </select>
        <select className="input w-48" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input w-36" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="">All Severities</option>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-brand-600 cursor-pointer">
          <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} className="rounded border-brand-300" />
          Show Resolved
        </label>
      </div>

      {/* Exception Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3" />
            <p className="text-brand-700 font-medium text-lg">All Clear</p>
            <p className="text-brand-400 mt-1">No exceptions matching your filters</p>
          </div>
        ) : filtered.map(e => {
          const Icon = TYPE_ICONS[e.type] || AlertTriangle;
          return (
            <div key={e.id} className={`card p-5 ${e.resolved ? 'opacity-60' : ''} ${e.severity === 'Critical' ? 'border-danger-300 ring-1 ring-danger-200' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg shrink-0 ${e.severity === 'Critical' || e.severity === 'High' ? 'bg-danger-100 text-danger-600' : e.severity === 'Medium' ? 'bg-warning-100 text-warning-600' : 'bg-brand-100 text-brand-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${SEVERITY_COLORS[e.severity]}`}>{e.severity}</span>
                    <span className="badge badge-neutral">{e.type}</span>
                    {e.resolved && <span className="badge badge-success">Resolved</span>}
                  </div>
                  <p className="font-medium text-brand-900 mt-2">{e.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-brand-500">
                    <span>{getPropertyName(e.propertyId)}</span>
                    <span className="font-mono font-medium text-brand-700">{formatZAR(e.amount)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{e.daysOutstanding} days</span>
                    <span>Created {new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {!e.resolved && (
                  <button onClick={() => setConfirmResolve(e.id)} className="btn btn-secondary shrink-0">
                    <CheckCircle className="w-4 h-4" />Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Confirmation */}
      {confirmResolve && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setConfirmResolve(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <CheckCircle className="w-10 h-10 text-success-500 mx-auto mb-3" />
            <p className="text-center font-medium text-brand-900">Mark as Resolved?</p>
            <p className="text-center text-sm text-brand-500 mt-1">This exception will be marked as resolved.</p>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={() => setConfirmResolve(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => handleResolve(confirmResolve)} className="btn btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
