import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth";
import { deleteDbSession } from "@/lib/sessions";

/**
 * POST /api/auth/signout — 真正的登出逻辑
 * 使用 POST 防止 Next.js Link prefetch 意外触发登出
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteDbSession(sessionId);
  }
  const opts = getSessionCookieOptions(request.url);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    path: opts.path,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}

/**
 * GET /api/auth/signout — 保留兼容
 * 如果是 RSC prefetch 请求（Next.js Link 自动触发），跳过登出逻辑
 */
export async function GET(request: NextRequest) {
  // 检测 Next.js prefetch，避免误触发登出
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.nextUrl.searchParams.has("_rsc");
  if (isPrefetch) {
    return NextResponse.json({ ok: false, reason: "prefetch ignored" });
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteDbSession(sessionId);
  }
  const response = NextResponse.redirect(new URL("/", request.url));
  const opts = getSessionCookieOptions(request.url);
  response.cookies.set(SESSION_COOKIE, "", {
    path: opts.path,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
