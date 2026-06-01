import "../scripts/load-env.mjs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { walletRouter } from "./modules/wallets/wallet.routes.js";
import { projectRouter } from "./modules/projects/project.routes.js";
import { investmentRouter } from "./modules/investments/investment.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { uploadRouter } from "./modules/uploads/upload.routes.js";

const API = "/api/v1";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const allowed = env.CORS_ORIGIN.split(",").map((o) => o.trim());
        const devOk =
          env.NODE_ENV === "development" &&
          (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
            /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
              origin,
            ));
        cb(null, allowed.includes(origin) || devOk);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "8mb" }));
  app.use("/uploads", express.static(path.resolve("uploads")));
  app.use(rateLimit({ windowMs: 60_000, max: 200 }));

  app.get(`${API}/health`, (_req, res) => {
    res.json({
      success: true,
      data: {
        ok: true,
        stellar: env.STELLAR_NETWORK,
        version: "2.0.0",
      },
    });
  });

  app.use(`${API}/auth`, authRouter);
  app.use(`${API}/wallets`, walletRouter);
  app.use(`${API}/projects`, projectRouter);
  app.use(`${API}/investments`, investmentRouter);
  app.use(`${API}/admin`, adminRouter);
  app.use(`${API}/uploads`, uploadRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { message: "Not found" } });
  });

  return app;
}
