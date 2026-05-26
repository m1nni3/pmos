import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
export default function App() {
    const element = useRoutes(routes);
    return _jsx(_Fragment, { children: element });
}
