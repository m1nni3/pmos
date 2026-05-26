import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Search from "./Search";
import AlertBanner from "./AlertBanner";
export default function Topbar() {
    return (_jsxs("header", { className: "flex h-16 items-center gap-4 border-b bg-white px-6", children: [_jsx("div", { className: "flex-1", children: _jsx(Search, {}) }), _jsx("div", { className: "flex items-center gap-3", children: _jsx(AlertBanner, {}) })] }));
}
