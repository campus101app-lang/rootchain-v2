import { env } from "../config/env.js";
import { isTestnet } from "./config.js";

export function escrowPublicKey(): string {
  const key = isTestnet() ? env.PLATFORM_ESCROW_TESTNET : env.PLATFORM_ESCROW_MAINNET;
  if (!key) {
    throw new Error(
      isTestnet()
        ? "PLATFORM_ESCROW_TESTNET not set — run npm run db:seed in server/"
        : "PLATFORM_ESCROW_MAINNET not set",
    );
  }
  return key;
}

export function escrowSecret(): string | null {
  return isTestnet()
    ? (env.PLATFORM_ESCROW_SECRET_TESTNET ?? null)
    : (env.PLATFORM_ESCROW_SECRET_MAINNET ?? null);
}
