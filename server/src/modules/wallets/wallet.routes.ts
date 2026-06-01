import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../../middleware/auth.js";
import { createWalletForUser } from "../auth/auth.service.js";
import { isTestnet } from "../../stellar/config.js";
import { StellarNetwork } from "@prisma/client";

export const walletRouter = Router();

walletRouter.use(requireAuth);

walletRouter.get("/me", async (req, res) => {
  const { sub } = (req as AuthRequest).auth;
  const wallet = await prisma.wallet.findUnique({ where: { userId: sub } });
  if (!wallet) {
    res.json({ success: true, data: { wallet: null } });
    return;
  }
  res.json({
    success: true,
    data: {
      wallet: {
        publicKey: wallet.publicKey,
        network: wallet.network.toLowerCase(),
        funded: wallet.funded,
        usdcTrustline: wallet.usdcTrustline,
      },
    },
  });
});

walletRouter.post("/provision", async (req, res) => {
  try {
    const { sub } = (req as AuthRequest).auth;
    const wallet = await createWalletForUser(sub);
    res.json({ success: true, data: { wallet } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Provision failed";
    res.status(500).json({ success: false, error: { message: msg } });
  }
});

walletRouter.post("/connect", async (req, res) => {
  try {
    const { sub } = (req as AuthRequest).auth;
    const { publicKey } = z.object({ publicKey: z.string().min(56).max(56) }).parse(req.body);
    const network = isTestnet() ? StellarNetwork.TESTNET : StellarNetwork.MAINNET;
    const wallet = await prisma.wallet.upsert({
      where: { userId: sub },
      create: { userId: sub, publicKey, network, funded: false, usdcTrustline: false },
      update: { publicKey, encryptedSecret: null },
    });
    res.json({
      success: true,
      data: {
        wallet: {
          publicKey: wallet.publicKey,
          network: wallet.network.toLowerCase(),
          funded: wallet.funded,
          usdcTrustline: wallet.usdcTrustline,
        },
      },
    });
  } catch {
    res.status(400).json({ success: false, error: { message: "Invalid public key" } });
  }
});
