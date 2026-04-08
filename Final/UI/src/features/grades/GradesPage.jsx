import { useEffect, useMemo, useState } from "react";
import API_BASE from "../../config";
import s from "./Grades.module.css";

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  } catch { return null; }
}

/** Loads grades for one student plus everything needed to render them. */
function useStudentGrades(studentId) {
  const [state, setState] = useState({ loading: false, error: "", grades: [], offerings: {}, subjects: {}, semesters: {} });

  useEffect(() => {
    if (!studentId) {
      setState({ loading: false, error: "", grades: [], offerings: {}, subjects: {}, semesters: {} });
      return;
    }
    let cancelled = false;
    setState(p => ({ ...p, loading: true, error: "" }));
    (async () => {
      try {
        const [grades, offerings, subjects, semesters] = await Promise.all([
          fetch(`${API_BASE}/api/grades?studentId=${studentId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/class-offerings`).then(r => r.json()),
          fetch(`${API_BASE}/api/subjects`).then(r => r.json()),
          fetch(`${API_BASE}/api/semesters`).then(r => r.json()),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: "",
          grades,
          offerings: Object.fromEntries(offerings.map(r => [r.id, r])),
          subjects: Object.fromEntries(subjects.map(r => [r.id, r])),
          semesters: Object.fromEntries(semesters.map(r => [r.id, r])),
        });
      } catch (e) {
        if (!cancelled) setState(p => ({ ...p, loading: false, error: e.message }));
      }
    })();
    return () => { cancelled = true; };
  }, [studentId]);

  return state;
}

/** Loads the parent's linked children. */
function useParentChildren(parentId) {
  const [state, setState] = useState({ loading: false, children: [] });
  useEffect(() => {
    if (!parentId) return;
    let cancelled = false;
    (async () => {
      try {
        const links = await fetch(`${API_BASE}/api/parent-student?parentId=${parentId}`).then(r => r.json());
        const children = await Promise.all(
          links.map(l => fetch(`${API_BASE}/api/students/${l.studentId}`).then(r => r.json()))
        );
        if (!cancelled) setState({ loading: false, children });
      } catch {
        if (!cancelled) setState({ loading: false, children: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [parentId]);
  return state;
}

export default function GradesPage() {
  const user = getUser();
  const role = user?.role;

  // Parent: pick a child first
  const { children } = useParentChildren(role === "Parent" ? user?.linkedEntity?.id : null);
  const [pickedChildId, setPickedChildId] = useState(null);

  useEffect(() => {
    if (role === "Parent" && children.length > 0 && pickedChildId == null) {
      setPickedChildId(children[0].id);
    }
  }, [role, children, pickedChildId]);

  const studentId =
    role === "Student" ? user?.linkedEntity?.id :
    role === "Parent"  ? pickedChildId :
    null;

  const { loading, error, grades, offerings, subjects, semesters } = useStudentGrades(studentId);

  // Group grades by semester → subject
  const grouped = useMemo(() => {
    const groups = {}; // { semesterId: { subjectId: { MIDTERM, FINAL } } }
    grades.forEach(g => {
      const off = offerings[g.classOfferingId];
      if (!off) return;
      const semId = off.semesterId;
      const subjId = off.subjectId;
      if (!groups[semId]) groups[semId] = {};
      if (!groups[semId][subjId]) groups[semId][subjId] = { offering: off };
      groups[semId][subjId][g.period] = g;
    });
    return groups;
  }, [grades, offerings]);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>{role === "Parent" ? "Parent" : "Student"} · Grades</div>
          <h1 className={s.title}>Academic Record</h1>
          <p className={s.sub}>
            {role === "Parent"
              ? "Grades for your linked children. Switch between children using the buttons below."
              : "Your grades grouped by semester and subject."}
          </p>
        </div>
      </div>

      {role === "Parent" && children.length === 0 && (
        <div className={s.card}><div className={s.empty}>No linked children. Ask an admin to link you.</div></div>
      )}

      {role === "Parent" && children.length > 0 && (
        <div className={s.childPicker}>
          {children.map(c => (
            <button
              key={c.id}
              className={`${s.childBtn} ${pickedChildId === c.id ? s.childBtnActive : ""}`}
              onClick={() => setPickedChildId(c.id)}>
              {c.firstName} {c.lastName}
            </button>
          ))}
        </div>
      )}

      <div className={s.card}>
        {!studentId && role !== "Parent" && (
          <div className={s.empty}>Your account isn't linked to a Student record yet.</div>
        )}

        {studentId && loading && <div className={s.empty}>Loading…</div>}
        {studentId && error && <div className={s.error}>{error}</div>}
        {studentId && !loading && !error && Object.keys(grouped).length === 0 && (
          <div className={s.empty}>No grades on record yet.</div>
        )}

        {Object.entries(grouped).map(([semId, bySubj]) => {
          const sem = semesters[semId];
          return (
            <div key={semId} className={s.semBlock}>
              <h3 className={s.semTitle}>{sem ? `${sem.label} Semester` : `Semester #${semId}`}</h3>
              <table className={s.gradeTable}>
                <thead>
                  <tr><th>Subject</th><th>Midterm</th><th>Final</th><th>Remarks</th></tr>
                </thead>
                <tbody>
                  {Object.entries(bySubj).map(([subjId, cell]) => {
                    const subj = subjects[subjId];
                    const mid = cell.MIDTERM;
                    const fin = cell.FINAL;
                    const remarks = [mid?.remarks, fin?.remarks].filter(Boolean).join(" · ");
                    return (
                      <tr key={subjId}>
                        <td>
                          <div className={s.studentName}>{subj?.title || `Subject #${subjId}`}</div>
                          {subj?.code && <div className={s.studentMeta}>{subj.code}</div>}
                        </td>
                        <td className={s.scoreCellRO}>{mid?.score ?? "—"}</td>
                        <td className={s.scoreCellRO}>{fin?.score ?? "—"}</td>
                        <td className={s.remarksRO}>{remarks || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
