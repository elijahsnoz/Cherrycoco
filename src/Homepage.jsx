import React from 'react';
import StoryCard from './StoryCard';
import HeroArt from './HeroArt';

export default function Homepage({ contentData, savedStories, onRead, onSave, onOpenEditor }) {
  const schema = contentData.homepage || {};
  const cmsStories = (contentData.cms && contentData.cms.stories) || [];
  const featured = cmsStories.length > 0 ? cmsStories[0] : schema.featuredStory ? schema.featuredStory : null;

  // Full feed: CMS stories + owner-published stories, minus the featured duplicate
  const list = [
    ...cmsStories.filter(s => !(featured && s.id === featured.id)),
    ...savedStories.filter(s => s.publishedAt)
  ];

  // "Trending" strip — take the first handful of whatever we have to show
  const trending = [featured, ...list].filter(Boolean).slice(0, 6);

  const dailyLine =
    schema.hero?.dailyLines?.[new Date().getDate() % (schema.hero?.dailyLines?.length || 1)];

  const topics = ['Identity', 'Mental Health', 'Relationships', 'Creativity', 'Belonging', 'Healing', 'Writing'];

  return (
    <section className="homepage">
      {/* ---- Medium-style editorial hero ---- */}
      <div className="mhero">
        <div className="mhero-copy">
          <h1 className="mhero-title">{schema.hero?.headline || 'Stories worth feeling.'}</h1>
          <p className="mhero-sub">
            {schema.hero?.subhead ||
              'A quiet corner of the internet where a man and a woman — and everyone in between — put honest words on the page. Read deeply. Write bravely.'}
          </p>
          <div className="mhero-actions">
            <button className="btn-accent large" onClick={() => onOpenEditor && onOpenEditor()}>
              Start writing
            </button>
            <a className="btn-ghost large" href="#featured">Start reading</a>
          </div>
          {dailyLine && <p className="mhero-daily">“{dailyLine}”</p>}
        </div>
        <div className="mhero-art" aria-hidden="false">
          <HeroArt />
        </div>
      </div>

      {/* ---- Trending strip ---- */}
      {trending.length > 0 && (
        <div className="trending">
          <p className="trending-head"><span className="trending-mark">✶</span> Trending on Cherry Coco</p>
          <ol className="trending-grid">
            {trending.map((s, i) => (
              <li key={s.id || s.title} className="trending-item" onClick={() => onRead && onRead(s)}>
                <span className="trending-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="trending-body">
                  <p className="trending-author">{s.author || 'Cherry Coco'}</p>
                  <h4 className="trending-title">{s.title}</h4>
                  <p className="trending-meta">{s.readingTimeMinutes || 5} min read</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ---- Feed + sidebar ---- */}
      <div id="featured" className="feed-wrap">
        <div className="feed-main">
          {featured && (
            <article className="lead-story" onClick={() => onRead && onRead(featured)}>
              <p className="eyebrow">Featured story</p>
              <h2 className="lead-title">{featured.title}</h2>
              <p className="lead-summary">{featured.summary}</p>
              <div className="lead-meta">
                <span>{featured.author || 'Cherry Coco'}</span>
                <span>·</span>
                <span>{featured.readingTimeMinutes || 14} min read</span>
              </div>
            </article>
          )}

          <div className="editorial-grid">
            {list.length === 0 && <p className="shelf-empty">No stories published yet — be the first to write one.</p>}
            {list.map((s) => (
              <StoryCard key={s.id || s.title} story={s} onRead={onRead} onSave={onSave} />
            ))}
          </div>
        </div>

        <aside className="feed-side">
          <div className="side-block">
            <h3 className="side-head">Discover more of what matters</h3>
            <div className="topic-pills">
              {topics.map((t) => (
                <a key={t} className="topic-pill" href="#voices">{t}</a>
              ))}
            </div>
          </div>
          <div className="side-block">
            <h3 className="side-head">Why we write</h3>
            <p className="side-note">
              {contentData.brand?.mission ||
                'To create a space for reflective, emotionally rich storytelling that helps people understand themselves and feel less alone.'}
            </p>
            <a className="side-link" href="#about">Read our story →</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
