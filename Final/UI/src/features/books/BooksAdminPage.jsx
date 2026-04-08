import { useEffect, useState } from "react";
import API_BASE from "../../config";
import s from "./Books.module.css";

const TABS = [
  { key: "books",                   label: "Book Master" },
  { key: "required-books",          label: "Required Books" },
  { key: "student-book-purchases",  label: "Purchases" },
];

const LOOKUPS = {
  subjects:    { endpoint: "/api/subjects",     label: "title" },
  schoolYears: { endpoint: "/api/school-years", label: "label" },
  books:       { endpoint: "/api/books",        label: "title" },
  students:    { endpoint: "/api/students",     label: null },
};

const SCHEMA = {
  books: {
    endpoint: "/api/books",
    columns: [
      ["title",  "Title"],
      ["author", "Author"],
      ["isbn",   "ISBN"],
      ["price",  "Price"],
    ],
    fields: [
      { key: "title",    label: "Title", type: "text", required: true },
      { key: "author",   label: "Author", type: "text" },
      { key: "isbn",     label: "ISBN", type: "text" },
      { key: "price",    label: "Price", type: "number", placeholder: "350.00" },
      { key: "coverUrl", label: "Cover URL", type: "text", placeholder: "(optional)" },
    ],
    blank: { title: "", author: "", isbn: "", price: "", coverUrl: "" },
  },

  "required-books": {
    endpoint: "/api/required-books",
    columns: [
      ["subjectId",    "Subject"],
      ["bookId",       "Book"],
      ["schoolYearId", "School Year"],
      ["mandatory",    "Mandatory"],
    ],
    fields: [
      { key: "subjectId",    label: "Subject",    type: "lookup", lookup: "subjects",    required: true },
      { key: "bookId",       label: "Book",       type: "lookup", lookup: "books",       required: true },
      { key: "schoolYearId", label: "School Year", type: "lookup", lookup: "schoolYears", required: true },
      { key: "mandatory",    label: "Required (uncheck for optional)", type: "checkbox" },
    ],
    blank: { subjectId: "", bookId: "", schoolYearId: "", mandatory: true },
  },

  "student-book-purchases": {
    endpoint: "/api/student-book-purchases",
    columns: [
      ["studentId",   "Student"],
      ["bookId",      "Book"],
      ["amount",      "Amount"],
      ["purchasedAt", "Purchased at"],
    ],
    fields: [
      { key: "studentId", label: "Student", type: "lookupStudent", lookup: "students", required: true },
      { key: "bookId",    label: "Book",    type: "lookup", lookup: "books",        required: true },
      { key: "amount",    label: "Amount",  type: "number", placeholder: "350.00" },
    ],
    blank: { studentId: "", bookId: "", amount: "" },
  },
};

export default function BooksAdminPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [data, setData]       = useState({});
  const [lookups, setLookups] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(null);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);

  const schema = SCHEMA[activeTab];
  const rows   = data[activeTab] || [];

  useEffect(() => {
    loadTab(activeTab);
    schema.fields.forEach(f => { if (f.lookup) loadLookup(f.lookup); });
    schema.columns.forEach(([k]) => {
      const f = schema.fields.find(ff => ff.key === k);
      if (f?.lookup) loadLookup(f.lookup);
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
        if (f.type === "lookup" || f.type === "lookupStudent" || f.type === "number") {
          if (payload[f.key] === "" || payload[f.key] === undefined) payload[f.key] = null;
          else if (payload[f.key] !== null && f.type !== "number") payload[f.key] = Number(payload[f.key]);
        }
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

  function studentLabel(st) {
    if (!st) return "—";
    return `${st.lastName}, ${st.firstName} (${st.studentNumber})`;
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
    if (field?.type === "lookupStudent") {
      const list = lookups.students || [];
      return studentLabel(list.find(r => r.id === v));
    }
    if (key === "purchasedAt") return new Date(v).toLocaleString();
    return String(v);
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>Admin · Books</div>
          <h1 className={s.title}>Book Library</h1>
          <p className={s.sub}>Master book list, required books per subject, and student purchase records.</p>
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
                lookupData={f.lookup ? lookups[f.lookup] : null}
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

function FormField({ field, value, onChange, lookupData }) {
  if (field.type === "checkbox") {
    return (
      <label className={s.checkboxRow}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
        <span>{field.label}</span>
      </label>
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
