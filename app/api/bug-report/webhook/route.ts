import { NextRequest, NextResponse } from "next/server";
import { addAdminMessage, setActiveSession } from "@/lib/bug-report/store";

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
    const token = process.env.TELEGRAM_BOT_TOKEN;

    // ─── 1. Xử lý khi Admin bấm nút Inline: [ 💬 Trả lời Khách (#xxxx) ] ───
    if (body?.callback_query) {
      const cq = body.callback_query;
      const data = cq.data || "";
      const chatId = cq.message?.chat?.id || cq.from?.id;

      if (data.startsWith("reply:")) {
        const sessionId = data.slice(6);
        const ticket = setActiveSession(sessionId);
        const userName = ticket?.userName || `#${sessionId}`;

        // Xác nhận với Telegram là đã bấm nút (ẩn loading)
        if (token && cq.id) {
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: cq.id,
              text: `Đang trả lời cho: ${userName}`,
            }),
          });
        }

        // Bắn tin nhắn kích hoạt khung soạn thảo cho Admin
        if (token && chatId) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✍️ <b>Đang trả lời cho:</b> <code>${escapeHtml(userName)}</code> (<code>#${sessionId}</code>)\n\n<i>Mời bạn gõ câu trả lời vào khung chat bên dưới rồi nhấn Gửi:</i>`,
              parse_mode: "HTML",
              reply_markup: {
                force_reply: true,
                input_field_placeholder: `Gõ phản hồi gửi cho ${userName}...`,
              },
            }),
          });
        }
      }

      return NextResponse.json({ ok: true });
    }

    // ─── 2. Xử lý tin nhắn văn bản từ Admin ───
    const message = body?.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const replyText = message.text.trim();
    const chatId = message.chat?.id;

    // Phản hồi lệnh /start
    if (replyText === "/start") {
      if (token && chatId) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "⛩️ <b>Kênh Báo Lỗi & Hỗ Trợ Kỹ Thuật Tử Vi Đẩu Số đã kết nối!</b>\n\nKhi có báo cáo sự cố, bạn chỉ cần bấm nút <b>[💬 Trả lời]</b> ngay dưới tin nhắn để chọn đúng người cần phản hồi.",
            parse_mode: "HTML",
          }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    // Xác định sessionId mục tiêu:
    let targetSessionId: string | null = null;

    // Cách A: Nếu Admin Reply vào tin nhắn kích hoạt hoặc tin báo lỗi
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

    // Thêm tin nhắn vào store (nếu targetSessionId null, tự lấy phiên vừa được chọn gần nhất)
    const result = addAdminMessage(targetSessionId, replyText);

    // Bắn thông báo xác nhận ngược lại cho Admin trên Telegram
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
            text: `⚠️ <b>Chưa chọn Ticket nào để phản hồi.</b>\n\nVui lòng bấm nút <b>[💬 Trả lời ...]</b> dưới tin nhắn báo sự cố trước khi gõ tin nhắn.`,
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
