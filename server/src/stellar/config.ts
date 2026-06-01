import { Networks } from "@stellar/stellar-sdk";
import { env } from "../config/env.js";

export function isTestnet(): boolean {
  return env.STELLAR_NETWORK === "testnet";
}

export function horizonUrl(): string {
  return isTestnet() ? env.STELLAR_HORIZON_URL_TESTNET : env.STELLAR_HORIZON_URL_MAINNET;
}

export function networkPassphrase(): string {
  return isTestnet() ? env.STELLAR_PASSPHRASE_TESTNET : env.STELLAR_PASSPHRASE_MAINNET;
}

export function networkPassphraseConst(): string {
  return isTestnet() ? Networks.TESTNET : Networks.PUBLIC;
}

export function usdcIssuer(): string {
  if (isTestnet() && env.TESTNET_USDC_ISSUER) return env.TESTNET_USDC_ISSUER;
  return isTestnet() ? env.USDC_ISSUER_TESTNET : env.USDC_ISSUER_MAINNET;
}

export const USDC_CODE = "USDC";
