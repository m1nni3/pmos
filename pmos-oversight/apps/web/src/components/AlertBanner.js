import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle } from "lucide-react";
export default function AlertBanner() {
    return (_jsxs("button", { className: "relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), _jsx("span", { className: "absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white", children: "3" })] }));
}
