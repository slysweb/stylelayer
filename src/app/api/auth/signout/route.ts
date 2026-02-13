import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth";
import { deleteDbSession } from "@/lib/sessions";

export async function GET(request: NextRequest) {
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
