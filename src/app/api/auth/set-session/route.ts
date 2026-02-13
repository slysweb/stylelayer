import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth";
import { getSessionByToken } from "@/lib/sessions";

export const dynamic = "force-dynamic";

/**
 * 通过 POST 接收 session_id，设置 cookie 后 302 重定向。
 * 用于 auth/complete 后的二次请求，某些环境下 POST+302 的 Set-Cookie 比 200+meta 更可靠。
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const sessionId = formData.get("session_id") as string | null;

  if (!sessionId || sessionId.length < 16) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_session", request.url));
  }

  const user = await getSessionByToken(sessionId);
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
