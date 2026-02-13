import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ credits: null }, { status: 401 });
    }

    const user = await getUserByGoogleId(session.id);
    if (!user) {
      return NextResponse.json({ credits: 0 });
    }

    return NextResponse.json({ credits: user.credits_balance });
  } catch (e) {
    console.error("GET /api/user/credits error:", e);
    return NextResponse.json(
      { credits: 0, error: "Database unavailable" },
      { status: 200 }
    );
  }
}
