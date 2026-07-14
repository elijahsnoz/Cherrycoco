// GET /api/stories -> array of published WordPress stories (empty if WP not configured).
import { fetchWpPosts } from "../lib/wp.js";

export default async function handler(req, res) {
  try {
    let stories = [];
    try {
      stories = await fetchWpPosts();
    } catch {
      stories = [];
    }
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
