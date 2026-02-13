import { NextRequest, NextResponse } from "next/server";
import { verifyHandoffToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * OAuth 回调后的中间页：通过 GET 请求设置 cookie，避免 redirect 时 cookie 丢失。
 * 流程：/api/auth/callback -> redirect 到此处（带 handoff token）-> 设置 cookie -> 跳转到首页
 *
 * 使用 200 + meta refresh 而非 302，避免 Cloudflare 上 302+Set-Cookie 可能导致的 cookie 不持久化问题。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in?error=no_token", request.url));
  }

  const handoff = await verifyHandoffToken(token);
  if (!handoff) {
    return NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
  }

  const sessionId = handoff.sessionId;
  const setSessionUrl = new URL("/api/auth/set-session", request.url);

  // 使用 form POST 到 set-session，由该接口设置 cookie 并 302 重定向
  // 某些环境下 POST 响应的 Set-Cookie 比 200+meta 更可靠
  const html = `<!DOCTYPE html><html><head><title>Signing in...</title></head><body>
    <p>Signing in...</p>
    <form id="f" method="POST" action="${setSessionUrl.toString()}">
      <input type="hidden" name="session_id" value="${sessionId}" />
    </form>
    <script>document.getElementById("f").submit();</script>
  </body></html>`;
  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
  return response;
}
