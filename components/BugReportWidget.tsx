'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  time?: number;
}

export default function BugReportWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [hasNewReply, setHasNewReply] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  // Khởi tạo mã định danh thiết bị
  useEffect(() => {
    setMounted(true);
    let sid = localStorage.getItem('zw_bug_sid');
    if (!sid) {
      sid = 'err_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('zw_bug_sid', sid);
    }
    setSessionId(sid);
    setName(localStorage.getItem('zw_bug_name') || '');
  }, []);

  // Lắng nghe phản hồi từ Telegram Admin
  useEffect(() => {
    if (!sessionId) return;

    const fetchReplies = async () => {
      try {
        const res = await fetch(`/api/bug-report/messages?sessionId=${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          // Báo hiệu nếu có tin nhắn mới từ Admin khi đang đóng widget
          if (data.messages.length > prevCountRef.current) {
            const lastMsg = data.messages[data.messages.length - 1];
            if (lastMsg && lastMsg.sender === 'admin' && !isOpen) {
              setHasNewReply(true);
            }
          }
          prevCountRef.current = data.messages.length;
          setMessages(data.messages);
        }
      } catch {}
    };

    fetchReplies();
    // Thăm dò nhanh hơn khi đang mở hộp thoại (2.5s) và 6s khi đang đóng
    const interval = setInterval(fetchReplies, isOpen ? 2500 : 6000);
    return () => clearInterval(interval);
  }, [sessionId, isOpen]);

  // Tự động cuộn xuống đáy khi có tin nhắn mới
  useEffect(() => {
    if (isOpen) {
      setHasNewReply(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    const content = text.trim();
    setText('');
    setSubmitting(true);
    setSentSuccess(false);

    if (name.trim()) {
      localStorage.setItem('zw_bug_name', name.trim());
    }

    // Hiển thị ngay lên màn hình
    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      sender: 'user',
      text: content,
      time: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const screen = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '';

      const res = await fetch('/api/bug-report/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name: name.trim(),
          text: content,
          pageUrl,
          screen,
          userAgent,
        }),
      });

      if (res.ok) {
        setSentSuccess(true);
        setTimeout(() => setSentSuccess(false), 5000);
      }
    } catch {
      // Bỏ qua lỗi mạng
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans text-xs">
      {/* Nút bấm nổi góc màn hình */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 px-3.5 py-2 rounded-full shadow-md border transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--bg-1)',
            borderColor: hasNewReply ? '#A83228' : 'var(--bdr-med)',
            color: 'var(--tx-1)',
          }}
          title="Phản ánh sự cố hoặc góp ý trực tiếp"
        >
          {hasNewReply ? (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
          ) : (
            <span className="text-[#A83228] font-bold">⚠</span>
          )}
          <span className="font-medium tracking-wide">
            {hasNewReply ? 'Kỹ thuật đã phản hồi!' : 'Báo lỗi / Góp ý'}
          </span>
        </button>
      ) : (
        /* Hộp thoại phản ánh sự cố */
        <div
          className="w-80 sm:w-96 rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{
            backgroundColor: 'var(--bg-0)',
            borderColor: 'var(--bdr-med)',
            color: 'var(--tx-0)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{
              backgroundColor: 'var(--bg-1)',
              borderColor: 'var(--bdr)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[#A83228] font-bold text-sm">⚠</span>
              <div>
                <h3 className="font-semibold text-xs tracking-wide" style={{ color: 'var(--tx-0)' }}>
                  Phản Ánh Sự Cố Kỹ Thuật
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--tx-3)' }}>
                  Kết nối trực tiếp quản trị viên
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: 'var(--tx-3)' }}
              title="Đóng"
            >
              ✕
            </button>
          </div>

          {/* Khung nội dung trao đổi */}
          <div
            className="h-64 overflow-y-auto p-3.5 space-y-3"
            style={{ backgroundColor: 'var(--bg-0)' }}
          >
            {messages.length === 0 ? (
              <div
                className="text-center py-8 text-[11px] leading-relaxed"
                style={{ color: 'var(--tx-3)' }}
              >
                Nếu gặp lỗi hiển thị, sai khác cách cục an sao hoặc tính năng AI chưa phản hồi, xin hãy mô tả vắn tắt bên dưới.
                <br />
                <span className="opacity-80 mt-1 block">Quản trị viên sẽ phản hồi trực tiếp qua đây.</span>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] mb-0.5 px-1" style={{ color: 'var(--tx-3)' }}>
                    {m.sender === 'user' ? 'Nội dung bạn gửi' : 'Kỹ thuật viên phản hồi'}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-xs ${
                      m.sender === 'user'
                        ? 'border'
                        : 'border'
                    }`}
                    style={
                      m.sender === 'user'
                        ? {
                            backgroundColor: 'var(--bg-2)',
                            borderColor: 'var(--bdr-med)',
                            color: 'var(--tx-0)',
                          }
                        : {
                            backgroundColor: 'var(--ac-bg)',
                            borderColor: 'var(--ac-bdr)',
                            color: 'var(--tx-0)',
                            fontWeight: 500,
                          }
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form nhập dữ liệu */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t flex flex-col gap-2"
            style={{
              backgroundColor: 'var(--bg-1)',
              borderColor: 'var(--bdr)',
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên/SĐT (tùy chọn)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-1/3 rounded-lg px-2.5 py-1.5 text-[11px] border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-0)',
                  borderColor: 'var(--bdr-med)',
                  color: 'var(--tx-0)',
                }}
              />
              <input
                type="text"
                placeholder="Mô tả sự cố bạn gặp..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 rounded-lg px-2.5 py-1.5 text-xs border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-0)',
                  borderColor: 'var(--bdr-med)',
                  color: 'var(--tx-0)',
                }}
              />
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-[10px]" style={{ color: sentSuccess ? '#2D7A4A' : 'var(--tx-3)' }}>
                {sentSuccess ? '✓ Đã gửi thông báo thành công' : 'Tự động đính kèm URL trang bị lỗi'}
              </span>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-40"
                style={{
                  backgroundColor: 'var(--ac)',
                  color: '#FFFFFF',
                }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi phản ánh'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
