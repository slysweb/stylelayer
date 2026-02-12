import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  type SessionUser,
} from "@/lib/auth";

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

  const token = await createSession(user);
  const response = NextResponse.redirect(new URL("/generate", request.url));
  response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return response;
}
