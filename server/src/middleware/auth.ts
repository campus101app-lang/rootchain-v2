import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/jwt.js";

export type AuthRequest = Request & { auth: { sub: string; role: string } };

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing token" } });
    return;
  }
  try {
    const auth = verifyAccessToken(header.slice(7));
    (req as AuthRequest).auth = auth;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } });
  }
}
