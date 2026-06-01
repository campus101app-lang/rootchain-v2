import type { Request } from "express";
import { env } from "../config/env.js";

/** Origin for absolute asset URLs (uploads). Prefer PUBLIC_URL on Railway/Vercel. */
export function publicOrigin(req?: Pick<Request, "protocol" | "get">): string {
  if (env.PUBLIC_URL) {
    return env.PUBLIC_URL.replace(/\/$/, "");
  }
  if (!req) return "";
  const proto = (req.get("x-forwarded-proto") ?? req.protocol).split(",")[0]!.trim();
  const host = req.get("host") ?? "localhost";
  return `${proto}://${host}`;
}

/** Resolve /uploads/... or full URL to a browser-safe HTTPS asset URL. */
export function toAssetUrl(pathOrUrl: string, req?: Pick<Request, "protocol" | "get">): string {
  if (!pathOrUrl) return pathOrUrl;

  let url: string;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    url = pathOrUrl;
  } else {
    const origin = publicOrigin(req);
    const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    url = `${origin}${path}`;
  }

  if (env.NODE_ENV === "production") {
    url = url.replace(/^http:\/\//i, "https://");
  }

  return url;
}
