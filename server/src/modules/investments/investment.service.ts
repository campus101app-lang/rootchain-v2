import { InvestmentStatus, ProjectStatus, Role } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { dec, decStr } from "../../lib/serialize.js";
import { decryptSecret } from "../../lib/crypto.js";
import { projectMemo, sendUsdcPayment, verifyUsdcPayment } from "../../stellar/payments.js";
import { escrowPublicKey } from "../../stellar/escrow.js";
import { isTestnet } from "../../stellar/config.js";
import { getUsdcBalance, sendTestnetUsdcTo } from "../../stellar/testnet-liquidity.js";

function formatAmount(amount: number): string {
  return Math.max(amount, 0.0000001).toFixed(7);
}

export async function investInProject(
  userId: string,
  input: { projectId: string; amountUsdc: number; transactionHash?: string },
) {
  if (input.amountUsdc < 0.1) throw new Error("MIN_AMOUNT");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });
  if (!user || user.role !== Role.INVESTOR) throw new Error("NOT_INVESTOR");
  if (!user.wallet?.encryptedSecret) throw new Error("NO_WALLET");
  if (!user.wallet.usdcTrustline) throw new Error("NO_USDC_TRUSTLINE");

  if (isTestnet()) {
    const bal = await getUsdcBalance(user.wallet.publicKey);
    if (bal < input.amountUsdc) {
      await sendTestnetUsdcTo(user.wallet.publicKey, String(Math.max(input.amountUsdc * 2, 50)));
    }
  }

  const project = await prisma.project.findUnique({ where: { id: input.projectId } });
  if (!project || project.status !== ProjectStatus.ACTIVE) throw new Error("PROJECT_NOT_LIVE");

  const goal = dec(project.fundingGoal);
  const raised = dec(project.raisedAmount);
  const remaining = goal - raised;
  if (remaining <= 0) throw new Error("PROJECT_FULLY_FUNDED");
  if (input.amountUsdc > remaining + 0.0000001) throw new Error("EXCEEDS_GOAL");

  const memo = projectMemo(project.id);
  const amountStr = formatAmount(input.amountUsdc);
  let txHash = input.transactionHash;

  if (txHash) {
    const ok = await verifyUsdcPayment({
      txHash,
      fromPublicKey: user.wallet.publicKey,
      amount: amountStr,
      memo,
    });
    if (!ok) throw new Error("TX_VERIFICATION_FAILED");
  } else {
    const secret = decryptSecret(user.wallet.encryptedSecret);
    try {
      const result = await sendUsdcPayment({ fromSecret: secret, amount: amountStr, memo });
      txHash = result.hash;
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      throw new Error(`STELLAR_PAYMENT_FAILED: ${detail}`);
    }
  }

  const existing = await prisma.investment.findUnique({ where: { stellarTxHash: txHash } });
  if (existing) throw new Error("TX_ALREADY_USED");

  const investment = await prisma.$transaction(async (tx) => {
    const inv = await tx.investment.create({
      data: {
        projectId: project.id,
        investorId: userId,
        amountUsdc: input.amountUsdc,
        stellarTxHash: txHash!,
        status: InvestmentStatus.CONFIRMED,
      },
    });

    await tx.project.update({
      where: { id: project.id },
      data: { raisedAmount: { increment: input.amountUsdc } },
    });

    return inv;
  });

  return {
    id: investment.id,
    projectId: investment.projectId,
    amountUsdc: decStr(investment.amountUsdc),
    stellarTxHash: investment.stellarTxHash,
    status: investment.status.toLowerCase(),
    escrowPublicKey: escrowPublicKey(),
    memo,
  };
}

export async function listMyInvestments(userId: string) {
  const rows = await prisma.investment.findMany({
    where: { investorId: userId },
    include: {
      project: {
        include: {
          farmer: { include: { user: { select: { fullName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    amountUsdc: decStr(r.amountUsdc),
    stellarTxHash: r.stellarTxHash,
    status: r.status.toLowerCase(),
    createdAt: r.createdAt.toISOString(),
    project: {
      id: r.project.id,
      title: r.project.title,
      status: r.project.status.toLowerCase(),
      farmName: r.project.farmer.farmName,
    },
  }));
}

export function getInvestQuote(projectId: string, amountUsdc: number) {
  return {
    escrowPublicKey: escrowPublicKey(),
    memo: projectMemo(projectId),
    amountUsdc: formatAmount(amountUsdc),
    asset: "USDC",
  };
}
