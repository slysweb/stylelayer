import { cookies } from "next/headers";
import { createDbSession, getSessionByToken } from "./sessions";

export const SESSION_COOKIE = "stylelayer_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const HANDOFF_MAX_AGE = 60; // 1 min for OAuth redirect handoff

export function getSessionCookieOptions(_requestUrl?: string): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
} {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
    // 不设置 domain，使用默认（当前 host），避免显式 domain 导致 cookie 不持久化
  };
}

/** @deprecated 使用 getSessionCookieOptions 以支持生产 domain */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
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
  let secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true });
      secret = (ctx.env as { AUTH_SECRET?: string }).AUTH_SECRET;
    } catch {
      // ignore
    }
  }
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  return secret;
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(data).toString("base64")
      : btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
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

/** 创建 session，存入 D1，返回 session_id 作为 cookie 值 */
export async function createSession(user: SessionUser): Promise<string> {
  return createDbSession(user);
}

/** 短期 handoff token，用于 OAuth 回调后设置 cookie。payload 包含 session_id（在 callback 创建） */
export async function createHandoffToken(
  user: SessionUser,
  sessionId: string
): Promise<string> {
  const secret = await getSecret();
  const payload = {
    user,
    sessionId,
    exp: Math.floor(Date.now() / 1000) + HANDOFF_MAX_AGE,
    handoff: true,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(payloadStr));
  const signature = await sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export type HandoffResult = { user: SessionUser; sessionId: string };

/** 验证 handoff token 并返回 user 和 sessionId，过期或无效返回 null */
export async function verifyHandoffToken(
  token: string
): Promise<HandoffResult | null> {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  try {
    const secret = await getSecret();
    if (!(await verify(payloadB64, signature, secret))) return null;

    const payloadStr = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadStr) as {
      user: SessionUser;
      sessionId: string;
      exp: number;
      handoff?: boolean;
    };

    if (!payload.handoff || !payload.sessionId || payload.exp < Date.now() / 1000)
      return null;
    return { user: payload.user, sessionId: payload.sessionId };
  } catch {
    return null;
  }
}

/** 验证 session token（D1 查询）并返回 user，供 getSession 和 middleware 使用 */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  if (!token || token.length < 16) return null;
  return getSessionByToken(token);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

