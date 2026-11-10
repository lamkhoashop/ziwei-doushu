import { NextRequest, NextResponse } from "next/server";

declare global {
  var bugStore: Record<string, Array<{ id: string; sender: "user" | "admin"; text: string; time: number }>>;
}
global.bugStore = global.bugStore || {};

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ messages: [] });
  }

  const list = global.bugStore[sessionId] || [];
  return NextResponse.json({ messages: list });
}
