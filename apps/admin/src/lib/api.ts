const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api/v1";

export function getToken(): string | null {
  return localStorage.getItem("rc_admin_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("rc_admin_token", token);
  else localStorage.removeItem("rc_admin_token");
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  const t = getToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const json = (await res.json()) as { success: boolean; data?: T; error?: { message: string } };
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  return json.data as T;
}
