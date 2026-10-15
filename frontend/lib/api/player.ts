import type { Player, PlayerPosition, CreatePlayerPayload } from "../../types/player";
import { authFetch } from "@/lib/auth/auth-fetch";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
export class PlayerApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "PlayerApiError";
  }
}
async function playerRequest<T>(endpoint: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const response = await authFetch(`${API_URL}${endpoint}`, accessToken, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) throw new PlayerApiError(response.status, `Player API request failed (${response.status})`);
  return response.json() as Promise<T>;
}
export function getPlayer(accessToken: string): Promise<Player> {
  return playerRequest<Player>("/api/players/me/", accessToken);
}
export function createPlayer(accessToken: string, payload: CreatePlayerPayload): Promise<Player> {
  return playerRequest<Player>("/api/players/me/", accessToken, { method: "POST", body: JSON.stringify(payload) });
}
export function updatePlayerPosition(accessToken: string, position: PlayerPosition): Promise<Player> {
  return playerRequest<Player>("/api/players/me/position/", accessToken, { method: "PATCH", body: JSON.stringify(position) });
}
export function sendHeartbeat(accessToken: string): Promise<unknown> {
  return playerRequest<unknown>("/api/players/heartbeat/", accessToken, { method: "POST" });
}
export function getOnlinePlayers(accessToken: string): Promise<{ online_players: number }> {
  return playerRequest<{ online_players: number }>("/api/players/online/", accessToken);
}
