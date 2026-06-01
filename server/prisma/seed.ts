import "../scripts/load-env.mjs";
import bcrypt from "bcryptjs";
import {
  Asset,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";
import { PrismaClient, $Enums } from "@prisma/client";
import { appendFileSync, existsSync } from "node:fs";
import path from "node:path";
import { horizonUrl, networkPassphraseConst, USDC_CODE, usdcIssuer } from "../src/stellar/config.js";
import { bootstrapEscrowUsdc, ensureTestnetIssuerFunded } from "../src/stellar/testnet-liquidity.js";

const prisma = new PrismaClient();
const envPath = path.resolve(".env");

async function fundEscrowAccount(secret: string, publicKey: string) {
  const server = new Horizon.Server(horizonUrl());
  const kp = Keypair.fromSecret(secret);

  try {
    await server.loadAccount(publicKey);
  } catch {
    const res = await fetch(
      `${process.env.FRIENDBOT_URL ?? "https://friendbot.stellar.org"}?addr=${encodeURIComponent(publicKey)}`,
    );
    if (!res.ok) console.warn("Friendbot:", await res.text());
    else console.log("Funded escrow via Friendbot");
    for (let i = 0; i < 12; i++) {
      try {
        await server.loadAccount(publicKey);
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  try {
    const account = await server.loadAccount(publicKey);
    const usdc = new Asset(USDC_CODE, usdcIssuer());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphraseConst(),
    })
      .addOperation(Operation.changeTrust({ asset: usdc, limit: "1000000000" }))
      .setTimeout(180)
      .build();
    tx.sign(kp);
    await server.submitTransaction(tx);
    console.log("Escrow USDC trustline ready");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.includes("op_already_exists")) console.warn("Escrow trustline:", msg);
  }
}

async function ensureTestnetIssuerInEnv() {
  if (process.env.TESTNET_USDC_ISSUER?.length) {
    return {
      publicKey: process.env.TESTNET_USDC_ISSUER,
      secret: process.env.TESTNET_USDC_ISSUER_SECRET,
    };
  }
  const kp = Keypair.random();
  const lines = `\nTESTNET_USDC_ISSUER=${kp.publicKey()}\nTESTNET_USDC_ISSUER_SECRET=${kp.secret()}\n`;
  if (existsSync(envPath)) appendFileSync(envPath, lines);
  process.env.TESTNET_USDC_ISSUER = kp.publicKey();
  process.env.TESTNET_USDC_ISSUER_SECRET = kp.secret();
  console.log("Created testnet USDC issuer → server/.env");
  return { publicKey: kp.publicKey(), secret: kp.secret() };
}

async function ensureEscrowInEnv() {
  if (process.env.PLATFORM_ESCROW_TESTNET?.length) {
    console.log("Escrow public key:", process.env.PLATFORM_ESCROW_TESTNET);
    return {
      publicKey: process.env.PLATFORM_ESCROW_TESTNET,
      secret: process.env.PLATFORM_ESCROW_SECRET_TESTNET,
    };
  }

  const kp = Keypair.random();
  const lines = `\nPLATFORM_ESCROW_TESTNET=${kp.publicKey()}\nPLATFORM_ESCROW_SECRET_TESTNET=${kp.secret()}\n`;
  if (existsSync(envPath)) appendFileSync(envPath, lines);
  process.env.PLATFORM_ESCROW_TESTNET = kp.publicKey();
  process.env.PLATFORM_ESCROW_SECRET_TESTNET = kp.secret();
  console.log("Created escrow wallet → server/.env");
  return { publicKey: kp.publicKey(), secret: kp.secret() };
}

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@rootchain.local").toLowerCase();
  if (!(await prisma.user.findUnique({ where: { email } }))) {
    await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeAdmin123!", 12),
        role: $Enums.Role.ADMIN,
        fullName: "Platform Admin",
      },
    });
    console.log("Seeded admin:", email);
  }

  if (process.env.STELLAR_NETWORK !== "mainnet") {
    await ensureTestnetIssuerInEnv();
    await ensureTestnetIssuerFunded();
  }

  const escrow = await ensureEscrowInEnv();
  if (escrow.secret && process.env.STELLAR_NETWORK !== "mainnet") {
    await fundEscrowAccount(escrow.secret, escrow.publicKey);
    await bootstrapEscrowUsdc();
  }

  const updated = await prisma.farmerProfile.updateMany({
    where: { verificationStatus: "PENDING" },
    data: { verificationStatus: "VERIFIED" },
  });
  if (updated.count) console.log(`Auto-verified ${updated.count} farmer(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
