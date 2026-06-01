# Deploy Rootchain V2 on Vercel (+ Railway API)

The **frontend** (`apps/web`) goes on **Vercel**. The **API** (`server`) must run on **Railway** — see **[DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md)**.

### “Invalid response from server” on Vercel?

You deployed only the frontend. Vercel returns HTML for `/api/v1`, not JSON.

1. Deploy API on Railway ([guide](./DEPLOY-RAILWAY.md))
2. Set **`VITE_API_URL`** = `https://YOUR-RAILWAY-URL.up.railway.app/api/v1`
3. **Redeploy** the Vercel project

## Why the repo didn’t show in Vercel

The GitHub repo lives under **`campus101app-lang/rootchain-v2`**, but your Vercel screen lists **`Freddy1-commits`** repos only.

**Fix (pick one):**

1. **Import by URL** (fastest)  
   On “New Project”, paste:  
   `https://github.com/campus101app-lang/rootchain-v2`

2. **Connect the other GitHub account**  
   Vercel → Settings → Git → connect `campus101app-lang`.

3. **Fork** the repo to `Freddy1-commits`, then import the fork.

---

## 1. Deploy API on Railway (do this first)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub → `rootchain-v2`.
2. Set **root directory** / start command to `server` (or use Railway service with `cd server && npm start` after build).
3. Add **PostgreSQL** plugin → copy `DATABASE_URL` into service variables.
4. Copy variables from `server/.env.example` (generate new JWT secrets for production).
5. Run migrations (Railway shell or one-off):  
   `npm run db:deploy && npm run db:seed`
6. Note your public API URL, e.g. `https://rootchain-v2-production.up.railway.app`

Set **CORS** on Railway:

```env
CORS_ORIGIN=https://your-app.vercel.app,https://your-admin.vercel.app
```

---

## 2. Deploy marketing landing (Next.js) on Vercel — **separate project**

The premium landing (`page.tsx` with Hero, Metrics, etc.) lives in **`apps/landing`**, NOT `apps/web`.

You need **two** Vercel projects from the same repo:

| Vercel project | Root Directory | What users see |
|----------------|----------------|----------------|
| **rootchain-web** | `apps/web` | Login, marketplace, invest |
| **rootchain-landing** | `apps/landing` | Marketing homepage |

### Landing setup

1. **Add New Project** → import `rootchain-v2` again (second project).
2. **Root Directory:** `apps/landing` ← required
3. **Framework:** Next.js (auto)
4. **Environment:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-WEB-APP.vercel.app` |

5. Deploy. Open the new URL — you should see the full landing (Hero, live metrics, etc.).

`apps/landing` installs with its **own** `npm install` (not the monorepo root).

---

## 3. Deploy web app on Vercel

1. **Add New Project** → import `rootchain-v2` (or paste Git URL above).
2. **Root Directory:** `apps/web`  
   (Vercel will read `apps/web/vercel.json` for install/build.)
3. **Framework Preset:** Vite (auto-detected).
4. **Environment variables:**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL/api/v1` *(optional if using `apps/web/vercel.json` API proxy)* |
| `VITE_STELLAR_NETWORK` | `testnet` |

**Set these on Vercel, not Railway.** `VITE_*` is baked into the frontend at build time; Railway’s API service does not use them.

5. Deploy (required after changing env vars).

SPA routes (`/marketplace`, `/dashboard`, etc.) are handled by `vercel.json` rewrites.

---

## 4. Optional: Admin on Vercel

Second project, **Root Directory:** `apps/admin`, same install pattern, env:

```env
VITE_API_URL=https://YOUR-RAILWAY-URL/api/v1
```

---

## Local vs production

| | Local | Production |
|---|--------|------------|
| Web API calls | `/api/v1` (Vite proxy) | Full Railway URL in `VITE_API_URL` |
| API | `localhost:3001` | Railway |
| DB | Docker `5434` | Railway Postgres |

---

## Troubleshooting

- **Build fails:** Ensure Root Directory is `apps/web`, not repo root only without config.
- **“Failed to fetch” on site:** `VITE_API_URL` wrong or Railway API down; check CORS.
- **Repo not listed:** Use import URL or connect `campus101app-lang` on Vercel Git settings.
