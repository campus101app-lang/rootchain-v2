import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  WALLET_ENCRYPTION_KEY: z.string().min(64),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
  STELLAR_HORIZON_URL_TESTNET: z.string().url(),
  STELLAR_HORIZON_URL_MAINNET: z.string().url(),
  STELLAR_PASSPHRASE_TESTNET: z.string(),
  STELLAR_PASSPHRASE_MAINNET: z.string(),
  USDC_ISSUER_TESTNET: z.string(),
  USDC_ISSUER_MAINNET: z.string(),
  /** Platform-controlled testnet USDC issuer (dev). Falls back to Circle testnet issuer. */
  TESTNET_USDC_ISSUER: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  TESTNET_USDC_ISSUER_SECRET: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  PLATFORM_ESCROW_TESTNET: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  PLATFORM_ESCROW_SECRET_TESTNET: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  PLATFORM_ESCROW_MAINNET: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  PLATFORM_ESCROW_SECRET_MAINNET: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  FRIENDBOT_URL: z.string().url().default("https://friendbot.stellar.org"),
  AUTO_APPROVE_FARMERS: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
  AUTO_APPROVE_PROJECTS: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
});

export type Env = z.infer<typeof schema>;

function load(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid server/.env — see server/.env.example");
  }
  return parsed.data;
}

export const env = load();
