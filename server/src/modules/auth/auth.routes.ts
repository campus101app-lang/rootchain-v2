import { Router } from "express";
import { z } from "zod";
import { register, login, getMe } from "./auth.service.js";
import { requireAuth, type AuthRequest } from "../../middleware/auth.js";

const registerSchema = z.object({
  role: z.enum(["investor", "farmer"]),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  country: z.string().optional(),
  farmName: z.string().optional(),
  location: z.string().optional(),
  provisionWallet: z.boolean().optional(),
});

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const data = await register(body);
    res.json({ success: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Register failed";
    const status = msg === "EMAIL_IN_USE" ? 409 : 400;
    res.status(status).json({ success: false, error: { message: msg } });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(req.body);
    const data = await login(email, password);
    res.json({ success: true, data });
  } catch {
    res.status(401).json({ success: false, error: { message: "Invalid credentials" } });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const { sub } = (req as AuthRequest).auth;
    const data = await getMe(sub);
    res.json({ success: true, data });
  } catch {
    res.status(404).json({ success: false, error: { message: "Not found" } });
  }
});
