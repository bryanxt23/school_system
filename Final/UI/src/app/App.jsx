import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Shell from "../components/layout/Shell";
import Topbar from "../components/layout/Topbar";
import HomePage from "../features/home/HomePage";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import PeoplePage from "../features/people/PeoplePage";
import CalendarPage from "../features/calendar/CalendarPage";
import AcademicsPage from "../features/academics/AcademicsPage";
import DirectoryPage from "../features/directory/DirectoryPage";

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  } catch { return null; }
}

function RequireAuth({ children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "Admin") return <Navigate to="/dashboard" replace />;
  return children;
}

/** Allows the route only if the user's role is in the given allowlist. */
export function RequireRole({ roles, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className={isHome ? undefined : "page"}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — with shell + topbar */}
        <Route path="/*" element={
          <RequireAuth>
            <Shell>
              <Topbar />
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/people"    element={<PeoplePage />} />
                <Route path="/calendar"  element={<CalendarPage />} />
                <Route path="/academics" element={
                  <RequireAdmin><AcademicsPage /></RequireAdmin>
                } />
                <Route path="/directory" element={
                  <RequireAdmin><DirectoryPage /></RequireAdmin>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Shell>
          </RequireAuth>
        } />
      </Routes>
    </div>
  );
}
