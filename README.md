# Cherry Coco Roadmap

Cherry Coco is a reflective storytelling platform built to help people understand themselves and feel less alone.

## Mission

Create a calm, emotionally rich digital space for:
- mental health
- relationships
- identity and self-discovery
- personal growth
- arts, culture, and creativity

## Product Principles

- Depth over volume
- Reflection over reaction
- Finite journeys over infinite scroll
- Emotional safety over engagement tricks
- Global voices with cultural context

## Current Status (April 2026)

Implemented:
- React + Vite landing page
- Data-driven homepage from `content-schema.json`
- Multi-step onboarding (privacy + tone + intent)
- Lightweight personalization rules (tone + intent)
- Reflection Shelf with local persistence
- Edit/delete controls for saved lines and thought fragments
- Responsive UI for desktop and mobile

## Roadmap

### Phase 1: Foundation (Done)

- [x] Define mission-aligned homepage structure
- [x] Build editorial sections and visual system
- [x] Add slow-reading mode and reflective prompts
- [x] Introduce onboarding and local personalization

### Phase 2: Content Engine (In Progress)

- [ ] Move from static JSON import to runtime content API
- [ ] Add schema validation for story and prompt content
- [ ] Add editorial workflow states (draft, review, published)
- [ ] Build pathway curation tools for editors

### Phase 3: Reflection Layer (Next)

- [ ] Add account-based sync for Reflection Shelf
- [ ] Add optional private journaling timeline
- [ ] Add soft reminders (no streak pressure)
- [ ] Add export for personal reflections

### Phase 4: Community Layer (Next)

- [ ] Add anonymous resonance signals (no public like counts)
- [ ] Add themed weekly circles around shared emotional topics
- [ ] Add moderation and emotional safety policy tooling
- [ ] Add contributor spotlights and culturally grounded context notes

### Phase 5: Platform Scale (Later)

- [ ] Add analytics focused on depth metrics (completion, saves, reflection actions)
- [ ] Add localization and multilingual story support
- [ ] Add accessibility pass (WCAG AA/AAA targets)
- [ ] Add performance budget and image/content optimization

## Success Metrics (Meaningful, Non-Addictive)

- Longform completion rate
- Reflection actions per session
- Saved lines per reader
- Return visits by intention (not random recency clicks)
- "I felt understood" sentiment pulse

## Tech Stack

- React 18
- Vite 5
- Local persistence via browser `localStorage`
- Content schema in `content-schema.json`

## Local Development

```bash
npm install
npm run dev
```

Default local URL:
- `http://localhost:5173/`

## Suggested Next Build Step

Implement a `content-service` layer and replace direct schema imports with a fetch-based data source to support editor-managed content updates without code deployments.
