import { useEffect, useState } from "react";
import API_BASE from "../../config";
import s from "./Facilities.module.css";

const TABS = [
  { key: "areas",                 label: "Areas" },
  { key: "cleaning-schedules",    label: "Schedules" },
  { key: "janitor-tasks",         label: "Tasks" },
  { key: "maintenance-requests",  label: "Maintenance" },
];

const LOOKUPS = {
  areas:    { endpoint: "/api/areas", label: "name" },
  janitors: { endpoint: "/api/employees?all=true", label: "name", filter: r => r.staffType === "JANITOR" },
};

const SCHEMA = {
  areas: {
    endpoint: "/api/areas",
    columns: [
      ["name",     "Name"],
      ["building", "Building"],
      ["floor",    "Floor"],
      ["assignedJanitorStaffId", "Janitor"],
    ],
    fields: [
      { key: "name",     label: "Name", type: "text", required: true, placeholder: "Library" },
      { key: "building", label: "Building", type: "text", placeholder: "Main" },
      { key: "floor",    label: "Floor", type: "text", placeholder: "2F" },
      { key: "assignedJanitorStaffId", label: "Assigned janitor", type: "extLookup", source: "janitors" },
    ],
    blank: { name: "", building: "", floor: "", assignedJanitorStaffId: "" },
  },

  "cleaning-schedules": {
    endpoint: "/api/cleaning-schedules",
    columns: [
      ["areaId",    "Area"],
      ["dayOfWeek", "Day"],
      ["timeSlot",  "Time"],
      ["frequency", "Frequency"],
    ],
    fields: [
      { key: "areaId",    label: "Area", type: "lookup", lookup: "areas", required: true },
      { key: "dayOfWeek", label: "Day", type: "select", required: true,
        options: [["MONDAY","Monday"],["TUESDAY","Tuesday"],["WEDNESDAY","Wednesday"],
                  ["THURSDAY","Thursday"],["FRIDAY","Friday"],["SATURDAY","Saturday"],
                  ["SUNDAY","Sunday"],["DAILY","Daily"]] },
      { key: "timeSlot",  label: "Time slot", type: "text", placeholder: "08:00-09:00" },
      { key: "frequency", label: "Frequency", type: "select",
        options: [["WEEKLY","Weekly"],["DAILY","Daily"],["BIWEEKLY","Bi-weekly"],["MONTHLY","Monthly"]] },
    ],
    blank: { areaId: "", dayOfWeek: "MONDAY", timeSlot: "", frequency: "WEEKLY" },
  },

  "janitor-tasks": {
    endpoint: "/api/janitor-tasks",
    columns: [
      ["areaId",         "Area"],
      ["janitorStaffId", "Janitor"],
      ["dueDate",        "Due"],
      ["status",         "Status"],
      ["notes",          "Notes"],
    ],
    fields: [
      { key: "areaId",         label: "Area", type: "lookup", lookup: "areas", required: true },
      { key: "janitorStaffId", label: "Janitor", type: "extLookup", source: "janitors" },
      { key: "dueDate",        label: "Due date", type: "date" },
      { key: "status",         label: "Status", type: "select",
        options: [["PENDING","Pending"],["DONE","Done"]] },
      { key: "notes",          label: "Notes", type: "text" },
    ],
    blank: { areaId: "", janitorStaffId: "", dueDate: "", status: "PENDING", notes: "" },
  },

  "maintenance-requests": {
    endpoint: "/api/maintenance-requests",
    columns: [
      ["areaId",                  "Area"],
      ["description",             "Description"],
      ["assignedJanitorStaffId",  "Assigned"],
      ["status",                  "Status"],
      ["requestedByUsername",     "Requested by"],
      ["createdAt",               "Created"],
    ],
    fields: [
      { key: "areaId",                 label: "Area", type: "lookup", lookup: "areas", required: true },
      { key: "description",            label: "Description", type: "text", required: true },
      { key: "assignedJanitorStaffId", label: "Assign to janitor", type: "extLookup", source: "janitors" },
      { key: "status",                 label: "Status", type: "select",
        options: [["OPEN","Open"],["IN_PROGRESS","In progress"],["RESOLVED","Resolved"]] },
    ],
    blank: { areaId: "", description: "", assignedJanitorStaffId: "", status: "OPEN" },
  },
};

export default function FacilitiesAdminPage() {
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
    schema.fields.forEach(f => {
      if (f.type === "lookup") loadLookup(f.lookup);
      if (f.type === "extLookup") loadExtLookup(f.source);
    });
    schema.columns.forEach(([k]) => {
      const f = schema.fields.find(ff => ff.key === k);
      if (f?.type === "lookup") loadLookup(f.lookup);
      if (f?.type === "extLookup") loadExtLookup(f.source);
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

  async function loadExtLookup(source) {
    if (lookups[source]) return;
    try {
      const def = LOOKUPS[source];
      const res = await fetch(`${API_BASE}${def.endpoint}`);
      if (!res.ok) throw new Error(`Load ${source} failed`);
      let list = await res.json();
      if (def.filter) list = list.filter(def.filter);
      setLookups(prev => ({ ...prev, [source]: list }));
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
        if (f.type === "lookup" || f.type === "extLookup" || f.type === "number") {
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
    if (field?.type === "extLookup") {
      const list = lookups[field.source] || [];
      const ref = list.find(r => r.id === v);
      return ref ? ref[LOOKUPS[field.source].label] : `#${v}`;
    }
    if (key === "status") {
      return <span className={`${s.statusBadge} ${s["status_" + v]}`}>{v.replace("_"," ")}</span>;
    }
    if (key === "createdAt" || key === "completedAt") return new Date(v).toLocaleString();
    return String(v);
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>Admin · Facilities</div>
          <h1 className={s.title}>Areas, Tasks &amp; Maintenance</h1>
          <p className={s.sub}>Define cleaning areas, schedules, janitor tasks, and triage maintenance requests.</p>
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
                lookupData={f.lookup ? lookups[f.lookup] : (f.source ? lookups[f.source] : null)}
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
  if (field.type === "lookup" || field.type === "extLookup") {
    const list = lookupData || [];
    const labelKey = LOOKUPS[field.lookup || field.source].label;
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
