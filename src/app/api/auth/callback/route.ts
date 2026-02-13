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

  // 使用 NextResponse + cookies.set()，这是 Next.js 标准方式
  const targetUrl = new URL("/", request.url).toString();
  const html = `<!DOCTYPE html><html><head><title>Signing in...</title></head><body><p>Signing in, please wait...</p><script>setTimeout(function(){window.location.href="${targetUrl}"},500);</script></body></html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    path: "/",
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    secure: request.url.startsWith("https://"),
    sameSite: "lax",
  });
  console.log("Cookie set via NextResponse.cookies, token length:", sessionToken.length);
  return response;
}
