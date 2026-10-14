export type Delivery = {
  id: number;
  status: "active" | "completed";
  reward: number;
  pickup_x: number;
  pickup_z: number;
  destination_x: number;
  destination_z: number;
};

type DeliveryResponse = {
  delivery: Delivery | null;
};

export type CompleteDeliveryResponse = {
  message: string;
  reward: number;
  balance: number;
  delivery: Delivery;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export class DeliveryApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "DeliveryApiError";
  }
}

async function deliveryRequest<T>(
  path: string,
  token: string,
  method: "GET" | "POST" = "GET"
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new DeliveryApiError(
      response.status,
      body?.detail ?? `Request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}

export function getActiveDelivery(token: string) {
  return deliveryRequest<DeliveryResponse>(
    "/api/jobs/delivery/active/",
    token
  );
}

export function startDelivery(token: string) {
  return deliveryRequest<{ delivery: Delivery }>(
    "/api/jobs/delivery/start/",
    token,
    "POST"
  );
}

export function completeDelivery(token: string) {
  return deliveryRequest<CompleteDeliveryResponse>(
    "/api/jobs/delivery/complete/",
    token,
    "POST"
  );
}