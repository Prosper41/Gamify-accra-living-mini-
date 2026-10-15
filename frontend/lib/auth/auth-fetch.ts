import { getAccessToken } from "./session";
import { refreshAccessToken } from "./refresh";

// Always read the latest stored token, even if a game callback holds an old one.
export async function authFetch(url: string, fallbackToken: string, init: RequestInit = {}): Promise<Response> {
  const firstToken = getAccessToken() ?? fallbackToken;
  const send = (token: string) => fetch(url, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const first = await send(firstToken);
  if (first.status !== 401) return first;
  // Another request may already have refreshed the token.
  const current = getAccessToken();
  const renewed = current && current !== firstToken ? current : await refreshAccessToken();
  if (!renewed) return first;
  return send(renewed); // Retry at most once.
}
