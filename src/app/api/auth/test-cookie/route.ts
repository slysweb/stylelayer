import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 测试端点：设置一个简单 cookie 并返回 JSON。
 * 访问后检查浏览器 DevTools → Application → Cookies 是否出现 test_cookie。
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ ok: true, time: Date.now() });
  response.cookies.set("test_cookie", "hello_" + Date.now(), {
    path: "/",
    maxAge: 3600,
    httpOnly: true,
    secure: request.url.startsWith("https://"),
    sameSite: "lax",
  });
  return response;
}
