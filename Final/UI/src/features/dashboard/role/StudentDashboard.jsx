import { useEffect, useState } from "react";
import API_BASE from "../../../config";
import RoleDashboard from "./RoleDashboard";
import s from "./ClassList.module.css";

function useStudentSchedule(sectionId) {
  const [state, setState] = useState({ loading: true, error: "", classes: [], lookups: {}, activeSemester: null });

  useEffect(() => {
    if (!sectionId) {
      setState({ loading: false, error: "", classes: [], lookups: {}, activeSemester: null });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const semesters = await fetch(`${API_BASE}/api/semesters`).then(r => r.json());
        const active = semesters.find(s => s.active) || semesters[0];
        if (!active) {
          if (!cancelled) setState({ loading: false, error: "", classes: [], lookups: {}, activeSemester: null });
          return;
        }
        const [cls, subjects, employees] = await Promise.all([
          fetch(`${API_BASE}/api/class-offerings?semesterId=${active.id}&sectionId=${sectionId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/subjects`).then(r => r.json()),
          fetch(`${API_BASE}/api/employees?all=true`).then(r => r.json()),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: "",
          classes: cls,
          activeSemester: active,
          lookups: {
            subjects: Object.fromEntries(subjects.map(r => [r.id, r])),
            employees: Object.fromEntries(employees.map(r => [r.id, r])),
          },
        });
      } catch (e) {
        if (!cancelled) setState(p => ({ ...p, loading: false, error: e.message }));
      }
    })();
    return () => { cancelled = true; };
  }, [sectionId]);

  return state;
}

export default function StudentDashboard({ user }) {
  const link = user?.linkedEntity;
  const sectionId = link?.currentSectionId;
  const { loading, error, classes, lookups, activeSemester } = useStudentSchedule(sectionId);

  return (
    <RoleDashboard
      eyebrow="Student"
      title={`Welcome${link?.displayName ? `, ${link.displayName}` : ""}.`}
      sub={link?.studentNumber
        ? `Student #${link.studentNumber}. Your grades, books and tuition will appear here as later phases come online.`
        : "Your grades, books and tuition will appear here as later phases come online."}
      user={user}
    >
      <div className={s.section}>
        <div className={s.sectionHead}>
          My Schedule {activeSemester && `· ${activeSemester.label} Semester`}
        </div>

        {!sectionId && (
          <div className={s.empty}>
            You're not enrolled in a section yet. Once an admin enrolls you, your class schedule will appear here.
          </div>
        )}

        {sectionId && loading && <div className={s.empty}>Loading…</div>}
        {sectionId && error && <div className={s.error}>{error}</div>}
        {sectionId && !loading && !error && classes.length === 0 && (
          <div className={s.empty}>No classes scheduled for the active semester yet.</div>
        )}

        {classes.length > 0 && (
          <ul className={s.list}>
            {classes.map(c => {
              const subj = lookups.subjects[c.subjectId];
              const teacher = c.teacherStaffId ? lookups.employees[c.teacherStaffId] : null;
              return (
                <li key={c.id} className={s.row}>
                  <div className={s.rowMain}>
                    <div className={s.rowTitle}>{subj?.title || `Subject #${c.subjectId}`}</div>
                    <div className={s.rowMeta}>
                      {subj?.code && <span>{subj.code}</span>}
                      {teacher?.name && <span>· {teacher.name}</span>}
                    </div>
                  </div>
                  <div className={s.rowSide}>
                    {c.schedule && <div>{c.schedule}</div>}
                    {c.room && <div className={s.rowRoom}>Room {c.room}</div>}
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
