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

- **Web (Vercel):** see [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) — Root Directory `apps/web`, set `VITE_API_URL` to your Railway API.
- **API + DB (Railway):** deploy `server/` with Postgres; not hosted on Vercel.

## Mainnet flip

Set in `server/.env` and `apps/web/.env`:

```env
STELLAR_NETWORK=mainnet
```

See `server/src/stellar/config.ts`.
