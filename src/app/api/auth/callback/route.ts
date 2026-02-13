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
  // 用 steps 追踪每一步状态
  const steps: string[] = [];

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(new URL("/sign-in?error=access_denied", request.url));
    }
    if (!code) {
      return NextResponse.redirect(new URL("/sign-in?error=no_code", request.url));
    }
    steps.push("code_ok");

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/sign-in?error=config", request.url));
    }
    steps.push("env_ok");

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
      return NextResponse.redirect(new URL("/sign-in?error=token", request.url));
    }

    const tokens = (await tokenRes.json()) as { access_token?: string };
    const accessToken = tokens.access_token;
    if (!accessToken) {
      return NextResponse.redirect(new URL("/sign-in?error=no_access_token", request.url));
    }
    steps.push("token_ok");

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
    steps.push("user_ok");

    const user: SessionUser = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name ?? userInfo.email,
      picture: userInfo.picture,
    };

    try {
      const { getOrCreateUser } = await import("@/lib/users");
      await getOrCreateUser(user.id, user.email);
      steps.push("db_user_ok");
    } catch (e) {
      steps.push("db_user_fail");
    }

    // 创建 session token
    let sessionToken: string;
    let sessionType = "none";
    try {
      sessionToken = await createDbSession(user);
      sessionType = "d1";
      steps.push("d1_session_ok");
    } catch (e) {
      steps.push("d1_session_fail:" + String(e).slice(0, 50));
      try {
        sessionToken = await createSignedSessionToken(user);
        sessionType = "signed";
        steps.push("signed_session_ok");
      } catch (e2) {
        steps.push("signed_session_fail:" + String(e2).slice(0, 50));
        return NextResponse.redirect(
          new URL(`/sign-in?error=session&steps=${encodeURIComponent(steps.join(","))}`, request.url)
        );
      }
    }

    // 使用 NextResponse.redirect + cookies.set
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      path: "/",
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: request.url.startsWith("https://"),
      sameSite: "lax",
    });
    return response;
  } catch (e) {
    // 捕获任何未处理的异常
    steps.push("UNCAUGHT:" + String(e).slice(0, 100));
    return NextResponse.redirect(
      new URL(`/sign-in?error=crash&steps=${encodeURIComponent(steps.join(","))}`, request.url)
    );
  }
}
