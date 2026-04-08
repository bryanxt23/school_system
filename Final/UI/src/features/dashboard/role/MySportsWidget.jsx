import { useEffect, useState } from "react";
import API_BASE from "../../../config";
import s from "./ClassList.module.css";

/** Loads a single student's sports + sport name lookup. */
function useStudentSports(studentId) {
  const [state, setState] = useState({ loading: true, rows: [], sportsById: {} });
  useEffect(() => {
    if (!studentId) {
      setState({ loading: false, rows: [], sportsById: {} });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [rows, sports] = await Promise.all([
          fetch(`${API_BASE}/api/student-sports?studentId=${studentId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/sports`).then(r => r.json()),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          rows,
          sportsById: Object.fromEntries(sports.map(r => [r.id, r])),
        });
      } catch {
        if (!cancelled) setState({ loading: false, rows: [], sportsById: {} });
      }
    })();
    return () => { cancelled = true; };
  }, [studentId]);
  return state;
}

export default function MySportsWidget({ studentId, label = "My Sports" }) {
  const { loading, rows, sportsById } = useStudentSports(studentId);

  if (!studentId) return null;

  return (
    <div className={s.section}>
      <div className={s.sectionHead}>{label}</div>

      {loading && <div className={s.empty}>Loading…</div>}
      {!loading && rows.length === 0 && <div className={s.empty}>Not currently on any team.</div>}

      {rows.length > 0 && (
        <ul className={s.list}>
          {rows.map(r => {
            const sport = sportsById[r.sportId];
            return (
              <li key={r.id} className={s.row}>
                <div className={s.rowMain}>
                  <div className={s.rowTitle}>{sport?.name || `Sport #${r.sportId}`}</div>
                  <div className={s.rowMeta}>
                    {r.position && <span>{r.position}</span>}
                    {sport?.season && <span> · {sport.season}</span>}
                  </div>
                </div>
                <div className={s.rowSide}>
                  {r.jerseyNumber && <div>#{r.jerseyNumber}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
