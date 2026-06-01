# Rootchain V2 — Architecture

## Update order (build the flow first)

| Step | Area | Files |
|------|------|--------|
| 1 | **Landing + role routing** | `apps/web/src/pages/landing.tsx`, `App.tsx` |
| 2 | **Auth API** | `server/src/modules/auth/*`, `prisma/schema.prisma` |
| 3 | **Wallet provision** | `server/src/stellar/wallet-provision.ts`, `modules/wallets/*` |
| 4 | **Signup UI** | `apps/web/src/pages/signup-*.tsx`, `wallet-setup.tsx` |
| 5 | **Admin verify** | `apps/admin/*`, `server/src/modules/admin/*` |
| 6 | **Projects + invest** | `modules/projects`, `modules/investments`, Stellar payment verify |

## Stack

| Layer | Choice |
|-------|--------|
| Web | Vite 6, React 19, TypeScript, Tailwind v4 |
| Admin | Same as web, port 5175 |
| API | Express, Prisma, Zod, JWT |
| DB | PostgreSQL (Railway / Docker) |
| Chain | `@stellar/stellar-sdk`, Horizon, Friendbot (testnet) |

## API (`/api/v1`)

```text
POST   /auth/register          # investor | farmer (auto-verify farmer if enabled)
POST   /auth/login
GET    /auth/me
POST   /wallets/provision
GET    /wallets/me
GET    /projects/marketplace   # ACTIVE projects
GET    /projects/mine          # farmer's projects
GET    /projects/:id
POST   /projects               # farmer create → auto ACTIVE if enabled
POST   /investments            # USDC payment to escrow (on-chain)
GET    /investments/mine
POST   /uploads                # images / PDF (base64)
GET    /admin/overview         # admin JWT
GET    /admin/farmers
GET    /admin/projects
```

**Dev testnet:** `npm run db:seed` creates platform USDC issuer + escrow. Run `npx tsx scripts/bootstrap-usdc.ts` if escrow USDC is empty.

## Environment

- **server/.env** — `DATABASE_URL`, JWT secrets, `STELLAR_NETWORK`, issuers, `WALLET_ENCRYPTION_KEY`
- **apps/web/.env** — `VITE_API_URL`, `VITE_STELLAR_NETWORK`
- **apps/admin/.env** — `VITE_API_URL`

## Security notes

- Custodial secrets encrypted at rest (`WALLET_ENCRYPTION_KEY`); production should use KMS.
- Mainnet: disable Friendbot; users fund via Flutterwave / direct deposit (Phase 2).
- All investments: Stellar payment to platform escrow, verified on Horizon.
