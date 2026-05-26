import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Wrench, Plus, Search, Filter, Trash2, Clock, CheckCircle, ArrowUp, ArrowRight, X, AlertTriangle, Zap, Droplets, Shield, Plug, Hammer, PenTool } from 'lucide-react';
import type { MaintenanceIssue, MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '@/types';

function formatZAR(n: number) { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(n); }

const CATEGORY_ICONS: Record<MaintenanceCategory, typeof Wrench> = {
  Electrical: Plug, Plumbing: Droplets, Security: Shield, Appliances: PenTool, Structural: Hammer, General: Wrench
};
const CATEGORY_COLORS: Record<MaintenanceCategory, string> = {
  Electrical: 'bg-yellow-100 text-yellow-700', Plumbing: 'bg-blue-100 text-blue-700',
  Security: 'bg-red-100 text-red-700', Appliances: 'bg-purple-100 text-purple-700',
  Structural: 'bg-orange-100 text-orange-700', General: 'bg-brand-100 text-brand-700'
};
const PRIORITY_COLORS: Record<MaintenancePriority, string> = {
  Low: 'badge-neutral', Medium: 'badge-warning', High: 'badge-danger', Critical: 'badge-danger'
};
const STATUS_FLOW: MaintenanceStatus[] = ['Reported', 'Assigned', 'In Progress', 'Completed', 'Closed'];
const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  Reported: 'badge-warning', Assigned: 'badge-neutral', 'In Progress': 'badge-neutral', Completed: 'badge-success', Closed: 'badge-neutral'
};

export default function MaintenancePage() {
  const { properties, contacts, maintenanceIssues, addMaintenanceIssue, updateMaintenanceIssue, deleteMaintenanceIssue, addTimelineEntry } = useStore();
  const [search, setSearch] = useState('');
  const [filterProp, setFilterProp] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [form, setForm] = useState({
    propertyId: '', title: '', description: '', category: 'General' as MaintenanceCategory,
    priority: 'Medium' as MaintenancePriority, estimatedCost: '', reportedDate: new Date().toISOString().slice(0,10),
    assignedContractorId: '', photos: '', notes: ''
  });

  const filtered = useMemo(() => {
    let data = maintenanceIssues;
    if (filterProp) data = data.filter(i => i.propertyId === filterProp);
    if (filterCategory) data = data.filter(i => i.category === filterCategory);
    if (filterStatus) data = data.filter(i => i.status === filterStatus);
    if (search) data = data.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));
    return data.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [maintenanceIssues, filterProp, filterCategory, filterStatus, search]);

  const detail = detailId ? maintenanceIssues.find(i => i.id === detailId) : null;

  const stats = useMemo(() => {
    const open = maintenanceIssues.filter(i => i.status !== 'Closed' && i.status !== 'Completed').length;
    const inProgress = maintenanceIssues.filter(i => i.status === 'In Progress').length;
    const completed = maintenanceIssues.filter(i => i.status === 'Completed' || i.status === 'Closed').length;
    const totalCost = maintenanceIssues.reduce((s,i) => s + i.actualCost, 0);
    return { open, inProgress, completed, totalCost };
  }, [maintenanceIssues]);

  const getPropName = (id: string) => { const p = properties.find(p => p.id === id); return p ? `${p.unitNumber} ${p.schemeName}` : id; };
  const getContactName = (id?: string) => { if (!id) return '—'; const c = contacts.find(c => c.id === id); return c ? `${c.person} (${c.company})` : id; };
  const contractors = contacts.filter(c => c.category === 'Contractor');

  const handleAdd = () => {
    addMaintenanceIssue({
      propertyId: form.propertyId, title: form.title, description: form.description,
      category: form.category, priority: form.priority, status: 'Reported',
      reportedDate: form.reportedDate, assignedContractorId: form.assignedContractorId || undefined,
      estimatedCost: parseFloat(form.estimatedCost) || 0, actualCost: 0,
      photos: form.photos ? form.photos.split(',').map(s => s.trim()).filter(Boolean) : [],
      notes: form.notes,
    });
    setShowAdd(false);
    setForm({ propertyId: '', title: '', description: '', category: 'General', priority: 'Medium', estimatedCost: '', reportedDate: new Date().toISOString().slice(0,10), assignedContractorId: '', photos: '', notes: '' });
  };

  const advanceStatus = (issue: MaintenanceIssue) => {
    const idx = STATUS_FLOW.indexOf(issue.status);
    if (idx < STATUS_FLOW.length - 1) {
      const newStatus = STATUS_FLOW[idx + 1];
      const note = `Status changed from ${issue.status} to ${newStatus}`;
      updateMaintenanceIssue(issue.id, { status: newStatus });
      addTimelineEntry(issue.id, { date: new Date().toISOString(), status: newStatus, note });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Maintenance Tracker</h1>
          <p className="text-sm text-brand-500 mt-1">Track issues, contractors, and costs across the portfolio</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus className="w-4 h-4" />Report Issue</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-brand-500">Open Issues</p><p className={`text-2xl font-bold ${stats.open > 0 ? 'text-warning-700' : 'text-success-700'}`}>{stats.open}</p></div>
        <div className="card p-4"><p className="text-xs text-brand-500">In Progress</p><p className="text-2xl font-bold text-accent-700">{stats.inProgress}</p></div>
        <div className="card p-4"><p className="text-xs text-brand-500">Completed</p><p className="text-2xl font-bold text-success-700">{stats.completed}</p></div>
        <div className="card p-4"><p className="text-xs text-brand-500">Total Costs</p><p className="text-2xl font-bold text-brand-900">{formatZAR(stats.totalCost)}</p></div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input className="input pl-10" placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={filterProp} onChange={e => setFilterProp(e.target.value)}>
          <option value="">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.unitNumber} {p.schemeName}</option>)}
        </select>
        <select className="input w-40" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option>Electrical</option><option>Plumbing</option><option>Security</option><option>Appliances</option><option>Structural</option><option>General</option>
        </select>
        <select className="input w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Issue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-16 text-center">
            <Wrench className="w-12 h-12 text-brand-300 mx-auto mb-3" />
            <p className="text-brand-500 font-medium">No maintenance issues</p>
            <p className="text-brand-400 text-sm mt-1">All clear across the portfolio</p>
          </div>
        ) : filtered.map(issue => {
          const CatIcon = CATEGORY_ICONS[issue.category];
          return (
            <div key={issue.id} className={`card p-5 cursor-pointer hover:shadow-md transition-shadow ${detailId === issue.id ? 'ring-2 ring-accent-500' : ''}`} onClick={() => setDetailId(detailId === issue.id ? null : issue.id)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-md ${CATEGORY_COLORS[issue.category]}`}><CatIcon className="w-4 h-4" /></span>
                  <span className={`badge ${PRIORITY_COLORS[issue.priority]}`}>{issue.priority}</span>
                </div>
                <span className={`badge ${STATUS_COLORS[issue.status]}`}>{issue.status}</span>
              </div>
              <h3 className="font-medium text-brand-900 mb-1">{issue.title}</h3>
              <p className="text-sm text-brand-500 line-clamp-2 mb-3">{issue.description}</p>
              <div className="flex items-center justify-between text-xs text-brand-500">
                <span>{getPropName(issue.propertyId)}</span>
                <span>{new Date(issue.reportedDate).toLocaleDateString()}</span>
              </div>
              {issue.status !== 'Closed' && issue.status !== 'Completed' && (
                <button onClick={e => { e.stopPropagation(); advanceStatus(issue); }} className="btn btn-secondary w-full mt-3 text-xs">
                  Advance to {STATUS_FLOW[STATUS_FLOW.indexOf(issue.status) + 1]}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      {detail && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3>{detail.title}</h3>
                <span className={`badge ${PRIORITY_COLORS[detail.priority]}`}>{detail.priority}</span>
                <span className={`badge ${STATUS_COLORS[detail.status]}`}>{detail.status}</span>
              </div>
              <p className="text-sm text-brand-500">{getPropName(detail.propertyId)} — Reported {new Date(detail.reportedDate).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              {detail.status !== 'Closed' && (
                <button onClick={() => advanceStatus(detail)} className="btn btn-primary text-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                  {STATUS_FLOW[STATUS_FLOW.indexOf(detail.status) + 1]}
                </button>
              )}
              <button onClick={() => { deleteMaintenanceIssue(detail.id); setDetailId(null); }} className="btn btn-ghost p-2 text-danger-500"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => setDetailId(null)} className="btn btn-ghost p-2"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="card-body grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-brand-500 mb-1">Description</p>
                <p className="text-sm text-brand-800">{detail.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-brand-500">Category</p><span className={`badge mt-0.5 ${CATEGORY_COLORS[detail.category]}`}>{detail.category}</span></div>
                <div><p className="text-xs text-brand-500">Contractor</p><p className="text-sm">{getContactName(detail.assignedContractorId)}</p></div>
                <div><p className="text-xs text-brand-500">Estimated Cost</p><p className="text-sm font-medium">{formatZAR(detail.estimatedCost)}</p></div>
                <div><p className="text-xs text-brand-500">Actual Cost</p><p className="text-sm font-medium">{formatZAR(detail.actualCost)}</p></div>
              </div>
              {detail.notes && <div><p className="text-xs text-brand-500 mb-1">Notes</p><p className="text-sm text-brand-700">{detail.notes}</p></div>}
            </div>
            <div>
              <p className="text-xs text-brand-500 mb-3 font-medium">Timeline</p>
              <div className="space-y-3">
                {detail.timeline.length === 0 ? (
                  <p className="text-sm text-brand-400">No timeline entries</p>
                ) : detail.timeline.map(t => (
                  <div key={t.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${t.status === 'Completed' || t.status === 'Closed' ? 'bg-success-500' : 'bg-accent-500'}`} />
                      <div className="w-px flex-1 bg-brand-200 mt-1" />
                    </div>
                    <div className="pb-3">
                      <p className="text-xs text-brand-500">{new Date(t.date).toLocaleString()}</p>
                      <p className="text-sm font-medium text-brand-800">{t.status}</p>
                      <p className="text-sm text-brand-600">{t.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <h3>Report Maintenance Issue</h3>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label">Property *</label>
                <select className="input" value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})}>
                  <option value="">Select property...</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.unitNumber} {p.schemeName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Title *</label>
                <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Geyser burst in bathroom" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value as MaintenanceCategory})}>
                    <option>Electrical</option><option>Plumbing</option><option>Security</option><option>Appliances</option><option>Structural</option><option>General</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value as MaintenancePriority})}>
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Estimated Cost (R)</label>
                  <input className="input" type="number" value={form.estimatedCost} onChange={e => setForm({...form, estimatedCost: e.target.value})} />
                </div>
                <div>
                  <label className="label">Reported Date</label>
                  <input className="input" type="date" value={form.reportedDate} onChange={e => setForm({...form, reportedDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Assign Contractor</label>
                <select className="input" value={form.assignedContractorId} onChange={e => setForm({...form, assignedContractorId: e.target.value})}>
                  <option value="">Unassigned</option>
                  {contractors.map(c => <option key={c.id} value={c.id}>{c.person} — {c.company}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Photo URLs (comma-separated)</label>
                <input className="input" value={form.photos} onChange={e => setForm({...form, photos: e.target.value})} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowAdd(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleAdd} className="btn btn-primary" disabled={!form.propertyId || !form.title}>Report Issue</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
