import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Building2, DollarSign, Landmark, FileWarning, Wrench, ArrowLeftRight, AlertTriangle, Users, TrendingUp, } from "lucide-react";
import KPIWidget from "../../components/KPIWidget";
const kpis = [
    { title: "Portfolio Value", value: "R 48.2M", icon: Building2, trend: { direction: "up", label: "+12.3% YoY" } },
    { title: "Monthly Rental Income", value: "R 342K", icon: DollarSign, trend: { direction: "up", label: "+5.2% vs last month" } },
    { title: "Loan Exposure", value: "R 18.7M", icon: Landmark, trend: { direction: "down", label: "-2.1% reduced" } },
    { title: "Levy Obligations", value: "R 89K", icon: FileWarning },
    { title: "Municipality Obligations", value: "R 124K", icon: FileWarning },
    { title: "Open Maintenance", value: "14", icon: Wrench, trend: { direction: "up", label: "+3 this week" } },
    { title: "Reconciliation Health", value: "94%", icon: ArrowLeftRight, trend: { direction: "up", label: "+2% improved" } },
    { title: "Exceptions Requiring Attention", value: "7", icon: AlertTriangle, trend: { direction: "down", label: "urgent: 2" } },
    { title: "Occupancy", value: "92%", icon: Users, trend: { direction: "up", label: "+1.5% this quarter" } },
    { title: "Net Cashflow", value: "R 129K", icon: TrendingUp, trend: { direction: "up", label: "+8.3% MoM" } },
];
export default function Dashboard() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Dashboard" }), _jsx("p", { className: "text-sm text-gray-500", children: "Portfolio oversight at a glance" })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: kpis.map((kpi) => (_jsx(KPIWidget, { ...kpi }, kpi.title))) })] }));
}
