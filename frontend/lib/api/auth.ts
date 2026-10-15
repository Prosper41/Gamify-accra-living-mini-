const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export async function loginUser(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password.");
  }

  return response.json();
}

export async function getCurrentUser(accessToken: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to retrieve user profile.");
  }

  return response.json();
}
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    const message = data
      ? Object.entries(data)
          .map(([field, errors]) => {
            const detail = Array.isArray(errors)
              ? errors.join(", ")
              : String(errors);

            return `${field}: ${detail}`;
          })
          .join(" | ")
      : "Registration failed.";

    throw new Error(message);
  }
}
