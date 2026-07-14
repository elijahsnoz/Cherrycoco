// Shared WordPress helpers for the Vercel serverless functions in /api.
// Uses the global fetch available in Vercel's Node 18+ runtime — no node-fetch needed.

const WP_URL = process.env.WP_URL || process.env.WORDPRESS_URL || null;

// Normalized, trailing-slash-free WordPress base URL (or null if not configured).
export function wpBase() {
  return WP_URL ? WP_URL.replace(/\/$/, "") : null;
}

export function wpCredentials() {
  const username = process.env.WP_USER || process.env.WORDPRESS_USER || null;
  const appPassword = process.env.WP_APP_PASSWORD || process.env.WORDPRESS_APP_PASSWORD || null;
  return { username, appPassword };
}

// Turn a raw WP REST post into the shape the front end expects.
export function normalizePost(post) {
  return {
    id: post.id,
    title: post.title?.rendered || "",
    summary: post.excerpt?.rendered || "",
    body: post.content?.rendered || "",
    publishedAt: post.date,
    author: post._embedded?.author?.[0]?.name || undefined,
    image:
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || undefined
  };
}

// Fetch the latest published posts. Returns [] when WordPress isn't configured yet.
export async function fetchWpPosts() {
  const base = wpBase();
  if (!base) return [];
  const res = await fetch(`${base}/wp-json/wp/v2/posts?per_page=20&_embed=1`);
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizePost) : [];
}
