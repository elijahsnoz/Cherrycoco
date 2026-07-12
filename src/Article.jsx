import React from 'react';

export default function Article({ story, onClose }) {
  if (!story) return null;

  return (
    <main className="article-view">
      <div className="article-panel">
        <p className="eyebrow">{story.isAuthor ? 'Author Story' : 'Article'}</p>
        <h1>{story.title}</h1>
        {story.author && <p className="meta">by {story.author}</p>}
        {story.readingTimeMinutes && <p className="meta">{story.readingTimeMinutes} min read</p>}

        <article className="article-body">
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--ink-soft)' }}>{story.body || story.summary}</div>
        </article>

        <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.6rem' }}>
          <button className="secondary" onClick={onClose}>Back</button>
        </div>
      </div>
    </main>
  );
}
