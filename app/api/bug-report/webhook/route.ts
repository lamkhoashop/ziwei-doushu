import { NextRequest, NextResponse } from "next/server";

declare global {
  var bugStore: Record<string, Array<{ id: string; sender: "user" | "admin"; text: string; time: number }>>;
}
global.bugStore = global.bugStore || {};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    // Kiểm tra nếu là tin nhắn Reply từ Admin
    if (message?.reply_to_message?.text && message?.text) {
      const originalText = message.reply_to_message.text;

      // Tìm mã Ticket dạng #err_xxxx hoặc #zw_xxxx
      const match = originalText.match(/#([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const sessionId = match[1];
        const replyText = message.text.trim();

        if (!global.bugStore[sessionId]) {
          global.bugStore[sessionId] = [];
        }

        global.bugStore[sessionId].push({
          id: `${Date.now()}-admin`,
          sender: "admin",
          text: replyText,
          time: Date.now(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
