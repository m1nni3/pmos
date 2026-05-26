import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import {
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Home,
  Percent,
  Wrench,
  ShieldCheck,
  Banknote,
  Activity,
  ArrowRight,
  PlusCircle,
  ChevronRight,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type {
  RentalTransaction,
  Exception,
  Property,
  PropertyStatus,
} from '@/types';

// ============================================================================
// Helpers
// ============================================================================

/** Format a number as South African Rand. */
function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Derive a colour class for the reconciliation health score. */
function healthScoreColor(score: number): string {
  if (score >= 80) return 'text-success-500';
  if (score >= 50) return 'text-warning-500';
  return 'text-danger-500';
}

function healthScoreBg(score: number): string {
  if (score >= 80) return 'bg-success-500';
  if (score >= 50) return 'bg-warning-500';
  return 'bg-danger-500';
}

// ============================================================================
// Status badge colours
// ============================================================================

const statusBadge: Record<PropertyStatus, string> = {
  Active: 'bg-success-50 text-success-700 border-success-500/30',
  Vacant: 'bg-warning-50 text-warning-700 border-warning-500/30',
  'Under Maintenance': 'bg-accent-50 text-accent-700 border-accent-500/30',
  Sold: 'bg-slate-100 text-slate-600 border-slate-300',
};

const severityBadge: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600 border-slate-300',
  Medium: 'bg-warning-50 text-warning-700 border-warning-500/30',
  High: 'bg-danger-50 text-danger-700 border-danger-500/30',
  Critical: 'bg-danger-100 text-danger-700 border-danger-500/50',
};

// ============================================================================
// DashboardPage
// ============================================================================

export default function DashboardPage() {
  // ---- Store -----------------------------------------------------------------
  const metrics = useStore((s) => s.getDashboardMetrics());
  const properties = useStore((s) => s.properties);
  const rentalTransactions = useStore((s) => s.rentalTransactions);
  const exceptions = useStore((s) => s.exceptions);

  // ---- Derived: monthly chart data ------------------------------------------
  const monthlyChartData = useMemo(() => {
    if (rentalTransactions.length === 0) return [];

    const groups: Record<string, { income: number; expenses: number }> = {};

    for (const tx of rentalTransactions) {
      const monthKey = format(parseISO(tx.date), 'MMM yyyy');
      if (!groups[monthKey]) {
        groups[monthKey] = { income: 0, expenses: 0 };
      }
      if (tx.type === 'Rent Received' || tx.type === 'Other Income') {
        groups[monthKey].income += tx.amount;
      } else {
        // All deduction / expense types
        groups[monthKey].expenses += tx.amount;
      }
    }

    // Convert to sorted array
    return Object.entries(groups)
      .map(([month, values]) => ({
        month,
        Income: values.income,
        Expenses: values.expenses,
      }))
      .sort(
        (a, b) =>
          new Date(a.month).getTime() - new Date(b.month).getTime(),
      );
  }, [rentalTransactions]);

  // ---- Derived: 5 most recent unresolved exceptions -------------------------
  const recentExceptions: Exception[] = useMemo(() => {
    return exceptions
      .filter((ex) => !ex.resolved)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [exceptions]);

  // ---- Derived: property name lookup for exceptions -------------------------
  const propertyNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of properties) {
      map[p.id] = p.unitNumber
        ? `${p.schemeName} #${p.unitNumber}`
        : p.schemeName;
    }
    return map;
  }, [properties]);

  // ==========================================================================
  // Empty State
  // ==========================================================================
  if (properties.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-8 sm:p-12 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
              <Home className="w-8 h-8 text-brand-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome to PMOS
            </h2>
            <p className="text-slate-500 max-w-md mb-8">
              No properties in portfolio yet. Add your first property to start
              tracking rental income, expenses, maintenance and reconciliations.
            </p>

            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white font-medium text-sm
                         hover:bg-accent-600 transition-colors duration-150 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your First Property
            </Link>

            {/* Quick-links */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                <Building2 className="w-5 h-5 text-brand-500 mb-2" />
                <p className="text-sm font-medium text-slate-700">Properties</p>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your portfolio
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                <DollarSign className="w-5 h-5 text-success-500 mb-2" />
                <p className="text-sm font-medium text-slate-700">Financials</p>
                <p className="text-xs text-slate-400 mt-1">
                  Track income &amp; expenses
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                <Activity className="w-5 h-5 text-accent-500 mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  Reconciliation
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Auto-match transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // Full Dashboard
  // ==========================================================================
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ================================================================== */}
      {/* Page Header                                                       */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Portfolio overview &amp; key metrics
          </p>
        </div>
        <Link
          to="/reconciliation"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium
                     hover:bg-accent-600 transition-colors duration-150 shadow-sm"
        >
          <Activity className="w-4 h-4" />
          Run Reconciliation
        </Link>
      </div>

      {/* ================================================================== */}
      {/* Row 1 — 5 Primary KPI Cards                                        */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Portfolio Value */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-accent-500" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Portfolio Value
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatZAR(metrics.portfolioValue)}
          </p>
        </div>

        {/* Monthly Rental Income */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-success-500" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Rental Income
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatZAR(metrics.totalRentalIncome)}
          </p>
        </div>

        {/* Loan Exposure */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-warning-50 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 text-warning-500" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Loan Exposure
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatZAR(metrics.loanExposure)}
          </p>
        </div>

        {/* Occupancy Rate */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Occupancy
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {metrics.occupancyRate}%
          </p>
        </div>

        {/* Reconciliation Health Score */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Recon Health
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p
              className={`text-2xl font-bold ${healthScoreColor(
                metrics.reconciliationHealthScore,
              )}`}
            >
              {metrics.reconciliationHealthScore}/100
            </p>
          </div>
          {/* Thin progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${healthScoreBg(
                metrics.reconciliationHealthScore,
              )}`}
              style={{ width: `${metrics.reconciliationHealthScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Row 2 — 3 Secondary KPI Cards                                      */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Open Maintenance Issues */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Open Maintenance
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {metrics.openMaintenanceIssues}
            </p>
          </div>
          {metrics.openMaintenanceIssues > 0 && (
            <Link
              to="/maintenance"
              className="ml-auto text-xs text-accent-500 hover:text-accent-600 font-medium flex items-center gap-1 shrink-0"
            >
              View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Exceptions Requiring Attention */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              metrics.exceptionsRequiringAttention > 0
                ? 'bg-danger-50'
                : 'bg-success-50'
            }`}
          >
            <AlertTriangle
              className={`w-6 h-6 ${
                metrics.exceptionsRequiringAttention > 0
                  ? 'text-danger-500'
                  : 'text-success-500'
              }`}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Exceptions
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {metrics.exceptionsRequiringAttention}
            </p>
          </div>
          {metrics.exceptionsRequiringAttention > 0 && (
            <Link
              to="/exceptions"
              className="ml-auto text-xs text-accent-500 hover:text-accent-600 font-medium flex items-center gap-1 shrink-0"
            >
              Resolve <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Net Cash Flow */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              metrics.netCashFlow >= 0 ? 'bg-success-50' : 'bg-danger-50'
            }`}
          >
            <TrendingUp
              className={`w-6 h-6 ${
                metrics.netCashFlow >= 0 ? 'text-success-500' : 'text-danger-500'
              }`}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Net Cash Flow
            </p>
            <p
              className={`text-2xl font-bold ${
                metrics.netCashFlow >= 0 ? 'text-success-700' : 'text-danger-700'
              }`}
            >
              {formatZAR(metrics.netCashFlow)}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Property Overview                                                  */}
      {/* ================================================================== */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Property Overview
            </h2>
            <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
              {properties.length}
            </span>
          </div>
          <Link
            to="/properties"
            className="text-xs text-accent-500 hover:text-accent-600 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scrollable property cards */}
        <div className="p-4 flex gap-4 overflow-x-auto">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              maintenanceCount={
                useStore
                  .getState()
                  .maintenanceIssues.filter(
                    (m) =>
                      m.propertyId === property.id && m.status !== 'Closed',
                  ).length
              }
            />
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Charts: Income vs Expenses                                         */}
      {/* ================================================================== */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Monthly Income vs Expenses
          </h2>
        </div>

        <div className="p-6">
          {monthlyChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat('en-ZA', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
                    formatter={(value: number) => formatZAR(value)}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
                  />
                  <Bar
                    dataKey="Income"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState />
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Recent Exceptions                                                  */}
      {/* ================================================================== */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning-500" />
            <h2 className="text-base font-semibold text-slate-900">
              Recent Exceptions
            </h2>
            {recentExceptions.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                {exceptions.filter((e) => !e.resolved).length} unresolved
              </span>
            )}
          </div>
          <Link
            to="/exceptions"
            className="text-xs text-accent-500 hover:text-accent-600 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExceptions.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {recentExceptions.map((ex) => (
              <li
                key={ex.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                {/* Severity dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    ex.severity === 'Critical' || ex.severity === 'High'
                      ? 'bg-danger-500'
                      : ex.severity === 'Medium'
                        ? 'bg-warning-500'
                        : 'bg-slate-400'
                  }`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded border ${
                        severityBadge[ex.severity]
                      }`}
                    >
                      {ex.severity}
                    </span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {ex.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      &middot;{' '}
                      {propertyNameMap[ex.propertyId] ?? 'Unknown property'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 truncate">
                    {ex.description}
                  </p>
                </div>

                {/* Amount & age */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatZAR(ex.amount)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {ex.daysOutstanding} days
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-success-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              No unresolved exceptions
            </p>
            <p className="text-xs text-slate-400 mt-1">
              All reconciliations are in good health.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

/** Individual property card for the overview carousel. */
function PropertyCard({
  property,
  maintenanceCount,
}: {
  property: Property;
  maintenanceCount: number;
}) {
  const isActive = property.status === 'Active';

  return (
    <Link
      to={`/properties`}
      className="flex-shrink-0 w-64 rounded-xl border border-slate-200 bg-slate-50 p-4
                 hover:border-accent-300 hover:shadow-md transition-all duration-150 group"
    >
      {/* Status & scheme */}
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
            statusBadge[property.status]
          }`}
        >
          {property.status}
        </span>
        {maintenanceCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-warning-600 bg-warning-50 rounded-full px-2 py-0.5">
            <Wrench className="w-3 h-3" />
            {maintenanceCount}
          </span>
        )}
      </div>

      {/* Property name */}
      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-accent-600 transition-colors truncate">
        {property.schemeName}
      </h3>
      {property.unitNumber && (
        <p className="text-xs text-slate-400 mt-0.5">Unit {property.unitNumber}</p>
      )}

      {/* Rental amount */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-400">Rental</span>
        <span className="text-sm font-bold text-slate-800">
          {formatZAR(property.rentalAmount)}
        </span>
      </div>

      {/* Occupancy indicator */}
      <div className="mt-2 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-success-500' : 'bg-slate-300'
          }`}
        />
        <span className="text-xs text-slate-500">
          {isActive ? 'Occupied' : 'Not occupied'}
        </span>
      </div>
    </Link>
  );
}

/** Empty-state placeholder for the chart section. */
function EmptyChartState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <BarChart3 className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-sm font-medium text-slate-600">
        No rental transaction data yet
      </p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Once rental transactions are recorded, monthly income vs expenses will
        appear here.
      </p>
      <Link
        to="/financial"
        className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent-500 hover:text-accent-600 font-medium"
      >
        Go to Financial Ledgers <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
