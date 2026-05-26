import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, BookUser, Wallet, ArrowLeftRight, Wrench, FileText, Settings, } from "lucide-react";
const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/portfolio", label: "Portfolio", icon: Building2 },
    { to: "/directory", label: "Directory", icon: BookUser },
    { to: "/finance", label: "Finance", icon: Wallet },
    { to: "/reconciliation", label: "Reconciliation", icon: ArrowLeftRight },
    { to: "/maintenance", label: "Maintenance", icon: Wrench },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/settings", label: "Settings", icon: Settings },
];
export default function Sidebar() {
    return (_jsxs("aside", { className: "flex w-64 flex-col border-r bg-white", children: [_jsxs("div", { className: "flex h-16 items-center gap-2 border-b px-6", children: [_jsx(Building2, { className: "h-6 w-6 text-brand-600" }), _jsx("span", { className: "text-lg font-semibold", children: "PMOS Oversight" })] }), _jsx("nav", { className: "flex-1 space-y-1 p-4", children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, className: ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`, children: [_jsx(item.icon, { className: "h-5 w-5" }), item.label] }, item.to))) })] }));
}
