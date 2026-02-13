import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { getSessionByToken } from "@/lib/sessions";

export const dynamic = "force-dynamic";

/**
 * 调试接口：检查 cookie 和 session 状态
 * 生产环境可删除或加权限保护
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const hasCookie = !!token;
  let hasSession = false;
  let dbOk = false;

  if (token) {
    try {
      const user = await getSessionByToken(token);
      hasSession = !!user;
      dbOk = true;
    } catch (e) {
      dbOk = false;
    }
  }

  return NextResponse.json({
    hasCookie,
    cookieLength: token?.length ?? 0,
    hasSession,
    dbOk,
  });
}
