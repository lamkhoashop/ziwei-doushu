import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/bug-report/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ messages: [] });
  }

  const list = getMessages(sessionId);
  return NextResponse.json(
    { messages: list },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
