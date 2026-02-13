import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  verifyHandoffToken,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";

/**
 * OAuth 回调后的中间页：通过 GET 请求设置 cookie，避免 redirect 时 cookie 丢失。
 * 流程：/api/auth/callback -> redirect 到此处（带 handoff token）-> 设置 cookie -> redirect 到 /generate
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in?error=no_token", request.url));
  }

  const user = await verifyHandoffToken(token);
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
  }

  const sessionToken = await createSession(user);
  const response = NextResponse.redirect(new URL("/generate", request.url));
  response.cookies.set(SESSION_COOKIE, sessionToken, SESSION_COOKIE_OPTIONS);
  return response;
}
