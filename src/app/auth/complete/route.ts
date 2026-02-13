import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  verifyHandoffToken,
  SESSION_COOKIE,
  getSessionCookieOptions,
} from "@/lib/auth";

/**
 * OAuth 回调后的中间页：通过 GET 请求设置 cookie，避免 redirect 时 cookie 丢失。
 * 流程：/api/auth/callback -> redirect 到此处（带 handoff token）-> 设置 cookie -> 跳转到 /generate
 *
 * 使用 200 + meta refresh 而非 302，避免 Cloudflare 上 302+Set-Cookie 可能导致的 cookie 不持久化问题。
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
  const targetUrl = new URL("/generate", request.url);

  // 200 + meta refresh：先让浏览器完整接收响应并保存 cookie，再跳转
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${targetUrl.toString()}"></head><body>Redirecting...</body></html>`;
  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  response.cookies.set(
    SESSION_COOKIE,
    sessionToken,
    getSessionCookieOptions(request.url)
  );
  return response;
}
