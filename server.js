#!/usr/bin/env node
/*
  Simple content-service to proxy a WordPress site (headless) or fall back to local content-schema.json
  Usage:
    WP_URL=https://your-wp-site.com node server.js
  Endpoints:
    GET /api/homepage  -> returns normalized homepage object (content-schema merged with cms stories)
    GET /api/stories   -> list of stories from WP (or empty array if no WP_URL)
    GET /api/stories/:id -> single story
*/

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;
const WP_URL = process.env.WP_URL || process.env.WORDPRESS_URL || null;

const SCHEMA_PATH = path.join(process.cwd(), "content-schema.json");
let localSchema = {};
try {
  localSchema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
} catch (err) {
  console.warn("Could not read local content-schema.json", err.message);
  localSchema = {};
}

// simple cache
const cache = new Map();
function cached(key, fn, ttl = 30_000) {
  const entry = cache.get(key);
  const now = Date.now();
  if (entry && entry.expires > now) return Promise.resolve(entry.value);
  return fn().then((v) => {
    cache.set(key, { value: v, expires: now + ttl });
    return v;
  });
}

async function fetchWpPosts() {
  if (!WP_URL) return [];
  const endpoint = `${WP_URL.replace(/\/$/, "")}/wp-json/wp/v2/posts?per_page=20`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`);
  const data = await res.json();
  return data.map((post) => ({
    id: post.id,
    title: post.title?.rendered || "",
    summary: post.excerpt?.rendered || "",
    body: post.content?.rendered || "",
    publishedAt: post.date,
    author: post._embedded?.author?.[0]?.name || undefined
  }));
}

app.get("/api/homepage", async (req, res) => {
  try {
    const stories = await cached("wp_posts", fetchWpPosts, 60_000).catch(() => []);
    // prefer first published story as featured (normalized)
    const featured = stories.length > 0 ? stories[0] : null;
    const payload = {
      ...localSchema,
      cms: {
        stories
      },
      featuredFromCms: featured
    };
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stories", async (req, res) => {
  try {
    const stories = await cached("wp_posts", fetchWpPosts, 60_000).catch(() => []);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!WP_URL) return res.status(404).json({ error: "WP_URL not configured" });
    const endpoint = `${WP_URL.replace(/\/$/, "")}/wp-json/wp/v2/posts/${id}`;
    const r = await fetch(endpoint);
    if (!r.ok) return res.status(r.status).json({ error: `WP responded ${r.status}` });
    const post = await r.json();
    res.json({
      id: post.id,
      title: post.title?.rendered || "",
      summary: post.excerpt?.rendered || "",
      body: post.content?.rendered || "",
      publishedAt: post.date
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish a new story to WordPress (server-side authenticated)
app.post("/api/publish", async (req, res) => {
  try {
    if (!WP_URL) return res.status(400).json({ error: "WP_URL not configured" });
    const { title, body, summary, status, publishedAt } = req.body;
    const username = process.env.WP_USER || process.env.WORDPRESS_USER;
    const appPassword = process.env.WP_APP_PASSWORD || process.env.WORDPRESS_APP_PASSWORD;
    if (!username || !appPassword) {
      return res.status(500).json({ error: "WP_USER or WP_APP_PASSWORD not set on server" });
    }

    const endpoint = `${WP_URL.replace(/\/$/, "")}/wp-json/wp/v2/posts`;
    const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
    const payload = {
      title: title || "Untitled",
      content: body || summary || "",
      excerpt: summary || "",
      status: status === "publish" || status === "published" ? "publish" : "draft"
    };
    if (publishedAt) payload.date = publishedAt;

    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    // return normalized post
    res.json({
      wpId: data.id,
      title: data.title?.rendered || "",
      body: data.content?.rendered || "",
      summary: data.excerpt?.rendered || "",
      publishedAt: data.date
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing WP post
app.put("/api/publish/:wpId", async (req, res) => {
  try {
    if (!WP_URL) return res.status(400).json({ error: "WP_URL not configured" });
    const wpId = req.params.wpId;
    const username = process.env.WP_USER || process.env.WORDPRESS_USER;
    const appPassword = process.env.WP_APP_PASSWORD || process.env.WORDPRESS_APP_PASSWORD;
    if (!username || !appPassword) {
      return res.status(500).json({ error: "WP_USER or WP_APP_PASSWORD not set on server" });
    }
    const endpoint = `${WP_URL.replace(/\/$/, "")}/wp-json/wp/v2/posts/${wpId}`;
    const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
    const { title, body, summary, status, publishedAt } = req.body;
    const payload = {};
    if (title !== undefined) payload.title = title;
    if (body !== undefined) payload.content = body;
    if (summary !== undefined) payload.excerpt = summary;
    if (status !== undefined) payload.status = status === "publish" ? "publish" : "draft";
    if (publishedAt) payload.date = publishedAt;

    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    res.json({ wpId: data.id, title: data.title?.rendered || "", body: data.content?.rendered || "", summary: data.excerpt?.rendered || "", publishedAt: data.date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Content service listening on http://localhost:${PORT}`);
  if (WP_URL) console.log(`Proxying WordPress at ${WP_URL}`);
  else console.log(`WP_URL not set — serving local schema only`);
});
