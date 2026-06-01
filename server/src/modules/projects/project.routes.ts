import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import {
  createProject,
  getProject,
  listFarmerProjects,
  listMarketplace,
  listMarketplaceFeatured,
} from "./project.service.js";

function baseUrl(req: { protocol: string; get: (n: string) => string | undefined }) {
  return `${req.protocol}://${req.get("host")}`;
}

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  category: z.string().min(2).max(64),
  farmPlan: z.string().min(10).max(10000),
  landPhotoUrls: z.array(z.string()).default([]),
  idDocumentUrl: z.string().optional(),
  fundingGoal: z.coerce.number().positive().max(10_000_000),
  expectedRoi: z.coerce.number().min(0).max(1000),
  durationDays: z.coerce.number().int().min(7).max(3650),
  startDate: z.string(),
  endDate: z.string(),
});

export const projectRouter = Router();

projectRouter.get("/marketplace/featured", async (req, res) => {
  try {
    const data = await listMarketplaceFeatured(baseUrl(req));
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: e instanceof Error ? e.message : "Error" } });
  }
});

projectRouter.get("/marketplace", async (req, res) => {
  try {
    const data = await listMarketplace(baseUrl(req));
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: e instanceof Error ? e.message : "Error" } });
  }
});

projectRouter.get("/mine", requireAuth, requireRole("FARMER"), async (req, res) => {
  try {
    const { sub } = (req as AuthRequest).auth;
    const data = await listFarmerProjects(sub, baseUrl(req));
    res.json({ success: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    res.status(msg === "NOT_FARMER" ? 403 : 500).json({ success: false, error: { message: msg } });
  }
});

projectRouter.get("/:id", async (req, res) => {
  try {
    const data = await getProject(req.params.id, baseUrl(req));
    res.json({ success: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    res.status(msg === "NOT_FOUND" ? 404 : 500).json({ success: false, error: { message: msg } });
  }
});

projectRouter.post("/", requireAuth, requireRole("FARMER"), async (req, res) => {
  try {
    const body = createSchema.parse(req.body);
    const { sub } = (req as AuthRequest).auth;
    const data = await createProject(sub, body, baseUrl(req));
    res.status(201).json({ success: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "NOT_FARMER" || msg === "FARMER_NOT_VERIFIED"
        ? 403
        : msg === "INVALID_DATES"
          ? 400
          : 400;
    res.status(status).json({ success: false, error: { message: msg } });
  }
});
