# Cherry Coco — Go-Live Setup (domain + headless WordPress)

The React site is on **Vercel**. WordPress runs **headless** on Hostinger as the
editor/database. The browser never talks to WordPress directly — it calls the
Vercel serverless functions in [`/api`](./api), which hold the WordPress
credentials and talk to the WordPress REST API. This avoids CORS and keeps
secrets off the client.

```
Reader ──▶ cherrycoco.org (React app on Vercel)
                 │  publish / fetch
                 ▼
        /api/* (Vercel serverless functions)  ──▶  cms.cherrycoco.org (WordPress on Hostinger)
```

Do the steps in order. **A** and **D** get the site live on your domain today;
**B/C/E** switch real WordPress publishing on.

---

## A. Point the domain at the React app (Hostinger DNS)

Your domain currently uses Hostinger's parking DNS. Keep DNS at Hostinger and add
two records so the apex + www serve the React app on Vercel.

In **hPanel → Domains → cherrycoco.org → DNS / Nameservers → DNS records**, add:

| Type  | Name (Host) | Value / Points to | TTL     |
| ----- | ----------- | ----------------- | ------- |
| A     | `@`         | `76.76.21.21`     | default |
| A     | `www`       | `76.76.21.21`     | default |

Delete any existing `A`/`CNAME` records on `@` or `www` that point at Hostinger
parking, or they'll conflict. Propagation is usually minutes (up to a couple hours).
After it resolves, **https://cherrycoco.org** shows the site. (SSL is issued by
Vercel automatically.)

## B. Get WordPress running on Hostinger (subdomain)

> Requires an active Hostinger **hosting/WordPress plan** — a domain alone can't
> run WordPress. If you only bought the domain, add a hosting plan first.

1. hPanel → **Domains → Subdomains** → create **`cms`** → gives you `cms.cherrycoco.org`
   (Hostinger auto-creates its DNS record pointing to your hosting).
2. hPanel → **Websites / Auto Installer** → install **WordPress** onto `cms.cherrycoco.org`.
3. Confirm the admin loads at **https://cms.cherrycoco.org/wp-admin** and the site
   has HTTPS (Hostinger issues a free SSL cert).

## C. Create a WordPress Application Password

1. WP admin → **Users → Profile** (your admin user) → scroll to **Application Passwords**.
2. Name it `Cherry Coco Vercel` → **Add New Application Password**.
3. Copy the generated password (looks like `abcd EFGH ijkl ...`, spaces are fine).
   You'll only see it once. Keep it private — it is NOT your login password.

## D. Add the WordPress secrets to Vercel

Vercel dashboard → **cherrycoco** project → **Settings → Environment Variables**.
Add these three for the **Production** environment (do not commit them to git):

| Name              | Value                          |
| ----------------- | ------------------------------ |
| `WP_URL`          | `https://cms.cherrycoco.org`   |
| `WP_USER`         | your WordPress admin username  |
| `WP_APP_PASSWORD` | the Application Password from C |

Then **redeploy** (Deployments → ⋯ → Redeploy, or push any commit) so the
functions pick up the new variables.

## E. Verify

- `https://cherrycoco.org/api/homepage` → `cms.stories` should list your WordPress posts.
- In the Writer Studio, publish a story → it should appear in WordPress under
  **Posts**, and show on the homepage.

---

### Notes / troubleshooting
- **401 on publish:** a WordPress security plugin (Wordfence, etc.) or host setting
  may be blocking the REST API / `Authorization` header. Allow REST API + Application
  Passwords for your user.
- **Empty stories:** confirm `WP_URL` has no trailing slash and the site is public
  (Settings → Reading → not "Discourage search engines" is fine; just don't password-
  protect the whole site).
- **Local full-stack dev:** run `vercel dev` (serves the app + `/api` together). Plain
  `npm run dev` runs only the front end; `/api` calls fall back gracefully.
- The legacy [`server.js`](./server.js) Express version is kept for reference; production
  uses the `/api` serverless functions.
