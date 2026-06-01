import {
  Asset,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";
import { env } from "../config/env.js";
import {
  horizonUrl,
  isTestnet,
  networkPassphraseConst,
  USDC_CODE,
  usdcIssuer,
} from "./config.js";

export type ProvisionResult = {
  publicKey: string;
  secret: string;
  funded: boolean;
  usdcTrustline: boolean;
  fundingHash?: string;
  trustlineHash?: string;
  warnings: string[];
};

async function fundWithFriendbot(publicKey: string): Promise<{ ok: boolean; hash?: string; warning?: string }> {
  if (!isTestnet()) {
    return { ok: false, warning: "Friendbot only on testnet — fund account manually on mainnet." };
  }
  const url = `${env.FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`;
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) {
    if (res.status === 400 && body.includes("already exists")) {
      return { ok: true, warning: "Account already funded." };
    }
    return { ok: false, warning: `Friendbot: ${body.slice(0, 120)}` };
  }
  const data = JSON.parse(body) as { hash?: string };
  return { ok: true, hash: data.hash };
}

async function waitForAccount(server: Horizon.Server, publicKey: string, attempts = 12): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      await server.loadAccount(publicKey);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return false;
}

export async function provisionStellarWallet(): Promise<ProvisionResult> {
  const warnings: string[] = [];
  const kp = Keypair.random();
  const publicKey = kp.publicKey();
  const secret = kp.secret();
  const server = new Horizon.Server(horizonUrl());

  const fund = await fundWithFriendbot(publicKey);
  if (fund.warning) warnings.push(fund.warning);
  const funded = fund.ok;

  if (funded) {
    const loaded = await waitForAccount(server, publicKey);
    if (!loaded) warnings.push("Account not visible on Horizon yet — retry trustline later.");
  }

  let usdcTrustline = false;
  let trustlineHash: string | undefined;

  if (funded) {
    try {
      const account = await server.loadAccount(publicKey);
      const usdc = new Asset(USDC_CODE, usdcIssuer());
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphraseConst(),
      })
        .addOperation(
          Operation.changeTrust({
            asset: usdc,
            limit: "1000000000",
          }),
        )
        .setTimeout(180)
        .build();
      tx.sign(kp);
      const result = await server.submitTransaction(tx);
      usdcTrustline = true;
      trustlineHash = result.hash;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      warnings.push(`USDC trustline: ${msg}`);
    }
  }

  return {
    publicKey,
    secret,
    funded,
    usdcTrustline,
    fundingHash: fund.hash,
    trustlineHash,
    warnings,
  };
}
