import bcrypt from "bcryptjs";
import { FarmerVerificationStatus, Role } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { signAccessToken } from "./jwt.js";
import { isTestnet } from "../../stellar/config.js";
import { StellarNetwork } from "@prisma/client";
import { encryptSecret } from "../../lib/crypto.js";
import { provisionStellarWallet } from "../../stellar/wallet-provision.js";
import { getUsdcBalance, sendTestnetUsdcTo } from "../../stellar/testnet-liquidity.js";

function toRole(r: "investor" | "farmer"): Role {
  return r === "farmer" ? Role.FARMER : Role.INVESTOR;
}

function mapUser(u: { id: string; email: string; role: Role; fullName: string }) {
  return {
    id: u.id,
    email: u.email,
    role: u.role.toLowerCase() as "investor" | "farmer" | "admin",
    fullName: u.fullName,
  };
}

export async function register(input: {
  role: "investor" | "farmer";
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  country?: string;
  farmName?: string;
  location?: string;
  provisionWallet?: boolean;
}) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("EMAIL_IN_USE");

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: toRole(input.role),
        fullName: input.fullName.trim(),
        phone: input.phone?.trim(),
        country: input.country?.trim(),
      },
    });

    if (input.role === "farmer") {
      await tx.farmerProfile.create({
        data: {
          userId: created.id,
          farmName: input.farmName?.trim() || `${input.fullName} Farm`,
          location: input.location?.trim() || input.country || "Pending",
          verificationStatus: env.AUTO_APPROVE_FARMERS
            ? FarmerVerificationStatus.VERIFIED
            : FarmerVerificationStatus.PENDING,
        },
      });
    }

    return created;
  });

  let wallet = null;
  if (input.provisionWallet !== false) {
    wallet = await createWalletForUser(user.id);
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });

  return {
    user: mapUser(user),
    accessToken,
    wallet,
  };
}

export async function createWalletForUser(userId: string) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) {
    return {
      publicKey: existing.publicKey,
      network: existing.network.toLowerCase(),
      funded: existing.funded,
      usdcTrustline: existing.usdcTrustline,
    };
  }

  const provision = await provisionStellarWallet();
  const network = isTestnet() ? StellarNetwork.TESTNET : StellarNetwork.MAINNET;

  const row = await prisma.wallet.create({
    data: {
      userId,
      publicKey: provision.publicKey,
      network,
      encryptedSecret: encryptSecret(provision.secret),
      funded: provision.funded,
      usdcTrustline: provision.usdcTrustline,
    },
  });

  let testnetUsdcTx: string | null = null;
  if (isTestnet() && provision.usdcTrustline) {
    const bal = await getUsdcBalance(row.publicKey);
    if (bal < 10) {
      testnetUsdcTx = await sendTestnetUsdcTo(row.publicKey, "100");
    }
  }

  return {
    publicKey: row.publicKey,
    network: row.network.toLowerCase(),
    funded: row.funded,
    usdcTrustline: row.usdcTrustline,
    warnings: provision.warnings,
    fundingHash: provision.fundingHash,
    trustlineHash: provision.trustlineHash,
    testnetUsdcTx,
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) throw new Error("INVALID_CREDENTIALS");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  const accessToken = signAccessToken({ sub: user.id, role: user.role });

  return {
    user: mapUser(user),
    accessToken,
    wallet: wallet
      ? {
          publicKey: wallet.publicKey,
          network: wallet.network.toLowerCase(),
          funded: wallet.funded,
          usdcTrustline: wallet.usdcTrustline,
        }
      : null,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true, farmerProfile: true },
  });
  if (!user) throw new Error("NOT_FOUND");
  return {
    user: mapUser(user),
    wallet: user.wallet
      ? {
          publicKey: user.wallet.publicKey,
          network: user.wallet.network.toLowerCase(),
          funded: user.wallet.funded,
          usdcTrustline: user.wallet.usdcTrustline,
        }
      : null,
    farmerProfile: user.farmerProfile
      ? {
          farmName: user.farmerProfile.farmName,
          location: user.farmerProfile.location,
          verificationStatus: user.farmerProfile.verificationStatus.toLowerCase(),
        }
      : null,
  };
}
