import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.js";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = (req as AuthRequest).auth;
    if (!roles.includes(auth.role)) {
      res.status(403).json({ success: false, error: { message: "Forbidden" } });
      return;
    }
    next();
  };
}
