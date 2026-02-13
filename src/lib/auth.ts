import { cookies } from "next/headers";

export const SESSION_COOKIE = "stylelayer_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const HANDOFF_MAX_AGE = 60; // 1 min for OAuth redirect handoff

export function getSessionCookieOptions(requestUrl?: string): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
  domain?: string;
} {
  const isProd = process.env.NODE_ENV === "production";
  const opts: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" as const;
    maxAge: number;
    path: string;
    domain?: string;
  } = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
  // 生产环境显式设置 domain，确保 cookie 在 stylelayer.app 正确持久化
  if (isProd && requestUrl) {
    try {
      const host = new URL(requestUrl).hostname;
      if (host === "stylelayer.app" || host.endsWith(".stylelayer.app")) {
        opts.domain = ".stylelayer.app";
      }
    } catch {
      // ignore
    }
  }
  return opts;
}

/** @deprecated 使用 getSessionCookieOptions 以支持生产 domain */
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

/** 短期 handoff token，用于 OAuth 回调后设置 cookie（避免 redirect 时 cookie 丢失） */
export async function createHandoffToken(user: SessionUser): Promise<string> {
  const secret = await getSecret();
  const payload = {
    user,
    exp: Math.floor(Date.now() / 1000) + HANDOFF_MAX_AGE,
    handoff: true,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(payloadStr));
  const signature = await sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

/** 验证 handoff token 并返回 user，过期或无效返回 null */
export async function verifyHandoffToken(
  token: string
): Promise<SessionUser | null> {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  try {
    const secret = await getSecret();
    if (!(await verify(payloadB64, signature, secret))) return null;

    const payloadStr = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadStr) as {
      user: SessionUser;
      exp: number;
      handoff?: boolean;
    };

    if (!payload.handoff || payload.exp < Date.now() / 1000) return null;
    return payload.user;
  } catch {
    return null;
  }
}

/** 验证 session token 并返回 user，供 getSession 和 middleware 使用 */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
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

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

