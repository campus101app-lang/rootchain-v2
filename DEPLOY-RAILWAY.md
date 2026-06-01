# Deploy Rootchain API on Railway

Vercel only hosts the **frontend**. The error **"Invalid response from server"** means the browser called Vercel’s URL for `/api/v1` and got HTML (a 404 page), not JSON from Express.

You need **two deployments**:

| What | Where |
|------|--------|
| Landing (`apps/landing`) | Vercel — optional marketing site |
| App (`apps/web`) | Vercel — must set `VITE_API_URL` |
| **API (`server`)** | **Railway** + Postgres |

---

## Step 1 — Railway project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Select **`campus101app-lang/rootchain-v2`** (or your fork).
3. Railway reads **`railway.toml`** at the repo root (build + start commands).

---

## Step 2 — PostgreSQL (fixes empty `DATABASE_URL`)

Your deploy log shows:

```text
DATABASE_URL resolved to an empty string
```

That means Postgres is **not linked** to the API service yet.

### Do this exactly

1. In the same Railway project, click **+ New** → **Database** → **PostgreSQL**.
2. Wait until Postgres shows **Active**.
3. Click your **API service** (`rootchain-v2` / honest-spirit) → **Variables**.
4. **Delete** any `DATABASE_URL` row that is blank or only spaces.
5. Click **+ New Variable** → **Add variable reference** (or "Reference"):
   - Variable name: `DATABASE_URL`
   - Reference: select your **Postgres** service → `DATABASE_URL`
   
   It should look like: `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`  
   (Service name might be `Postgres` or `postgresql` — pick the database service.)

6. Click **Deploy** / wait for automatic redeploy.

### Verify

**Deployments** → latest should be **Success**.  
**Deploy logs** should show `listening on 0.0.0.0:8080`, not Prisma P1012.

Open: https://rootchain-v2-production.up.railway.app/api/v1/health

---

## Step 3 — API environment variables

On the **API service** (not Postgres), set:

| Variable | Example / notes |
|----------|------------------|
| `NODE_ENV` | `production` |
| `JWT_ACCESS_SECRET` | Random 32+ chars (generate new for prod) |
| `JWT_REFRESH_SECRET` | Random 32+ chars |
| `WALLET_ENCRYPTION_KEY` | 64 hex chars (32 bytes) — **never reuse dev key in prod** |
| `STELLAR_NETWORK` | `testnet` |
| `STELLAR_HORIZON_URL_TESTNET` | `https://horizon-testnet.stellar.org` |
| `STELLAR_HORIZON_URL_MAINNET` | `https://horizon.stellar.org` |
| `STELLAR_PASSPHRASE_TESTNET` | `Test SDF Network ; September 2015` |
| `STELLAR_PASSPHRASE_MAINNET` | `Public Global Stellar Network ; September 2015` |
| `USDC_ISSUER_TESTNET` | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| `USDC_ISSUER_MAINNET` | same as testnet issuer for now |
| `AUTO_APPROVE_FARMERS` | `true` |
| `AUTO_APPROVE_PROJECTS` | `true` |
| `CORS_ORIGIN` | Your Vercel URLs (comma-separated, no spaces) |

**Do not put `VITE_API_URL` on Railway** — that is a **Vercel** build variable for `apps/web` only. Railway runs the API; it ignores `VITE_*`.

**CORS example:**

```env
CORS_ORIGIN=https://rootchain-v2.vercel.app,https://your-landing.vercel.app
```

Generate secrets locally:

```bash
openssl rand -hex 32   # JWT_ACCESS_SECRET
openssl rand -hex 32   # JWT_REFRESH_SECRET
openssl rand -hex 32   # WALLET_ENCRYPTION_KEY
```

---

## Step 4 — Deploy & seed (once)

1. Deploy the API service. Wait until **Active**.
2. Copy the public URL, e.g. `https://rootchain-v2-production.up.railway.app`
3. Test: `https://YOUR-URL/api/v1/health` → JSON `{ "success": true, ... }`
4. **One-time seed** (Railway shell on API service):

```bash
npm run db:seed --workspace=server
```

This creates admin user, escrow wallet, and testnet USDC issuer vars (check logs / append to Railway variables if needed).

---

## Step 5 — Fix Vercel (web app)

In **Vercel** → your **`apps/web`** project → **Settings** → **Environment Variables**:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL.up.railway.app/api/v1` |
| `VITE_STELLAR_NETWORK` | `testnet` |

**Important:** Use the **full Railway URL**, not `/api/v1` alone.

Redeploy Vercel (**Deployments** → ⋮ → **Redeploy**) so the build picks up env vars.

For **landing** (`apps/landing`):

```env
NEXT_PUBLIC_APP_URL=https://your-web-app.vercel.app
```

---

## Step 6 — Uploads on Railway

Uploaded images are stored on the API disk (`server/uploads/`). On Railway the filesystem is **ephemeral** — files may disappear on redeploy. For production, plan S3/R2 later. For demo/testnet this is OK.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Invalid response from server | `VITE_API_URL` wrong or missing on Vercel; redeploy after setting |
| Cannot reach API | Railway service down; check deploy logs |
| CORS error in browser | Add exact Vercel URL to `CORS_ORIGIN` on Railway |
| 500 on register | `DATABASE_URL` missing; run migrations (`start:prod` runs migrate) |
| Stellar / USDC errors | Run `db:seed` once; set escrow/issuer vars from seed output |

---

## Architecture

```text
User → Vercel (React)  --fetch-->  Railway (Express + Prisma)
                                      ↓
                                 Railway Postgres
```

Local dev unchanged: `docker compose up -d postgres`, `cd server && npm run dev`, `cd apps/web && npm run dev`.
