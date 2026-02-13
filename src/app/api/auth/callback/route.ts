import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSignedSessionToken,
  type SessionUser,
} from "@/lib/auth";
import { createDbSession } from "@/lib/sessions";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=access_denied", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=no_code", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    return NextResponse.redirect(new URL("/sign-in?error=config", request.url));
  }

  const callbackUrl = new URL("/api/auth/callback", request.url);
  const redirectUri = callbackUrl.toString();

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Google token error:", errText);
    return NextResponse.redirect(new URL("/sign-in?error=token", request.url));
  }

  const tokens = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokens.access_token;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/sign-in?error=token", request.url));
  }

  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/sign-in?error=userinfo", request.url));
  }

  const userInfo = (await userRes.json()) as {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };

  const user: SessionUser = {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name ?? userInfo.email,
    picture: userInfo.picture,
  };

  try {
    const { getOrCreateUser } = await import("@/lib/users");
    await getOrCreateUser(user.id, user.email);
  } catch (e) {
    console.error("Failed to create user in DB:", e);
  }

  // 创建 session token
  let sessionToken: string;
  try {
    sessionToken = await createDbSession(user);
    console.log("Session created in D1, length:", sessionToken.length);
  } catch (e) {
    console.error("D1 session failed, using signed token:", e);
    try {
      sessionToken = await createSignedSessionToken(user);
      console.log("Signed session created, length:", sessionToken.length);
    } catch (e2) {
      console.error("Signed token also failed:", e2);
      return NextResponse.redirect(new URL("/sign-in?error=session", request.url));
    }
  }

  // 直接在 callback 中设置 cookie 并重定向到首页
  // 不使用中间页，减少跳转次数
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: new URL("/", request.url).toString(),
    },
  });
  // 手动设置 Set-Cookie 头，避免 NextResponse 的任何潜在干扰
  const cookieParts = [
    `${SESSION_COOKIE}=${sessionToken}`,
    `Path=/`,
    `Max-Age=${SESSION_MAX_AGE}`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];
  if (request.url.startsWith("https://")) {
    cookieParts.push("Secure");
  }
  response.headers.set("Set-Cookie", cookieParts.join("; "));
  console.log("Set-Cookie header:", response.headers.get("Set-Cookie")?.slice(0, 80) + "...");
  return response;
}
