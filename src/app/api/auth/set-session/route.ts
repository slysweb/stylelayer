import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 通过 POST 接收 session_id（D1 或签名 token），设置 cookie 后 302 重定向。
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const sessionId = formData.get("session_id") as string | null;

  if (!sessionId || sessionId.length < 16) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_session", request.url));
  }

  const user = await verifySessionToken(sessionId);
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  const opts = getSessionCookieOptions(request.url);
  response.cookies.set(SESSION_COOKIE, sessionId, {
    path: opts.path,
    maxAge: opts.maxAge,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
  });
  return response;
}
