import { cookies } from "next/headers";

export const SESSION_COOKIE = "stylelayer_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_MAX_AGE,
  path: "/",
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

async function getSecret(): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  return secret;
}

function base64UrlEncode(data: Uint8Array): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  return new Uint8Array(Buffer.from(base64, "base64"));
}

async function sign(msg: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(msg)
  );
  return base64UrlEncode(new Uint8Array(sig));
}

async function verify(msg: string, sig: string, secret: string): Promise<boolean> {
  const expected = await sign(msg, secret);
  return sig === expected;
}

export async function createSession(user: SessionUser): Promise<string> {
  const secret = await getSecret();
  const payload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(payloadStr));
  const signature = await sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  try {
    const secret = await getSecret();
    if (!(await verify(payloadB64, signature, secret))) return null;

    const payloadStr = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadStr) as { user: SessionUser; exp: number };

    if (payload.exp < Date.now() / 1000) return null;
    return payload.user;
  } catch {
    return null;
  }
}

