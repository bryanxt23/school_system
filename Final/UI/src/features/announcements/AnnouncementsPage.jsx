import { useEffect, useState } from "react";
import API_BASE from "../../config";
import s from "./Announcements.module.css";

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  } catch { return null; }
}

const AUDIENCE_PRESETS = [
  ["ALL",      "Everyone"],
  ["STUDENTS", "All students"],
  ["PARENTS",  "All parents"],
  ["STAFF",    "All staff"],
  ["ROLE:Teacher",       "Teachers only"],
  ["ROLE:Janitor",       "Janitors only"],
  ["ROLE:SecurityGuard", "Security only"],
];

const blank = { title: "", body: "", audience: "ALL", expiresAt: "" };

function fmtDate(s) {
  if (!s) return "";
  return new Date(s).toLocaleString();
}

function audienceLabel(a, sectionsById, gradeLevelsById) {
  if (!a) return "—";
  if (a.startsWith("SECTION:")) {
    const id = Number(a.substring(8));
    return `Section · ${sectionsById[id]?.name || `#${id}`}`;
  }
  if (a.startsWith("GRADELEVEL:")) {
    const id = Number(a.substring(11));
    return `Grade level · ${gradeLevelsById[id]?.name || `#${id}`}`;
  }
  if (a.startsWith("ROLE:")) return a.substring(5) + " role";
  return AUDIENCE_PRESETS.find(([k]) => k === a)?.[1] || a;
}

export default function AnnouncementsPage() {
  const user = getUser();
  const role = user?.role;
  const canPost = role === "Admin" || role === "Teacher";

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(null);

  // Lookups for the audience picker (sections + grade levels)
  const [sections, setSections]       = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);

  const sectionsById    = Object.fromEntries(sections.map(r => [r.id, r]));
  const gradeLevelsById = Object.fromEntries(gradeLevels.map(r => [r.id, r]));

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [role]);
  useEffect(() => {
    if (!canPost) return;
    Promise.all([
      fetch(`${API_BASE}/api/sections`).then(r => r.json()),
      fetch(`${API_BASE}/api/grade-levels`).then(r => r.json()),
    ]).then(([se, gl]) => { setSections(se); setGradeLevels(gl); }).catch(() => {});
  }, [canPost]);

  async function load() {
    setLoading(true); setError("");
    try {
      const url = role === "Admin"
        ? `${API_BASE}/api/announcements`
        : `${API_BASE}/api/announcements?audience=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load");
      setItems(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function startCreate() { setEditing("new"); setForm({ ...blank }); setError(""); }
  function startEdit(row) {
    setEditing(row);
    setForm({
      title: row.title,
      body: row.body,
      audience: row.audience || "ALL",
      expiresAt: row.expiresAt ? row.expiresAt.substring(0, 16) : "",
    });
    setError("");
  }
  function cancel() { setEditing(null); setForm(null); setError(""); }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const isNew = editing === "new";
      const url = isNew
        ? `${API_BASE}/api/announcements`
        : `${API_BASE}/api/announcements/${editing.id}`;
      const payload = {
        ...form,
        expiresAt: form.expiresAt ? form.expiresAt + ":00" : null,
      };
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Save failed (${res.status})`);
      }
      await load();
      cancel();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function remove(row) {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/announcements/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const canManage = (row) =>
    role === "Admin" || (role === "Teacher" && row.postedByUsername === user?.username);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.eyebrow}>Announcements</div>
          <h1 className={s.title}>What's New</h1>
          <p className={s.sub}>
            {role === "Admin"
              ? "All school announcements. Post, edit and delete here."
              : canPost
                ? "Posts you've made and ones you're authorized to see."
                : "Announcements relevant to you."}
          </p>
        </div>
        {canPost && !editing && (
          <button className={s.btnPrimary} onClick={startCreate}>+ New post</button>
        )}
      </div>

      {error && <div className={s.error}>{error}</div>}

      {editing && (
        <div className={s.card}>
          <h2 className={s.cardTitle}>{editing === "new" ? "New announcement" : "Edit announcement"}</h2>
          <form onSubmit={save} className={s.form}>
            <div className={s.fieldFull}>
              <label className={s.label}>Title <span className={s.req}>*</span></label>
              <input
                className={s.input}
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
            <div className={s.fieldFull}>
              <label className={s.label}>Body <span className={s.req}>*</span></label>
              <textarea
                className={s.textarea}
                rows={5}
                value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                required
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>Audience</label>
              <select
                className={s.input}
                value={
                  form.audience.startsWith("SECTION:") || form.audience.startsWith("GRADELEVEL:")
                    ? form.audience
                    : form.audience
                }
                onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}>
                <optgroup label="Broad">
                  {AUDIENCE_PRESETS.map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
                </optgroup>
                <optgroup label="By section">
                  {sections.map(se => (
                    <option key={`s${se.id}`} value={`SECTION:${se.id}`}>Section · {se.name}</option>
                  ))}
                </optgroup>
                <optgroup label="By grade level">
                  {gradeLevels.map(g => (
                    <option key={`g${g.id}`} value={`GRADELEVEL:${g.id}`}>Grade · {g.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Expires at (optional)</label>
              <input
                className={s.input}
                type="datetime-local"
                value={form.expiresAt}
                onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
              />
            </div>
            <div className={s.formActions}>
              <button type="button" className={s.btnGhost} onClick={cancel}>Cancel</button>
              <button type="submit" className={s.btnPrimary} disabled={busy}>
                {busy ? "Saving…" : (editing === "new" ? "Post" : "Save changes")}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className={s.empty}>Loading…</div>}
      {!loading && items.length === 0 && <div className={s.empty}>No announcements right now.</div>}

      <div className={s.feed}>
        {items.map(a => (
          <article key={a.id} className={s.post}>
            <header className={s.postHead}>
              <div>
                <h3 className={s.postTitle}>{a.title}</h3>
                <div className={s.postMeta}>
                  <span className={s.audienceBadge}>{audienceLabel(a.audience, sectionsById, gradeLevelsById)}</span>
                  <span> · {fmtDate(a.postedAt)}</span>
                  {a.postedByUsername && <span> · by {a.postedByUsername}</span>}
                  {a.expiresAt && <span> · expires {fmtDate(a.expiresAt)}</span>}
                </div>
              </div>
              {canManage(a) && (
                <div>
                  <button className={s.btnGhost} onClick={() => startEdit(a)}>Edit</button>
                  <button className={s.btnDanger} onClick={() => remove(a)}>Delete</button>
                </div>
              )}
            </header>
            <div className={s.postBody}>{a.body}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
