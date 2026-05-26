import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function KPIWidget({ title, value, icon: Icon, trend }) {
    return (_jsx("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: title }), _jsx("p", { className: "mt-1 text-2xl font-bold", children: value }), trend && (_jsx("p", { className: `mt-1 text-xs ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`, children: trend.label }))] }), _jsx("div", { className: "rounded-lg bg-brand-50 p-3", children: _jsx(Icon, { className: "h-5 w-5 text-brand-600" }) })] }) }));
}
