import { useEffect, useState } from "react";
import API_BASE from "../../config";
import s from "./Tuition.module.css";

const TABS = [
  { key: "fee-structures",   label: "Fee Structures" },
  { key: "tuition-invoices", label: "Invoices" },
  { key: "tuition-payments", label: "Payments" },
];

const LOOKUPS = {
  schoolYears: { endpoint: "/api/school-years", label: "label" },
  semesters:   { endpoint: "/api/semesters",    label: "label" },
  gradeLevels: { endpoint: "/api/grade-levels", label: "name" },
  students:    { endpoint: "/api/students",     label: null },
  invoices:    { endpoint: "/api/tuition-invoices", label: null },
  feeStructures: { endpoint: "/api/fee-structures", label: null },
};

const SCHEMA = {
  "fee-structures": {
    endpoint: "/api/fee-structures",
    columns: [
      ["gradeLevelId", "Grade Level"],
      ["schoolYearId", "School Year"],
      ["totalAmount",  "Total"],
      ["breakdown",    "Breakdown"],
    ],
    fields: [
      { key: "gradeLevelId", label: "Grade Level", type: "lookup", lookup: "gradeLevels", required: true },
      { key: "schoolYearId", label: "School Year", type: "lookup", lookup: "schoolYears", required: true },
      { key: "totalAmount",  label: "Total amount", type: "number", required: true, placeholder: "25000.00" },
      { key: "breakdown",    label: "Breakdown (free text)", type: "text", placeholder: "Tuition 20000 + Misc 5000" },
    ],
    blank: { gradeLevelId: "", schoolYearId: "", totalAmount: "", breakdown: "" },
  },

  "tuition-invoices": {
    endpoint: "/api/tuition-invoices",
    columns: [
      ["studentId",    "Student"],
      ["schoolYearId", "School Year"],
      ["semesterId",   "Semester"],
      ["amount",       "Amount"],
      ["dueDate",      "Due"],
      ["status",       "Status"],
    ],
    fields: [
      { key: "studentId",    label: "Student", type: "lookupStudent", lookup: "students", required: true },
      { key: "schoolYearId", label: "School Year", type: "lookup", lookup: "schoolYears", required: true },
      { key: "semesterId",   label: "Semester", type: "lookup", lookup: "semesters", required: true },
      { key: "amount",       label: "Amount", type: "number", required: true },
      { key: "dueDate",      label: "Due date", type: "date" },
      { key: "status",       label: "Status", type: "select",
        options: [["UNPAID","Unpaid"], ["PARTIAL","Partial"], ["PAID","Paid"]] },
    ],
    blank: { studentId: "", schoolYearId: "", semesterId: "", amount: "", dueDate: "", status: "UNPAID" },
  },

  "tuition-payments": {
    endpoint: "/api/tuition-payments",
    columns: [
      ["invoiceId",   "Invoice"],
      ["amount",      "Amount"],
      ["method",      "Method"],
      ["referenceNo", "Ref #"],
      ["paidAt",      "Paid at"],
    ],
    fields: [
      { key: "invoiceId",   label: "Invoice", type: "lookupInvoice", lookup: "invoices", required: true },
      { key: "amount",      label: "Amount", type: "number", required: true, placeholder: "5000.00" },
      { key: "method",      label: "Method", type: "select",
        options: [["CASH","Cash"], ["BANK","Bank transfer"], ["GCASH","GCash"], ["CARD","Card"], ["OTHER","Other"]] },
      { key: "referenceNo", label: "Reference #", type: "text" },
    ],
    blank: { invoiceId: "", amount: "", method: "CASH", referenceNo: "" },
  },
};

export default function TuitionAdminPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [data, setData]           = useState({});  // tabKey -> rows
  const [lookups, setLookups]     = useState({});  // lookupName -> rows
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(null);
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState(false);

  // Generate-invoices modal state
  const [genOpen, setGenOpen]     = useState(false);
  const [genFeeId, setGenFeeId]   = useState("");
  const [genSemId, setGenSemId]   = useState("");
  const [genDue, setGenDue]       = useState("");
  const [genResult, setGenResult] = useState(null);

  const schema = SCHEMA[activeTab];
  const rows   = data[activeTab] || [];

  useEffect(() => {
    loadTab(activeTab);
    schema.fields.forEach(f => { if (f.lookup) loadLookup(f.lookup); });
    schema.columns.forEach(([k]) => {
      const f = schema.fields.find(ff => ff.key === k);
      if (f?.lookup) loadLookup(f.lookup);
    });
    // Always pre-load lookups needed by the generate modal when on Invoices tab
    if (activeTab === "tuition-invoices") {
      loadLookup("feeStructures");
      loadLookup("semesters");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function loadTab(tabKey) {
    try {
      const res = await fetch(`${API_BASE}${SCHEMA[tabKey].endpoint}`);
      if (!res.ok) throw new Error(`Load ${tabKey} failed`);
      const list = await res.json();
      setData(prev => ({ ...prev, [tabKey]: list }));
    } catch (e) { setError(e.message); }
  }

  async function loadLookup(name) {
    if (lookups[name]) return;
    try {
      const res = await fetch(`${API_BASE}${LOOKUPS[name].endpoint}`);
      if (!res.ok) throw new Error(`Load lookup ${name} failed`);
      const list = await res.json();
      setLookups(prev => ({ ...prev, [name]: list }));
    } catch (e) { setError(e.message); }
  }

  function startCreate() { setEditing("new"); setForm({ ...schema.blank }); setError(""); }
  function startEdit(row) { setEditing(row); setForm({ ...schema.blank, ...row }); setError(""); }
  function cancel() { setEditing(null); setForm(null); setError(""); }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const isNew = editing === "new";
      const url = isNew ? `${API_BASE}${schema.endpoint}` : `${API_BASE}${schema.endpoint}/${editing.id}`;
      const payload = { ...form };
      schema.fields.forEach(f => {
        if (f.type === "number" || f.type === "lookup" || f.type === "lookupStudent" || f.type === "lookupInvoice") {
          if (payload[f.key] === "" || payload[f.key] === undefined) payload[f.key] = null;
          else if (payload[f.key] !== null && f.type !== "number") payload[f.key] = Number(payload[f.key]);
        }
        if (f.type === "date" && payload[f.key] === "") payload[f.key] = null;
      });
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Save failed (${res.status})`);
      }
      await loadTab(activeTab);
      // Payment save might have updated an invoice's status — refresh invoices too
      if (activeTab === "tuition-payments") await loadTab("tuition-invoices");
      cancel();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function remove(row) {
    if (!window.confirm("Delete this record?")) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API_BASE}${schema.endpoint}/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await loadTab(activeTab);
      if (activeTab === "tuition-payments") await loadTab("tuition-invoices");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function runGenerate() {
    setError(""); setGenResult(null); setBusy(true);
    try {
      if (!genFeeId || !genSemId) throw new Error("Pick a fee structure and semester");
      const res = await fetch(`${API_BASE}/api/tuition-invoices/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeStructureId: Number(genFeeId),
          semesterId: Number(genSemId),
          dueDate: genDue || null,
        }),
      });
      if (!res.ok) throw new Error((await res.text()) || `Generate failed (${res.status})`);
      const result = await res.json();
      setGenResult(`Created ${result.created}, skipped ${result.skipped} existing.`);
      await loadTab("tuition-invoices");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  function studentLabel(st) {
    if (!st) return "—";
    return `${st.lastName}, ${st.firstName} (${st.studentNumber})`;
  }

  function invoiceLabel(inv) {
    if (!inv) return "—";
    const st = (lookups.students || []).find(s => s.id === inv.studentId);
    const sem = (lookups.semesters || []).find(s => s.id === inv.semesterId);
    return `${studentLabel(st)} · ${sem?.label || ""} · ${inv.amount}`;
  }

  function renderCell(row, key) {
    const v = row[key];
    if (v === null || v === undefined || v === "") return "—";
    const field = schema.fields.find(f => f.key === key);
    if (field?.type === "lookup") {
      const list = lookups[field.lookup] || [];
      const ref = list.find(r => r.id === v);
      return ref ? ref[LOOKUPS[field.lookup].label] : `#${v}`;
    }
    if (field?.type === "lookupStudent") {
      const list = lookups.students || [];
      return studentLabel(list.find(r => r.id === v));
    }
    if (field?.type === "lookupInvoice") {
      const list = lookups.invoices || [];
      return invoiceLabel(list.find(r => r.id === v));
    }
    if (key === "status") {
      return <span className={`${s.statusBadge} ${s["status_" + v]}`}>{v}</span>;
    }
    if (key === "paidAt" || key === "createdAt") return new Date(v).toLocaleString();
    return String(v);
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>Admin · Tuition</div>
          <h1 className={s.title}>Fees, Invoices &amp; Payments</h1>
          <p className={s.sub}>Define fee structures per grade level, generate invoices for a semester, and record payments.</p>
        </div>
      </div>

      <div className={s.tabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${s.tab} ${activeTab === t.key ? s.tabActive : ""}`}
            onClick={() => { setActiveTab(t.key); cancel(); setGenOpen(false); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={s.card}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>{TABS.find(t => t.key === activeTab).label}</h2>
          <div className={s.headActions}>
            {activeTab === "tuition-invoices" && !editing && (
              <button className={s.btnGhost} onClick={() => { setGenOpen(o => !o); setGenResult(null); }}>
                {genOpen ? "Close" : "+ Generate for semester"}
              </button>
            )}
            {!editing && <button className={s.btnPrimary} onClick={startCreate}>+ New</button>}
          </div>
        </div>

        {error && <div className={s.error}>{error}</div>}

        {activeTab === "tuition-invoices" && genOpen && (
          <div className={s.genBox}>
            <div className={s.genGrid}>
              <div className={s.field}>
                <label className={s.label}>Fee structure *</label>
                <select className={s.input} value={genFeeId} onChange={e => setGenFeeId(e.target.value)}>
                  <option value="">— select —</option>
                  {(lookups.feeStructures || []).map(fs => {
                    const gl = (lookups.gradeLevels || []).find(g => g.id === fs.gradeLevelId);
                    const sy = (lookups.schoolYears || []).find(y => y.id === fs.schoolYearId);
                    return (
                      <option key={fs.id} value={fs.id}>
                        {gl?.name || `Grade #${fs.gradeLevelId}`} · {sy?.label || ""} · {fs.totalAmount}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Semester *</label>
                <select className={s.input} value={genSemId} onChange={e => setGenSemId(e.target.value)}>
                  <option value="">— select —</option>
                  {(lookups.semesters || []).map(sm => (
                    <option key={sm.id} value={sm.id}>{sm.label}</option>
                  ))}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Due date</label>
                <input className={s.input} type="date" value={genDue} onChange={e => setGenDue(e.target.value)} />
              </div>
            </div>
            <div className={s.formActions}>
              {genResult && <div className={s.success}>{genResult}</div>}
              <button className={s.btnPrimary} onClick={runGenerate} disabled={busy}>
                {busy ? "Generating…" : "Generate invoices"}
              </button>
            </div>
          </div>
        )}

        {editing ? (
          <form onSubmit={save} className={s.form}>
            {schema.fields.map(f => (
              <FormField
                key={f.key}
                field={f}
                value={form[f.key]}
                onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                lookupData={f.lookup ? lookups[f.lookup] : null}
                lookups={lookups}
              />
            ))}
            <div className={s.formActions}>
              <button type="button" className={s.btnGhost} onClick={cancel}>Cancel</button>
              <button type="submit" className={s.btnPrimary} disabled={busy}>
                {busy ? "Saving..." : (editing === "new" ? "Create" : "Save changes")}
              </button>
            </div>
          </form>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  {schema.columns.map(([k, label]) => <th key={k}>{label}</th>)}
                  <th className={s.actionsCol}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={schema.columns.length + 1} className={s.emptyRow}>No records yet.</td></tr>
                ) : rows.map(row => (
                  <tr key={row.id}>
                    {schema.columns.map(([k]) => <td key={k}>{renderCell(row, k)}</td>)}
                    <td className={s.actionsCol}>
                      <button className={s.btnGhost} onClick={() => startEdit(row)}>Edit</button>
                      <button className={s.btnDanger} onClick={() => remove(row)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ field, value, onChange, lookupData, lookups }) {
  if (field.type === "select") {
    return (
      <div className={s.field}>
        <label className={s.label}>{field.label}{field.required && <span className={s.req}> *</span>}</label>
        <select className={s.input} value={value ?? ""} onChange={e => onChange(e.target.value)} required={field.required}>
          {field.options.map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === "lookup") {
    const list = lookupData || [];
    const labelKey = LOOKUPS[field.lookup].label;
    return (
      <div className={s.field}>
        <label className={s.label}>{field.label}{field.required && <span className={s.req}> *</span>}</label>
        <select className={s.input} value={value ?? ""} onChange={e => onChange(e.target.value)} required={field.required}>
          <option value="">— select —</option>
          {list.map(r => <option key={r.id} value={r.id}>{r[labelKey]}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === "lookupStudent") {
    const list = lookupData || [];
    return (
      <div className={s.field}>
        <label className={s.label}>{field.label}{field.required && <span className={s.req}> *</span>}</label>
        <select className={s.input} value={value ?? ""} onChange={e => onChange(e.target.value)} required={field.required}>
          <option value="">— select —</option>
          {list.map(r => <option key={r.id} value={r.id}>{r.lastName}, {r.firstName} ({r.studentNumber})</option>)}
        </select>
      </div>
    );
  }
  if (field.type === "lookupInvoice") {
    const list = lookupData || [];
    const semList = lookups.semesters || [];
    const stuList = lookups.students || [];
    return (
      <div className={s.field}>
        <label className={s.label}>{field.label}{field.required && <span className={s.req}> *</span>}</label>
        <select className={s.input} value={value ?? ""} onChange={e => onChange(e.target.value)} required={field.required}>
          <option value="">— select —</option>
          {list.map(inv => {
            const st = stuList.find(x => x.id === inv.studentId);
            const sm = semList.find(x => x.id === inv.semesterId);
            return (
              <option key={inv.id} value={inv.id}>
                {st ? `${st.lastName}, ${st.firstName}` : `Student #${inv.studentId}`} · {sm?.label || ""} · {inv.amount} ({inv.status})
              </option>
            );
          })}
        </select>
      </div>
    );
  }
  return (
    <div className={s.field}>
      <label className={s.label}>{field.label}{field.required && <span className={s.req}> *</span>}</label>
      <input
        className={s.input}
        type={field.type}
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        onChange={e => onChange(e.target.value)}
        required={field.required}
        step={field.type === "number" ? "0.01" : undefined}
      />
    </div>
  );
}
