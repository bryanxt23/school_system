import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE from "../../config";
import s from "./Grades.module.css";

const PERIODS = ["MIDTERM", "FINAL"];

export default function TeacherGradeEncodingPage() {
  const { id } = useParams();
  const classOfferingId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const [offering, setOffering]   = useState(null);
  const [subject, setSubject]     = useState(null);
  const [section, setSection]     = useState(null);
  const [semester, setSemester]   = useState(null);
  const [students, setStudents]   = useState([]);
  // grades[studentId] = { MIDTERM: { score, remarks }, FINAL: { score, remarks } }
  const [grades, setGrades]       = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError("");
      try {
        const off = await fetch(`${API_BASE}/api/class-offerings`).then(r => r.json());
        const me = off.find(c => c.id === classOfferingId);
        if (!me) throw new Error("Class offering not found");

        const [subjects, sections, semesters, allStudents, existing] = await Promise.all([
          fetch(`${API_BASE}/api/subjects`).then(r => r.json()),
          fetch(`${API_BASE}/api/sections`).then(r => r.json()),
          fetch(`${API_BASE}/api/semesters`).then(r => r.json()),
          fetch(`${API_BASE}/api/students?sectionId=${me.sectionId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/grades?classOfferingId=${classOfferingId}`).then(r => r.json()),
        ]);
        if (cancelled) return;

        setOffering(me);
        setSubject(subjects.find(x => x.id === me.subjectId) || null);
        setSection(sections.find(x => x.id === me.sectionId) || null);
        setSemester(semesters.find(x => x.id === me.semesterId) || null);
        setStudents(allStudents);

        const g = {};
        existing.forEach(row => {
          if (!g[row.studentId]) g[row.studentId] = {};
          g[row.studentId][row.period] = {
            score: row.score == null ? "" : String(row.score),
            remarks: row.remarks || "",
          };
        });
        setGrades(g);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [classOfferingId]);

  function setCell(studentId, period, field, value) {
    setGrades(prev => {
      const row = { ...(prev[studentId] || {}) };
      row[period] = { ...(row[period] || { score: "", remarks: "" }), [field]: value };
      return { ...prev, [studentId]: row };
    });
  }

  async function saveAll() {
    setBusy(true); setError(""); setSavedAt(null);
    try {
      const entries = [];
      students.forEach(st => {
        PERIODS.forEach(p => {
          const cell = grades[st.id]?.[p];
          if (cell && (cell.score !== "" || (cell.remarks && cell.remarks.trim() !== ""))) {
            entries.push({
              studentId: st.id,
              period: p,
              score: cell.score === "" ? null : cell.score,
              remarks: cell.remarks || null,
            });
          } else if (cell) {
            // Both blank → tell server to delete
            entries.push({ studentId: st.id, period: p, score: null, remarks: null });
          }
        });
      });
      const res = await fetch(`${API_BASE}/api/grades/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classOfferingId, entries }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Save failed (${res.status})`);
      }
      const result = await res.json();
      setSavedAt(`Saved ${result.saved}, removed ${result.deleted}.`);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const heading = useMemo(() => {
    if (!offering) return "";
    const parts = [
      subject?.title || `Subject #${offering.subjectId}`,
      section?.name && `Section ${section.name}`,
      semester?.label && `${semester.label} Semester`,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [offering, subject, section, semester]);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <button className={s.backBtn} onClick={() => navigate("/dashboard")}>← Back</button>
        <div>
          <div className={s.eyebrow}>Teacher · Grade encoding</div>
          <h1 className={s.title}>{loading ? "Loading…" : heading || "Class"}</h1>
          {subject?.code && <p className={s.sub}>{subject.code}</p>}
        </div>
      </div>

      <div className={s.card}>
        {error && <div className={s.error}>{error}</div>}
        {savedAt && <div className={s.success}>{savedAt}</div>}

        {!loading && students.length === 0 && (
          <div className={s.empty}>
            No students are currently in this section. Enroll students via Directory → Enrollments
            (or set their <code>currentSectionId</code> directly).
          </div>
        )}

        {!loading && students.length > 0 && (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  {PERIODS.map(p => (
                    <th key={p} colSpan={2} className={s.colGroup}>
                      {p === "MIDTERM" ? "Midterm" : "Final"}
                    </th>
                  ))}
                </tr>
                <tr className={s.subHead}>
                  <th></th>
                  {PERIODS.flatMap(p => [
                    <th key={p + "-s"}>Score</th>,
                    <th key={p + "-r"}>Remarks</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {students.map(st => (
                  <tr key={st.id}>
                    <td>
                      <div className={s.studentName}>{st.lastName}, {st.firstName}</div>
                      <div className={s.studentMeta}>#{st.studentNumber}</div>
                    </td>
                    {PERIODS.flatMap(p => {
                      const cell = grades[st.id]?.[p] || { score: "", remarks: "" };
                      return [
                        <td key={`${st.id}-${p}-s`} className={s.scoreCell}>
                          <input
                            className={s.inputScore}
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="—"
                            value={cell.score}
                            onChange={e => setCell(st.id, p, "score", e.target.value)}
                          />
                        </td>,
                        <td key={`${st.id}-${p}-r`} className={s.remarksCell}>
                          <input
                            className={s.inputRemarks}
                            type="text"
                            placeholder=""
                            value={cell.remarks}
                            onChange={e => setCell(st.id, p, "remarks", e.target.value)}
                          />
                        </td>,
                      ];
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={s.actions}>
              <button className={s.btnPrimary} onClick={saveAll} disabled={busy}>
                {busy ? "Saving…" : "Save grades"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
