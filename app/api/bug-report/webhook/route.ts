import { NextRequest, NextResponse } from "next/server";
import { addAdminMessage } from "@/lib/bug-report/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const replyText = message.text.trim();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = message.chat?.id;

    // 1. Phản hồi lệnh /start
    if (replyText === "/start") {
      if (token && chatId) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "⛩️ <b>Kênh Báo Lỗi & Hỗ Trợ Kỹ Thuật Tử Vi Đẩu Số đã kết nối!</b>\n\nKhi có người dùng gửi phản ánh, bạn có thể bấm <b>Reply (Trả lời)</b> tin nhắn đó hoặc <b>gõ nhắn trực tiếp</b> để trả lời.",
            parse_mode: "HTML",
          }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Trích xuất sessionId mục tiêu:
    let targetSessionId: string | null = null;

    // Cách A: Nếu Admin dùng tính năng Reply tin nhắn Telegram
    if (message.reply_to_message?.text) {
      const match = message.reply_to_message.text.match(/#([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        targetSessionId = match[1];
      }
    }

    // Cách B: Nếu trong tin nhắn admin tự gõ có chứa mã #err_xxxx
    if (!targetSessionId) {
      const matchDirect = replyText.match(/#([a-zA-Z0-9_-]+)/);
      if (matchDirect && matchDirect[1]) {
        targetSessionId = matchDirect[1];
      }
    }

    // 3. Thêm tin nhắn vào store (nếu targetSessionId null, hàm addAdminMessage sẽ tự động lấy ticket gần nhất)
    const result = addAdminMessage(targetSessionId, replyText);

    // 4. Bắn thông báo xác nhận ngược lại cho Admin trên Telegram
    if (token && chatId) {
      if (result.success && result.targetSessionId) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            reply_to_message_id: message.message_id,
            text: `✅ <b>Đã chuyển phản hồi tới:</b> <code>${escapeHtml(result.userName)}</code> (<code>#${result.targetSessionId}</code>)\n\n💬 <i>"${escapeHtml(replyText)}"</i>`,
            parse_mode: "HTML",
          }),
        });
      } else {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            reply_to_message_id: message.message_id,
            text: `⚠️ <b>Chưa tìm thấy người dùng nào vừa báo lỗi.</b>\n\nVui lòng bấm <b>Reply (Trả lời)</b> vào tin nhắn báo lỗi hoặc đợi người dùng gửi phản ánh.`,
            parse_mode: "HTML",
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
