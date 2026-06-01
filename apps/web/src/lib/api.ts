const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api/v1";

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
    throw new Error(
      "Cannot reach the API. Start the backend with: cd server && npm run dev — then use http://localhost:5173",
    );
  }

  let json: { success: boolean; data?: T; error?: { message: string } };
  try {
    json = (await res.json()) as typeof json;
  } catch {
    throw new Error(`Invalid response from server (${res.status})`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}
