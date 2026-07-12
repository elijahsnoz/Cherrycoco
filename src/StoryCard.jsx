import React from 'react';

export default function StoryCard({ story, onRead, onSave }) {
  const fallbackImg = "https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=400&q=80";
  const imgUrl = story.image || fallbackImg;

  return (
    <article className="story-card medium-card" onClick={() => onRead && onRead(story)}>
      <div className="medium-card-content">
        <div className="medium-card-author">
          <span className="author-name">{story.author || 'Anonymous'}</span>
          {story.category && <span className="in-category"> in {story.category}</span>}
        </div>
        <h3 className="medium-card-title">{story.title}</h3>
        <p className="medium-card-summary">{story.summary}</p>
        <div className="medium-card-meta">
          <span>{story.publishedAt ? new Date(story.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}</span>
          <span>·</span>
          <span>{story.readingTimeMinutes || 5} min read</span>
          <button 
            className="tertiary save-btn" 
            onClick={(e) => { 
              e.stopPropagation(); 
              onSave && onSave(story.summary || story.title); 
            }}>
            Save
          </button>
        </div>
      </div>
      <div className="medium-card-image">
        <img src={imgUrl} alt={story.title} loading="lazy" />
      </div>
    </article>
  );
}
