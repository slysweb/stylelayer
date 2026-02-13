import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ credits: null }, { status: 401 });
  }

  const user = await getUserByGoogleId(session.id);
  if (!user) {
    return NextResponse.json({ credits: 0 });
  }

  return NextResponse.json({ credits: user.credits_balance });
}
