import { authFetch } from "@/lib/auth/auth-fetch";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
export type ShopItem = {
  id: number;
  name: string;
  price: number | string;
  energy_restore: number;
  is_available?: boolean;
};
async function request<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await authFetch(`${API_BASE}${path}`, token, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body && typeof body === "object" && "detail" in body ? String(body.detail) : `Shop request failed (${response.status})`;
    throw new Error(detail);
  }
  return body as T;
}
export async function getShopItems(token: string): Promise<ShopItem[]> {
  const data = await request<ShopItem[] | { items: ShopItem[] }>(token, "/api/shops/items/");
  return Array.isArray(data) ? data : data.items;
}
export async function purchaseShopItem(token: string, itemId: number): Promise<unknown> {
  return request<unknown>(token, "/api/shops/purchase/", {
    method: "POST", body: JSON.stringify({ item_id: itemId }),
  });
}
