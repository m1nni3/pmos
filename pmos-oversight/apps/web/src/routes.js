import { jsx as _jsx } from "react/jsx-runtime";
import AppLayout from "./layouts/AppLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Property from "./pages/Property";
import Directory from "./pages/Directory";
import Finance from "./pages/Finance";
import Reconciliation from "./pages/Reconciliation";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
export const routes = [
    {
        path: "/",
        element: _jsx(AppLayout, {}),
        children: [
            {
                element: _jsx(DashboardLayout, {}),
                children: [
                    { index: true, element: _jsx(Dashboard, {}) },
                    { path: "dashboard", element: _jsx(Dashboard, {}) },
                    { path: "portfolio", element: _jsx(Portfolio, {}) },
                    { path: "property/:id", element: _jsx(Property, {}) },
                    { path: "directory", element: _jsx(Directory, {}) },
                    { path: "finance", element: _jsx(Finance, {}) },
                    { path: "reconciliation", element: _jsx(Reconciliation, {}) },
                    { path: "maintenance", element: _jsx(Maintenance, {}) },
                    { path: "reports", element: _jsx(Reports, {}) },
                    { path: "settings", element: _jsx(Settings, {}) },
                ],
            },
        ],
    },
];
