import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { FileText, Download, Building2, DollarSign, Wrench, AlertTriangle, TrendingUp, TrendingDown, Calendar, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function formatZAR(n: number) { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(n); }

const REPORTS = [
  { id: 'trust', label: 'Monthly Trust Report', icon: Building2, desc: 'Portfolio summary for trustees' },
  { id: 'rental', label: 'Rental Summary', icon: DollarSign, desc: 'Income, deductions, net per property' },
  { id: 'levy', label: 'Levy Summary', icon: Building2, desc: 'Levy charges and payments' },
  { id: 'municipality', label: 'Municipality Summary', icon: Building2, desc: 'Rates, water, refuse, sewerage' },
  { id: 'loan', label: 'Loan Summary', icon: DollarSign, desc: 'Bond balances and repayments' },
  { id: 'cashflow', label: 'Cash Flow Report', icon: TrendingUp, desc: 'Income vs expenses over time' },
  { id: 'discrepancy', label: 'Discrepancy Report', icon: AlertTriangle, desc: 'Unreconciled items and exceptions' },
  { id: 'maintenance', label: 'Maintenance Report', icon: Wrench, desc: 'Issues, costs, and statuses' },
  { id: 'audit', label: 'Audit Report', icon: FileText, desc: 'Full portfolio audit trail' },
];

const PIE_COLORS = ['#0552b5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
  const { properties, rentalTransactions, levyTransactions, municipalityTransactions, bankTransactions, maintenanceIssues, exceptions, reconciliationEntries, getDashboardMetrics } = useStore();
  const [selected, setSelected] = useState('trust');
  const metrics = getDashboardMetrics();

  const monthlyData = useMemo(() => {
    const byMonth: Record<string, { month: string; income: number; expenses: number }> = {};
    [...rentalTransactions, ...levyTransactions, ...municipalityTransactions, ...bankTransactions].forEach(t => {
      const m = new Date(t.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' });
      if (!byMonth[m]) byMonth[m] = { month: m, income: 0, expenses: 0 };
      if (t.amount > 0) byMonth[m].income += t.amount;
      else byMonth[m].expenses += Math.abs(t.amount);
    });
    return Object.values(byMonth).sort((a,b) => a.month.localeCompare(b.month));
  }, [rentalTransactions, levyTransactions, municipalityTransactions, bankTransactions]);

  const propertyBreakdown = useMemo(() => properties.map(p => ({
    name: `${p.unitNumber} ${p.schemeName}`,
    valuation: p.currentValuation,
    rental: p.rentalAmount,
    loan: p.loanBalance,
  })), [properties]);

  const maintByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    maintenanceIssues.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; });
    return Object.entries(cats).map(([k,v]) => ({ name: k, value: v }));
  }, [maintenanceIssues]);

  const exceptionByType = useMemo(() => {
    const types: Record<string, number> = {};
    exceptions.filter(e => !e.resolved).forEach(e => { types[e.type] = (types[e.type] || 0) + 1; });
    return Object.entries(types).map(([k,v]) => ({ name: k, value: v }));
  }, [exceptions]);

  const recByStatus = useMemo(() => {
    const stats: Record<string, number> = {};
    reconciliationEntries.forEach(e => { stats[e.status] = (stats[e.status] || 0) + 1; });
    return Object.entries(stats).map(([k,v]) => ({ name: k, value: v }));
  }, [reconciliationEntries]);

  const handleExport = () => window.print();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Reports</h1>
          <p className="text-sm text-brand-500 mt-1">Portfolio intelligence and audit reports</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary">
          <Printer className="w-4 h-4" />Print / Export
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report sidebar */}
        <div className="space-y-2">
          {REPORTS.map(r => (
            <button key={r.id} onClick={() => setSelected(r.id)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${selected === r.id ? 'bg-accent-50 border border-accent-200' : 'card hover:bg-brand-50'}`}>
              <div className="flex items-center gap-3">
                <r.icon className={`w-5 h-5 ${selected === r.id ? 'text-accent-600' : 'text-brand-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${selected === r.id ? 'text-accent-700' : 'text-brand-700'}`}>{r.label}</p>
                  <p className="text-xs text-brand-400">{r.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Report content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Trust Report */}
          {selected === 'trust' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header"><h2>Monthly Trust Report — Portfolio Overview</h2></div>
                <div className="card-body">
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-3 bg-brand-50 rounded-lg"><p className="text-xs text-brand-500">Portfolio Value</p><p className="text-xl font-bold text-brand-900">{formatZAR(metrics.portfolioValue)}</p></div>
                    <div className="text-center p-3 bg-success-50 rounded-lg"><p className="text-xs text-brand-500">Rental Income</p><p className="text-xl font-bold text-success-700">{formatZAR(metrics.totalRentalIncome)}</p></div>
                    <div className="text-center p-3 bg-warning-50 rounded-lg"><p className="text-xs text-brand-500">Loan Exposure</p><p className="text-xl font-bold text-warning-700">{formatZAR(metrics.loanExposure)}</p></div>
                    <div className="text-center p-3 bg-accent-50 rounded-lg"><p className="text-xs text-brand-500">Occupancy</p><p className="text-xl font-bold text-accent-700">{metrics.occupancyRate}%</p></div>
                    <div className="text-center p-3 bg-brand-50 rounded-lg"><p className="text-xs text-brand-500">Net Cash Flow</p><p className={`text-xl font-bold ${metrics.netCashFlow >= 0 ? 'text-success-700' : 'text-danger-700'}`}>{formatZAR(metrics.netCashFlow)}</p></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-brand-500 px-2">
                    <span>Reconciliation Health: <strong className={metrics.reconciliationHealthScore >= 80 ? 'text-success-700' : 'text-warning-700'}>{metrics.reconciliationHealthScore}%</strong></span>
                    <span>Open Issues: <strong className="text-warning-700">{metrics.openMaintenanceIssues}</strong></span>
                    <span>Exceptions: <strong className="text-danger-700">{metrics.exceptionsRequiringAttention}</strong></span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>Property Breakdown</h3></div>
                <div className="card-body">
                  <table className="w-full text-sm">
                    <thead className="text-left text-brand-500">
                      <tr><th className="pb-3 font-medium">Property</th><th className="pb-3 font-medium text-right">Valuation</th><th className="pb-3 font-medium text-right">Rental</th><th className="pb-3 font-medium text-right">Loan Balance</th><th className="pb-3 font-medium text-right">LTV</th><th className="pb-3 font-medium text-right">Yield</th></tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100">
                      {properties.map(p => (
                        <tr key={p.id}>
                          <td className="py-3"><span className="font-medium">{p.unitNumber} {p.schemeName}</span><br /><span className="text-xs text-brand-400">{p.physicalAddress}</span></td>
                          <td className="py-3 text-right">{formatZAR(p.currentValuation)}</td>
                          <td className="py-3 text-right">{formatZAR(p.rentalAmount)}</td>
                          <td className="py-3 text-right">{formatZAR(p.loanBalance)}</td>
                          <td className="py-3 text-right">{p.loanBalance > 0 ? Math.round((p.loanBalance / p.currentValuation) * 100) : 0}%</td>
                          <td className="py-3 text-right">{p.yieldPercentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {monthlyData.length > 0 && (
                <div className="card">
                  <div className="card-header"><h3>Monthly Cash Flow</h3></div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{fontSize: 12}} stroke="#94a3b8" />
                        <YAxis tick={{fontSize: 12}} stroke="#94a3b8" tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => formatZAR(v)} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4,4,0,0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rental Summary */}
          {selected === 'rental' && (
            <div className="card">
              <div className="card-header"><h2>Rental Summary</h2></div>
              <div className="card-body space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-success-50 rounded-lg"><p className="text-xs text-brand-500">Gross Income</p><p className="text-xl font-bold text-success-700">{formatZAR(rentalTransactions.filter(t => t.type === 'Rent Received').reduce((s,t) => s + t.amount, 0))}</p></div>
                  <div className="text-center p-3 bg-danger-50 rounded-lg"><p className="text-xs text-brand-500">Total Deductions</p><p className="text-xl font-bold text-danger-700">{formatZAR(rentalTransactions.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0))}</p></div>
                  <div className="text-center p-3 bg-accent-50 rounded-lg"><p className="text-xs text-brand-500">Net Income</p><p className="text-xl font-bold text-accent-700">{formatZAR(rentalTransactions.reduce((s,t) => s + t.amount, 0))}</p></div>
                  <div className="text-center p-3 bg-brand-50 rounded-lg"><p className="text-xs text-brand-500">Transactions</p><p className="text-xl font-bold text-brand-900">{rentalTransactions.length}</p></div>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-left text-brand-500"><tr><th className="pb-3">Property</th><th className="pb-3 text-right">Rent</th><th className="pb-3 text-right">Deductions</th><th className="pb-3 text-right">Net</th></tr></thead>
                  <tbody className="divide-y divide-brand-100">
                    {properties.map(p => {
                      const txns = rentalTransactions.filter(t => t.propertyId === p.id);
                      const income = txns.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
                      const expenses = txns.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
                      return (
                        <tr key={p.id}><td className="py-3 font-medium">{p.unitNumber} {p.schemeName}</td>
                          <td className="py-3 text-right text-success-700">{formatZAR(income)}</td>
                          <td className="py-3 text-right text-danger-700">{formatZAR(expenses)}</td>
                          <td className="py-3 text-right font-bold">{formatZAR(income - expenses)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Levy Summary */}
          {selected === 'levy' && (
            <div className="card">
              <div className="card-header"><h2>Levy Summary</h2></div>
              <div className="card-body">
                <table className="w-full text-sm">
                  <thead className="text-left text-brand-500"><tr><th className="pb-3">Property</th><th className="pb-3 text-right">Charges</th><th className="pb-3 text-right">Payments</th><th className="pb-3 text-right">Balance</th></tr></thead>
                  <tbody className="divide-y divide-brand-100">
                    {properties.map(p => {
                      const txns = levyTransactions.filter(t => t.propertyId === p.id);
                      const charges = txns.filter(t => t.type === 'Levy Charge' || t.type === 'Special Levy').reduce((s,t) => s + Math.abs(t.amount), 0);
                      const payments = txns.filter(t => t.type === 'Levy Payment').reduce((s,t) => s + Math.abs(t.amount), 0);
                      return (
                        <tr key={p.id}><td className="py-3 font-medium">{p.unitNumber} {p.schemeName}</td>
                          <td className="py-3 text-right">{formatZAR(charges)}</td>
                          <td className="py-3 text-right text-success-700">{formatZAR(payments)}</td>
                          <td className={`py-3 text-right font-bold ${charges - payments > 0 ? 'text-danger-700' : 'text-success-700'}`}>{formatZAR(Math.max(0, charges - payments))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Municipality Summary */}
          {selected === 'municipality' && (
            <div className="card">
              <div className="card-header"><h2>Municipality Summary</h2></div>
              <div className="card-body">
                <table className="w-full text-sm">
                  <thead className="text-left text-brand-500"><tr><th className="pb-3">Property</th><th className="pb-3">Municipality</th><th className="pb-3 text-right">Charges</th><th className="pb-3 text-right">Payments</th><th className="pb-3 text-right">Balance</th></tr></thead>
                  <tbody className="divide-y divide-brand-100">
                    {properties.map(p => {
                      const txns = municipalityTransactions.filter(t => t.propertyId === p.id);
                      const charges = txns.reduce((s,t) => s + (t.amount > 0 ? t.amount : 0), 0);
                      const payments = txns.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
                      return (
                        <tr key={p.id}><td className="py-3 font-medium">{p.unitNumber} {p.schemeName}</td>
                          <td className="py-3 text-brand-500">{p.municipality}</td>
                          <td className="py-3 text-right">{formatZAR(charges)}</td>
                          <td className="py-3 text-right text-success-700">{formatZAR(payments)}</td>
                          <td className={`py-3 text-right font-bold ${charges - payments > 0 ? 'text-danger-700' : 'text-success-700'}`}>{formatZAR(Math.max(0, charges - payments))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loan Summary */}
          {selected === 'loan' && (
            <div className="card">
              <div className="card-header"><h2>Loan Summary</h2></div>
              <div className="card-body">
                <table className="w-full text-sm">
                  <thead className="text-left text-brand-500"><tr><th className="pb-3">Property</th><th className="pb-3 text-right">Original Loan</th><th className="pb-3 text-right">Balance</th><th className="pb-3 text-right">Rate</th><th className="pb-3 text-right">Monthly</th><th className="pb-3 text-right">LTV</th></tr></thead>
                  <tbody className="divide-y divide-brand-100">
                    {properties.map(p => (
                      <tr key={p.id}><td className="py-3 font-medium">{p.unitNumber} {p.schemeName}</td>
                        <td className="py-3 text-right">{formatZAR(p.loanAmount)}</td>
                        <td className="py-3 text-right">{formatZAR(p.loanBalance)}</td>
                        <td className="py-3 text-right">{p.interestRate}%</td>
                        <td className="py-3 text-right">{formatZAR(p.monthlyRepayment)}</td>
                        <td className="py-3 text-right">{p.currentValuation > 0 ? Math.round((p.loanBalance / p.currentValuation) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cash Flow */}
          {selected === 'cashflow' && (
            <div className="card">
              <div className="card-header"><h2>Cash Flow Report</h2></div>
              <div className="card-body">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{fontSize: 12}} stroke="#94a3b8" />
                      <YAxis tick={{fontSize: 12}} stroke="#94a3b8" tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatZAR(v)} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4,4,0,0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-brand-400 py-12">No transaction data available</p>}
              </div>
            </div>
          )}

          {/* Discrepancy */}
          {selected === 'discrepancy' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header"><h2>Discrepancy Report</h2></div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-brand-700 mb-3">Unresolved Exceptions</h3>
                      {exceptionByType.length === 0 ? (
                        <p className="text-sm text-success-700">No unresolved exceptions</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart><Pie data={exceptionByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,value}) => `${name}: ${value}`}>
                            {exceptionByType.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie><Tooltip /><Legend /></PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-brand-700 mb-3">Reconciliation Status</h3>
                      {recByStatus.length === 0 ? (
                        <p className="text-sm text-brand-400">No reconciliation data</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart><Pie data={recByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,value}) => `${name}: ${value}`}>
                            {recByStatus.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie><Tooltip /><Legend /></PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h3>Outstanding Exceptions</h3></div>
                <div className="card-body">
                  {exceptions.filter(e => !e.resolved).length === 0 ? (
                    <p className="text-sm text-success-700 text-center py-4">All exceptions resolved</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="text-left text-brand-500"><tr><th className="pb-3">Type</th><th className="pb-3">Property</th><th className="pb-3">Description</th><th className="pb-3 text-right">Amount</th><th className="pb-3 text-right">Days</th><th className="pb-3">Severity</th></tr></thead>
                      <tbody className="divide-y divide-brand-100">
                        {exceptions.filter(e => !e.resolved).map(e => {
                          const p = properties.find(p => p.id === e.propertyId);
                          return (
                            <tr key={e.id}><td className="py-3">{e.type}</td><td className="py-3">{p ? `${p.unitNumber} ${p.schemeName}` : e.propertyId}</td>
                              <td className="py-3">{e.description}</td><td className="py-3 text-right font-medium">{formatZAR(e.amount)}</td>
                              <td className="py-3 text-right">{e.daysOutstanding}</td>
                              <td className="py-3"><span className={`badge ${e.severity === 'Critical' || e.severity === 'High' ? 'badge-danger' : 'badge-warning'}`}>{e.severity}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Report */}
          {selected === 'maintenance' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header"><h2>Maintenance Report</h2></div>
                <div className="card-body">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-brand-50 rounded-lg"><p className="text-xs text-brand-500">Total Issues</p><p className="text-xl font-bold">{maintenanceIssues.length}</p></div>
                    <div className="text-center p-3 bg-warning-50 rounded-lg"><p className="text-xs text-brand-500">Open</p><p className="text-xl font-bold text-warning-700">{maintenanceIssues.filter(i => i.status !== 'Closed' && i.status !== 'Completed').length}</p></div>
                    <div className="text-center p-3 bg-success-50 rounded-lg"><p className="text-xs text-brand-500">Completed</p><p className="text-xl font-bold text-success-700">{maintenanceIssues.filter(i => i.status === 'Completed' || i.status === 'Closed').length}</p></div>
                    <div className="text-center p-3 bg-brand-50 rounded-lg"><p className="text-xs text-brand-500">Total Cost</p><p className="text-xl font-bold">{formatZAR(maintenanceIssues.reduce((s,i) => s + i.actualCost, 0))}</p></div>
                  </div>
                  {maintByCategory.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart><Pie data={maintByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,value}) => `${name}: ${value}`}>
                        {maintByCategory.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie><Tooltip /><Legend /></PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h3>All Issues</h3></div>
                <div className="card-body">
                  <table className="w-full text-sm">
                    <thead className="text-left text-brand-500"><tr><th className="pb-3">Title</th><th className="pb-3">Property</th><th className="pb-3">Category</th><th className="pb-3">Priority</th><th className="pb-3">Status</th><th className="pb-3 text-right">Cost</th></tr></thead>
                    <tbody className="divide-y divide-brand-100">
                      {maintenanceIssues.map(i => {
                        const p = properties.find(p => p.id === i.propertyId);
                        return (
                          <tr key={i.id}><td className="py-3 font-medium">{i.title}</td><td className="py-3">{p ? `${p.unitNumber} ${p.schemeName}` : i.propertyId}</td>
                            <td className="py-3">{i.category}</td><td className="py-3"><span className={`badge ${i.priority === 'High' || i.priority === 'Critical' ? 'badge-danger' : 'badge-neutral'}`}>{i.priority}</span></td>
                            <td className="py-3"><span className={`badge ${i.status === 'Completed' || i.status === 'Closed' ? 'badge-success' : 'badge-warning'}`}>{i.status}</span></td>
                            <td className="py-3 text-right">{formatZAR(i.actualCost)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Audit Report */}
          {selected === 'audit' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header"><h2>Audit Report</h2></div>
                <div className="card-body">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-brand-50 rounded-lg"><p className="text-3xl font-bold text-brand-900">{properties.length}</p><p className="text-sm text-brand-500">Properties</p></div>
                    <div className="text-center p-4 bg-brand-50 rounded-lg"><p className="text-3xl font-bold text-brand-900">{rentalTransactions.length + levyTransactions.length + municipalityTransactions.length + bankTransactions.length}</p><p className="text-sm text-brand-500">Financial Transactions</p></div>
                    <div className="text-center p-4 bg-brand-50 rounded-lg"><p className="text-3xl font-bold text-brand-900">{reconciliationEntries.length}</p><p className="text-sm text-brand-500">Reconciliation Entries</p></div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-brand-700">Portfolio Assets</h3>
                    <table className="w-full text-sm mb-6">
                      <thead className="text-left text-brand-500"><tr><th className="pb-2">Property</th><th className="pb-2">Acquired</th><th className="pb-2 text-right">Purchase</th><th className="pb-2 text-right">Valuation</th><th className="pb-2 text-right">Gain/Loss</th></tr></thead>
                      <tbody className="divide-y divide-brand-100">
                        {properties.map(p => (
                          <tr key={p.id}><td className="py-2">{p.unitNumber} {p.schemeName}</td>
                            <td className="py-2">{new Date(p.acquisitionDate).toLocaleDateString()}</td>
                            <td className="py-2 text-right">{formatZAR(p.purchasePrice)}</td>
                            <td className="py-2 text-right">{formatZAR(p.currentValuation)}</td>
                            <td className={`py-2 text-right font-medium ${p.currentValuation >= p.purchasePrice ? 'text-success-700' : 'text-danger-700'}`}>
                              {p.currentValuation >= p.purchasePrice ? '+' : ''}{formatZAR(p.currentValuation - p.purchasePrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <h3 className="font-medium text-brand-700">Unreconciled Transactions</h3>
                    <div className="text-sm">
                      {rentalTransactions.filter(t => !t.reconciled).length === 0 ? (
                        <p className="text-success-700 py-2">All rental transactions reconciled ✓</p>
                      ) : (
                        <p className="text-warning-700 py-2">{rentalTransactions.filter(t => !t.reconciled).length} unreconciled rental transactions</p>
                      )}
                    </div>

                    <h3 className="font-medium text-brand-700">Data Integrity</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between p-3 bg-brand-50 rounded"><span>Total exceptions</span><span className="font-medium">{exceptions.length}</span></div>
                      <div className="flex justify-between p-3 bg-brand-50 rounded"><span>Unresolved</span><span className="font-medium text-danger-600">{exceptions.filter(e => !e.resolved).length}</span></div>
                      <div className="flex justify-between p-3 bg-brand-50 rounded"><span>Reconciliation health</span><span className={`font-medium ${metrics.reconciliationHealthScore >= 80 ? 'text-success-700' : 'text-warning-700'}`}>{metrics.reconciliationHealthScore}%</span></div>
                      <div className="flex justify-between p-3 bg-brand-50 rounded"><span>Open maintenance</span><span className="font-medium">{metrics.openMaintenanceIssues}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other reports */}
          {!['trust','rental','levy','municipality','loan','cashflow','discrepancy','maintenance','audit'].includes(selected) && (
            <div className="card p-12 text-center">
              <FileText className="w-12 h-12 text-brand-300 mx-auto mb-3" />
              <p className="text-brand-500">Select a report from the sidebar to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
