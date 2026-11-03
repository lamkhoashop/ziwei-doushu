'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from './TimeNav';
import {
  toVietnamesePalace,
  toVietnameseStar,
  toVietnameseSiHua,
} from '@/lib/ziwei/vietnamese';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean;
}

interface SelectedSiHua {
  starName: string;
  siHua: string;
  view: TimeView;
}

interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
  selectedSiHua?: SelectedSiHua | null;
}

const TOPICS = [
  { key: 'overview',     label: 'Mệnh Cách' },
  { key: 'love',        label: 'Tình Duyên' },
  { key: 'career',      label: 'Sự Nghiệp' },
  { key: 'wealth',      label: 'Tài Bạch' },
  { key: 'health',      label: 'Sức Khỏe' },
  { key: 'personality', label: 'Tính Cách' },
] as const;

const TOPIC_PROMPTS: Record<string, string> = {
  overview: `Xin phân tích tổng quan mệnh cách, trình bày theo cấu trúc chuẩn sau:

**【ĐỊNH TÍNH MỆNH CÁCH】**
Khái quát một câu về cốt cách, khí chất và bố cục lớn của lá số.

**【CHÍNH TINH MỆNH CUNG】**
Đặc tính cốt lõi của các chính tinh tại Mệnh Cung, góc nhìn theo trường phái Thiên Kỷ Nghê Hải Hà.

**【TAM PHƯƠNG TỨ CHÍNH】**
Phân tích liên hoàn Tài Bạch, Quan Lộc, Thiên Di hội chiếu Mệnh Cung.

**【ĐẠI HẠN HIỆN TẠI】**
Xu hướng vận khí 10 năm hiện tại và những điểm then chốt cần chú ý.

**【ƯU THẾ & ĐỊNH HƯỚNG HÀNH ĐỘNG】**
Sở trường thiên bẩm, cùng lời khuyên tu dưỡng và hành động thực tế.`,

  love: `Xin phân tích chuyên sâu vận tình cảm hôn nhân, trình bày theo cấu trúc sau:

**【CỤC DIỆN TÌNH CẢM】**
Khái quát một câu về cách cục tình cảm và hôn nhân.

**【PHÂN TÍCH CUNG PHU THÊ & PHÚC ĐỨC】**
Chính tinh, phụ tinh, tứ hóa và luận giải theo lý pháp Nghê Hải Hà ("Xem hôn nhân phải phối hợp cung Phúc Đức").

**【TAM PHƯƠNG HỘI CHIẾU】**
Ảnh hưởng của các cung xung chiếu và tam hợp đến đường tình duyên.

**【VẬN TÌNH DUYÊN ĐẠI HẠN HIỆN TẠI】**
Xu thế 10 năm hiện tại và thời điểm quan trọng.

**【LỜI KHUYÊN GIA ĐẠO】**
Giải pháp dung hòa thực tế để giữ gìn hòa khí và hạnh phúc.`,

  career: `Xin phân tích chuyên sâu con đường sự nghiệp và công danh:

**【ĐỊNH TÍNH SỰ NGHIỆP】**
Một câu định tính: hợp làm công chức, chuyên môn kỹ thuật, quản lý hay tự thân kinh doanh lập nghiệp.

**【PHÂN TÍCH CUNG QUAN LỘC】**
Chính tinh, tứ hóa tọa thủ và thế đứng công danh.

**【LIÊN HOÀN TÀI BẠCH & THIÊN DI】**
Nguồn tài trợ, cơ hội mở rộng và quan hệ xã hội hỗ trợ sự nghiệp.

**【ĐẠI HẠN HIỆN TẠI VỀ CÔNG DANH】**
Vận trình thăng trầm trong 10 năm này.

**【CHIẾN LƯỢC HÀNH ĐỘNG】**
Ngành nghề phù hợp, chiến lược phát triển và thời cơ bứt phá.`,

  wealth: `Xin phân tích chuyên sâu về tài lộc và tiền bạc:

**【MÔ HÌNH TÀI VẬN】**
Một câu định tính: Tài vận chủ động hay thụ động, tích lũy vững chắc hay đột phá kinh doanh.

**【CUNG TÀI BẠCH & ĐIỀN TRẠCH】**
Khả năng tụ tài, kho tiền Điền Trạch và phương thức sinh lời.

**【TỨ HÓA ĐẾN TÀI LỘC】**
Ảnh hưởng của Hóa Lộc, Hóa Quyền, Hóa Kỵ đối với tiền bạc.

**【VẬN TÀI CHÍNH ĐẠI HẠN HIỆN TẠI】**
Dòng tiền, cơ hội đầu tư và rủi ro hao tài trong 10 năm này.

**【LỜI KHUYÊN QUẢN LÝ TÀI CHÍNH】**
Chiến lược giữ tiền, đầu tư bền vững.`,

  health: `Xin phân tích về sức khỏe và tật ách:

**【TẬT ÁCH & BẢN NGUYÊN】**
Ý nghĩa các tinh diệu tại Tật Ách và thể trạng tiên thiên.

**【CƠ QUAN & NGUY CƠ CẦN LƯU Ý】**
Phân tích theo âm dương ngũ hành và kinh lạc (lý luận Tí Ngọ Lưu Chú).

**【ĐẠI HẠN VỀ THỂ CHẤT】**
Xu hướng sức khỏe trong giai đoạn hiện tại.

**【HƯỚNG DẪN DƯỠNG SINH】**
Lời khuyên ăn uống, thói quen và rèn luyện thể chất.`,

  personality: `Xin phân tích chuyên sâu về tâm lý và tính cách:

**【CỐT CÁCH NỘI TÂM】**
Bản tính sâu xa, khí chất và thế giới nội tâm.

**【TƯ DUY & PHONG THÁI XÃ HỘI】**
Cách đối nhân xử thế, phong cách giao tế và phản ứng khi gặp áp lực.

**【ĐIỂM MẠNH & GÓC KHUẤT TÂM LÝ】**
Thiên hướng tài năng và điểm mù tâm lý cần tỉnh thức vượt qua.

**【BÀI HỌC TU DƯỠNG】**
Định hướng phát triển bản thân để đạt tới sự cân bằng và thành tựu.`,
};

const PALACE_ROLES: Record<string, string> = {
  '命宫':   'Bản mệnh, cốt cách, ý chí và tính cách tiên thiên',
  '兄弟宫': 'Anh em, bạn bè tri kỷ, đối tác hợp tác',
  '夫妻宫': 'Tình duyên, hôn nhân, tính cách bạn đời',
  '子女宫': 'Con cái, hậu duệ, cấp dưới và người kế cận',
  '财帛宫': 'Tài lộc, cách thức kiếm tiền, dòng tiền',
  '疾厄宫': 'Sức khỏe, thể trạng, cơ địa bệnh tật',
  '迁移宫': 'Xuất ngoại, giao tế xã hội, cơ hội bên ngoài',
  '交友宫': 'Bạn bè, đồng liêu, quý nhân và trợ lực xã hội',
  '仆役宫': 'Bạn bè, đồng liêu, quý nhân và trợ lực xã hội',
  '官禄宫': 'Công danh, chức vụ, sự nghiệp và vị thế xã hội',
  '田宅宫': 'Điền sản, nhà đất, tài khố và nền tảng gia đình',
  '福德宫': 'Nội tâm, phúc phận tinh thần, thọ khảo',
  '父母宫': 'Cha mẹ, trưởng bối, di truyền và phúc ấm',
};

function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
        if (sectionMatch) {
          return (
            <div key={i} className="pt-3 pb-0.5 first:pt-0">
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--t-gold)' }}>
                【{sectionMatch[1]}】
              </span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const parts = line.split(/\*\*(.+?)\*\*/);
        return (
          <div key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>
            {parts.map((part, j) =>
              j % 2 === 0
                ? part
                : <strong key={j} className="font-medium" style={{ color: 'var(--t-text)' }}>{part}</strong>
            )}
          </div>
        );
      })}
      {streaming && (
        <span
          className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle"
          style={{ background: 'var(--t-gold)', opacity: 0.6 }}
        />
      )}
    </div>
  );
}

export default function InsightPanel({ chart, selectedPalace, selectedSiHua }: InsightPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>('overview');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [queueStatus, setQueueStatus] = useState<{
    position: number;
    total: number;
    message?: string;
  } | null>(null);
  const [isVip, setIsVip] = useState(false);
  const messagesRef = useRef<Message[]>([]);
  const loadingRef = useRef(false);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const lastSiHuaKey = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Kiểm tra và lưu trữ Lệnh Bài VIP (từ URL ?vip=... hoặc LocalStorage)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlVip = params.get('vip');
      if (urlVip) {
        localStorage.setItem('ziwei_vip', urlVip);
        document.cookie = `ziwei_vip=${urlVip}; path=/; max-age=31536000; SameSite=Lax`;
        setIsVip(true);
      } else {
        const savedVip = localStorage.getItem('ziwei_vip');
        if (savedVip) {
          setIsVip(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Nếu cách đáy dưới 70px thì coi như người dùng đang ở đáy
    const atBottom = scrollHeight - scrollTop - clientHeight <= 70;
    isAtBottomRef.current = atBottom;
    setShowScrollBottom(!atBottom);
  };

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    isAtBottomRef.current = true;
    setShowScrollBottom(false);
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  // Chỉ tự động cuộn xuống nếu người dùng đang ở đáy (không bị giật khi người dùng kéo lên đọc)
  useEffect(() => {
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chartKey = `ziwei_chat_${chart.birthInfo.name || ''}_${chart.birthInfo.year}_${chart.birthInfo.month}_${chart.birthInfo.day}_${chart.birthInfo.hour}`;

  // Khôi phục lịch sử luận giải từ sessionStorage khi F5
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(chartKey);
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(m => m.content && m.content.trim().length > 0);
          if (cleaned.length > 0) {
            setMessages(cleaned);
            autoLoaded.current = true;
            return;
          }
        }
      }
    } catch { /* ignore */ }

    // Nếu chưa có tin nhắn nào được lưu, tự động bắt đầu luận giải Mệnh cách
    if (!autoLoaded.current) {
      autoLoaded.current = true;
      sendMessage(TOPIC_PROMPTS.overview, true);
    }
  }, [chartKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lưu tin nhắn vào sessionStorage mỗi khi cập nhật để giữ nguyên khi F5
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(chartKey, JSON.stringify(messages));
      } catch { /* ignore */ }
    }
  }, [messages, chartKey]);

  // Phân tích cung vị khi người dùng nhấn chọn một cung trên bàn cờ
  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;

    const majorStars = selectedPalace.stars.filter(s => s.type === 'major');
    const starDesc = majorStars.length > 0
      ? majorStars.map(s => `${toVietnameseStar(s.name)}${s.siHua ? ' Hóa ' + toVietnameseSiHua(s.siHua) : ''}`).join('、')
      : 'Vô Chính Diệu (mượn chính tinh đối cung)';
    const palaceNameVi = toVietnamesePalace(selectedPalace.name);
    const role = PALACE_ROLES[selectedPalace.name] ?? PALACE_ROLES[selectedPalace.name + '宫'] ?? 'Cung vị then chốt';

    const prompt = `Xin phân tích chuyên sâu cung vị 【${palaceNameVi}】 (Chủ quản: ${role}), có chính tinh tọa thủ: ${starDesc}, trình bày theo cấu trúc sau:

**【ĐỊNH TÍNH CUNG VỊ】**
Ý nghĩa của ${palaceNameVi} trong mệnh bàn và đánh giá bố cục tinh diệu này.

**【CHÍNH TINH TỌA THỦ】**
Luận giải theo trường phái Thiên Kỷ Nghê Hải Hà về các sao tại cung vị này.

**【TAM PHƯƠNG TỨ CHÍNH HỘI CHIẾU】**
Tác động qua lại của đối cung và hai cung tam hợp đến ${palaceNameVi}.

**【LỜI KHUYÊN THỰC TẾ】**
Định hướng giải pháp và hành động cụ thể cho phương diện này.`;

    sendMessage(prompt, true);
  }, [selectedPalace]); // eslint-disable-line react-hooks/exhaustive-deps

  // Phân tích khi bấm vào Tứ Hóa
  useEffect(() => {
    if (!selectedSiHua) return;
    const key = `${selectedSiHua.starName}-${selectedSiHua.siHua}-${selectedSiHua.view}`;
    if (key === lastSiHuaKey.current) return;
    lastSiHuaKey.current = key;

    const palaceOfStar = chart.palaces.find(p =>
      p.stars.some(s => s.name === selectedSiHua.starName)
    );
    const palaceName = palaceOfStar ? toVietnamesePalace(palaceOfStar.name) : 'Cung vị tọa thủ';
    const viewLabel = selectedSiHua.view === 'daxian' ? 'Đại Hạn' : 'Lưu Niên';
    const starNameVi = toVietnameseStar(selectedSiHua.starName);
    const siHuaVi = toVietnameseSiHua(selectedSiHua.siHua);

    const prompt = `Xin phân tích tác động phi hóa 【${viewLabel}: ${starNameVi} Hóa ${siHuaVi}】, trình bày theo cấu trúc:

**【Ý NGHĨA HÓA ${siHuaVi.toUpperCase()}】**
Ý nghĩa cốt lõi của Hóa ${siHuaVi} trong hệ thống Tử Vi Nghê Hải Hà, đặc biệt là khi ${starNameVi} Hóa ${siHuaVi}.

**【TÁC ĐỘNG TẠI ${palaceName.toUpperCase()}】**
${starNameVi} Hóa ${siHuaVi} đóng tại 【${palaceName}】 mang lại cát hung gì cho phương diện này.

**【ẢNH HƯỞNG TAM PHƯƠNG TỨ CHÍNH】**
Tia ảnh hưởng đến cung đối chiếu và tam hợp.

**【VẬN THẾ HIỆN TẠI & LỜI KHUYÊN】**
Ảnh hưởng trong chu kỳ ${viewLabel} và gợi ý hành động thiết thực.`;

    sendMessage(prompt, true);
  }, [selectedSiHua]); // eslint-disable-line react-hooks/exhaustive-deps

  const streamResponse = async (apiMessages: { role: 'user' | 'assistant'; content: string }[]) => {
    try {
      const storedVip = typeof window !== 'undefined' ? localStorage.getItem('ziwei_vip') || undefined : undefined;
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedVip ? { 'x-vip-key': storedVip } : {}),
        },
        body: JSON.stringify({ chart, messages: apiMessages, vipKey: storedVip }),
      });
      if (res.status === 404) throw new Error('api-missing');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Yêu cầu không thành công');
      }
      if (!res.body) throw new Error('Không có luồng phản hồi');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);

            // Xử lý các sự kiện quản lý hàng đợi Đạo gia
            if (parsed.type === 'vip') {
              setIsVip(true);
              continue;
            }
            if (parsed.type === 'queue') {
              setQueueStatus({
                position: parsed.position,
                total: parsed.total,
                message: parsed.message,
              });
              continue;
            }
            if (parsed.type === 'start') {
              setQueueStatus(null);
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
    } catch (e: any) {
      const missing = e instanceof Error && e.message === 'api-missing';
      const errorMsg = missing
        ? 'Chưa kết nối backend /api/interpret. Vui lòng cấu hình AI_API_KEY trong file .env.local.'
        : (e?.message || 'Không thể tải luận giải, vui lòng thử lại sau.');
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant' && !updated[lastIdx].content) {
          updated[lastIdx] = { role: 'assistant', content: errorMsg };
          return updated;
        }
        return [...prev, { role: 'assistant', content: errorMsg }];
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
      setQueueStatus(null);
    }
  };

  const sendMessage = (text: string, hidden = false) => {
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    isAtBottomRef.current = true;
    setShowScrollBottom(false);

    const userMsg: Message = { role: 'user', content: text, hidden };
    const apiMessages = [...messagesRef.current, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Thêm ngay placeholder assistant rỗng để hiển thị trạng thái chờ tức thì (không bị trắng màn hình)
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    streamResponse(apiMessages);
  };

  const handleTopicClick = (topicKey: string) => {
    if (loadingRef.current) return;
    setActiveTopic(topicKey);
    sendMessage(TOPIC_PROMPTS[topicKey], true);
  };

  const handleSend = () => {
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden card-glass">

      {/* ── Topic buttons ── */}
      <div className="flex-shrink-0 px-2 pt-2 pb-2 relative z-30 flex flex-col gap-1.5" style={{ borderBottom: '1px solid var(--t-border)' }}>
        {isVip && (
          <div className="flex items-center justify-between px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-[9px] text-amber-300 font-serif">
            <span className="flex items-center gap-1">
              <span className="text-amber-400">✨</span>
              <span className="font-bold tracking-wider uppercase">Lệnh Bài Tri Kỷ</span>
              <span className="opacity-70 text-[8px] font-sans">— Luận giải ưu tiên không qua hàng đợi</span>
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-500/20 text-amber-200 font-sans font-semibold">
              VIP PASS
            </span>
          </div>
        )}
        <div className="grid grid-cols-6 gap-1">
          {TOPICS.map((t, idx) => {
            const isActive = activeTopic === t.key;
            const isFirst = idx === 0;
            const isLast = idx === TOPICS.length - 1;
            const tooltipPos = isFirst
              ? 'left-0'
              : isLast
              ? 'right-0'
              : 'left-1/2 -translate-x-1/2';

            return (
              <div
                key={t.key}
                className="relative group"
              >
                <button
                  type="button"
                  onClick={() => handleTopicClick(t.key)}
                  disabled={loading}
                  className={`w-full py-1.5 text-[10px] font-medium rounded-lg transition-all duration-150 ${
                    loading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--t-gold)]'
                  }`}
                  style={{
                    background: isActive ? 'rgba(212,168,67,0.12)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(212,168,67,0.3)' : 'var(--t-border)'}`,
                    color: isActive ? 'var(--t-gold)' : 'var(--t-faint)',
                  }}
                >
                  {t.label}
                </button>

                {/* Badge thông báo hiển thị phía dưới nút khi rê chuột vào trong lúc đang luận giải (không bị khuất mép trên) */}
                {loading && (
                  <div className={`absolute ${tooltipPos} top-full mt-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none`}>
                    <div
                      className="w-0 h-0 border-x-4 border-x-transparent border-b-4 mb-[1px]"
                      style={{ borderBottomColor: 'rgba(212, 168, 67, 0.9)' }}
                    />
                    <div
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap shadow-2xl backdrop-blur-md"
                      style={{
                        background: 'rgba(12, 15, 24, 0.98)',
                        border: '1px solid rgba(212, 168, 67, 0.6)',
                        color: 'var(--t-gold)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      Đang luận giải, vui lòng đợi hoàn tất...
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >

          {/* Loading state before first message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3" style={{ color: 'var(--t-gold)', opacity: 0.1 }}>✦</div>
              <p className="text-[10px] animate-pulse" style={{ color: 'var(--t-faint)' }}>Đang khởi tạo luận giải mệnh cách…</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              if (msg.role === 'user' && msg.hidden) return null;

              if (msg.role === 'user') {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div
                      className="max-w-[85%] rounded-xl px-3 py-2 text-[11px]"
                      style={{
                        background: 'rgba(212,168,67,0.08)',
                        border: '1px solid rgba(212,168,67,0.18)',
                        color: 'var(--t-gold)',
                      }}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                );
              }

              // Assistant message
              const isLastMsg = i === messages.length - 1;
              const isWaitingFirstToken = loading && isLastMsg && (!msg.content || msg.content.trim() === '');

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="text-[9px] tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ color: 'var(--t-faint)' }}
                  >
                    <span style={{ color: 'var(--t-gold)', opacity: 0.4 }}>✦</span>
                    LUẬN GIẢI MỆNH LÝ
                  </div>

                  {isWaitingFirstToken ? (
                    queueStatus ? (
                      /* Thẻ Hàng Đợi Phong Cách Đạo Giáo Tu Tiên */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-5 px-4 flex flex-col items-center justify-center text-center space-y-3.5 rounded-xl my-2 border relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(180deg, rgba(28, 20, 10, 0.95) 0%, rgba(14, 11, 7, 0.98) 100%)',
                          borderColor: 'rgba(212, 168, 67, 0.45)',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), inset 0 0 25px rgba(212, 168, 67, 0.08)',
                        }}
                      >
                        {/* Họa tiết cổ phong 4 góc */}
                        <div className="absolute top-1.5 left-2 text-[10px] opacity-35 select-none text-amber-400">╔</div>
                        <div className="absolute top-1.5 right-2 text-[10px] opacity-35 select-none text-amber-400">╗</div>
                        <div className="absolute bottom-1.5 left-2 text-[10px] opacity-35 select-none text-amber-400">╚</div>
                        <div className="absolute bottom-1.5 right-2 text-[10px] opacity-35 select-none text-amber-400">╝</div>

                        {/* Chung trà bốc khói & Bát Quái xoay */}
                        <div className="relative flex items-center justify-center mt-1">
                          <div className="w-13 h-13 rounded-full border border-amber-500/40 flex items-center justify-center bg-amber-500/10 shadow-[0_0_15px_rgba(212,168,67,0.25)]">
                            <span className="text-2xl animate-bounce" style={{ animationDuration: '2.5s' }}>🍵</span>
                          </div>
                          <div className="absolute -inset-1 rounded-full border border-dashed border-amber-400/40 animate-spin" style={{ animationDuration: '20s' }} />
                        </div>

                        {/* Tiêu đề Đạo gia */}
                        <div className="space-y-1">
                          <h4 className="text-[12px] font-bold tracking-wider uppercase text-amber-300 flex items-center justify-center gap-1.5 font-serif">
                            <span>✦</span> BẦN ĐẠO ĐANG NHẬP ĐỊNH THÔI DIỄN THIÊN CƠ <span>✦</span>
                          </h4>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-medium border border-amber-500/30 bg-amber-500/15 text-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span>Tĩnh thất đang tiếp 10 đạo hữu đàm đạo</span>
                          </div>
                        </div>

                        {/* Thẻ vị trí hàng đợi */}
                        <div className="px-4 py-2 rounded-lg border border-amber-500/30 bg-black/50 text-center w-full max-w-[280px]">
                          <div className="text-[9px] tracking-widest text-amber-400/80 uppercase font-sans">Thứ tự tiếp duyên của bạn</div>
                          <div className="text-2xl font-black text-amber-300 font-serif my-0.5 tracking-wider">
                            VỊ TRÍ SỐ {queueStatus.position}
                          </div>
                          <div className="text-[9px] text-zinc-400 font-sans">
                            Ước chừng khoảng {queueStatus.position * 15}–{queueStatus.position * 25} giây
                          </div>
                        </div>

                        {/* Lời răn dạy của Đạo gia */}
                        <p className="text-[11px] leading-relaxed max-w-[340px] italic font-serif text-amber-100/90 px-2">
                          &ldquo;Thiên cơ huyền ảo, dục tốc bất đạt, không thể phân tâm. Kính mời đạo hữu tĩnh tọa ngưng thần, thưởng một chung trà thanh tâm... Đạo duyên sẽ tự khắc khai mở khi đến lượt!&rdquo;
                        </p>

                        {/* Thanh chỉ báo linh lực */}
                        <div className="w-full max-w-[220px] h-1 bg-amber-950/70 rounded-full overflow-hidden border border-amber-600/30">
                          <div className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 animate-pulse w-full" />
                        </div>
                      </motion.div>
                    ) : (
                      <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-3 rounded-xl my-2 border border-dashed border-[rgba(212,168,67,0.25)] bg-[rgba(212,168,67,0.03)] backdrop-blur-sm">
                        <div className="relative flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--t-gold)] animate-spin opacity-50" />
                          <span className="absolute text-xs" style={{ color: 'var(--t-gold)' }}>✦</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[12px] font-medium tracking-wide animate-pulse" style={{ color: 'var(--t-gold)' }}>
                            {isVip ? '✨ Lệnh Bài Tri Kỷ: Bần đạo lập tức trải tinh bàn đàm đạo...' : 'Đang phân tích thiên bàn & luận giải lá số...'}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--t-faint)' }}>
                            {isVip ? 'Đặc quyền thượng khách — kết nối ưu tiên trực tiếp tới AI cao cấp.' : 'Hệ thống AI đang đối chiếu cung vị và tinh diệu, quý bạn vui lòng đợi trong giây lát (khoảng 10-15s).'}
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <AiContent text={msg.content} streaming={loading && isLastMsg} />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Nút nổi 'Xuống dưới cùng' khi người dùng chủ động kéo lên trên đọc */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            type="button"
            className="absolute bottom-3 right-4 px-2.5 py-1 rounded-full text-[10px] font-medium shadow-2xl backdrop-blur-md flex items-center gap-1 transition-all z-20 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(15, 20, 32, 0.94)',
              border: '1px solid rgba(212, 168, 67, 0.5)',
              color: 'var(--t-gold)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <span>Xuống cuối</span>
            <span className="text-xs">↓</span>
          </button>
        )}
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={loading ? 'Đang luận giải, vui lòng đợi hoàn tất để hỏi tiếp...' : 'Đặt câu hỏi thêm: Năm nay công danh thế nào?...'}
            disabled={loading}
            className={`flex-1 rounded-lg px-3 py-2 text-[11px] focus:outline-none transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: 'var(--t-card)',
              border: '1px solid var(--t-border)',
              color: 'var(--t-text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(212,168,67,0.15)',
              border: '1px solid rgba(212,168,67,0.25)',
              color: 'var(--t-gold)',
            }}
          >
            {loading ? '…' : 'Hỏi'}
          </button>
        </div>
      </div>

    </div>
  );
}
