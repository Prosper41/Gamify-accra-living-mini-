import type {
  Player,
  PlayerPosition,
  CreatePlayerPayload,
} from "../../types/player";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export class PlayerApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "PlayerApiError";
  }
}

async function playerRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new PlayerApiError(
      response.status,
      `Player API request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}

// QUERY: Retrieve the current player's profile
export function getPlayer(accessToken: string): Promise<Player> {
  return playerRequest<Player>("/api/players/me/", accessToken);
}

// COMMAND: Create a new character
export function createPlayer(
  accessToken: string,
  payload: CreatePlayerPayload
): Promise<Player> {
  return playerRequest<Player>("/api/players/me/", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// COMMAND: Save the player's position
export function updatePlayerPosition(
  accessToken: string,
  position: PlayerPosition
): Promise<Player> {
  return playerRequest<Player>(
    "/api/players/me/position/",
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(position),
    }
  );
}

// COMMAND: Mark the player as active
export function sendHeartbeat(accessToken: string): Promise<unknown> {
  return playerRequest<unknown>(
    "/api/players/heartbeat/",
    accessToken,
    {
      method: "POST",
    }
  );
}

// QUERY: Retrieve the number of online players
export function getOnlinePlayers(
  accessToken: string
): Promise<{ online_players: number }> {
  return playerRequest<{ online_players: number }>(
    "/api/players/online/",
    accessToken
  );
}