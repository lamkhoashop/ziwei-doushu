import { NextRequest, NextResponse } from "next/server";
import { addUserMessage } from "@/lib/bug-report/store";

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
    const { sessionId, name, text, pageUrl, screen, userAgent } = await req.json();
    if (!sessionId || !text) {
      return NextResponse.json({ error: "Thiếu nội dung báo lỗi" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !adminChatId) {
      return NextResponse.json({ error: "Chưa cấu hình Telegram Bot" }, { status: 500 });
    }

    const senderName = name?.trim() || `Khách (#${sessionId.slice(0, 4)})`;

    // Lưu log tin nhắn vào store bền vững
    addUserMessage(sessionId, senderName, text.trim());

    // Soạn tin thông báo HTML an toàn cho Telegram
    const safeName = escapeHtml(senderName);
    const safeText = escapeHtml(text);
    const safeUrl = escapeHtml(pageUrl || "Không rõ");
    const safeScreen = escapeHtml(screen || "Không rõ");
    const safeUa = escapeHtml(userAgent ? userAgent.slice(0, 70) + "..." : "Unknown");

    const messageHtml =
      `🚨 <b>BÁO CÁO SỰ CỐ / LỖI WEBSITE</b>\n` +
      `────────────────────────\n` +
      `👤 <b>Người báo:</b> ${safeName}\n` +
      `📍 <b>Trang lỗi:</b> <code>${safeUrl}</code>\n` +
      `💻 <b>Thiết bị:</b> ${safeScreen} | <i>${safeUa}</i>\n` +
      `🔖 <b>Mã Ticket:</b> <code>#${sessionId}</code>\n\n` +
      `📝 <b>Nội dung sự cố:</b>\n"${safeText}"\n` +
      `────────────────────────\n` +
      `👉 <i>Bấm Reply tin nhắn này hoặc gõ trực tiếp để phản hồi cho người dùng.</i>`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: messageHtml,
        parse_mode: "HTML",
        reply_markup: {
          force_reply: true,
          input_field_placeholder: "Gõ câu trả lời gửi cho khách tại đây...",
        },
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({ error: data.description || "Gửi tin thất bại" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
