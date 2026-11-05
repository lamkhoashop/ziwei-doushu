'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '@/components/ThemeProvider';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from './TimeNav';
import {
  toVietnamesePalace,
  toVietnameseStar,
  toVietnameseSiHua,
} from '@/lib/ziwei/vietnamese';
import SpeechPlayer from './SpeechPlayer';

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

function renderInlineMarkdown(text: string, isDark: boolean = true) {
  // Loại bỏ hoàn toàn bất kỳ thẻ br hoặc HTML thô còn sót lại trong dòng
  const cleanText = text.replace(/<br\s*\/?>/gi, ' ');
  const boldParts = cleanText.split(/\*\*(.+?)\*\*/);
  return boldParts.map((bPart, bIdx) => {
    if (bIdx % 2 === 1) {
      return (
        <strong
          key={bIdx}
          className={clsx(
            "font-bold",
            isDark ? "text-amber-200 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" : "text-[#1C1917]"
          )}
        >
          {bPart}
        </strong>
      );
    }
    const italicParts = bPart.split(/\*(.+?)\*/);
    return italicParts.map((iPart, iIdx) => {
      if (iIdx % 2 === 1) {
        return (
          <em
            key={iIdx}
            className={clsx(
              "italic font-serif",
              isDark ? "text-amber-100/90" : "text-[#78350F] font-medium"
            )}
          >
            {iPart}
          </em>
        );
      }
      return iPart;
    });
  });
}

function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Chuẩn hóa và làm sạch toàn bộ thẻ HTML thô (<br>, <br/>, <br />, <p>, ...) thành dấu xuống dòng chuẩn (\n)
  const normalizedText = (text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/\\n/g, '\n');

  const lines = normalizedText.split('\n');
  let hasRenderedDropCap = false;

  return (
    <div className="space-y-2 font-mystic text-[12px] leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // 1. Phân cách Thiên Cơ (---)
        if (trimmed.match(/^---+$/)) {
          return (
            <div key={i} className="flex items-center justify-center gap-2.5 my-3 opacity-70">
              <span className={clsx("w-16 h-[1px] bg-gradient-to-r from-transparent", isDark ? "to-amber-500/60" : "to-amber-700/40")} />
              <span className={clsx("text-[10px] font-mystic select-none tracking-widest", isDark ? "text-amber-300" : "text-amber-800")}>✦ ☯ ✦</span>
              <span className={clsx("w-16 h-[1px] bg-gradient-to-l from-transparent", isDark ? "to-amber-500/60" : "to-amber-700/40")} />
            </div>
          );
        }

        // 2. Tiêu đề mục phong cách Hoàng Gia Cổ Phong (【...】 hoặc **【...】** hoặc ### ...)
        const sectionMatch = trimmed.match(/^(?:\*\*)?【(.+?)】(?:\*\*)?$/) || trimmed.match(/^###\s*(.+)$/);
        if (sectionMatch) {
          const rawTitle = sectionMatch[1].replace(/【|】/g, '');
          const cleanTitle = rawTitle.replace(/\*\*/g, '').trim();
          return (
            <div key={i} className="pt-3 pb-1 first:pt-0">
              <div
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                  isDark
                    ? "border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-black/80 shadow-[0_2px_12px_rgba(212,168,67,0.18)]"
                    : "border-amber-400/60 bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-50 shadow-[0_2px_8px_rgba(180,83,9,0.1)]"
                )}
              >
                <span className={clsx("text-xs select-none", isDark ? "text-amber-400" : "text-amber-700")}>✦</span>
                <span
                  className={clsx(
                    "text-[12.5px] font-mystic font-bold tracking-wider uppercase",
                    isDark ? "text-amber-200 drop-shadow-[0_0_8px_rgba(212,168,67,0.4)]" : "text-[#78350F]"
                  )}
                >
                  【{cleanTitle}】
                </span>
              </div>
            </div>
          );
        }

        // 3. Tiêu đề phụ (#### ...)
        const subHeaderMatch = trimmed.match(/^####\s*(.+)$/);
        if (subHeaderMatch) {
          return (
            <div
              key={i}
              className={clsx(
                "pt-2 pb-0.5 text-[11px] font-mystic font-bold flex items-center gap-1.5",
                isDark ? "text-amber-300/90" : "text-[#78350F]"
              )}
            >
              <span className={clsx("text-[9px]", isDark ? "text-amber-400" : "text-amber-700")}>❖</span>
              <span>{subHeaderMatch[1]}</span>
            </div>
          );
        }

        // 4. Blockquote trích dẫn (>)
        if (trimmed.startsWith('>')) {
          const quoteContent = trimmed.replace(/^>\s*/, '');
          return (
            <div
              key={i}
              className={clsx(
                "pl-3.5 pr-2.5 py-1.5 my-1.5 rounded-r text-[12px] leading-relaxed border-l-2 font-mystic",
                isDark
                  ? "border-amber-500 bg-amber-950/25 text-amber-100/95"
                  : "border-amber-600 bg-[#FAF6EE] text-[#1C1917] shadow-sm"
              )}
            >
              {renderInlineMarkdown(quoteContent, isDark)}
            </div>
          );
        }

        // 5. Dòng trống
        if (trimmed === '') return <div key={i} className="h-1.5" />;

        // 6. Mục danh sách đánh số (1. 2. 3...)
        const numberedMatch = trimmed.match(/^([0-9]+)\.\s*(.+)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const content = numberedMatch[2];

          return (
            <div key={i} className="flex items-start gap-2 text-[12px] leading-relaxed my-1 font-mystic" style={{ color: isDark ? 'var(--t-text2)' : '#292524' }}>
              <span
                className={clsx(
                  "inline-flex items-center justify-center w-4 h-4 rounded-full border text-[9px] font-mystic font-bold flex-shrink-0 mt-0.5 select-none",
                  isDark
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.3)]"
                    : "border-amber-500/50 bg-amber-100 text-[#78350F] shadow-sm"
                )}
              >
                {num}
              </span>
              <div className="flex-1">
                {renderInlineMarkdown(content, isDark)}
              </div>
            </div>
          );
        }

        // 7. Mục danh sách gạch đầu dòng (•, -, *)
        const bulletMatch = trimmed.match(/^[•\-\*]\s*(.+)$/);
        if (bulletMatch) {
          const content = bulletMatch[1];

          return (
            <div key={i} className="flex items-start gap-2 text-[12px] leading-relaxed my-1 pl-1 font-mystic" style={{ color: isDark ? 'var(--t-text2)' : '#292524' }}>
              <span
                className={clsx(
                  "text-[10px] flex-shrink-0 mt-0.5 select-none",
                  isDark ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" : "text-amber-700"
                )}
              >
                ◆
              </span>
              <div className="flex-1">
                {renderInlineMarkdown(content, isDark)}
              </div>
            </div>
          );
        }

        // 8. Đoạn văn thường (kèm Drop-Cap chữ hoa khởi đầu cho đoạn đầu tiên)
        const shouldApplyDropCap = !hasRenderedDropCap && trimmed.length > 30 && !streaming;
        if (shouldApplyDropCap) {
          hasRenderedDropCap = true;
          const firstChar = trimmed.charAt(0);
          const restText = trimmed.slice(1);

          return (
            <div key={i} className="text-[12px] leading-relaxed text-justify font-mystic" style={{ color: isDark ? 'var(--t-text2)' : '#292524' }}>
              <span
                className={clsx(
                  "float-left text-3xl font-mystic font-black leading-none pr-2 pt-0.5 select-none",
                  isDark ? "text-amber-300 drop-shadow-[0_0_10px_rgba(212,168,67,0.6)]" : "text-[#78350F]"
                )}
              >
                {firstChar}
              </span>
              {renderInlineMarkdown(restText, isDark)}
            </div>
          );
        }

        return (
          <div key={i} className="text-[12px] leading-relaxed font-mystic" style={{ color: isDark ? 'var(--t-text2)' : '#292524' }}>
            {renderInlineMarkdown(line, isDark)}
          </div>
        );
      })}
      {streaming && (
        <span
          className="inline-block w-1.5 h-3.5 ml-0.5 animate-pulse rounded-sm align-middle"
          style={{ background: isDark ? 'var(--t-gold)' : '#78350F', opacity: 0.8, boxShadow: isDark ? '0 0 8px rgba(212,168,67,0.8)' : 'none' }}
        />
      )}
    </div>
  );
}

export default function InsightPanel({ chart, selectedPalace, selectedSiHua }: InsightPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
  const [isVip, setIsVip] = useState<string | false>(false);
  const messagesRef = useRef<Message[]>([]);
  const loadingRef = useRef(false);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const lastSiHuaKey = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Kiểm tra và lưu trữ Lệnh Bài VIP (Hỗ trợ vip1h: 1 giờ, ltk: 1 tháng làm mới liên tục)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlVip = params.get('vip') || (params.has('vip1h') ? 'vip1h' : null);

      if (urlVip) {
        const clean = urlVip.trim().toLowerCase();
        let maxAge = 3600; // 1 giờ mặc định
        let label = 'vip1h';

        if (clean === 'ltk') {
          maxAge = 30 * 24 * 3600; // 30 ngày (1 tháng)
          label = 'ltk';
        } else if (clean === 'vip1h' || clean === '1h') {
          maxAge = 3600; // 1 giờ
          label = 'vip1h';
        } else {
          maxAge = 365 * 24 * 3600; // Master key: 1 năm
          label = clean;
        }

        const expireTime = Date.now() + maxAge * 1000;
        localStorage.setItem('ziwei_vip', label);
        localStorage.setItem('ziwei_vip_exp', String(expireTime));
        document.cookie = `ziwei_vip=${label}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `ziwei_vip_exp=${expireTime}; path=/; max-age=${maxAge}; SameSite=Lax`;
        setIsVip(label);
      } else {
        const savedVip = localStorage.getItem('ziwei_vip');
        const savedExp = localStorage.getItem('ziwei_vip_exp');
        if (savedVip && savedExp) {
          const expTime = Number(savedExp);
          if (Date.now() < expTime) {
            setIsVip(savedVip);
          } else {
            // Hết hạn cookie -> thu hồi đặc quyền
            localStorage.removeItem('ziwei_vip');
            localStorage.removeItem('ziwei_vip_exp');
            document.cookie = 'ziwei_vip=; path=/; max-age=0;';
            document.cookie = 'ziwei_vip_exp=; path=/; max-age=0;';
            setIsVip(false);
          }
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
      const storedExp = typeof window !== 'undefined' ? Number(localStorage.getItem('ziwei_vip_exp')) || undefined : undefined;

      // Kiểm tra tính hợp lệ về hạn dùng của VIP
      const validVip = storedVip && (!storedExp || Date.now() < storedExp) ? storedVip : undefined;

      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(validVip ? { 'x-vip-key': validVip, 'x-vip-exp': String(storedExp) } : {}),
        },
        body: JSON.stringify({ chart, messages: apiMessages, vipKey: validVip, vipExp: storedExp }),
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
              setIsVip(prev => prev || 'vip');
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
          <div className="flex items-center justify-between px-2 py-1 rounded border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-transparent text-[9px] text-amber-300 font-serif">
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400">✨</span>
              <span className="font-bold tracking-wider uppercase">
                {isVip === 'ltk'
                  ? 'Lệnh Bài Tri Kỷ (Hạn 1 Tháng)'
                  : isVip === 'vip1h'
                  ? 'Lệnh Bài Tạm Thời (Hạn 1 Giờ)'
                  : 'Lệnh Bài Thượng Khách'}
              </span>
              <span className="opacity-70 text-[8px] font-sans hidden sm:inline">— Luận giải ưu tiên không qua hàng đợi</span>
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-500/20 text-amber-200 font-sans font-semibold">
              {isVip === 'ltk' ? '1 THÁNG' : isVip === 'vip1h' ? '1 GIỜ' : 'VIP'}
            </span>
          </div>
        )}
        <div className="flex sm:grid sm:grid-cols-6 gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
          {TOPICS.map((t) => {
            const isActive = activeTopic === t.key;

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTopicClick(t.key)}
                disabled={loading}
                title={loading ? 'Đang luận giải, vui lòng đợi hoàn tất...' : undefined}
                className={`w-full py-1.5 px-2 sm:px-1 text-[11px] font-mystic font-semibold tracking-wider rounded-lg transition-all duration-150 whitespace-nowrap select-none ${
                  loading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'
                }`}
                style={{
                  background: isActive
                    ? (isDark
                        ? 'linear-gradient(145deg, rgba(50, 42, 22, 0.95) 0%, rgba(32, 24, 12, 0.98) 60%, rgba(18, 14, 8, 1) 100%)'
                        : 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 60%, #FDE68A 100%)')
                    : (isDark
                        ? 'linear-gradient(145deg, rgba(28, 35, 50, 0.8) 0%, rgba(14, 18, 28, 0.9) 100%)'
                        : 'linear-gradient(145deg, #FFFFFF 0%, #FAF6EE 100%)'),
                  border: `1px solid ${
                    isActive
                      ? (isDark ? 'rgba(254, 240, 138, 0.55)' : 'rgba(184, 146, 42, 0.75)')
                      : (isDark ? 'rgba(212, 168, 67, 0.2)' : 'rgba(184, 146, 42, 0.35)')
                  }`,
                  color: isActive
                    ? (isDark ? '#FEF08A' : '#78350F')
                    : (isDark ? 'var(--t-faint)' : '#57534E'),
                  textShadow: isActive
                    ? (isDark ? '0 1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(212,168,67,0.45)' : '0 1px 0 rgba(255,255,255,0.9)')
                    : undefined,
                  boxShadow: isActive
                    ? (isDark
                        ? 'inset 0 1px 1.5px rgba(255,255,255,0.25), inset 0 -2px 3px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.45), 0 0 10px rgba(212,168,67,0.25)'
                        : 'inset 0 1px 1.5px rgba(255,255,255,0.95), inset 0 -2px 3px rgba(140,100,20,0.2), 0 3px 8px rgba(120,53,15,0.12)')
                    : (isDark
                        ? 'inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -1.5px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.25)'
                        : 'inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(140,100,20,0.08), 0 1px 3px rgba(120,53,15,0.05)'),
                }}
              >
                {t.label}
              </button>
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
                      className="max-w-[85%] rounded-xl px-3.5 py-2 text-[11px] font-mystic"
                      style={{
                        background: isDark ? 'rgba(212,168,67,0.08)' : '#FEF3C7',
                        border: isDark ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(217,119,6,0.3)',
                        color: isDark ? 'var(--t-gold)' : '#78350F',
                        boxShadow: isDark ? 'none' : '0 1px 4px rgba(120,53,15,0.06)',
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
                    className="text-[9px] tracking-widest mb-2 flex items-center justify-between"
                    style={{ color: 'var(--t-faint)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: 'var(--t-gold)', opacity: 0.4 }}>✦</span>
                      <span>LUẬN GIẢI MỆNH LÝ</span>
                    </div>
                    {!isWaitingFirstToken && msg.content && msg.content.trim().length > 0 && (
                      <SpeechPlayer text={msg.content} disabled={loading && isLastMsg} />
                    )}
                  </div>

                  {isWaitingFirstToken ? (
                    queueStatus ? (
                      /* Thẻ Hàng Đợi Phong Cách Đạo Giáo Tu Tiên */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-5 px-4 flex flex-col items-center justify-center text-center space-y-3.5 rounded-xl my-2 border relative overflow-hidden"
                        style={{
                          background: isDark
                            ? 'linear-gradient(180deg, rgba(28, 20, 10, 0.95) 0%, rgba(14, 11, 7, 0.98) 100%)'
                            : 'linear-gradient(180deg, #FFFDF8 0%, #FEF3C7 100%)',
                          borderColor: isDark ? 'rgba(212, 168, 67, 0.45)' : 'rgba(217, 119, 6, 0.45)',
                          boxShadow: isDark
                            ? '0 8px 30px rgba(0, 0, 0, 0.7), inset 0 0 25px rgba(212, 168, 67, 0.08)'
                            : '0 8px 30px rgba(180, 83, 9, 0.12), inset 0 0 20px rgba(217, 119, 6, 0.06)',
                        }}
                      >
                        {/* Họa tiết cổ phong 4 góc */}
                        <div className="absolute top-1.5 left-2 text-[10px] opacity-35 select-none" style={{ color: isDark ? '#fbbf24' : '#b45309' }}>╔</div>
                        <div className="absolute top-1.5 right-2 text-[10px] opacity-35 select-none" style={{ color: isDark ? '#fbbf24' : '#b45309' }}>╗</div>
                        <div className="absolute bottom-1.5 left-2 text-[10px] opacity-35 select-none" style={{ color: isDark ? '#fbbf24' : '#b45309' }}>╚</div>
                        <div className="absolute bottom-1.5 right-2 text-[10px] opacity-35 select-none" style={{ color: isDark ? '#fbbf24' : '#b45309' }}>╝</div>

                        {/* Chung trà bốc khói & Bát Quái xoay */}
                        <div className="relative flex items-center justify-center mt-1">
                          <div
                            className="w-13 h-13 rounded-full border flex items-center justify-center shadow-sm"
                            style={{
                              borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(217, 119, 6, 0.4)',
                              background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(254, 243, 199, 0.8)',
                            }}
                          >
                            <span className="text-2xl animate-bounce" style={{ animationDuration: '2.5s' }}>🍵</span>
                          </div>
                          <div className="absolute -inset-1 rounded-full border border-dashed border-amber-500/40 animate-spin" style={{ animationDuration: '20s' }} />
                        </div>

                        {/* Tiêu đề Đạo gia */}
                        <div className="space-y-1">
                          <h4
                            className={clsx(
                              "text-[12px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 font-serif",
                              isDark ? "text-amber-300" : "text-[#78350F]"
                            )}
                          >
                            <span>✦</span> BẦN ĐẠO ĐANG NHẬP ĐỊNH THÔI DIỄN THIÊN CƠ <span>✦</span>
                          </h4>
                          <div
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-medium border",
                              isDark ? "border-amber-500/30 bg-amber-500/15 text-amber-200" : "border-amber-500/40 bg-amber-100 text-[#78350F]"
                            )}
                          >
                            <span className={clsx("w-1.5 h-1.5 rounded-full animate-ping", isDark ? "bg-amber-400" : "bg-amber-600")} />
                            <span>Tĩnh thất đang tiếp 10 đạo hữu đàm đạo</span>
                          </div>
                        </div>

                        {/* Thẻ vị trí hàng đợi */}
                        <div
                          className="px-4 py-2 rounded-lg border text-center w-full max-w-[280px]"
                          style={{
                            background: isDark ? 'rgba(0, 0, 0, 0.5)' : '#FFFFFF',
                            borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.35)',
                            boxShadow: isDark ? 'none' : '0 2px 6px rgba(120,53,15,0.06)',
                          }}
                        >
                          <div className="text-[9px] tracking-widest uppercase font-sans" style={{ color: isDark ? 'rgba(251, 191, 36, 0.8)' : '#92400e' }}>Thứ tự tiếp duyên của bạn</div>
                          <div
                            className="text-2xl font-black font-serif my-0.5 tracking-wider"
                            style={{ color: isDark ? '#fde68a' : '#78350F' }}
                          >
                            VỊ TRÍ SỐ {queueStatus.position}
                          </div>
                          <div className="text-[9px] font-sans" style={{ color: isDark ? '#a1a1aa' : '#57534E' }}>
                            Ước chừng khoảng {queueStatus.position * 15}–{queueStatus.position * 25} giây
                          </div>
                        </div>

                        {/* Lời răn dạy của Đạo gia */}
                        <p
                          className="text-[11px] leading-relaxed max-w-[340px] italic font-serif px-2"
                          style={{ color: isDark ? 'rgba(254, 243, 199, 0.9)' : '#44403C' }}
                        >
                          &ldquo;Thiên cơ huyền ảo, dục tốc bất đạt, không thể phân tâm. Kính mời đạo hữu tĩnh tọa ngưng thần, thưởng một chung trà thanh tâm... Đạo duyên sẽ tự khắc khai mở khi đến lượt!&rdquo;
                        </p>

                        {/* Thanh chỉ báo linh lực */}
                        <div
                          className="w-full max-w-[220px] h-1 rounded-full overflow-hidden border"
                          style={{
                            background: isDark ? 'rgba(69, 26, 3, 0.7)' : '#FEF3C7',
                            borderColor: isDark ? 'rgba(217, 119, 6, 0.3)' : 'rgba(217, 119, 6, 0.4)',
                          }}
                        >
                          <div className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 animate-pulse w-full" />
                        </div>
                      </motion.div>
                    ) : (
                      <div
                        className="py-7 px-4 flex flex-col items-center justify-center text-center space-y-3 rounded-xl my-2 border border-dashed backdrop-blur-md max-w-full overflow-hidden shadow-md"
                        style={{
                          borderColor: isDark ? 'rgba(212, 168, 67, 0.35)' : 'rgba(217, 119, 6, 0.45)',
                          background: isDark
                            ? 'linear-gradient(180deg, rgba(212,168,67,0.1) 0%, rgba(212,168,67,0.03) 100%)'
                            : 'linear-gradient(180deg, #FEF3C7 0%, #FFFDF8 100%)',
                          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 16px rgba(180,83,9,0.08)',
                        }}
                      >
                        <div className="relative flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full border-2 border-dashed border-[var(--t-gold)] animate-spin opacity-60" style={{ animationDuration: '12s' }} />
                          <span className="absolute text-sm" style={{ color: 'var(--t-gold)' }}>✦</span>
                        </div>
                        <div className="space-y-1.5 w-full max-w-[320px] mx-auto px-1">
                          <p
                            className={clsx(
                              "text-[12px] sm:text-[13px] font-serif font-bold tracking-wider animate-pulse break-words uppercase",
                              isDark ? "text-amber-300" : "text-[#78350F]"
                            )}
                          >
                            {isVip
                              ? '✨ LỆNH BÀI TRI KỶ: BẦN ĐẠO TRẢI BÀN ĐÀM ĐẠO...'
                              : '✦ BẦN ĐẠO ĐANG KHAI MỞ THIÊN BÀN ✦'}
                          </p>
                          <p
                            className={clsx(
                              "text-[10px] sm:text-[11px] leading-relaxed italic font-serif break-words",
                              isDark ? "text-amber-100/80" : "text-[#57534E]"
                            )}
                          >
                            {isVip
                              ? 'Thượng khách quang lâm, bần đạo lập tức vận khởi linh cơ soi tỏ vận số, không để đạo hữu chờ đợi.'
                              : 'Bần đạo đang vận chuyển thần thức, điểm chỉ tinh diệu và soi tỏ khí số bản mệnh. Đạo hữu hoan hỉ tĩnh tâm chờ trong giây lát (~10–15s)...'}
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
            className="absolute bottom-3 right-4 px-3 py-1.5 rounded-full text-[10.5px] font-mystic font-bold shadow-2xl backdrop-blur-md flex items-center gap-1.5 transition-all z-20 hover:scale-105 active:scale-95 cursor-pointer select-none"
            style={{
              background: isDark
                ? 'linear-gradient(145deg, rgba(30, 38, 56, 0.96) 0%, rgba(12, 16, 26, 0.98) 100%)'
                : 'linear-gradient(145deg, #FFFFFF 0%, #FAF5EA 100%)',
              border: isDark ? '1px solid rgba(254, 240, 138, 0.4)' : '1px solid rgba(184, 146, 42, 0.55)',
              color: isDark ? '#FEF08A' : '#78350F',
              textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 0 rgba(255,255,255,0.8)',
              boxShadow: isDark
                ? 'inset 0 1px 1.5px rgba(255,255,255,0.25), inset 0 -2px 3px rgba(0,0,0,0.7), 0 6px 20px rgba(0,0,0,0.6), 0 0 10px rgba(212,168,67,0.2)'
                : 'inset 0 1px 1.5px rgba(255,255,255,0.95), inset 0 -2px 3px rgba(140,100,20,0.15), 0 6px 16px rgba(120,53,15,0.15)',
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
            className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-mystic focus:outline-none transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: 'var(--t-card)',
              border: isDark ? '1px solid var(--t-border)' : '1px solid rgba(184, 146, 42, 0.4)',
              color: 'var(--t-text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg text-[12px] font-mystic font-bold tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-95 select-none"
            style={{
              background: isDark
                ? 'linear-gradient(145deg, #FDE68A 0%, #D4A843 45%, #92400E 100%)'
                : 'linear-gradient(145deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
              border: isDark ? '1px solid rgba(254, 240, 138, 0.6)' : '1px solid rgba(146, 64, 14, 0.6)',
              color: isDark ? '#1C1917' : '#FFFFFF',
              textShadow: isDark ? '0 1px 0 rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.4)',
              boxShadow: isDark
                ? 'inset 0 1px 2px rgba(255,255,255,0.85), inset 0 -2px 4px rgba(0,0,0,0.6), 0 4px 14px rgba(212,168,67,0.4), 0 2px 4px rgba(0,0,0,0.5)'
                : 'inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 3px rgba(120,53,15,0.5), 0 4px 12px rgba(180,83,9,0.3)',
            }}
          >
            {loading ? '…' : 'Hỏi'}
          </button>
        </div>
      </div>

    </div>
  );
}
