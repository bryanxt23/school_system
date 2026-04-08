import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../../config";
import s from "./Announcements.module.css";

export default function RecentAnnouncementsWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/announcements?audience=auto`);
        if (!res.ok) throw new Error();
        const all = await res.json();
        if (!cancelled) setItems(all.slice(0, 3));
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={s.widget}>
      <div className={s.widgetHead}>
        <span>Recent Announcements</span>
        <button className={s.widgetMore} onClick={() => navigate("/announcements")}>View all →</button>
      </div>
      {loading && <div className={s.widgetEmpty}>Loading…</div>}
      {!loading && items.length === 0 && <div className={s.widgetEmpty}>Nothing new.</div>}
      <ul className={s.widgetList}>
        {items.map(a => (
          <li key={a.id} className={s.widgetItem}>
            <div className={s.widgetTitle}>{a.title}</div>
            <div className={s.widgetSnippet}>
              {a.body.length > 110 ? a.body.substring(0, 110) + "…" : a.body}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
