import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  GitCompare,
  AlertTriangle,
  Wrench,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LayoutProps {
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Navigation configuration
// ---------------------------------------------------------------------------

interface NavItem {
  to: string;
  icon: React.FC<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/properties', icon: Building2, label: 'Properties' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/financial', icon: DollarSign, label: 'Financial Ledgers' },
  { to: '/reconciliation', icon: GitCompare, label: 'Reconciliation' },
  { to: '/exceptions', icon: AlertTriangle, label: 'Exceptions' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function Layout({ children }: LayoutProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ================================================================= */}
      {/* Sidebar                                                          */}
      {/* ================================================================= */}
      <aside
        className={`
          flex flex-col shrink-0
          bg-slate-900
          border-r border-slate-800
          transition-all duration-300 ease-in-out
          ${expanded ? 'w-64' : 'w-16'}
        `}
      >
        {/* ============================================================= */}
        {/* Brand Header                                                  */}
        {/* ============================================================= */}
        <div className="flex items-center h-16 px-4 border-b border-slate-800 shrink-0 overflow-hidden">
          {/* Logo icon — always visible */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 shrink-0">
            <span className="text-white font-bold text-sm tracking-tight">
              P
            </span>
          </div>

          {/* Brand text — only when expanded */}
          <div
            className={`
              ml-3 flex items-baseline gap-1.5 whitespace-nowrap
              transition-all duration-300 overflow-hidden
              ${expanded ? 'opacity-100 max-w-48' : 'opacity-0 max-w-0'}
            `}
          >
            <span className="text-white font-semibold text-lg tracking-tight">
              PMOS
            </span>
            <span className="text-slate-500 text-sm font-normal">
              — Portfolio Oversight
            </span>
          </div>
        </div>

        {/* ============================================================= */}
        {/* Navigation Items                                              */}
        {/* ============================================================= */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <ul className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/dashboard'}
                    className={({ isActive }) =>
                      [
                        // Base
                        'group flex items-center gap-3 px-3 py-2.5 rounded-lg',
                        'text-sm font-medium whitespace-nowrap overflow-hidden',
                        'transition-colors duration-150',
                        // Active
                        isActive
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }
                  >
                    {/* Active indicator dot (left edge) */}
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 w-0.5 h-6 rounded-r-full bg-indigo-400" />
                        )}
                        <Icon
                          className={[
                            'w-5 h-5 shrink-0 transition-transform duration-150',
                            'group-hover:scale-105',
                          ].join(' ')}
                        />
                        <span
                          className={`
                            transition-all duration-300
                            ${expanded ? 'opacity-100' : 'opacity-0 w-0'}
                          `}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ============================================================= */}
        {/* Toggle Button                                                 */}
        {/* ============================================================= */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={`
              flex items-center gap-2 w-full p-2 rounded-lg
              text-slate-500 hover:text-slate-200 hover:bg-slate-800/60
              transition-colors duration-150 overflow-hidden
              ${!expanded ? 'justify-center' : ''}
            `}
            title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? (
              <ChevronLeft className="w-5 h-5 shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 shrink-0" />
            )}
            <span
              className={`
                text-xs font-medium whitespace-nowrap
                transition-all duration-300
                ${expanded ? 'opacity-100' : 'opacity-0 w-0'}
              `}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* Main Content Area                                                */}
      {/* ================================================================= */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
