// POST /api/publish
// Server-side authenticated publish to WordPress. Credentials live only in Vercel
// environment variables (WP_USER + WP_APP_PASSWORD) and are never exposed to the browser.
import { wpBase, wpCredentials } from "../lib/wp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const base = wpBase();
  if (!base) {
    return res.status(400).json({ error: "WordPress is not configured (set WP_URL)." });
  }

  const { username, appPassword } = wpCredentials();
  if (!username || !appPassword) {
    return res
      .status(500)
      .json({ error: "WP_USER or WP_APP_PASSWORD not set on the server." });
  }

  try {
    const { title, body, summary, status, publishedAt } = req.body || {};
    const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
    const payload = {
      title: title || "Untitled",
      content: body || summary || "",
      excerpt: summary || "",
      status: status === "publish" || status === "published" ? "publish" : "draft"
    };
    if (publishedAt) payload.date = publishedAt;

    const r = await fetch(`${base}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });

    res.status(200).json({
      wpId: data.id,
      title: data.title?.rendered || "",
      body: data.content?.rendered || "",
      summary: data.excerpt?.rendered || "",
      publishedAt: data.date
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
