# Rootchain Landing (Next.js)

Standalone app — **not** in the root npm workspace (keeps Railway API builds fast).

```bash
cd apps/landing
npm install
cp .env.example .env.local   # if present
npm run dev
```

Deploy on Vercel with **Root Directory:** `apps/landing`.
