import { useEffect, useState } from "react";
import API_BASE from "../../config";
import s from "./DirectoryPage.module.css";

/* ---------- Tabs ---------- */
const TABS = [
  { key: "students",       label: "Students" },
  { key: "parents",        label: "Parents" },
  { key: "parent-student", label: "Parent ↔ Student" },
  { key: "enrollments",    label: "Enrollments" },
];

/* ---------- External lookup endpoints (resolved on demand for ref fields) ---------- */
const LOOKUPS = {
  sections:    { endpoint: "/api/sections",     label: "name" },
  schoolYears: { endpoint: "/api/school-years", label: "label" },
  semesters:   { endpoint: "/api/semesters",    label: "label" },
};

/* ---------- Field schemas ---------- */
const SCHEMA = {
  students: {
    endpoint: "/api/students",
    columns: [
      ["studentNumber", "Student #"],
      ["lastName",      "Last name"],
      ["firstName",     "First name"],
      ["sex",           "Sex"],
      ["currentSectionId", "Current section"],
      ["status",        "Status"],
    ],
    fields: [
      { key: "studentNumber", label: "Student number", type: "text", required: true, placeholder: "S-2026-0001" },
      { key: "firstName",     label: "First name",     type: "text", required: true },
      { key: "middleName",    label: "Middle name",    type: "text" },
      { key: "lastName",      label: "Last name",      type: "text", required: true },
      { key: "birthdate",     label: "Birthdate",      type: "date" },
      { key: "sex",           label: "Sex",            type: "select",
        options: [["", "—"], ["Male", "Male"], ["Female", "Female"]] },
      { key: "contact",       label: "Contact",        type: "text" },
      { key: "address",       label: "Address",        type: "text" },
      { key: "currentSectionId", label: "Current section", type: "lookup", lookup: "sections" },
      { key: "status",        label: "Status",         type: "select",
        options: [["ENROLLED","Enrolled"], ["GRADUATED","Graduated"], ["INACTIVE","Inactive"]] },
    ],
    blank: { studentNumber: "", firstName: "", middleName: "", lastName: "", birthdate: "",
             sex: "", contact: "", address: "", currentSectionId: "", status: "ENROLLED" },
  },

  parents: {
    endpoint: "/api/parents",
    columns: [
      ["lastName",  "Last name"],
      ["firstName", "First name"],
      ["contact",   "Contact"],
      ["email",     "Email"],
      ["occupation","Occupation"],
    ],
    fields: [
      { key: "firstName",  label: "First name", type: "text", required: true },
      { key: "lastName",   label: "Last name",  type: "text", required: true },
      { key: "contact",    label: "Contact",    type: "text" },
      { key: "email",      label: "Email",      type: "text" },
      { key: "occupation", label: "Occupation", type: "text" },
      { key: "address",    label: "Address",    type: "text" },
    ],
    blank: { firstName: "", lastName: "", contact: "", email: "", occupation: "", address: "" },
  },

  "parent-student": {
    endpoint: "/api/parent-student",
    columns: [
      ["parentId",     "Parent"],
      ["studentId",    "Student"],
      ["relationship", "Relationship"],
      ["primary",      "Primary?"],
    ],
    fields: [
      { key: "parentId",     label: "Parent",  type: "selfLookup", lookup: "parents",
        labelFn: r => `${r.lastName}, ${r.firstName}`, required: true },
      { key: "studentId",    label: "Student", type: "selfLookup", lookup: "students",
        labelFn: r => `${r.lastName}, ${r.firstName} (${r.studentNumber})`, required: true },
      { key: "relationship", label: "Relationship", type: "select", required: true,
        options: [["Father","Father"], ["Mother","Mother"], ["Guardian","Guardian"], ["Other","Other"]] },
      { key: "primary",      label: "Primary contact", type: "checkbox" },
    ],
    blank: { parentId: "", studentId: "", relationship: "Father", primary: false },
  },

  enrollments: {
    endpoint: "/api/enrollments",
    columns: [
      ["studentId",    "Student"],
      ["schoolYearId", "School Year"],
      ["semesterId",   "Semester"],
      ["sectionId",    "Section"],
      ["status",       "Status"],
      ["enrolledAt",   "Enrolled at"],
    ],
    fields: [
      { key: "studentId",    label: "Student", type: "selfLookup", lookup: "students",
        labelFn: r => `${r.lastName}, ${r.firstName} (${r.studentNumber})`, required: true },
      { key: "schoolYearId", label: "School Year", type: "lookup", lookup: "schoolYears", required: true },
      { key: "semesterId",   label: "Semester",    type: "lookup", lookup: "semesters",   required: true },
      { key: "sectionId",    label: "Section",     type: "lookup", lookup: "sections",    required: true },
      { key: "status",       label: "Status",      type: "select",
        options: [["ENROLLED","Enrolled"], ["DROPPED","Dropped"], ["COMPLETED","Completed"]] },
    ],
    blank: { studentId: "", schoolYearId: "", semesterId: "", sectionId: "", status: "ENROLLED" },
  },
};

/* ---------- Page ---------- */
export default function DirectoryPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [data, setData]           = useState({});  // { tabKey: [rows] }
  const [lookups, setLookups]     = useState({});  // { lookupName: [rows] }
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(null);
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState(false);

  const schema = SCHEMA[activeTab];
  const rows   = data[activeTab] || [];

  useEffect(() => {
    loadTab(activeTab);
    // Pre-load any external lookup or selfLookup data referenced by this tab
    schema.fields.forEach(f => {
      if (f.type === "lookup")     loadLookup(f.lookup);
      if (f.type === "selfLookup") loadSelfLookup(f.lookup);
    });
    // For column rendering, load lookups for any column key that's a ref
    schema.columns.forEach(([k]) => {
      const field = schema.fields.find(ff => ff.key === k);
      if (field?.type === "lookup")     loadLookup(field.lookup);
      if (field?.type === "selfLookup") loadSelfLookup(field.lookup);
    });
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

  async function loadSelfLookup(tabKey) {
    if (data[tabKey]) return;
    try {
      const res = await fetch(`${API_BASE}${SCHEMA[tabKey].endpoint}`);
      if (!res.ok) throw new Error(`Load lookup ${tabKey} failed`);
      const list = await res.json();
      setData(prev => ({ ...prev, [tabKey]: list }));
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
      const url   = isNew ? `${API_BASE}${schema.endpoint}` : `${API_BASE}${schema.endpoint}/${editing.id}`;
      const payload = { ...form };
      schema.fields.forEach(f => {
        if (f.type === "lookup" || f.type === "selfLookup" || f.type === "number") {
          if (payload[f.key] === "" || payload[f.key] === undefined) payload[f.key] = null;
          else if (payload[f.key] !== null) payload[f.key] = Number(payload[f.key]);
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
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  function renderCell(row, key) {
    const v = row[key];
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "boolean") return v ? "✓" : "—";
    const field = schema.fields.find(f => f.key === key);
    if (field?.type === "lookup") {
      const list = lookups[field.lookup] || [];
      const ref = list.find(r => r.id === v);
      return ref ? ref[LOOKUPS[field.lookup].label] : `#${v}`;
    }
    if (field?.type === "selfLookup") {
      const list = data[field.lookup] || [];
      const ref = list.find(r => r.id === v);
      return ref ? field.labelFn(ref) : `#${v}`;
    }
    if (key === "enrolledAt") return new Date(v).toLocaleString();
    return String(v);
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>Admin · Directory</div>
          <h1 className={s.title}>People &amp; Enrollment</h1>
          <p className={s.sub}>Students, parents, parent–student links and per-semester enrollments.</p>
        </div>
      </div>

      <div className={s.tabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${s.tab} ${activeTab === t.key ? s.tabActive : ""}`}
            onClick={() => { setActiveTab(t.key); cancel(); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={s.card}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>{TABS.find(t => t.key === activeTab).label}</h2>
          {!editing && <button className={s.btnPrimary} onClick={startCreate}>+ New</button>}
        </div>

        {error && <div className={s.error}>{error}</div>}

        {editing ? (
          <form onSubmit={save} className={s.form}>
            {schema.fields.map(f => (
              <FormField
                key={f.key}
                field={f}
                value={form[f.key]}
                onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                lookupData={f.type === "lookup" ? lookups[f.lookup] : (f.type === "selfLookup" ? data[f.lookup] : null)}
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

/* ---------- Form field ---------- */
function FormField({ field, value, onChange, lookupData }) {
  if (field.type === "checkbox") {
    return (
      <label className={s.checkboxRow}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
        <span>{field.label}</span>
      </label>
    );
  }
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
          {list.map(r => <option key={r.id} value={r.id}>{r[labelKey] || `#${r.id}`}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === "selfLookup") {
    const list = lookupData || [];
    return (
      <div className={s.field}>
        <label className={s.label}>{field.label}{field.required && <span className={s.req}> *</span>}</label>
        <select className={s.input} value={value ?? ""} onChange={e => onChange(e.target.value)} required={field.required}>
          <option value="">— select —</option>
          {list.map(r => <option key={r.id} value={r.id}>{field.labelFn(r)}</option>)}
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
      />
    </div>
  );
}
