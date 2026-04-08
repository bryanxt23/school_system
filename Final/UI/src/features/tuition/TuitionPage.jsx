import { useEffect, useMemo, useState } from "react";
import API_BASE from "../../config";
import s from "./Tuition.module.css";

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  } catch { return null; }
}

function useStudentTuition(studentId) {
  const [state, setState] = useState({
    loading: false, error: "",
    invoices: [], paymentsByInvoice: {},
    semesters: {}, schoolYears: {},
  });

  useEffect(() => {
    if (!studentId) {
      setState({ loading: false, error: "", invoices: [], paymentsByInvoice: {}, semesters: {}, schoolYears: {} });
      return;
    }
    let cancelled = false;
    setState(p => ({ ...p, loading: true, error: "" }));
    (async () => {
      try {
        const invoices = await fetch(`${API_BASE}/api/tuition-invoices?studentId=${studentId}`).then(r => r.json());
        const [semesters, schoolYears, ...paymentLists] = await Promise.all([
          fetch(`${API_BASE}/api/semesters`).then(r => r.json()),
          fetch(`${API_BASE}/api/school-years`).then(r => r.json()),
          ...invoices.map(inv => fetch(`${API_BASE}/api/tuition-payments?invoiceId=${inv.id}`).then(r => r.json())),
        ]);
        if (cancelled) return;
        const paymentsByInvoice = {};
        invoices.forEach((inv, i) => { paymentsByInvoice[inv.id] = paymentLists[i] || []; });
        setState({
          loading: false, error: "", invoices, paymentsByInvoice,
          semesters: Object.fromEntries(semesters.map(r => [r.id, r])),
          schoolYears: Object.fromEntries(schoolYears.map(r => [r.id, r])),
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

export default function TuitionPage() {
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

  const { loading, error, invoices, paymentsByInvoice, semesters, schoolYears } = useStudentTuition(studentId);

  const totals = useMemo(() => {
    let billed = 0, paid = 0;
    invoices.forEach(inv => {
      billed += Number(inv.amount || 0);
      (paymentsByInvoice[inv.id] || []).forEach(p => { paid += Number(p.amount || 0); });
    });
    return { billed, paid, balance: billed - paid };
  }, [invoices, paymentsByInvoice]);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>{role === "Parent" ? "Parent" : "Student"} · Tuition</div>
          <h1 className={s.title}>Tuition &amp; Payments</h1>
          <p className={s.sub}>
            {role === "Parent"
              ? "Outstanding balances and payment history for your linked children."
              : "Your invoices and payment history."}
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

      {studentId && (
        <div className={s.summaryRow}>
          <div className={s.summaryCard}>
            <div className={s.summaryLabel}>Total billed</div>
            <div className={s.summaryValue}>{fmt(totals.billed)}</div>
          </div>
          <div className={s.summaryCard}>
            <div className={s.summaryLabel}>Total paid</div>
            <div className={s.summaryValue}>{fmt(totals.paid)}</div>
          </div>
          <div className={`${s.summaryCard} ${totals.balance > 0 ? s.summaryDue : s.summaryClear}`}>
            <div className={s.summaryLabel}>Outstanding</div>
            <div className={s.summaryValue}>{fmt(totals.balance)}</div>
          </div>
        </div>
      )}

      <div className={s.card}>
        {!studentId && role !== "Parent" && (
          <div className={s.empty}>Your account isn't linked to a Student record yet.</div>
        )}

        {studentId && loading && <div className={s.empty}>Loading…</div>}
        {studentId && error && <div className={s.error}>{error}</div>}
        {studentId && !loading && !error && invoices.length === 0 && (
          <div className={s.empty}>No invoices on record yet.</div>
        )}

        {invoices.map(inv => {
          const sem = semesters[inv.semesterId];
          const sy  = schoolYears[inv.schoolYearId];
          const payments = paymentsByInvoice[inv.id] || [];
          const paidSum = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
          return (
            <div key={inv.id} className={s.invoiceCard}>
              <div className={s.invoiceHead}>
                <div>
                  <div className={s.invoiceTitle}>
                    {sem?.label || `Sem #${inv.semesterId}`} Semester · {sy?.label || ""}
                  </div>
                  <div className={s.invoiceMeta}>
                    Due {inv.dueDate || "—"}
                  </div>
                </div>
                <div className={s.invoiceTotals}>
                  <span className={`${s.statusBadge} ${s["status_" + inv.status]}`}>{inv.status}</span>
                  <div className={s.invoiceAmount}>
                    <span className={s.invoiceAmountPaid}>{fmt(paidSum)}</span>
                    <span className={s.invoiceAmountSep}> / </span>
                    <span>{fmt(inv.amount)}</span>
                  </div>
                </div>
              </div>

              {payments.length > 0 && (
                <table className={s.paymentTable}>
                  <thead>
                    <tr>
                      <th>Paid at</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th className={s.amountCol}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                        <td>{p.method || "—"}</td>
                        <td>{p.referenceNo || "—"}</td>
                        <td className={s.amountCol}>{fmt(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
