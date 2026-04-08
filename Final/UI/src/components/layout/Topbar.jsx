import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Topbar.module.css";

/**
 * Phase 3+: role-aware nav. An entry is EITHER a flat link
 *   { label, path }
 * OR a dropdown group
 *   { label, items: [{ label, path }, ...] }
 */
const NAV_BY_ROLE = {
  Admin: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Academics", path: "/academics" },
    { label: "People", items: [
      { label: "Students & Parents", path: "/directory" },
      { label: "Staff",              path: "/people" },
    ]},
    { label: "Operations", items: [
      { label: "Tuition",    path: "/admin/tuition" },
      { label: "Books",      path: "/admin/books" },
      { label: "Facilities", path: "/admin/facilities" },
    ]},
    { label: "Announcements", path: "/announcements" },
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

function NavGroup({ entry, pathname, nav }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const groupActive = entry.items.some(it => pathname === it.path);

  return (
    <div className={styles.navGroup} ref={ref}>
      <div
        className={`${styles.navItem} ${groupActive ? styles.active : ""}`}
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setOpen(o => !o); }}>
        {entry.label} <span className={styles.chevron}>▾</span>
      </div>
      {open && (
        <div className={styles.dropdown}>
          {entry.items.map(it => (
            <div
              key={it.label}
              className={`${styles.dropItem} ${pathname === it.path ? styles.dropItemActive : ""}`}
              onClick={() => { setOpen(false); nav(it.path); }}>
              {it.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
        {navForRole(user?.role).map((entry) => {
          if (entry.items) {
            return <NavGroup key={entry.label} entry={entry} pathname={pathname} nav={nav} />;
          }
          const active = pathname === entry.path;
          return (
            <div key={entry.path}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
              onClick={() => nav(entry.path)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") nav(entry.path); }}
              role="button" tabIndex={0}>
              {entry.label}
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
