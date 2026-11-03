'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart } from '@/lib/ziwei/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  chart: ZiweiChart;
}

const PRESET_QUESTIONS = [
  'Tổng quan mệnh cách và đặc trưng tính cách của tôi là gì?',
  'Vận thế tình cảm, hôn nhân và gia đạo của tôi ra sao?',
  'Sự nghiệp, tài bạch của tôi phát triển theo hướng nào là tốt nhất?',
  'Vận khí trong đại hạn 10 năm hiện tại cần lưu ý điều gì?',
  'Phương diện sức khỏe, tật ách cần chú ý phòng tránh gì?',
  'Lưu niên năm nay của tôi có những thời cơ và thử thách nào?',
];

export default function ChatPanel({ chart }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const storedVip = typeof window !== 'undefined' ? localStorage.getItem('ziwei_vip') || undefined : undefined;
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedVip ? { 'x-vip-key': storedVip } : {}),
        },
        body: JSON.stringify({ chart, messages: [...messages, userMsg], vipKey: storedVip }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Yêu cầu không thành công');
      }
      if (!res.body) throw new Error('Không nhận được luồng dữ liệu phản hồi');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'queue') {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: `🍵 **Bần đạo kính cáo đạo hữu:**\n\n*Lúc này trong tĩnh thất đang có 10 đạo hữu cùng đàm đạo. Kính mời đạo hữu tĩnh tâm thưởng chung trà thanh tâm, người đang ở **vị trí số ${parsed.position}** trong hàng đợi.*\n\n*Đạo duyên sẽ tự khắc khai mở sau chốc lát...*`,
                  };
                  return updated;
                });
                continue;
              }
              if (parsed.type === 'start') {
                assistantText = '';
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: '' };
                  return updated;
                });
                continue;
              }
              if (parsed.type === 'vip') {
                continue;
              }

              const delta = parsed.delta?.text ?? parsed.choices?.[0]?.delta?.content ?? '';
              assistantText += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            } catch { /* skip */ }
          }
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: e?.message || 'Luận giải không thành công, vui lòng kiểm tra cấu hình AI_API_KEY trong file .env.local và thử lại.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden card-glass">
      {/* Tiêu đề */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--t-border)' }}>
        <h3 className="text-xs font-semibold tracking-wider" style={{ color: 'var(--t-gold)' }}>AI LUẬN GIẢI MỆNH BÀN</h3>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--t-faint)' }}>Trường phái Thiên Kỷ Nghê Hải Hà · Tu dưỡng tri mệnh</p>
      </div>

      {/* Danh sách tin nhắn */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-center mb-3" style={{ color: 'var(--t-faint)' }}>
              Chọn câu hỏi mẫu bên dưới hoặc nhập câu hỏi bạn quan tâm:
            </p>
            {PRESET_QUESTIONS.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => sendMessage(q)}
                className="w-full text-left text-[11px] p-2.5 rounded-lg transition-all card-inner block"
                style={{ color: 'var(--t-text2)', border: '1px solid var(--t-border)' }}
              >
                ✦ {q}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] text-[11px] leading-relaxed p-3 rounded-xl whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'text-white'
                    : 'card-inner'
                }`}
                style={{
                  background: msg.role === 'user' ? 'var(--t-gold)' : undefined,
                  color: msg.role === 'user' ? '#1a1000' : 'var(--t-text2)',
                  fontWeight: msg.role === 'user' ? 600 : 400,
                  border: msg.role === 'assistant' ? '1px solid var(--t-border)' : undefined,
                }}
              >
                {msg.content || (
                  <span className="inline-flex items-center gap-1 opacity-70">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    Đang giải đoán vận số…
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hộp nhập tin nhắn */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--t-border)' }}>
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Hỏi về sự nghiệp, tình duyên, tài lộc, gia đạo..."
            disabled={loading}
            className="flex-1 text-[11px] px-3 py-2 rounded-lg card-inner outline-none transition-colors"
            style={{
              border: '1px solid var(--t-border)',
              color: 'var(--t-text)',
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-[11px] px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-40"
            style={{
              background: 'var(--t-gold)',
              color: '#1a1000',
              fontWeight: 600,
            }}
          >
            {loading ? '…' : 'Gửi'}
          </button>
        </form>
      </div>
    </div>
  );
}
