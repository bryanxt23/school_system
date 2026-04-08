import AdminDashboard   from "./role/AdminDashboard";
import TeacherDashboard from "./role/TeacherDashboard";
import StudentDashboard from "./role/StudentDashboard";
import ParentDashboard  from "./role/ParentDashboard";
import JanitorDashboard from "./role/JanitorDashboard";
import GuardDashboard   from "./role/GuardDashboard";

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  } catch { return null; }
}

const ROLE_DASHBOARDS = {
  Admin:         AdminDashboard,
  Teacher:       TeacherDashboard,
  Student:       StudentDashboard,
  Parent:        ParentDashboard,
  Janitor:       JanitorDashboard,
  SecurityGuard: GuardDashboard,
};

export default function DashboardPage() {
  const user = getUser();
  const Dashboard = ROLE_DASHBOARDS[user?.role] || AdminDashboard;
  return <Dashboard user={user} />;
}
