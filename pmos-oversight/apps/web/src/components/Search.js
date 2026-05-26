import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SearchIcon } from "lucide-react";
export default function Search() {
    return (_jsxs("div", { className: "relative max-w-md", children: [_jsx(SearchIcon, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "search", placeholder: "Search properties, contacts, transactions...", className: "w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" })] }));
}
