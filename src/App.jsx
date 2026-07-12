import { useEffect, useMemo, useState } from "react";
import content from "../content-schema.json";
import About from "./About";
import Homepage from "./Homepage";
import StoryCard from "./StoryCard";
import Article from "./Article";

const STORAGE_KEYS = {
  profile: "cherrycoco.profile.v1",
  savedLines: "cherrycoco.savedLines.v1",
  fragments: "cherrycoco.fragments.v1"
};

// persisted authored stories (owner-written)
STORAGE_KEYS.stories = "cherrycoco.stories.v1";

const intentCopy = {
  clarity: "A clearer path, fewer tabs in your mind, and stories that help you name what matters.",
  stuck: "Small emotional movement over pressure. You can begin from wherever you are.",
  seen: "Voices that mirror your interior world, so you remember you are not singular in this feeling.",
  create: "Creative recovery, gentle structure, and prompts that turn emotion into expression."
};

const toneCopy = {
  gentle: "Tone set to gentle: soft pacing, spacious language, and low emotional noise.",
  grounded: "Tone set to grounded: practical reflection with emotional honesty.",
  poetic: "Tone set to poetic: lyrical framing with quiet depth.",
  direct: "Tone set to direct: clear language and focused insight."
};

const voiceDescriptions = {
  identity: "A personal story about identity, belonging, and inherited expectations.",
  relationships: "An intimate account of relationships, silence, and emotional repair.",
  creativity: "An artist's reflection on making meaning under pressure.",
  "mental-health": "A reflective story centered on emotional health and recovery."
};

function parseLocalStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

  function EditorModal({ isOpen, onClose, onSave, stories = [], onUpdate, onDelete }) {
    const empty = {
      title: "",
      author: "",
      category: "personal-growth",
      region: "",
      readingTimeMinutes: 5,
      summary: "",
      body: "",
      published: false
    };

    const [form, setForm] = useState(empty);
    const [editingId, setEditingId] = useState("");

    useEffect(() => {
      if (!isOpen) {
        setForm(empty);
        setEditingId("");
      }
    }, [isOpen]);

    function startEdit(story) {
      setEditingId(story.id);
      setForm({ ...story, published: Boolean(story.publishedAt) });
    }

    function handleChange(e) {
      const { name, value, type, checked } = e.target;
      setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }

    async function handleSave(e) {
      e.preventDefault();
      if (!form.title.trim()) return;
      // onSave may perform remote publish and return an updated entry
      try {
        const result = await onSave({ ...form, id: editingId || undefined });
        // if the save returned an updated story (from server), use its values to reset
        if (result && typeof result === "object") {
          setForm(empty);
          setEditingId("");
        } else {
          setForm(empty);
          setEditingId("");
        }
      } catch (err) {
        // swallow — keep form open so owner can retry
        console.error("Failed to save story", err);
      }
    }

    if (!isOpen) return null;

    return (
      <aside className="onboarding-modal is-open" role="dialog" aria-modal="true">
        <div className="onboarding-panel">
          <p className="eyebrow">Author Editor</p>
          <h2>Write and publish a story</h2>

          <form onSubmit={handleSave}>
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} />

            <label>Author</label>
            <input name="author" value={form.author} onChange={handleChange} />

            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} />

            <label>Region</label>
            <input name="region" value={form.region} onChange={handleChange} />

            <label>Reading time (minutes)</label>
            <input name="readingTimeMinutes" type="number" value={form.readingTimeMinutes} onChange={handleChange} />

            <label>Summary</label>
            <input name="summary" value={form.summary} onChange={handleChange} />

            <label>Body</label>
            <textarea name="body" value={form.body} onChange={handleChange} rows={6} />

            <label className="intent-option checkbox-option">
              <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
              <span>Publish now</span>
            </label>

            <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
              <button type="submit" className="primary">Save</button>
              <button type="button" className="tertiary" onClick={() => { setForm(empty); setEditingId(""); onClose(); }}>Close</button>
            </div>
          </form>

          <hr style={{ margin: "1rem 0" }} />

          <h3>Existing stories</h3>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {stories.length === 0 && <p className="shelf-empty">No authored stories yet.</p>}
            {stories.map((s) => (
              <div key={s.id} style={{ border: "1px solid rgba(0,0,0,0.06)", padding: "0.6rem", borderRadius: 8 }}>
                <strong>{s.title}</strong>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button type="button" className="secondary" onClick={() => startEdit(s)}>Edit</button>
                  <button type="button" className="tertiary" onClick={() => onUpdate(s.id, { publishedAt: s.publishedAt ? null : new Date().toISOString() })}>
                    {s.publishedAt ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" className="tertiary danger" onClick={() => onDelete(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

function createEntry(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text
  };
}

function OnboardingModal({ isOpen, onClose, onComplete, initialProfile, brandName }) {
  const [step, setStep] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(Boolean(initialProfile?.privacyAccepted));
  const [tone, setTone] = useState(initialProfile?.tone || "gentle");
  const [intent, setIntent] = useState(initialProfile?.intent || "clarity");

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setPrivacyAccepted(Boolean(initialProfile?.privacyAccepted));
      setTone(initialProfile?.tone || "gentle");
      setIntent(initialProfile?.intent || "clarity");
    }
  }, [isOpen, initialProfile]);

  if (!isOpen) {
    return null;
  }

  function handleNext() {
    setStep((current) => Math.min(current + 1, 2));
  }

  function handleBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleFinish() {
    onComplete({
      privacyAccepted,
      tone,
      intent,
      completedAt: new Date().toISOString()
    });
  }

  return (
    <aside className="onboarding-modal is-open" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle">
      <div className="onboarding-panel">
  <p className="eyebrow">Welcome to {brandName || content.brand.name}</p>
        <h2 id="onboardingTitle">Set your reading atmosphere</h2>
        <p className="onboarding-progress">Step {step + 1} of 3</p>

        {step === 0 && (
          <section className="onboarding-step">
            <h3>Privacy, first</h3>
            <p>
              We only store your reading intention and reflection notes in your browser to personalize pace and tone.
              We do not use infinite-feed mechanics, and we do not sell your emotional data.
            </p>
            <label className="intent-option checkbox-option">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
              />
              <span>I understand and want a calm, intentional experience.</span>
            </label>
          </section>
        )}

        {step === 1 && (
          <section className="onboarding-step">
            <h3>Choose the tone you want today</h3>
            <div className="intent-grid single-column">
              {Object.entries(toneCopy).map(([key, description]) => (
                <label key={key} className="intent-option">
                  <input
                    type="radio"
                    name="tone"
                    value={key}
                    checked={tone === key}
                    onChange={(event) => setTone(event.target.value)}
                  />
                  <span>
                    <strong>{key[0].toUpperCase() + key.slice(1)}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="onboarding-step">
            <h3>What do you need from this moment?</h3>
            <div className="intent-grid">
              {content.homepage.pathways.map((path) => (
                <label key={path.id} className="intent-option">
                  <input
                    type="radio"
                    name="intent"
                    value={path.id}
                    checked={intent === path.id}
                    onChange={(event) => setIntent(event.target.value)}
                  />
                  <span>{path.label}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        <div className="onboarding-controls">
          {step > 0 ? (
            <button type="button" className="tertiary" onClick={handleBack}>
              Back
            </button>
          ) : (
            <button type="button" className="tertiary" onClick={onClose}>
              Skip for now
            </button>
          )}

          {step < 2 && (
            <button type="button" className="primary" onClick={handleNext} disabled={step === 0 && !privacyAccepted}>
              Continue
            </button>
          )}

          {step === 2 && (
            <button type="button" className="primary" onClick={handleFinish}>
              Enter landing page
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function EditableList({
  title,
  label,
  placeholder,
  entries,
  emptyText,
  onAdd,
  onUpdate,
  onDelete
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingText, setEditingText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) {
      return;
    }
    onAdd(value);
    setDraft("");
  }

  function startEditing(entry) {
    setEditingId(entry.id);
    setEditingText(entry.text);
  }

  function saveEdit() {
    const value = editingText.trim();
    if (!value) {
      return;
    }
    onUpdate(editingId, value);
    setEditingId("");
    setEditingText("");
  }

  function cancelEdit() {
    setEditingId("");
    setEditingText("");
  }

  return (
    <article>
      <h3>{title}</h3>
      <form className="shelf-form" onSubmit={handleSubmit}>
        <label>{label}</label>
        <div className="input-row">
          <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={180} placeholder={placeholder} />
          <button type="submit" className="secondary">
            Save
          </button>
        </div>
      </form>
      <div className="shelf-list" aria-live="polite">
        {entries.length === 0 && <p className="shelf-empty">{emptyText}</p>}
        {entries.map((entry) => (
          <div key={entry.id} className="editable-item">
            {editingId === entry.id ? (
              <div className="editable-row">
                <input
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  maxLength={180}
                />
                <button type="button" className="secondary" onClick={saveEdit}>
                  Save
                </button>
                <button type="button" className="tertiary" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <p className="shelf-entry">"{entry.text}"</p>
                <div className="entry-controls">
                  <button type="button" className="tertiary" onClick={() => startEditing(entry)}>
                    Edit
                  </button>
                  <button type="button" className="tertiary danger" onClick={() => onDelete(entry.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

export default function App() {
  const [remoteContent, setRemoteContent] = useState(null);
  useEffect(() => {
    let mounted = true;
    fetch("/api/homepage")
      .then((r) => r.json())
      .then((json) => {
        if (mounted) setRemoteContent(json);
      })
      .catch(() => {
        // ignore — fallback to local content
      });
    return () => (mounted = false);
  }, []);

  const contentData = remoteContent || content;
  const [profile, setProfile] = useState(() => parseLocalStorage(STORAGE_KEYS.profile, null));
  const [showOnboarding, setShowOnboarding] = useState(() => !parseLocalStorage(STORAGE_KEYS.profile, null));
  const [savedLines, setSavedLines] = useState(() => parseLocalStorage(STORAGE_KEYS.savedLines, []));
  const [fragments, setFragments] = useState(() => parseLocalStorage(STORAGE_KEYS.fragments, []));
  const [savedStories, setSavedStories] = useState(() => parseLocalStorage(STORAGE_KEYS.stories, []));
  const [slowReading, setSlowReading] = useState(false);
  const [isOwner] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("admin") === "1");
  const [showEditor, setShowEditor] = useState(false);

  const schema = contentData.homepage;
  const dayIndex = new Date().getDate() % schema.hero.dailyLines.length;
  const dailyLine = schema.hero.dailyLines[dayIndex];

  // Featured story: prefer owner-published story (most recent) then fall back to schema.featuredStory
  const featuredAuthorStory = savedStories.find((s) => s.publishedAt) || null;
  const featured = featuredAuthorStory
    ? {
        id: featuredAuthorStory.id,
        title: featuredAuthorStory.title,
        author: featuredAuthorStory.author,
        readingTimeMinutes: featuredAuthorStory.readingTimeMinutes,
        summary: featuredAuthorStory.summary,
        body: featuredAuthorStory.body,
        publishedAt: featuredAuthorStory.publishedAt,
        isAuthor: true
      }
    : { ...schema.featuredStory, isAuthor: false };

  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showArticleView, setShowArticleView] = useState(false);

  const personalizedPathways = useMemo(() => {
    if (!profile?.intent) {
      return schema.pathways;
    }
    const matching = schema.pathways.find((path) => path.id === profile.intent);
    const rest = schema.pathways.filter((path) => path.id !== profile.intent);
    return matching ? [matching, ...rest] : schema.pathways;
  }, [profile, schema.pathways]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.savedLines, JSON.stringify(savedLines));
  }, [savedLines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fragments, JSON.stringify(fragments));
  }, [fragments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(savedStories));
  }, [savedStories]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", showOnboarding);
    return () => document.body.classList.remove("modal-open");
  }, [showOnboarding]);

  function saveProfile(nextProfile) {
    setProfile(nextProfile);
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(nextProfile));
    setShowOnboarding(false);
  }

  function addSavedLine(text) {
    setSavedLines((current) => [createEntry(text), ...current].slice(0, 8));
  }

  function addFragment(text) {
    setFragments((current) => [createEntry(text), ...current].slice(0, 8));
  }

  async function addStory(payload) {
    // create local entry first
    const localEntry = {
      id: payload.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: payload.title,
      author: payload.author || "Owner",
      category: payload.category || "personal-growth",
      region: payload.region || "",
      readingTimeMinutes: Number(payload.readingTimeMinutes) || 5,
      summary: payload.summary || "",
      body: payload.body || "",
      publishedAt: payload.published ? new Date().toISOString() : null,
      wpId: payload.wpId || null
    };

    // optimistic local save
    setSavedStories((current) => [localEntry, ...current]);
    setShowEditor(false);

    // attempt server publish if requested
    if (payload.published) {
      try {
        const resp = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: payload.title, body: payload.body, summary: payload.summary, status: "publish", publishedAt: localEntry.publishedAt })
        });
        if (resp.ok) {
          const json = await resp.json();
          // update local entry with wpId and canonical publishedAt
          setSavedStories((current) => current.map((s) => (s.id === localEntry.id ? { ...s, wpId: json.wpId, publishedAt: json.publishedAt } : s)));
          return { ...localEntry, wpId: json.wpId, publishedAt: json.publishedAt };
        } else {
          // leave local draft but return error body
          const err = await resp.json().catch(() => ({}));
          console.warn("Publish failed", err);
          return localEntry;
        }
      } catch (err) {
        console.warn("Publish request failed", err);
        return localEntry;
      }
    }

    return localEntry;
  }

  function updateStory(id, update) {
    setSavedStories((current) => current.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }

  function removeStory(id) {
    setSavedStories((current) => current.filter((s) => s.id !== id));
  }

  function updateById(setter, id, text) {
    setter((current) => current.map((entry) => (entry.id === id ? { ...entry, text } : entry)));
  }

  function removeById(setter, id) {
    setter((current) => current.filter((entry) => entry.id !== id));
  }

  // helper to find story by id across local authored stories and CMS stories
  function findStoryById(id) {
    if (!id) return null;
    const allCms = (contentData.cms && contentData.cms.stories) || [];
    const fromCms = allCms.find((s) => String(s.id) === String(id));
    if (fromCms) return fromCms;
    const fromSaved = savedStories.find((s) => String(s.id) === String(id));
    if (fromSaved) return fromSaved;
    // fallback: featured story (no id) or schema featured
    if (featured && String(featured.id) === String(id)) return featured;
    return null;
  }

  // navigate to an article view and update hash for deep-linking
  function navigateToArticle(story) {
    if (!story) return;
    setSelectedStory(story);
    setShowArticleView(true);
    try {
      const id = story.id || encodeURIComponent(story.title);
      window.location.hash = `story/${id}`;
    } catch (e) {
      // ignore
    }
  }

  // listen to hash changes so deep links work
  useEffect(() => {
    function handleHash() {
      const hash = (window.location.hash || "").replace(/^#/, "");
      if (!hash) {
        setShowArticleView(false);
        setSelectedStory(null);
        return;
      }
      const match = hash.match(/^story\/(.+)/);
      if (match) {
        const id = decodeURIComponent(match[1]);
        const found = findStoryById(id);
        if (found) {
          setSelectedStory(found);
          setShowArticleView(true);
        }
      }
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [contentData, savedStories, featured]);

  return (
    <>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={saveProfile}
        initialProfile={profile}
        brandName={contentData.brand?.name}
      />
      <EditorModal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={addStory}
        stories={savedStories}
        onUpdate={updateStory}
        onDelete={removeStory}
      />

      <header className="site-header">
        <p className="brand">{contentData.brand?.name || content.brand.name}</p>
        <nav className="main-nav" aria-label="Primary">
          <a href="#featured">Featured</a>
          <a href="#voices">Voices</a>
          <a href="#about">Our story</a>
          <a href="#shelf">Reflection Shelf</a>
        </nav>
        <div className="header-actions">
          {isOwner && (
            <button className="btn-ghost" onClick={() => setShowEditor(true)}>Open Editor</button>
          )}
          <a className="header-write" href="#shelf">Write</a>
          <button className="btn-dark" onClick={() => setShowEditor(true)}>Get started</button>
        </div>
      </header>

      <main className={slowReading ? "slow-reading" : ""}>
        <Homepage
          contentData={contentData}
          savedStories={savedStories}
          onRead={(story) => { navigateToArticle(story); }}
          onSave={(text) => addSavedLine(text)}
          onOpenEditor={() => setShowEditor(true)}
        />

        <section id="voices" className="voices reveal">
          <div className="section-head">
            <h2>Voices From Different Worlds</h2>
            <p>Cross-cultural storytelling grounded in lived emotional detail.</p>
          </div>
          <div className="voice-grid">
            {schema.globalVoices.map((voice) => (
              <article className="voice-card" key={voice.title}>
                <p className="eyebrow">{voice.region}</p>
                <h3>{voice.title}</h3>
                <p>{voiceDescriptions[voice.theme] || "A reflective story from a distinct cultural perspective."}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="shelf" className="shelf reveal">
          <div className="section-head">
            <h2>Your Reflection Shelf</h2>
            <p>Private fragments saved in this browser only.</p>
          </div>
          <div className="shelf-grid">
            <EditableList
              title="Saved Lines"
              label="Capture a sentence that stayed with you"
              placeholder="Write a line worth returning to..."
              entries={savedLines}
              emptyText="No saved lines yet. Capture a line from your reading."
              onAdd={addSavedLine}
              onUpdate={(id, text) => updateById(setSavedLines, id, text)}
              onDelete={(id) => removeById(setSavedLines, id)}
            />
            <EditableList
              title="Thought Fragments"
              label="Leave a private thought fragment"
              placeholder="What feels true for you right now?"
              entries={fragments}
              emptyText="No thought fragments yet. Add one honest sentence."
              onAdd={addFragment}
              onUpdate={(id, text) => updateById(setFragments, id, text)}
              onDelete={(id) => removeById(setFragments, id)}
            />
            <article>
              <h3>Community Pulse</h3>
              <ul>
                <li>Most shared feeling this week: identity fatigue</li>
                <li>Most saved theme: sibling tenderness</li>
                <li>Most resonant phrase: permission to begin again</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="closing reveal">
          <h2>Before You Go</h2>
          <p className="grounding">{schema.closingRitual.question}</p>
          <p className="prompt">Creative prompt: {schema.closingRitual.prompt}</p>
          <button className="secondary" onClick={() => setShowOnboarding(true)}>
            Revisit your intention
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p className="footer-brand">{contentData.brand?.name || content.brand.name}</p>
          <nav className="footer-nav" aria-label="Footer">
            <a href="#about">Our story</a>
            <a href="#featured">Featured</a>
            <a href="#voices">Voices</a>
            <a href="#shelf">Write</a>
          </nav>
        </div>
        <p className="footer-mission">{contentData.brand?.mission || content.brand.mission}</p>
      </footer>
      <About />
      {showStoryModal && selectedStory && (
        <aside className="onboarding-modal is-open" role="dialog" aria-modal="true">
          <div className="onboarding-panel">
            <p className="eyebrow">{selectedStory.isAuthor ? "Author Story" : "Featured"}</p>
            <h2>{selectedStory.title}</h2>
            {selectedStory.author && <p className="meta">by {selectedStory.author}</p>}
            {selectedStory.publishedAt && <p className="meta">Published: {new Date(selectedStory.publishedAt).toLocaleDateString()}</p>}
            <article style={{ marginTop: "0.8rem" }}>
              <div style={{ whiteSpace: "pre-wrap", color: "var(--ink-soft)" }}>{selectedStory.body || selectedStory.summary}</div>
            </article>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem" }}>
              <button className="primary" onClick={() => setShowStoryModal(false)}>Close</button>
            </div>
          </div>
        </aside>
      )}

      {showArticleView && selectedStory && (
        <Article
          story={selectedStory}
          onClose={() => {
            setShowArticleView(false);
            // clear hash and go back in history where possible
            try {
              if (window.history && window.history.length > 1) window.history.back();
              else window.location.hash = "";
            } catch (_) {
              window.location.hash = "";
            }
            setSelectedStory(null);
          }}
        />
      )}
    </>
  );
}
