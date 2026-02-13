import { NextRequest, NextResponse } from "next/server";
import {
  createHandoffToken,
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

  // 优先 D1 session；失败时 fallback 到签名 token（依赖 AUTH_SECRET）
  let sessionId: string;
  try {
    sessionId = await createDbSession(user);
  } catch (e) {
    console.error("Failed to create session in D1, using signed token fallback:", e);
    try {
      sessionId = await createSignedSessionToken(user);
    } catch (e2) {
      console.error("Signed token fallback also failed:", e2);
      return NextResponse.redirect(new URL("/sign-in?error=session", request.url));
    }
  }

  const handoffToken = await createHandoffToken(user, sessionId);
  const completeUrl = new URL("/auth/complete", request.url);
  completeUrl.searchParams.set("token", handoffToken);
  return NextResponse.redirect(completeUrl);
}
