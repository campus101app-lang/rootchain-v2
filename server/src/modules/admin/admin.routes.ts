import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { approveProject, verifyFarmer } from "../projects/project.service.js";
import { decStr } from "../../lib/serialize.js";
import { env } from "../../config/env.js";

function baseUrl(req: { protocol: string; get: (n: string) => string | undefined }) {
  return `${req.protocol}://${req.get("host")}`;
}

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/overview", async (_req, res) => {
  const [farmers, projects, investments, totalRaised] = await Promise.all([
    prisma.farmerProfile.count(),
    prisma.project.count(),
    prisma.investment.count(),
    prisma.investment.aggregate({ _sum: { amountUsdc: true } }),
  ]);
  res.json({
    success: true,
    data: {
      farmers,
      projects,
      investments,
      totalRaisedUsdc: decStr(totalRaised._sum.amountUsdc ?? 0),
      autoApproveFarmers: env.AUTO_APPROVE_FARMERS,
      autoApproveProjects: env.AUTO_APPROVE_PROJECTS,
    },
  });
});

adminRouter.get("/farmers", async (_req, res) => {
  const rows = await prisma.farmerProfile.findMany({
    include: { user: { select: { email: true, fullName: true, country: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    success: true,
    data: rows.map((f) => ({
      id: f.id,
      farmName: f.farmName,
      location: f.location,
      verificationStatus: f.verificationStatus.toLowerCase(),
      user: f.user,
    })),
  });
});

adminRouter.get("/projects", async (req, res) => {
  const rows = await prisma.project.findMany({
    include: {
      farmer: { include: { user: { select: { fullName: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    success: true,
    data: rows.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status.toLowerCase(),
      fundingGoal: decStr(p.fundingGoal),
      raisedAmount: decStr(p.raisedAmount),
      farmer: p.farmer.farmName,
      owner: p.farmer.user.fullName,
    })),
  });
});

adminRouter.post("/farmers/:id/verify", async (req, res) => {
  try {
    await verifyFarmer(req.params.id);
    res.json({ success: true, data: { ok: true } });
  } catch {
    res.status(404).json({ success: false, error: { message: "Not found" } });
  }
});

adminRouter.post("/projects/:id/approve", async (req, res) => {
  try {
    const data = await approveProject(req.params.id, baseUrl(req));
    res.json({ success: true, data });
  } catch {
    res.status(404).json({ success: false, error: { message: "Not found" } });
  }
});

adminRouter.patch("/settings/auto-approve", async (req, res) => {
  const body = z
    .object({
      farmers: z.boolean().optional(),
      projects: z.boolean().optional(),
    })
    .parse(req.body);
  res.json({
    success: true,
    data: {
      note: "Set AUTO_APPROVE_FARMERS / AUTO_APPROVE_PROJECTS in server/.env and restart API",
      requested: body,
      current: {
        farmers: env.AUTO_APPROVE_FARMERS,
        projects: env.AUTO_APPROVE_PROJECTS,
      },
    },
  });
});
