import s from "../DashboardPage.module.css";

/**
 * Shared visual shell for every role-specific dashboard placeholder.
 * Phases 4–11 will replace `children` with real widgets per role.
 */
export default function RoleDashboard({ eyebrow, title, sub, user, children }) {
  return (
    <div className={s.wrap}>
      <div className={s.card}>
        <div className={s.eyebrow}>{eyebrow}</div>
        <h1 className={s.title}>{title}</h1>
        <p className={s.sub}>{sub}</p>
        <div className={s.meta}>
          <span className={s.metaPill}>Role: {user?.role || "—"}</span>
          {user?.linkedEntity?.displayName && (
            <span className={s.metaPill}>Linked: {user.linkedEntity.displayName}</span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
