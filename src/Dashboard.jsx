import React, { useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = [
  "personal-growth",
  "mental-health",
  "relationships",
  "identity-self-discovery",
  "arts-culture-creativity"
];

const OWNER_NAME = "Cherry Coco";

function emptyForm() {
  return {
    title: "",
    author: OWNER_NAME,
    category: "personal-growth",
    region: "",
    readingTimeMinutes: 5,
    image: "",
    summary: "",
    body: "",
    published: false
  };
}

function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadMinutes(text) {
  return Math.max(1, Math.round(wordCount(text) / 200));
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "";
  }
}

/**
 * Cherry Coco's Writer Studio — a full-page authoring dashboard.
 * She is the primary writer here: the editor defaults to her name and
 * her published pieces surface first across the site.
 */
export default function Dashboard({
  stories = [],
  onSave,
  onUpdate,
  onDelete,
  onClose,
  onRead,
  brandName = OWNER_NAME
}) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const titleRef = useRef(null);

  const stats = useMemo(() => {
    const published = stories.filter((s) => s.publishedAt);
    const drafts = stories.filter((s) => !s.publishedAt);
    const minutes = stories.reduce((sum, s) => sum + (Number(s.readingTimeMinutes) || 0), 0);
    const byOwner = stories.filter((s) => (s.author || OWNER_NAME) === OWNER_NAME).length;
    return {
      total: stories.length,
      published: published.length,
      drafts: drafts.length,
      minutes,
      byOwner
    };
  }, [stories]);

  const visibleStories = useMemo(() => {
    const sorted = [...stories].sort((a, b) => {
      const at = a.publishedAt ? new Date(a.publishedAt).getTime() : Infinity;
      const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : Infinity;
      return bt - at;
    });
    if (filter === "published") return sorted.filter((s) => s.publishedAt);
    if (filter === "drafts") return sorted.filter((s) => !s.publishedAt);
    return sorted;
  }, [stories, filter]);

  // lock body scroll while the studio is open
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  // close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape" && onClose) onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId("");
    setStatus("");
  }

  function startEdit(story) {
    setEditingId(story.id);
    setForm({
      title: story.title || "",
      author: story.author || OWNER_NAME,
      category: story.category || "personal-growth",
      region: story.region || "",
      readingTimeMinutes: story.readingTimeMinutes || 5,
      image: story.image || "",
      summary: story.summary || "",
      body: story.body || "",
      published: Boolean(story.publishedAt)
    });
    setStatus("");
    if (titleRef.current) titleRef.current.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e, publishNow) {
    if (e) e.preventDefault();
    if (!form.title.trim()) {
      setStatus("Give your story a title first.");
      if (titleRef.current) titleRef.current.focus();
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      const payload = {
        ...form,
        author: form.author.trim() || OWNER_NAME,
        published: publishNow,
        id: editingId || undefined
      };
      await onSave(payload);
      setStatus(publishNow ? "Published ✦" : "Saved to drafts ✦");
      resetForm();
    } catch (err) {
      console.error("Failed to save story", err);
      setStatus("Something went wrong saving. Your draft is safe — try again.");
    } finally {
      setSaving(false);
    }
  }

  const words = wordCount(form.body);
  const suggestedMinutes = estimateReadMinutes(form.body);

  return (
    <div className="studio" role="dialog" aria-modal="true" aria-label="Writer Studio">
      <header className="studio-bar">
        <div className="studio-bar-left">
          <p className="studio-brand">{brandName}</p>
          <span className="studio-tag">Writer Studio</span>
        </div>
        <button type="button" className="btn-ghost studio-close" onClick={onClose}>
          Back to site
        </button>
      </header>

      <div className="studio-body">
        <section className="studio-hero">
          <p className="eyebrow">Your desk</p>
          <h1 className="studio-title">Welcome back, {OWNER_NAME.split(" ")[0]}.</h1>
          <p className="studio-lede">
            This is your studio — write first, publish when it's ready. Every story you publish
            leads the page before anybody else's.
          </p>
        </section>

        <div className="studio-stats">
          <div className="stat-tile">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Stories</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{stats.published}</span>
            <span className="stat-label">Published</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{stats.drafts}</span>
            <span className="stat-label">Drafts</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{stats.minutes}</span>
            <span className="stat-label">Reading min</span>
          </div>
        </div>

        <div className="studio-grid">
          {/* ---- Composer ---- */}
          <section className="studio-composer">
            <div className="composer-head">
              <h2>{editingId ? "Edit story" : "Write a new story"}</h2>
              {editingId && (
                <button type="button" className="tertiary" onClick={resetForm}>
                  + New story
                </button>
              )}
            </div>

            <form className="composer-form" onSubmit={(e) => submit(e, form.published)}>
              <label className="field">
                <span className="field-label">Title</span>
                <input
                  ref={titleRef}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="The Language I Found After Burnout"
                  autoComplete="off"
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span className="field-label">Author</span>
                  <input name="author" value={form.author} onChange={handleChange} />
                </label>
                <label className="field">
                  <span className="field-label">Region</span>
                  <input
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    placeholder="Kuala Lumpur"
                  />
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span className="field-label">Category</span>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/-/g, " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Reading time (min)</span>
                  <input
                    name="readingTimeMinutes"
                    type="number"
                    min="1"
                    value={form.readingTimeMinutes}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label className="field">
                <span className="field-label">
                  Cover image URL <span className="field-hint">optional</span>
                </span>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://…"
                />
              </label>

              <label className="field">
                <span className="field-label">Summary</span>
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  rows={2}
                  placeholder="One or two lines that pull the reader in."
                />
              </label>

              <label className="field">
                <span className="field-label">
                  Body
                  <span className="field-hint">
                    {words} words · ~{suggestedMinutes} min read
                  </span>
                </span>
                <textarea
                  name="body"
                  className="composer-body"
                  value={form.body}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Begin from wherever you are…"
                />
              </label>

              {status && <p className="composer-status">{status}</p>}

              <div className="composer-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={saving}
                  onClick={(e) => submit(e, false)}
                >
                  {saving ? "Saving…" : "Save draft"}
                </button>
                <button
                  type="button"
                  className="btn-accent"
                  disabled={saving}
                  onClick={(e) => submit(e, true)}
                >
                  {editingId ? "Update & publish" : "Publish"}
                </button>
              </div>
            </form>
          </section>

          {/* ---- Library ---- */}
          <section className="studio-library">
            <div className="library-head">
              <h2>Your library</h2>
              <div className="library-filters" role="tablist" aria-label="Filter stories">
                {[
                  ["all", `All ${stats.total}`],
                  ["published", `Published ${stats.published}`],
                  ["drafts", `Drafts ${stats.drafts}`]
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={filter === key}
                    className={`filter-chip ${filter === key ? "is-active" : ""}`}
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="library-list">
              {visibleStories.length === 0 && (
                <p className="shelf-empty">
                  {filter === "all"
                    ? "No stories yet. Your first one starts on the left."
                    : `No ${filter} stories yet.`}
                </p>
              )}

              {visibleStories.map((s) => (
                <article key={s.id} className="library-item">
                  <div className="library-item-main">
                    <span
                      className={`status-badge ${s.publishedAt ? "is-live" : "is-draft"}`}
                    >
                      {s.publishedAt ? "Published" : "Draft"}
                    </span>
                    <h3 className="library-item-title">{s.title || "Untitled"}</h3>
                    {s.summary && <p className="library-item-summary">{s.summary}</p>}
                    <p className="library-item-meta">
                      {s.author || OWNER_NAME}
                      <span aria-hidden="true"> · </span>
                      {s.readingTimeMinutes || 5} min
                      {s.publishedAt && (
                        <>
                          <span aria-hidden="true"> · </span>
                          {formatDate(s.publishedAt)}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="library-item-actions">
                    <button type="button" className="tertiary" onClick={() => startEdit(s)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="tertiary"
                      onClick={() =>
                        onUpdate(s.id, {
                          publishedAt: s.publishedAt ? null : new Date().toISOString()
                        })
                      }
                    >
                      {s.publishedAt ? "Unpublish" : "Publish"}
                    </button>
                    {s.publishedAt && onRead && (
                      <button type="button" className="tertiary" onClick={() => onRead(s)}>
                        View
                      </button>
                    )}
                    <button
                      type="button"
                      className="tertiary danger"
                      onClick={() => {
                        if (window.confirm(`Delete "${s.title || "Untitled"}"? This can't be undone.`)) {
                          onDelete(s.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
