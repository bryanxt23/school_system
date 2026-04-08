import { useEffect, useMemo, useState } from "react";
import API_BASE from "../../config";
import s from "./AcademicsPage.module.css";

/* ---------- Tab definitions ---------- */
const TABS = [
  { key: "school-years", label: "School Years" },
  { key: "semesters",    label: "Semesters" },
  { key: "faculties",    label: "Faculties" },
  { key: "grade-levels", label: "Grade Levels" },
  { key: "sections",     label: "Sections" },
  { key: "subjects",     label: "Subjects" },
  { key: "sports",       label: "Sports" },
];

/* ---------- Field schemas ---------- */
// Each tab declares the columns it shows in the table AND the fields its
// create/edit form renders. Keeps the page driven by data instead of 7 copies.
const SCHEMA = {
  "school-years": {
    endpoint: "/api/school-years",
    columns:  [["label","Label"], ["startDate","Start"], ["endDate","End"], ["active","Active"]],
    fields:   [
      { key: "label",     label: "Label",      type: "text",     placeholder: "2026-2027", required: true },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "endDate",   label: "End date",   type: "date" },
      { key: "active",    label: "Set as active school year", type: "checkbox" },
    ],
    blank: { label: "", startDate: "", endDate: "", active: false },
  },
  "semesters": {
    endpoint: "/api/semesters",
    columns:  [["label","Label"], ["schoolYearId","School Year"], ["startDate","Start"], ["endDate","End"], ["active","Active"]],
    fields:   [
      { key: "label",        label: "Label",     type: "select",  required: true,
        options: [["1st","1st Semester"], ["2nd","2nd Semester"]] },
      { key: "schoolYearId", label: "School Year", type: "ref", refTab: "school-years", refLabel: "label", required: true },
      { key: "startDate",    label: "Start date", type: "date" },
      { key: "endDate",      label: "End date",   type: "date" },
      { key: "active",       label: "Set as active semester", type: "checkbox" },
    ],
    blank: { label: "1st", schoolYearId: "", startDate: "", endDate: "", active: false },
  },
  "faculties": {
    endpoint: "/api/faculties",
    columns:  [["name","Name"], ["headStaffId","Head Staff ID"]],
    fields:   [
      { key: "name",        label: "Name",          type: "text", required: true,
        placeholder: "Senior High School" },
      { key: "headStaffId", label: "Head staff ID", type: "number", placeholder: "(optional)" },
    ],
    blank: { name: "", headStaffId: "" },
  },
  "grade-levels": {
    endpoint: "/api/grade-levels",
    columns:  [["ordering","#"], ["name","Name"], ["facultyId","Faculty"]],
    fields:   [
      { key: "name",      label: "Name",     type: "text", required: true, placeholder: "Grade 7" },
      { key: "facultyId", label: "Faculty",  type: "ref", refTab: "faculties", refLabel: "name" },
      { key: "ordering",  label: "Sort order", type: "number", placeholder: "0" },
    ],
    blank: { name: "", facultyId: "", ordering: 0 },
  },
  "sections": {
    endpoint: "/api/sections",
    columns:  [["name","Name"], ["gradeLevelId","Grade Level"], ["schoolYearId","School Year"], ["adviserStaffId","Adviser ID"]],
    fields:   [
      { key: "name",           label: "Name", type: "text", required: true, placeholder: "St. Therese" },
      { key: "gradeLevelId",   label: "Grade Level", type: "ref", refTab: "grade-levels", refLabel: "name", required: true },
      { key: "schoolYearId",   label: "School Year", type: "ref", refTab: "school-years", refLabel: "label", required: true },
      { key: "adviserStaffId", label: "Adviser staff ID", type: "number", placeholder: "(set in Phase 2)" },
    ],
    blank: { name: "", gradeLevelId: "", schoolYearId: "", adviserStaffId: "" },
  },
  "subjects": {
    endpoint: "/api/subjects",
    columns:  [["code","Code"], ["title","Title"], ["units","Units"], ["gradeLevelId","Grade Level"], ["facultyId","Faculty"]],
    fields:   [
      { key: "code",         label: "Code",  type: "text", required: true, placeholder: "MATH7" },
      { key: "title",        label: "Title", type: "text", required: true, placeholder: "Mathematics 7" },
      { key: "units",        label: "Units", type: "number", placeholder: "1.0" },
      { key: "gradeLevelId", label: "Grade Level", type: "ref", refTab: "grade-levels", refLabel: "name" },
      { key: "facultyId",    label: "Faculty",     type: "ref", refTab: "faculties",    refLabel: "name" },
    ],
    blank: { code: "", title: "", units: "", gradeLevelId: "", facultyId: "" },
  },
  "sports": {
    endpoint: "/api/sports",
    columns:  [["name","Name"], ["season","Season"], ["coachStaffId","Coach Staff ID"]],
    fields:   [
      { key: "name",         label: "Name",   type: "text", required: true, placeholder: "Basketball" },
      { key: "season",       label: "Season", type: "text", placeholder: "Wet Season" },
      { key: "coachStaffId", label: "Coach staff ID", type: "number", placeholder: "(set in Phase 2)" },
    ],
    blank: { name: "", season: "", coachStaffId: "" },
  },
};

/* ---------- Page ---------- */
export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [data, setData]           = useState({}); // { tabKey: [rows] }
  const [editing, setEditing]     = useState(null); // current row being edited (or "new")
  const [form, setForm]           = useState(null);
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState(false);

  const schema = SCHEMA[activeTab];
  const rows   = data[activeTab] || [];

  /* Load rows for the active tab + any tabs referenced by ref-fields */
  useEffect(() => {
    const tabsToLoad = new Set([activeTab]);
    schema.fields.forEach(f => { if (f.type === "ref") tabsToLoad.add(f.refTab); });
    tabsToLoad.forEach(loadTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function loadTab(tabKey) {
    try {
      const res = await fetch(`${API_BASE}${SCHEMA[tabKey].endpoint}`);
      if (!res.ok) throw new Error(`Load ${tabKey} failed`);
      const list = await res.json();
      setData(prev => ({ ...prev, [tabKey]: list }));
    } catch (e) {
      setError(e.message);
    }
  }

  function startCreate() {
    setEditing("new");
    setForm({ ...schema.blank });
    setError("");
  }
  function startEdit(row) {
    setEditing(row);
    setForm({ ...schema.blank, ...row });
    setError("");
  }
  function cancel() {
    setEditing(null);
    setForm(null);
    setError("");
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const isNew = editing === "new";
      const url   = isNew ? `${API_BASE}${schema.endpoint}` : `${API_BASE}${schema.endpoint}/${editing.id}`;
      const payload = { ...form };
      // strip empty strings -> null for numeric/ref fields
      schema.fields.forEach(f => {
        if (f.type === "number" || f.type === "ref") {
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
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(row) {
    if (!window.confirm(`Delete "${rowDisplayName(row)}"?`)) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API_BASE}${schema.endpoint}/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await loadTab(activeTab);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function rowDisplayName(row) {
    return row.label || row.name || row.title || row.code || `#${row.id}`;
  }

  function renderCell(row, key) {
    const v = row[key];
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "boolean") return v ? "✓" : "—";
    // resolve ref id -> label
    const field = schema.fields.find(f => f.key === key);
    if (field && field.type === "ref") {
      const refList = data[field.refTab] || [];
      const ref = refList.find(r => r.id === v);
      return ref ? ref[field.refLabel] : `#${v}`;
    }
    return String(v);
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>Admin · Academics</div>
          <h1 className={s.title}>School Structure</h1>
          <p className={s.sub}>School years, semesters, faculties, grade levels, sections, subjects and sports.</p>
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
          {!editing && (
            <button className={s.btnPrimary} onClick={startCreate}>+ New</button>
          )}
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
                refData={data[f.refTab]}
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
function FormField({ field, value, onChange, refData }) {
  if (field.type === "checkbox") {
    return (
      <label className={s.checkboxRow}>
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
        />
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
  if (field.type === "ref") {
    const list = refData || [];
    return (
      <div className={s.field}>
        <label className={s.label}>{field.label}{field.required && <span className={s.req}> *</span>}</label>
        <select className={s.input} value={value ?? ""} onChange={e => onChange(e.target.value)} required={field.required}>
          <option value="">— select —</option>
          {list.map(r => <option key={r.id} value={r.id}>{r[field.refLabel] || `#${r.id}`}</option>)}
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
