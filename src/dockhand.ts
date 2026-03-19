import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.DOCKHAND_URL ?? "";
const USERNAME = process.env.DOCKHAND_USERNAME ?? "";
const PASSWORD = process.env.DOCKHAND_PASSWORD ?? "";

let sessionCookie: string | null = null;

async function login(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });

  if (!res.ok) {
    throw new Error(`Dockhand login failed: ${res.status} ${res.statusText}`);
  }

  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No session cookie returned from Dockhand login");
  }

  // Extract the dockhand_session cookie value
  const match = setCookie.match(/dockhand_session=[^;]+/);
  if (!match) {
    throw new Error("dockhand_session cookie not found in login response");
  }

  sessionCookie = match[0];
}

export async function dockhandRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!sessionCookie) {
    await login();
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Cookie: sessionCookie!,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    // Session expired — re-login and retry once
    sessionCookie = null;
    await login();

    const retry = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        Cookie: sessionCookie!,
        "Content-Type": "application/json",
      },
    });

    if (!retry.ok) {
      throw new Error(`Dockhand API error: ${retry.status} ${retry.statusText}`);
    }

    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    throw new Error(`Dockhand API error: ${res.status} ${res.statusText}`);
  }

  // Some endpoints return 204 No Content
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}
