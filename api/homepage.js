// GET /api/homepage
// Merges the local content schema with live WordPress stories (if configured).
// Falls back to schema-only + empty stories when WordPress isn't connected yet,
// so the site always renders.
import { createRequire } from "module";
import { fetchWpPosts } from "../lib/wp.js";

// Load the JSON via require so it works uniformly across Node ESM + Vercel bundling
// (a bare `import ... from "*.json"` needs an import attribute the runtime rejects).
const require = createRequire(import.meta.url);
const localSchema = require("../content-schema.json");

export default async function handler(req, res) {
  try {
    let stories = [];
    try {
      stories = await fetchWpPosts();
    } catch {
      stories = [];
    }
    const featured = stories.length > 0 ? stories[0] : null;
    // brief CDN cache so the homepage isn't hitting WP on every request
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
      ...localSchema,
      cms: { stories },
      featuredFromCms: featured
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
