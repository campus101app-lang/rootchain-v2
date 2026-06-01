import {
  Asset,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";
import { env } from "../config/env.js";
import { horizonUrl, isTestnet, networkPassphraseConst, USDC_CODE, usdcIssuer } from "./config.js";

const server = () => new Horizon.Server(horizonUrl());

function issuerKeypair(): Keypair | null {
  if (!env.TESTNET_USDC_ISSUER_SECRET) return null;
  return Keypair.fromSecret(env.TESTNET_USDC_ISSUER_SECRET);
}

export async function ensureTestnetIssuerFunded(): Promise<string | null> {
  if (!isTestnet()) return null;
  const kp = issuerKeypair();
  if (!kp) return null;

  const publicKey = kp.publicKey();
  try {
    await server().loadAccount(publicKey);
  } catch {
    const res = await fetch(
      `${env.FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`,
    );
    if (!res.ok) console.warn("Issuer friendbot:", await res.text());
    for (let i = 0; i < 12; i++) {
      try {
        await server().loadAccount(publicKey);
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }
  return publicKey;
}

/** Send testnet USDC (platform-issued) to a wallet that already has the trustline. */
export async function sendTestnetUsdcTo(publicKey: string, amount = "100"): Promise<string | null> {
  if (!isTestnet()) return null;
  const kp = issuerKeypair();
  if (!kp) return null;

  const usdc = new Asset(USDC_CODE, usdcIssuer());
  const amountStr = Number(amount).toFixed(7);

  try {
    const account = await server().loadAccount(kp.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphraseConst(),
    })
      .addOperation(
        Operation.payment({
          destination: publicKey,
          asset: usdc,
          amount: amountStr,
        }),
      )
      .setTimeout(180)
      .build();
    tx.sign(kp);
    const result = await server().submitTransaction(tx);
    return result.hash;
  } catch (e) {
    console.warn("sendTestnetUsdcTo:", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function getUsdcBalance(publicKey: string): Promise<number> {
  try {
    const account = await server().loadAccount(publicKey);
    const line = account.balances.find(
      (b) =>
        b.asset_type !== "native" &&
        "asset_code" in b &&
        b.asset_code === USDC_CODE &&
        "asset_issuer" in b &&
        b.asset_issuer === usdcIssuer(),
    );
    if (!line || !("balance" in line)) return 0;
    return Number(line.balance);
  } catch {
    return 0;
  }
}

async function ensureUsdcTrustline(publicKey: string, secret: string): Promise<void> {
  const kp = Keypair.fromSecret(secret);
  const usdc = new Asset(USDC_CODE, usdcIssuer());
  const account = await server().loadAccount(publicKey);
  const has = account.balances.some(
    (b) =>
      b.asset_type !== "native" &&
      "asset_code" in b &&
      b.asset_code === USDC_CODE &&
      "asset_issuer" in b &&
      b.asset_issuer === usdcIssuer(),
  );
  if (has) return;

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: networkPassphraseConst(),
  })
    .addOperation(Operation.changeTrust({ asset: usdc, limit: "1000000000" }))
    .setTimeout(180)
    .build();
  tx.sign(kp);
  await server().submitTransaction(tx);
}

export async function bootstrapEscrowUsdc(_xlmToSell?: string): Promise<void> {
  if (!isTestnet()) return;
  const { escrowPublicKey, escrowSecret } = await import("./escrow.js");
  const secret = escrowSecret();
  if (!secret) return;
  const pk = escrowPublicKey();
  await ensureUsdcTrustline(pk, secret);
  await sendTestnetUsdcTo(pk, "50000");
}
