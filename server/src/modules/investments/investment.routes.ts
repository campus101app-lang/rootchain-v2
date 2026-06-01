import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { getInvestQuote, investInProject, listMyInvestments } from "./investment.service.js";

export const investmentRouter = Router();

investmentRouter.get("/mine", requireAuth, requireRole("INVESTOR"), async (req, res) => {
  try {
    const { sub } = (req as AuthRequest).auth;
    const data = await listMyInvestments(sub);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: e instanceof Error ? e.message : "Error" } });
  }
});

investmentRouter.get("/quote/:projectId", requireAuth, async (req, res) => {
  try {
    const amount = z.coerce.number().positive().parse(String(req.query.amount ?? "10"));
    const data = getInvestQuote(String(req.params.projectId), amount);
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: { message: e instanceof Error ? e.message : "Error" } });
  }
});

investmentRouter.post("/", requireAuth, requireRole("INVESTOR"), async (req, res) => {
  try {
    const body = z
      .object({
        projectId: z.string().uuid(),
        amountUsdc: z.coerce.number().positive(),
        transactionHash: z.string().optional(),
      })
      .parse(req.body);
    const { sub } = (req as AuthRequest).auth;
    const data = await investInProject(sub, body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Investment failed";
    const status =
      msg === "NOT_INVESTOR" || msg === "NO_WALLET" || msg === "NO_USDC_TRUSTLINE"
        ? 403
        : msg === "PROJECT_NOT_LIVE" || msg === "PROJECT_FULLY_FUNDED" || msg === "EXCEEDS_GOAL"
          ? 400
          : 400;
    res.status(status).json({ success: false, error: { message: msg } });
  }
});
