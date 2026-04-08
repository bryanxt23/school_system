import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Topbar.module.css";

// Phase 3: role-aware nav. Each role gets its own sidebar.
// Phase 4+ will add more entries (Grades, Tuition, Books, Tasks, Visitors, ...).
const NAV_BY_ROLE = {
  Admin: [
    { label: "Dashboard",     path: "/dashboard" },
    { label: "Academics",     path: "/academics" },
    { label: "Directory",     path: "/directory" },
    { label: "Tuition",       path: "/admin/tuition" },
    { label: "Books",         path: "/admin/books" },
    { label: "Announcements", path: "/announcements" },
    { label: "People",        path: "/people" },
    { label: "Calendar",      path: "/calendar" },
  ],
  Teacher: [
    { label: "Dashboard",     path: "/dashboard" },
    { label: "Announcements", path: "/announcements" },
    { label: "Calendar",      path: "/calendar" },
  ],
  Student: [
    { label: "Dashboard",     path: "/dashboard" },
    { label: "Grades",        path: "/grades" },
    { label: "Tuition",       path: "/tuition" },
    { label: "Books",         path: "/books" },
    { label: "Announcements", path: "/announcements" },
    { label: "Calendar",      path: "/calendar" },
  ],
  Parent: [
    { label: "Dashboard",     path: "/dashboard" },
    { label: "Grades",        path: "/grades" },
    { label: "Tuition",       path: "/tuition" },
    { label: "Books",         path: "/books" },
    { label: "Announcements", path: "/announcements" },
    { label: "Calendar",      path: "/calendar" },
  ],
  Janitor: [
    { label: "Dashboard",     path: "/dashboard" },
    { label: "Announcements", path: "/announcements" },
  ],
  SecurityGuard: [
    { label: "Dashboard",     path: "/dashboard" },
    { label: "Announcements", path: "/announcements" },
  ],
};

function navForRole(role) {
  return NAV_BY_ROLE[role] || [{ label: "Dashboard", path: "/dashboard" }];
}

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  } catch { return null; }
}

export default function Topbar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const user = getUser();

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    nav("/login", { replace: true });
  };

  return (
    <div className={styles.topbar}>

      {/* ── Brand ── */}
      <div className={styles.brand}>
        <div className={styles.brandLogoMark}>◐</div>
        <div className={styles.brandText}>
          <div className={styles.brandTitle}>PATHWISE ACADEMY</div>
          <div className={styles.brandSubtitle}>Management System</div>
        </div>
      </div>

      {/* ── Nav tabs ── */}
      <div className={styles.navPill}>
        {navForRole(user?.role).map((t) => {
          const active = pathname === t.path;
          return (
            <div key={t.path}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
              onClick={() => nav(t.path)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") nav(t.path); }}
              role="button" tabIndex={0}>
              {t.label}
            </div>
          );
        })}
      </div>

      {/* ── Actions ── */}
      <div className={styles.actions}>
        <div className={styles.userInfo}>
          {user?.photoUrl
            ? <img src={user.photoUrl} alt={user.username} className={styles.userAvatarImg} />
            : <div className={styles.userAvatar}>{user?.username?.[0]?.toUpperCase() || "?"}</div>
          }
          <div className={styles.userDetails}>
            <div className={styles.userName}>{user?.employeeName || user?.username}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          ⏏ Logout
        </button>
      </div>
    </div>
  );
}
