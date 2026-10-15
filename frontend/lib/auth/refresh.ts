import { clearSession, getRefreshToken, saveAccessToken, saveRefreshToken } from "./session";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
let pending: Promise<string | null> | null = null;
async function performRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        if (getRefreshToken() === refresh) clearSession();
      }
      return null;
    }
    const data: { access?: string; refresh?: string } = await response.json();
    if (!data.access) return null;
    // Do not resurrect a session if the user logged out while refreshing.
    if (getRefreshToken() !== refresh) return null;
    saveAccessToken(data.access);
    if (data.refresh) saveRefreshToken(data.refresh);
    return data.access;
  } catch {
    return null; // Network interruption: keep session for later retry.
  }
}
export function refreshAccessToken(): Promise<string | null> {
  if (!pending) pending = performRefresh().finally(() => { pending = null; });
  return pending;
}
