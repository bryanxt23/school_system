import { useEffect, useState } from "react";
import API_BASE from "../../../config";
import RoleDashboard from "./RoleDashboard";
import s from "./ClassList.module.css";

function useJanitorWork(janitorStaffId) {
  const [state, setState] = useState({ loading: true, error: "", tasks: [], requests: [], areasById: {} });

  useEffect(() => {
    if (!janitorStaffId) {
      setState({ loading: false, error: "", tasks: [], requests: [], areasById: {} });
      return;
    }
    let cancelled = false;
    setState(p => ({ ...p, loading: true, error: "" }));
    (async () => {
      try {
        const [tasks, requests, areas] = await Promise.all([
          fetch(`${API_BASE}/api/janitor-tasks?janitorStaffId=${janitorStaffId}&status=PENDING`).then(r => r.json()),
          fetch(`${API_BASE}/api/maintenance-requests?janitorStaffId=${janitorStaffId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/areas`).then(r => r.json()),
        ]);
        if (cancelled) return;
        setState({
          loading: false, error: "",
          tasks, requests,
          areasById: Object.fromEntries(areas.map(a => [a.id, a])),
        });
      } catch (e) {
        if (!cancelled) setState(p => ({ ...p, loading: false, error: e.message }));
      }
    })();
    return () => { cancelled = true; };
  }, [janitorStaffId]);

  return [state, setState];
}

export default function JanitorDashboard({ user }) {
  const janitorStaffId = user?.linkedEntity?.id;
  const [{ loading, error, tasks, requests, areasById }, setState] = useJanitorWork(janitorStaffId);

  async function markTaskDone(task) {
    try {
      const res = await fetch(`${API_BASE}/api/janitor-tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      if (!res.ok) throw new Error("Failed");
      setState(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== task.id) }));
    } catch (e) {
      setState(p => ({ ...p, error: e.message }));
    }
  }

  async function setRequestStatus(req, status) {
    try {
      const res = await fetch(`${API_BASE}/api/maintenance-requests/${req.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setState(p => ({
        ...p,
        requests: p.requests.map(r => r.id === req.id ? updated : r),
      }));
    } catch (e) {
      setState(p => ({ ...p, error: e.message }));
    }
  }

  return (
    <RoleDashboard
      eyebrow="Janitor"
      title={`Welcome${user?.linkedEntity?.displayName ? `, ${user.linkedEntity.displayName}` : ""}.`}
      sub="Your pending tasks and maintenance requests assigned to you."
      user={user}
    >
      {!janitorStaffId && (
        <div className={s.section}>
          <div className={s.empty}>
            Your account isn't linked to a Staff record yet. Ask an admin to set
            <code> linkedEntityType=STAFF</code> and <code>linkedEntityId</code>.
          </div>
        </div>
      )}

      {janitorStaffId && (
        <>
          <div className={s.section}>
            <div className={s.sectionHead}>Pending Tasks</div>
            {loading && <div className={s.empty}>Loading…</div>}
            {error && <div className={s.error}>{error}</div>}
            {!loading && !error && tasks.length === 0 && (
              <div className={s.empty}>No pending tasks. ✓</div>
            )}
            {tasks.length > 0 && (
              <ul className={s.list}>
                {tasks.map(t => {
                  const area = areasById[t.areaId];
                  return (
                    <li key={t.id} className={s.row}>
                      <div className={s.rowMain}>
                        <div className={s.rowTitle}>{area?.name || `Area #${t.areaId}`}</div>
                        <div className={s.rowMeta}>
                          {area?.building && <span>{area.building}</span>}
                          {area?.floor && <span> · {area.floor}</span>}
                          {t.dueDate && <span> · due {t.dueDate}</span>}
                          {t.notes && <span> · {t.notes}</span>}
                        </div>
                      </div>
                      <div className={s.rowSide}>
                        <button className={s.markDoneBtn} onClick={() => markTaskDone(t)}>
                          Mark done
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className={s.section}>
            <div className={s.sectionHead}>Maintenance Requests</div>
            {!loading && requests.length === 0 && (
              <div className={s.empty}>No requests assigned to you.</div>
            )}
            {requests.length > 0 && (
              <ul className={s.list}>
                {requests.map(r => {
                  const area = areasById[r.areaId];
                  return (
                    <li key={r.id} className={s.row}>
                      <div className={s.rowMain}>
                        <div className={s.rowTitle}>{area?.name || `Area #${r.areaId}`}</div>
                        <div className={s.rowMeta}>
                          {r.description}
                          {r.requestedByUsername && <span> · by {r.requestedByUsername}</span>}
                          <span> · {r.status.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className={s.rowSide}>
                        {r.status === "OPEN" && (
                          <button className={s.markDoneBtn} onClick={() => setRequestStatus(r, "IN_PROGRESS")}>
                            Start
                          </button>
                        )}
                        {r.status === "IN_PROGRESS" && (
                          <button className={s.markDoneBtn} onClick={() => setRequestStatus(r, "RESOLVED")}>
                            Resolve
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </RoleDashboard>
  );
}
