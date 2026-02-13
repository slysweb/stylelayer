import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { getSessionByToken } from "@/lib/sessions";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * 调试接口：全面检查 cookie、D1、session 状态
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const allCookies = request.cookies.getAll().map((c) => c.name);

  let dbAvailable = false;
  let dbError: string | null = null;
  try {
    const db = await getDb();
    dbAvailable = !!db;
    if (db) {
      // 测试查询
      await db.prepare("SELECT 1").first();
    }
  } catch (e) {
    dbError = String(e);
  }

  let sessionValid = false;
  let sessionError: string | null = null;
  if (token) {
    try {
      const user = await getSessionByToken(token);
      sessionValid = !!user;
    } catch (e) {
      sessionError = String(e);
    }
  }

  let envCheck = {
    hasAuthSecret: false,
    hasGoogleClientId: false,
    hasGoogleClientSecret: false,
    nodeEnv: process.env.NODE_ENV ?? "undefined",
  };
  try {
    envCheck.hasAuthSecret = !!(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32);
    envCheck.hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID;
    envCheck.hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  } catch {
    // ignore
  }

  // 尝试从 getCloudflareContext 获取环境变量
  let cfEnvCheck: Record<string, boolean> = {};
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as Record<string, unknown>;
    cfEnvCheck = {
      hasDB: !!env.DB,
      hasAuthSecret: !!(env.AUTH_SECRET && String(env.AUTH_SECRET).length >= 32),
      hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!env.GOOGLE_CLIENT_SECRET,
    };
  } catch (e) {
    cfEnvCheck = { error: true };
  }

  return NextResponse.json({
    cookie: {
      hasSessionCookie: !!token,
      cookieLength: token?.length ?? 0,
      allCookieNames: allCookies,
    },
    db: {
      available: dbAvailable,
      error: dbError,
    },
    session: {
      valid: sessionValid,
      error: sessionError,
    },
    processEnv: envCheck,
    cloudflareEnv: cfEnvCheck,
  });
}
