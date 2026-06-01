# Fix Railway + Vercel in 5 minutes

## Problem A — Railway: `DATABASE_URL` empty

**Symptom:** Deploy logs show `P1012` / healthcheck failure / service offline.

**Fix:**

1. Railway project → **+ New** → **Database** → **PostgreSQL**
2. API service → **Variables** → remove empty `DATABASE_URL`
3. Add reference: `DATABASE_URL` → `${{Postgres.DATABASE_URL}}`
4. Redeploy API service
5. Test: https://rootchain-v2-production.up.railway.app/api/v1/health

## Problem B — Vercel: `Invalid response (405)`

**Symptom:** Signup/login fails with 405.

**Cause:** API is down OR `VITE_API_URL` not set (browser POSTs to Vercel instead of Railway).

**Fix (after Railway health works):**

1. Vercel → web project → **Settings** → **Environment Variables**
2. Add or fix:

```env
VITE_API_URL=https://rootchain-v2-production.up.railway.app/api/v1
VITE_STELLAR_NETWORK=testnet
```

3. **Deployments** → **Redeploy** (required — env vars bake in at build time)
4. On Railway API, set:

```env
CORS_ORIGIN=https://YOUR-VERCEL-URL.vercel.app
```

## One-time after Railway is healthy

Railway API → **Shell** (not your Mac — needs Railway `DATABASE_URL`):

```bash
npm run db:seed --workspace=server
```

**Local Mac seed error?** Run `cd server && npx prisma generate` first, and use Docker Postgres (`docker compose up -d postgres`) or Railway’s **public** DB URL in `server/.env` — not `localhost:5434` unless Docker is running.

Add any `TESTNET_USDC_ISSUER` / `PLATFORM_ESCROW_*` variables the seed prints.
