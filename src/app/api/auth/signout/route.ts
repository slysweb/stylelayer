import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const opts = getSessionCookieOptions(request.url);
  // 删除 cookie 必须使用与设置时相同的 path 和 domain
  const deleteOpts: Parameters<typeof response.cookies.set>[2] = {
    path: opts.path,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    maxAge: 0,
    expires: new Date(0),
  };
  if (opts.domain) deleteOpts.domain = opts.domain;
  response.cookies.set(SESSION_COOKIE, "", deleteOpts);
  return response;
}
