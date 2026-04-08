import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../../../config";
import RoleDashboard from "./RoleDashboard";
import s from "./ClassList.module.css";

/** Loads the teacher's class offerings + the lookup tables needed to render them. */
function useTeacherClasses(teacherStaffId) {
  const [state, setState] = useState({ loading: true, error: "", classes: [], lookups: {} });

  useEffect(() => {
    if (!teacherStaffId) {
      setState({ loading: false, error: "", classes: [], lookups: {} });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [cls, sections, subjects, semesters] = await Promise.all([
          fetch(`${API_BASE}/api/class-offerings?teacherStaffId=${teacherStaffId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/sections`).then(r => r.json()),
          fetch(`${API_BASE}/api/subjects`).then(r => r.json()),
          fetch(`${API_BASE}/api/semesters`).then(r => r.json()),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: "",
          classes: cls,
          lookups: {
            sections: Object.fromEntries(sections.map(r => [r.id, r])),
            subjects: Object.fromEntries(subjects.map(r => [r.id, r])),
            semesters: Object.fromEntries(semesters.map(r => [r.id, r])),
          },
        });
      } catch (e) {
        if (!cancelled) setState(p => ({ ...p, loading: false, error: e.message }));
      }
    })();
    return () => { cancelled = true; };
  }, [teacherStaffId]);

  return state;
}

export default function TeacherDashboard({ user }) {
  const navigate = useNavigate();
  const teacherStaffId = user?.linkedEntity?.id;
  const { loading, error, classes, lookups } = useTeacherClasses(teacherStaffId);

  return (
    <RoleDashboard
      eyebrow="Teacher"
      title={`Welcome${user?.linkedEntity?.displayName ? `, ${user.linkedEntity.displayName}` : ""}.`}
      sub="Your assigned classes. Click any class to encode midterm and final grades."
      user={user}
    >
      <div className={s.section}>
        <div className={s.sectionHead}>My Classes</div>

        {!teacherStaffId && (
          <div className={s.empty}>
            Your account isn't linked to a Staff record yet. Ask an admin to set
            <code> linkedEntityType=STAFF</code> and <code>linkedEntityId</code> on your user.
          </div>
        )}

        {teacherStaffId && loading && <div className={s.empty}>Loading…</div>}
        {teacherStaffId && error && <div className={s.error}>{error}</div>}
        {teacherStaffId && !loading && !error && classes.length === 0 && (
          <div className={s.empty}>You have no class offerings assigned yet.</div>
        )}

        {classes.length > 0 && (
          <ul className={s.list}>
            {classes.map(c => {
              const subj = lookups.subjects[c.subjectId];
              const sec  = lookups.sections[c.sectionId];
              const sem  = lookups.semesters[c.semesterId];
              return (
                <li key={c.id}
                    className={`${s.row} ${s.rowClickable}`}
                    onClick={() => navigate(`/teacher/grades/${c.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter") navigate(`/teacher/grades/${c.id}`); }}>
                  <div className={s.rowMain}>
                    <div className={s.rowTitle}>{subj?.title || `Subject #${c.subjectId}`}</div>
                    <div className={s.rowMeta}>
                      {subj?.code && <span>{subj.code}</span>}
                      {sec?.name && <span>· Section {sec.name}</span>}
                      {sem?.label && <span>· {sem.label} sem</span>}
                    </div>
                  </div>
                  <div className={s.rowSide}>
                    {c.schedule && <div>{c.schedule}</div>}
                    {c.room && <div className={s.rowRoom}>Room {c.room}</div>}
                    <div className={s.rowAction}>Encode →</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </RoleDashboard>
  );
}
