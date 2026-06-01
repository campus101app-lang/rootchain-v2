const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api/v1";

function isProductionMisconfigured(): boolean {
  if (import.meta.env.DEV) return false;
  return !import.meta.env.VITE_API_URL || BASE.startsWith("/");
}

export function getToken(): string | null {
  return localStorage.getItem("rc_v2_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("rc_v2_token", token);
  else localStorage.removeItem("rc_v2_token");
}

export async function api<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (init?.auth !== false) {
    const t = getToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    if (isProductionMisconfigured()) {
      throw new Error(
        "API not configured. Set VITE_API_URL to your Railway URL (e.g. https://xxx.up.railway.app/api/v1) in Vercel → Environment Variables, then redeploy.",
      );
    }
    throw new Error(
      "Cannot reach the API. Start the backend: cd server && npm run dev — then open http://localhost:5173",
    );
  }

  let json: { success: boolean; data?: T; error?: { message: string } };
  try {
    json = (await res.json()) as typeof json;
  } catch {
    const hint = isProductionMisconfigured()
      ? " Set VITE_API_URL to your Railway API URL in Vercel and redeploy."
      : res.status === 404
        ? " The API URL may be wrong (got HTML, not JSON)."
        : "";
    throw new Error(`Invalid response from server (${res.status}).${hint}`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}
