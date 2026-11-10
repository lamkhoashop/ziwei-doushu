# HƯỚNG DẪN TÍCH HỢP HỆ THỐNG BÁO LỖI & PHẢN HỒI SỰ CỐ QUA TELEGRAM BOT
## Dành Riêng Cho Hệ Thống Tử Vi Đẩu Số (Ziwei-Master)

Kênh này được tối ưu chuyên biệt cho mục đích: **Tiếp nhận phản ánh lỗi, sự cố kỹ thuật và giải đáp khắc phục 2 chiều trực tiếp giữa Người dùng và Quản trị viên (Admin) qua Telegram**.

Hệ thống được thiết kế **tự động đính kèm thông tin trang, thiết bị và ngữ cảnh lá số** khi người dùng báo lỗi, giúp bạn tái hiện và xử lý sự cố ngay lập tức.

---

### MỤC LỤC
1. [Nguyên Lý Hoạt Động Kênh Báo Lỗi](#1-nguyên-lý-hoạt-động-kênh-báo-lỗi)
2. [Cấu Hình Biến Môi Trường (.env.local)](#2-cấu-hình-biến-môi-trường-envlocal)
3. [Mã Nguồn Backend (Thu Thập Lỗi & Chuyển Tiếp Telegram)](#3-mã-nguồn-backend-thu-thập-lỗi--chuyển-tiếp-telegram)
4. [Giao Diện Widget Báo Lỗi Tinh Tế (UI Component)](#4-giao-diện-widget-báo-lỗi-tinh-tế-ui-component)
5. [Quy Trình Phản Hồi Giải Pháp](#5-quy-trình-phản-hồi-giải-pháp)

---

### 1. NGUYÊN LÝ HOẠT ĐỘNG KÊNH BÁO LỖI

```
Người Dùng Trên Web                     Hệ Thống Backend                     Admin Trên Telegram
         │                                      │                                      │
         ├──── 1. Bấm "Báo lỗi / Góp ý" ───────►│                                      │
         │     (Tự lấy URL, thiết bị,           ├──── 2. Bắn Ticket sự cố ────────────►│
         │      lỗi màn hình, ghi log)          │     (Kèm đầy đủ thông số debug)      │
         │                                      │                                      │
         │                                      │                                      ├─ 3. Kiểm tra mã lỗi
         │                                      │                                      │     Bấm "Reply" trên app
         │                                      │◄─── 4. Nhận giải pháp (Webhook) ─────┤     "Đã fix / Bạn F5 lại nhé"
         │◄─── 5. Hiện phản hồi ngay màn hình ──┤                                      │
```

---

### 2. CẤU HÌNH BIẾN MÔI TRƯỜNG (.env.local)

Điền token bot và chat ID của bạn vào `E:\0AITool\ziwei-doushu\.env.local`:

```env
# ─── Telegram Bot Tiếp Nhận Sự Cố ───
TELEGRAM_BOT_TOKEN=7123456789:AAFn_your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=123456789
```

---

### 3. MÃ NGUỒN BACKEND

#### 1. File nhận báo cáo lỗi: `app/api/bug-report/send/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

declare global {
  var bugReportsStore: Record<string, Array<{ id: string; sender: "user" | "admin"; text: string; time: number }>>;
}
global.bugReportsStore = global.bugReportsStore || {};

export async function POST(req: NextRequest) {
  try {
    const { sessionId, name, text, pageUrl, userAgent, screen } = await req.json();
    if (!sessionId || !text) {
      return NextResponse.json({ error: "Thiếu nội dung báo lỗi" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    const senderName = name?.trim() || `Ẩn danh (#${sessionId.slice(0, 4)})`;

    // 1. Lưu log tin nhắn
    if (!global.bugReportsStore[sessionId]) global.bugReportsStore[sessionId] = [];
    global.bugReportsStore[sessionId].push({
      id: `${Date.now()}-user`,
      sender: "user",
      text,
      time: Date.now(),
    });

    // 2. Định dạng thông báo Ticket sự cố chi tiết gửi về Telegram
    const telegramMessage =
      `🚨 *BÁO CÁO SỰ CỐ / LỖI WEBSITE*\n` +
      `────────────────────────\n` +
      `👤 *Người báo:* ${senderName}\n` +
      `📍 *Trang bị lỗi:* \`${pageUrl || "Không rõ"}\`\n` +
      `💻 *Môi trường:* \`${screen || ""}\` | \`${userAgent ? userAgent.slice(0, 60) + "..." : "Unknown"}\`\n` +
      `🔖 *Mã Ticket:* \`#${sessionId}\`\n\n` +
      `📝 *Mô tả lỗi:*\n"${text}"\n` +
      `────────────────────────\n` +
      `👉 _Bấm Reply (Trả lời) tin nhắn này để hướng dẫn xử lý hoặc thông báo sửa xong cho người dùng._`;

    // 3. Gửi sang Telegram
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: telegramMessage,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

#### 2. File Webhook nhận câu trả lời sửa lỗi từ Admin: `app/api/bug-report/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    // Kiểm tra nếu Admin Reply vào tin nhắn của Bot
    if (message?.reply_to_message?.text && message?.text) {
      const originalText = message.reply_to_message.text;

      // Trích xuất mã Ticket dạng #zw_xxxx
      const match = originalText.match(/#([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const sessionId = match[1];
        const adminReplyText = message.text;

        global.bugReportsStore = global.bugReportsStore || {};
        if (!global.bugReportsStore[sessionId]) global.bugReportsStore[sessionId] = [];

        global.bugReportsStore[sessionId].push({
          id: `${Date.now()}-admin`,
          sender: "admin",
          text: adminReplyText,
          time: Date.now(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}
```

#### 3. File lấy phản hồi mới: `app/api/bug-report/messages/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ messages: [] });

  global.bugReportsStore = global.bugReportsStore || {};
  return NextResponse.json({ messages: global.bugReportsStore[sessionId] || [] });
}
```

---

### 4. GIAO DIỆN WIDGET BÁO LỖI TINH TẾ (UI COMPONENT)

Tạo file `components/BugReportWidget.tsx`:
- Nút bấm nhỏ gọn, tinh tế ở góc dưới màn hình: **"Báo lỗi"** hoặc icon cờ sự cố.
- Tự động lấy URL hiện tại và thông tin trình duyệt gửi kèm để admin dễ sửa.
- Phù hợp với phong cách trang nhã của website Tử Vi.

```tsx
"use client";

import React, { useState, useEffect, useRef } from "react";

export default function BugReportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; sender: "user" | "admin"; text: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sid = localStorage.getItem("ziwei_bug_sid");
    if (!sid) {
      sid = "err_" + Math.random().toString(36).substring(2, 8);
      localStorage.setItem("ziwei_bug_sid", sid);
    }
    setSessionId(sid);
    setName(localStorage.getItem("ziwei_bug_name") || "");
  }, []);

  // Lắng nghe phản hồi từ Admin
  useEffect(() => {
    if (!isOpen || !sessionId) return;
    const fetchReplies = async () => {
      try {
        const res = await fetch(`/api/bug-report/messages?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } catch (e) {}
    };

    fetchReplies();
    const timer = setInterval(fetchReplies, 3000);
    return () => clearInterval(timer);
  }, [isOpen, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    const reportContent = text.trim();
    setText("");
    setSubmitting(true);

    if (name) localStorage.setItem("ziwei_bug_name", name);

    // Cập nhật màn hình ngay lập tức
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: reportContent }]);

    try {
      await fetch("/api/bug-report/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name,
          text: reportContent,
          pageUrl: typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          screen: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "",
        }),
      });
      setSentSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-serif">
      {/* Nút nhỏ gọn kín đáo */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#FAF8F5] border border-[#ECEAE4] hover:border-[#B8922A] text-[#4A4A45] hover:text-[#0D0D0B] px-3.5 py-2 rounded-full shadow-sm hover:shadow transition-all text-xs"
          title="Phản ánh sự cố hoặc góp ý"
        >
          <span className="text-[#A83228]">⚠</span>
          <span>Báo lỗi / Góp ý</span>
        </button>
      )}

      {/* Cửa sổ tiếp nhận sự cố */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-[#FAFAF9] border border-[#ECEAE4] rounded-xl shadow-xl flex flex-col overflow-hidden text-[#1A1A18]">
          {/* Tiêu đề */}
          <div className="bg-[#F4F3EF] border-b border-[#ECEAE4] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#A83228] font-bold text-sm">⚠</span>
              <span className="text-xs font-semibold text-[#0D0D0B]">Phản Ánh Sự Cố Kỹ Thuật</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8A8A82] hover:text-[#0D0D0B] text-sm"
            >
              ✕
            </button>
          </div>

          {/* Lịch sử tin nhắn / trao đổi */}
          <div className="h-64 overflow-y-auto p-3.5 space-y-2.5 bg-white text-xs">
            {messages.length === 0 ? (
              <div className="text-[#8A8A82] text-center py-6 leading-relaxed">
                Nếu gặp lỗi hiển thị, sai khác cách cục an sao hoặc tính năng chưa phản hồi, xin hãy mô tả vắn tắt bên dưới. Kỹ thuật viên sẽ kiểm tra và phản hồi trực tiếp qua đây.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="text-[10px] text-[#8A8A82] mb-0.5">
                    {m.sender === "user" ? "Nội dung bạn gửi" : "Kỹ thuật viên phản hồi"}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#F4F3EF] border border-[#ECEAE4] text-[#1A1A18]"
                        : "bg-[#FAFAF0] border border-[#B8922A]/40 text-[#0D0D0B] font-medium"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form gửi lỗi */}
          <form onSubmit={handleSubmit} className="p-3 bg-[#FAF8F5] border-t border-[#ECEAE4] flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên / SĐT (tùy chọn)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-1/3 bg-white border border-[#ECEAE4] rounded px-2 py-1 text-[11px] outline-none focus:border-[#B8922A]"
              />
              <input
                type="text"
                placeholder="Mô tả sự cố bạn gặp..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 bg-white border border-[#ECEAE4] rounded px-2.5 py-1 text-xs outline-none focus:border-[#B8922A]"
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-[#8A8A82]">
                {sentSuccess ? "✓ Đã gửi thông báo đến kỹ thuật" : "Tự động kèm thông số trang bị lỗi"}
              </span>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="bg-[#0D0D0B] text-white px-3 py-1 rounded text-xs hover:bg-[#4A4A45] transition-colors disabled:opacity-40"
              >
                Gửi phản ánh
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
```

---

### 5. QUY TRÌNH PHẢN HỒI GIẢI PHÁP

1. **Khi có lỗi**: Người dùng chỉ cần gõ nội dung (ví dụ: *"Bấm vào nút luận giải AI bị xoay tròn không ra chữ"*).
2. **Telegram nhận thông báo**: Bạn biết ngay họ đang mở ở URL nào, màn hình bao nhiêu, lỗi gì.
3. **Admin xử lý**: Bạn chỉ việc ấn **Reply** trên tin nhắn Telegram (ví dụ: *"Đã khởi động lại server AI, bạn F5 lại trang giúp mình nhé"*).
4. **Khách nhận ngay**: Nội dung phản hồi hiển thị lập tức trong khung báo lỗi của khách.
