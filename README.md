# Rootchain V2

Transparent on-chain agricultural investment on **Stellar (USDC)**.  
Backend: **Railway + PostgreSQL + Prisma**. No Supabase.

## Monorepo

```text
rootchain-v2/
├── apps/
│   ├── web/          # Investor + Farm Owner app (Vite + React)
│   └── admin/        # Platform admin console
├── server/           # REST API + Stellar provisioning
├── packages/shared/  # Shared types
├── docker-compose.yml
└── ARCHITECTURE.md
```

## Quick start

```bash
# 1. Infrastructure
docker compose up -d postgres

# 2. API
cp server/.env.example server/.env
cd server && npm install && npm run db:deploy && npm run db:seed && npm run dev

# 3. Web (new terminal)
cp apps/web/.env.example apps/web/.env
cd apps/web && npm install && npm run dev

# 4. Admin (optional)
cp apps/admin/.env.example apps/admin/.env
cd apps/admin && npm install && npm run dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:5173 |
| Admin | http://localhost:5175 |
| API | http://localhost:3001/api/v1 |

**Testnet admin:** `admin@rootchain.local` / `ChangeMeAdmin123!`

## User flow

1. **Landing** — Farm Owner or Investor  
2. **Sign up** — wallet + testnet USDC (platform issuer in dev)  
3. **Farmer** — create project → **auto-approved** → live on marketplace  
4. **Investor** — browse marketplace → invest USDC on-chain to escrow  
5. **Admin** — overview at http://localhost:5175 (manual verify when `AUTO_APPROVE_*=false`)

After seed, if investments fail with no USDC: `cd server && npx tsx scripts/bootstrap-usdc.ts`

## Deploy

1. **API + Postgres (Railway)** — [DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md) ← do this first  
2. **Web app (Vercel)** — [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) — set `VITE_API_URL` to Railway URL  
3. **Landing (Vercel)** — Root Directory `apps/landing`, optional marketing site  

**Vercel alone is not enough** — without Railway you will see “Invalid response from server”.

## Mainnet flip

Set in `server/.env` and `apps/web/.env`:

```env
STELLAR_NETWORK=mainnet
```

See `server/src/stellar/config.ts`.
