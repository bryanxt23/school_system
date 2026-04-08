import { useEffect, useMemo, useState } from "react";
import API_BASE from "../../config";
import s from "./Books.module.css";

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  } catch { return null; }
}

/** For one student: figure out their subjects (via current section + active SY)
 *  → load required books for those subjects → load student's purchases. */
function useStudentBooks(studentId) {
  const [state, setState] = useState({
    loading: false, error: "",
    requiredRows: [], booksById: {}, subjectsById: {},
    purchasesByBook: {}, schoolYear: null,
  });

  useEffect(() => {
    if (!studentId) {
      setState({ loading: false, error: "", requiredRows: [], booksById: {},
                 subjectsById: {}, purchasesByBook: {}, schoolYear: null });
      return;
    }
    let cancelled = false;
    setState(p => ({ ...p, loading: true, error: "" }));
    (async () => {
      try {
        const student = await fetch(`${API_BASE}/api/students/${studentId}`).then(r => r.json());
        if (!student?.currentSectionId) {
          if (!cancelled) setState({
            loading: false, error: "", requiredRows: [], booksById: {},
            subjectsById: {}, purchasesByBook: {}, schoolYear: null,
          });
          return;
        }

        // Find the active school year
        const schoolYears = await fetch(`${API_BASE}/api/school-years`).then(r => r.json());
        const activeSY = schoolYears.find(y => y.active) || schoolYears[0];
        if (!activeSY) {
          if (!cancelled) setState({
            loading: false, error: "", requiredRows: [], booksById: {},
            subjectsById: {}, purchasesByBook: {}, schoolYear: null,
          });
          return;
        }

        // Class offerings for that section in any semester
        const offerings = await fetch(`${API_BASE}/api/class-offerings?sectionId=${student.currentSectionId}`).then(r => r.json());
        const subjectIds = Array.from(new Set(offerings.map(o => o.subjectId)));

        if (subjectIds.length === 0) {
          // Fall back to all subjects (still load purchases)
          const [purchases, books, subjects] = await Promise.all([
            fetch(`${API_BASE}/api/student-book-purchases?studentId=${studentId}`).then(r => r.json()),
            fetch(`${API_BASE}/api/books`).then(r => r.json()),
            fetch(`${API_BASE}/api/subjects`).then(r => r.json()),
          ]);
          if (cancelled) return;
          setState({
            loading: false, error: "",
            requiredRows: [],
            booksById: Object.fromEntries(books.map(b => [b.id, b])),
            subjectsById: Object.fromEntries(subjects.map(x => [x.id, x])),
            purchasesByBook: Object.fromEntries(purchases.map(p => [p.bookId, p])),
            schoolYear: activeSY,
          });
          return;
        }

        const requiredRows = await fetch(
          `${API_BASE}/api/required-books?subjectIds=${subjectIds.join(",")}&schoolYearId=${activeSY.id}`
        ).then(r => r.json());

        const [books, subjects, purchases] = await Promise.all([
          fetch(`${API_BASE}/api/books`).then(r => r.json()),
          fetch(`${API_BASE}/api/subjects`).then(r => r.json()),
          fetch(`${API_BASE}/api/student-book-purchases?studentId=${studentId}`).then(r => r.json()),
        ]);
        if (cancelled) return;

        setState({
          loading: false, error: "",
          requiredRows,
          booksById: Object.fromEntries(books.map(b => [b.id, b])),
          subjectsById: Object.fromEntries(subjects.map(x => [x.id, x])),
          purchasesByBook: Object.fromEntries(purchases.map(p => [p.bookId, p])),
          schoolYear: activeSY,
        });
      } catch (e) {
        if (!cancelled) setState(p => ({ ...p, loading: false, error: e.message }));
      }
    })();
    return () => { cancelled = true; };
  }, [studentId]);

  return state;
}

function useParentChildren(parentId) {
  const [children, setChildren] = useState([]);
  useEffect(() => {
    if (!parentId) return;
    let cancelled = false;
    (async () => {
      try {
        const links = await fetch(`${API_BASE}/api/parent-student?parentId=${parentId}`).then(r => r.json());
        const kids = await Promise.all(
          links.map(l => fetch(`${API_BASE}/api/students/${l.studentId}`).then(r => r.json()))
        );
        if (!cancelled) setChildren(kids);
      } catch {
        if (!cancelled) setChildren([]);
      }
    })();
    return () => { cancelled = true; };
  }, [parentId]);
  return children;
}

function fmt(n) {
  if (n === null || n === undefined || n === "") return "—";
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BooksPage() {
  const user = getUser();
  const role = user?.role;

  const children = useParentChildren(role === "Parent" ? user?.linkedEntity?.id : null);
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

  const { loading, error, requiredRows, booksById, subjectsById, purchasesByBook, schoolYear } = useStudentBooks(studentId);

  // Split into "to buy" and "purchased"
  const { toBuy, purchased } = useMemo(() => {
    const toBuy = [];
    const purchased = [];
    requiredRows.forEach(r => {
      const book = booksById[r.bookId];
      const subject = subjectsById[r.subjectId];
      if (!book) return;
      const entry = { ...r, book, subject };
      if (purchasesByBook[r.bookId]) {
        purchased.push({ ...entry, purchase: purchasesByBook[r.bookId] });
      } else {
        toBuy.push(entry);
      }
    });
    return { toBuy, purchased };
  }, [requiredRows, booksById, subjectsById, purchasesByBook]);

  const totalToBuy = toBuy.reduce((acc, r) => acc + Number(r.book.price || 0), 0);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>{role === "Parent" ? "Parent" : "Student"} · Books</div>
          <h1 className={s.title}>Required Books</h1>
          <p className={s.sub}>
            {role === "Parent"
              ? "Books required for your linked children, split by purchased vs not yet bought."
              : "Books required for your enrolled subjects, split by purchased vs not yet bought."}
            {schoolYear && ` · ${schoolYear.label}`}
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

      <div className={s.bookGrid}>
        {/* Not yet bought */}
        <div className={s.bookCol}>
          <div className={s.bookColHead}>
            <div className={s.bookColTitle}>To Buy</div>
            <div className={s.bookColCount}>{toBuy.length} · {fmt(totalToBuy)}</div>
          </div>

          {studentId && loading && <div className={s.empty}>Loading…</div>}
          {studentId && error && <div className={s.error}>{error}</div>}
          {studentId && !loading && !error && toBuy.length === 0 && (
            <div className={s.empty}>All required books purchased. 🎉</div>
          )}

          <div className={s.list}>
            {toBuy.map(r => (
              <div key={r.id} className={s.bookRow}>
                <div className={s.bookMain}>
                  <div className={s.bookTitle}>{r.book.title}</div>
                  <div className={s.bookMeta}>
                    {r.book.author && <span>{r.book.author}</span>}
                    {r.subject?.code && <span> · {r.subject.code}</span>}
                    {!r.mandatory && <span className={s.optionalTag}> · Optional</span>}
                  </div>
                </div>
                <div className={s.bookPrice}>{fmt(r.book.price)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Already purchased */}
        <div className={s.bookCol}>
          <div className={s.bookColHead}>
            <div className={s.bookColTitle}>Purchased</div>
            <div className={s.bookColCount}>{purchased.length}</div>
          </div>

          {studentId && !loading && !error && purchased.length === 0 && (
            <div className={s.empty}>No purchases recorded yet.</div>
          )}

          <div className={s.list}>
            {purchased.map(r => (
              <div key={r.id} className={`${s.bookRow} ${s.bookRowDone}`}>
                <div className={s.bookMain}>
                  <div className={s.bookTitle}>{r.book.title}</div>
                  <div className={s.bookMeta}>
                    {r.book.author && <span>{r.book.author}</span>}
                    {r.subject?.code && <span> · {r.subject.code}</span>}
                  </div>
                </div>
                <div className={s.bookPrice}>{fmt(r.purchase.amount || r.book.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
