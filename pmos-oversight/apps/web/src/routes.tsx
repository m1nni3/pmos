import type { RouteObject } from "react-router-dom";
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

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "portfolio", element: <Portfolio /> },
          { path: "property/:id", element: <Property /> },
          { path: "directory", element: <Directory /> },
          { path: "finance", element: <Finance /> },
          { path: "reconciliation", element: <Reconciliation /> },
          { path: "maintenance", element: <Maintenance /> },
          { path: "reports", element: <Reports /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
];
