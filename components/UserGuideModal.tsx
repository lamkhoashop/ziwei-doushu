'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import clsx from 'clsx';

export const USER_GUIDE_STORAGE_KEY = 'zw_guide_seen_v1';

interface UserGuideModalProps {
  open: boolean;
  onClose: () => void;
  initialStep?: number;
}

const STEPS = [
  {
    id: 'step1',
    num: '01',
    title: 'Lập Lá Số',
    sub: 'Chân Thái Dương',
    icon: '🧭',
    badge: 'Bước 1',
  },
  {
    id: 'step2',
    num: '02',
    title: '12 Cung Vị',
    sub: 'Chính Tinh & Tứ Hóa',
    icon: '🏛️',
    badge: 'Bước 2',
  },
  {
    id: 'step3',
    num: '03',
    title: 'Thôi Diễn AI',
    sub: 'Bản Mệnh · Đại Hạn · Lưu Niên',
    icon: '☯️',
    badge: 'Bước 3 · Trọng Tâm',
  },
  {
    id: 'step4',
    num: '04',
    title: 'Tiện Ích Trợ Lực',
    sub: 'Tẩy Bàn · Sổ Tay · Xuất Thiệp',
    icon: '✨',
    badge: 'Bước 4',
  },
];

export default function UserGuideModal({
  open,
  onClose,
  initialStep = 0,
}: UserGuideModalProps) {
  const [activeStep, setActiveStep] = useState(initialStep);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (open) {
      setActiveStep(initialStep);
      try {
        localStorage.setItem(USER_GUIDE_STORAGE_KEY, 'true');
      } catch {
        /* skip */
      }
    }
  }, [open, initialStep]);

  // Khóa scroll trang khi mở modal
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[130] flex items-center justify-center p-2.5 sm:p-5"
        style={{
          background: isDark ? 'rgba(2, 6, 14, 0.88)' : 'rgba(20, 14, 6, 0.78)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl overflow-hidden border flex flex-col w-full max-w-[880px] max-h-[92vh] sm:max-h-[88vh] shadow-2xl relative"
          style={{
            borderColor: isDark ? 'rgba(212,168,67,0.35)' : 'rgba(184,146,42,0.4)',
            background: isDark
              ? 'linear-gradient(145deg, #0d121c 0%, #070a10 60%, #150f08 100%)'
              : 'linear-gradient(145deg, #fefcf7 0%, #faf3e5 60%, #f4eada 100%)',
            boxShadow: isDark
              ? '0 25px 80px rgba(0,0,0,0.92), 0 0 35px rgba(212,168,67,0.18)'
              : '0 25px 70px rgba(80,50,20,0.25), 0 0 25px rgba(212,168,67,0.2)',
          }}
        >
          {/* ── HEADER MODAL ── */}
          <div
            className="px-4 sm:px-6 py-3.5 border-b flex items-center justify-between shrink-0 relative"
            style={{
              borderColor: isDark ? 'rgba(212,168,67,0.2)' : 'rgba(184,146,42,0.25)',
              background: isDark
                ? 'linear-gradient(180deg, rgba(212,168,67,0.12) 0%, rgba(13,18,28,0.4) 100%)'
                : 'linear-gradient(180deg, rgba(212,168,67,0.15) 0%, rgba(254,252,247,0.6) 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border shrink-0 shadow-sm"
                style={{
                  borderColor: isDark ? 'rgba(254,240,138,0.4)' : 'rgba(184,146,42,0.45)',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(212,168,67,0.25), rgba(13,18,28,0.9))'
                    : 'linear-gradient(135deg, rgba(254,240,138,0.6), rgba(255,255,255,0.9))',
                }}
              >
                📖
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    className="text-sm sm:text-base font-bold font-mystic tracking-wider uppercase m-0"
                    style={{ color: isDark ? '#FEF08A' : '#78350F' }}
                  >
                    Bí Kíp Xem Số & Thôi Diễn AI
                  </h2>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border"
                    style={{
                      borderColor: isDark ? 'rgba(212,168,67,0.4)' : 'rgba(184,146,42,0.4)',
                      background: isDark ? 'rgba(212,168,67,0.12)' : 'rgba(184,146,42,0.12)',
                      color: isDark ? '#FDE68A' : '#92400E',
                    }}
                  >
                    Phái Nghê Hải Hà
                  </span>
                </div>
                <p
                  className="text-[11px] sm:text-xs m-0 mt-0.5 line-clamp-1 font-sans"
                  style={{ color: isDark ? 'rgba(226,232,240,0.7)' : 'rgba(120,53,15,0.8)' }}
                >
                  Hướng dẫn lập lá số chuẩn thiên văn, đọc hiểu 12 cung & luận giải 3 chiều thời gian
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Đóng"
              className="w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(184,146,42,0.3)',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                color: isDark ? '#FEF08A' : '#78350F',
              }}
            >
              ✕
            </button>
          </div>

          {/* ── STEP TABS ── */}
          <div
            className="flex items-center border-b px-2 sm:px-6 py-2 gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar shrink-0"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(184,146,42,0.15)',
              background: isDark ? 'rgba(7,10,16,0.6)' : 'rgba(245,238,225,0.6)',
            }}
          >
            {STEPS.map((s, idx) => {
              const active = activeStep === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(idx)}
                  className={clsx(
                    'flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-mystic transition-all cursor-pointer select-none shrink-0 border relative',
                    active
                      ? 'shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:border-amber-500/30'
                  )}
                  style={{
                    borderColor: active
                      ? isDark
                        ? '#FDE68A'
                        : '#B45309'
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(184,146,42,0.2)',
                    background: active
                      ? isDark
                        ? 'linear-gradient(135deg, rgba(212,168,67,0.25) 0%, rgba(20,26,40,0.9) 100%)'
                        : 'linear-gradient(135deg, #FFFDF8 0%, #F5EADB 100%)'
                      : isDark
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(255,255,255,0.5)',
                    color: active
                      ? isDark
                        ? '#FEF08A'
                        : '#78350F'
                      : isDark
                      ? 'rgba(240,246,255,0.65)'
                      : '#6B7280',
                  }}
                >
                  <span className="text-base">{s.icon}</span>
                  <div className="text-left">
                    <div className="font-bold flex items-center gap-1.5 leading-tight">
                      <span>{s.title}</span>
                      {idx === 2 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-sans font-bold bg-amber-500 text-slate-950 uppercase tracking-tighter">
                          Trọng Tâm
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] opacity-75 font-sans leading-tight hidden sm:block">
                      {s.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── CONTENT BODY ── */}
          <div
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 text-xs sm:text-sm leading-relaxed"
            style={{
              color: isDark ? 'rgba(226, 232, 240, 0.9)' : '#292524',
            }}
          >
            {/* ══ STEP 1: LẬP LÁ SỐ ══ */}
            {activeStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div
                  className="p-3.5 sm:p-4 rounded-xl border flex items-start gap-3"
                  style={{
                    borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(184,146,42,0.3)',
                    background: isDark ? 'rgba(212,168,67,0.06)' : 'rgba(254,243,199,0.4)',
                  }}
                >
                  <span className="text-2xl mt-0.5">🧭</span>
                  <div>
                    <h3
                      className="font-bold font-mystic text-sm sm:text-base m-0 mb-1"
                      style={{ color: isDark ? '#FEF08A' : '#78350F' }}
                    >
                      BƯỚC 1: LẬP LÁ SỐ & HIỆU CHỈNH GIỜ MẶT TRỜI THỰC
                    </h3>
                    <p className="m-0 text-xs sm:text-[13px] opacity-90 leading-relaxed font-sans">
                      Để có một lá số đúng tuyệt đối, điều tiên quyết là phải an định đúng vị trí Cung Mệnh và Cung Thân thông qua việc quy đổi chính xác giờ sinh địa phương.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 mb-1.5 flex items-center gap-1.5">
                      <span>☀️</span>
                      <span>1. Hiệu chỉnh Chân Thái Dương Thời (True Solar Time)</span>
                    </div>
                    <p className="text-xs font-sans leading-relaxed m-0 opacity-85">
                      Việt Nam trải dài từ 102°Đ đến 109°Đ kinh độ Đông. Múi giờ hành chính UTC+7 (kinh tuyến chuẩn 105°Đ) thường lệch từ <strong>7 đến 22 phút</strong> so với vị trí mặt trời thực tế đỉnh đầu.
                      Hệ thống tự động tra cứu tọa độ 63 Tỉnh/Thành phố để bù trừ sai số này, đảm bảo phân chia 12 canh giờ chuẩn mực.
                    </p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 mb-1.5 flex items-center gap-1.5">
                      <span>🌓</span>
                      <span>2. Phân biệt Giờ Tý Sớm & Giờ Tý Muộn</span>
                    </div>
                    <p className="text-xs font-sans leading-relaxed m-0 opacity-85">
                      Theo phép Tử Vi chân truyền:
                      <br />• <strong>Giờ Dạ Tý (Tý Muộn):</strong> 23:00 – 24:00 (vẫn tính là ngày hôm trước).
                      <br />• <strong>Giờ Chính Tý (Tý Sớm):</strong> 00:00 – 01:00 (đã sang ngày mới).
                      <br />Hệ thống tự động nhận diện và tính toán chuẩn xác Can Chi ngày sinh, tránh nhầm lẫn tai hại.
                    </p>
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl border text-xs font-sans flex items-center justify-between gap-3"
                  style={{
                    borderColor: isDark ? 'rgba(56,189,248,0.3)' : 'rgba(14,165,233,0.3)',
                    background: isDark ? 'rgba(56,189,248,0.06)' : 'rgba(224,242,254,0.5)',
                    color: isDark ? '#BAE6FD' : '#0369A1',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>Bạn chỉ cần nhập ngày giờ sinh trên giấy khai sinh và chọn Tỉnh/Thành sinh ra, mọi phép quy đổi thiên văn hệ thống sẽ tự động thực hiện hoàn hảo.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 2: 12 CUNG VỊ ══ */}
            {activeStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div
                  className="p-3.5 sm:p-4 rounded-xl border flex items-start gap-3"
                  style={{
                    borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(184,146,42,0.3)',
                    background: isDark ? 'rgba(212,168,67,0.06)' : 'rgba(254,243,199,0.4)',
                  }}
                >
                  <span className="text-2xl mt-0.5">🏛️</span>
                  <div>
                    <h3
                      className="font-bold font-mystic text-sm sm:text-base m-0 mb-1"
                      style={{ color: isDark ? '#FEF08A' : '#78350F' }}
                    >
                      BƯỚC 2: CẤU TRÚC BÀN CỜ 12 CUNG VỊ & TINH DIỆU
                    </h3>
                    <p className="m-0 text-xs sm:text-[13px] opacity-90 leading-relaxed font-sans">
                      Bàn cờ Tử Vi là vũ trụ thu nhỏ gồm 12 cung địa bàn cố định, phân bố các phương diện trọng yếu trong cuộc đời mỗi con người.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                  <div
                    className="p-3 rounded-xl border space-y-1.5"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 flex items-center gap-1.5">
                      <span>👑</span> <span>Mệnh, Thân & Cục Số</span>
                    </div>
                    <p className="m-0 opacity-85 leading-relaxed">
                      • <strong>Cung Mệnh:</strong> Bản chất tiên thiên, cốt cách, tư chất từ khi lọt lòng đến trước 30 tuổi.
                      <br />• <strong>Cung Thân:</strong> Hậu vận sau 30 tuổi, nơi gửi gắm khát vọng và đích đến cuộc đời.
                      <br />• <strong>Cục Số:</strong> Ngũ Hành Cục (Thủy Nhị, Mộc Tam, Kim Tứ, Thổ Ngũ, Hỏa Lục) xác định độ tuổi bắt đầu bước vào Đại Hạn đầu tiên.
                    </p>
                  </div>

                  <div
                    className="p-3 rounded-xl border space-y-1.5"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 flex items-center gap-1.5">
                      <span>✨</span> <span>14 Chính Tinh & Đắc Hãm</span>
                    </div>
                    <p className="m-0 opacity-85 leading-relaxed">
                      14 vì sao rường cột chi phối lá số (Tử Vi, Thiên Cơ, Thái Dương, Vũ Khúc, Thiên Đồng, Liêm Trinh, Thiên Phủ, Thái Âm, Tham Lang, Cự Môn, Thiên Tướng, Thiên Lương, Thất Sát, Phá Quân).
                      <br />Được phân định trạng thái rõ rệt: <strong>Miếu (M)</strong> rực rỡ nhất, <strong>Vượng (V)</strong> sáng sủa, <strong>Đắc (Đ)</strong> hữu dụng, <strong>Hãm (H)</strong> mờ tối cần sao cứu giải.
                    </p>
                  </div>

                  <div
                    className="p-3 rounded-xl border space-y-1.5"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 flex items-center gap-1.5">
                      <span>⚡</span> <span>Tứ Hóa - Cội Nguồn Biến Hóa</span>
                    </div>
                    <p className="m-0 opacity-85 leading-relaxed">
                      Sao là Thể, Tứ Hóa là Dụng:
                      <br />• <strong>Hóa Lộc (🟢):</strong> Tài lộc, duyên lành, mở rộng.
                      <br />• <strong>Hóa Quyền (🔴):</strong> Quyền uy, năng lực hành động.
                      <br />• <strong>Hóa Khoa (🔵):</strong> Danh tiếng, quý nhân, hóa giải.
                      <br />• <strong>Hóa Kỵ (⚫):</strong> Chấp niệm, trở ngại, bài học lớn nhất đời người cần tu dưỡng.
                    </p>
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl border text-xs font-sans leading-relaxed"
                  style={{
                    borderColor: isDark ? 'rgba(212,168,67,0.25)' : 'rgba(184,146,42,0.25)',
                    background: isDark ? 'rgba(212,168,67,0.04)' : 'rgba(254,243,199,0.3)',
                  }}
                >
                  <strong className="text-amber-500 font-mystic">Nguyên lý Tam Phương Tứ Chính & Đối Cung:</strong> Một cung vị không bao giờ đứng độc lập. Phái Nghê Hải Hà đặc biệt chú trọng <strong>Cung Xung Chiếu (Đối Cung)</strong> và hai cung <strong>Tam Hợp</strong> để xem hội tụ cát tinh hay sát tinh vây hãm.
                </div>
              </motion.div>
            )}

            {/* ══ STEP 3: THÔI DIỄN AI (TRỌNG TÂM YÊU CẦU CỦA NGƯỜI DÙNG) ══ */}
            {activeStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div
                  className="p-3.5 sm:p-4 rounded-xl border flex items-start gap-3"
                  style={{
                    borderColor: isDark ? 'rgba(254,240,138,0.45)' : '#B45309',
                    background: isDark
                      ? 'linear-gradient(145deg, rgba(212,168,67,0.18) 0%, rgba(20,26,40,0.5) 100%)'
                      : 'linear-gradient(145deg, rgba(254,243,199,0.9) 0%, rgba(254,215,170,0.4) 100%)',
                  }}
                >
                  <span className="text-2xl mt-0.5">☯️</span>
                  <div>
                    <h3
                      className="font-bold font-mystic text-sm sm:text-base m-0 mb-1"
                      style={{ color: isDark ? '#FEF08A' : '#78350F' }}
                    >
                      BƯỚC 3: THÔI DIỄN THIÊN CƠ CÙNG AI AGENT (PHÁI NGHÊ HẢI HÀ)
                    </h3>
                    <p className="m-0 text-xs sm:text-[13px] opacity-90 leading-relaxed font-sans">
                      Hệ thống AI được truyền dạy tinh hoa học thuật của đại sư <strong>Nghê Hải Hà (Ni Hai-sha)</strong>: Luận đoán sắc sảo, trực diện, bỏ mê tín dị đoan, lấy việc thấu suốt bản thân và hành động thực tiễn làm gốc rễ cải mệnh.
                    </p>
                  </div>
                </div>

                {/* ── CHIỀU KHÔNG GIAN 1: 3 THỜI KỲ ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mystic text-amber-400">✦</span>
                    <h4
                      className="font-bold font-mystic text-xs sm:text-sm uppercase tracking-wider m-0"
                      style={{ color: isDark ? '#FEF08A' : '#78350F' }}
                    >
                      1. LUẬN GIẢI THEO 3 CHIỀU KHÔNG GIAN THỜI GIAN (BẢN MỆNH · ĐẠI HẠN · LƯU NIÊN)
                    </h4>
                  </div>
                  <p className="text-xs font-sans opacity-85 m-0 leading-relaxed">
                    Khi bạn chuyển đổi giữa 3 mốc trên thanh thời gian <strong>[Bản Mệnh] [Đại Hạn] [Lưu Niên]</strong>, 6 nút chủ đề luận giải (<em>Mệnh Cách, Tình Duyên, Sự Nghiệp, Tài Bạch, Sức Khỏe, Tính Cách</em>) sẽ tự động thích ứng để soi chiếu đúng chiều kích vận hạn tương ứng:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* KHỐI 1: BẢN MỆNH */}
                    <div
                      className="p-3.5 rounded-xl border flex flex-col justify-between"
                      style={{
                        borderColor: isDark ? 'rgba(245,158,11,0.35)' : 'rgba(217,119,6,0.35)',
                        background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(254,243,199,0.3)',
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="font-bold font-mystic text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            🌟 BẢN MỆNH
                          </span>
                          <span className="text-[10px] text-amber-300 font-sans font-medium">Gốc Tiên Thiên Trọn Đời</span>
                        </div>
                        <div className="text-[11.5px] font-sans space-y-1.5 leading-relaxed opacity-90">
                          <div>
                            <strong className="text-amber-300 font-medium">• Mệnh Cách:</strong> Cốt cách, khí chất, tầm vóc lớn cả đời.
                          </div>
                          <div>
                            <strong className="text-amber-300 font-medium">• Tình Duyên:</strong> Cung Phu Thê gốc, duyên nợ, đặc điểm bạn đời.
                          </div>
                          <div>
                            <strong className="text-amber-300 font-medium">• Sự Nghiệp:</strong> Ngành nghề đắc địa, đỉnh cao quan lộ.
                          </div>
                          <div>
                            <strong className="text-amber-300 font-medium">• Tài Bạch:</strong> Nguồn tiền tài chính/thiên tài, năng lực tụ tài.
                          </div>
                          <div>
                            <strong className="text-amber-300 font-medium">• Sức Khỏe:</strong> Tạng phủ tiên thiên, thể trạng căn bản.
                          </div>
                          <div>
                            <strong className="text-amber-300 font-medium">• Tính Cách:</strong> Chiều sâu tâm lý, góc khuất cần tu dưỡng.
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-amber-500/20 text-[10px] text-amber-400 font-sans">
                        👉 Giúp định vị bản thân và chiến lược đường dài cả một kiếp người.
                      </div>
                    </div>

                    {/* KHỐI 2: ĐẠI HẠN */}
                    <div
                      className="p-3.5 rounded-xl border flex flex-col justify-between"
                      style={{
                        borderColor: isDark ? 'rgba(56,189,248,0.35)' : 'rgba(14,165,233,0.35)',
                        background: isDark ? 'rgba(56,189,248,0.06)' : 'rgba(224,242,254,0.3)',
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="font-bold font-mystic text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            ⏳ ĐẠI HẠN
                          </span>
                          <span className="text-[10px] text-sky-300 font-sans font-medium">Vận Trình 10 Năm</span>
                        </div>
                        <div className="text-[11.5px] font-sans space-y-1.5 leading-relaxed opacity-90">
                          <div>
                            <strong className="text-sky-300 font-medium">• Mệnh Cách:</strong> Thời thế 10 năm mở ra thời cơ hay cần thủ thế.
                          </div>
                          <div>
                            <strong className="text-sky-300 font-medium">• Tình Duyên:</strong> Hôn nhân, tao ngộ, sóng gió hay hòa hợp 10 năm.
                          </div>
                          <div>
                            <strong className="text-sky-300 font-medium">• Sự Nghiệp:</strong> Thăng trầm công danh, cơ hội bứt phá chuyển việc.
                          </div>
                          <div>
                            <strong className="text-sky-300 font-medium">• Tài Bạch:</strong> Vận kiếm tiền thập kỷ, giai đoạn tích lũy hay hao tán.
                          </div>
                          <div>
                            <strong className="text-sky-300 font-medium">• Sức Khỏe:</strong> Cảnh báo bệnh lý và khủng hoảng thể chất theo đại vận.
                          </div>
                          <div>
                            <strong className="text-sky-300 font-medium">• Tính Cách:</strong> Biến chuyển thế giới quan và tâm lý trưởng thành.
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-sky-500/20 text-[10px] text-sky-400 font-sans">
                        👉 Dời Mệnh Đại Hạn & an Tứ Hóa 10 năm để nắm bắt thiên thời.
                      </div>
                    </div>

                    {/* KHỐI 3: LƯU NIÊN */}
                    <div
                      className="p-3.5 rounded-xl border flex flex-col justify-between"
                      style={{
                        borderColor: isDark ? 'rgba(52,211,153,0.35)' : 'rgba(16,185,129,0.35)',
                        background: isDark ? 'rgba(52,211,153,0.06)' : 'rgba(209,250,229,0.3)',
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="font-bold font-mystic text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ⚡ LƯU NIÊN
                          </span>
                          <span className="text-[10px] text-emerald-300 font-sans font-medium">Tiểu Hạn Từng Năm</span>
                        </div>
                        <div className="text-[11.5px] font-sans space-y-1.5 leading-relaxed opacity-90">
                          <div>
                            <strong className="text-emerald-300 font-medium">• Mệnh Cách:</strong> Vận khí tổng quan 12 tháng, năm hanh thông hay thử thách.
                          </div>
                          <div>
                            <strong className="text-emerald-300 font-medium">• Tình Duyên:</strong> Hỷ sự, đào hoa nở rộ, hoặc mâu thuẫn cần nhường nhịn.
                          </div>
                          <div>
                            <strong className="text-emerald-300 font-medium">• Sự Nghiệp:</strong> Cơ hội thi cử, ký kết hợp đồng, chuyển dời trong năm.
                          </div>
                          <div>
                            <strong className="text-emerald-300 font-medium">• Tài Bạch:</strong> Dòng tiền cụ thể năm nay, tháng sinh lời, tháng cẩn trọng.
                          </div>
                          <div>
                            <strong className="text-emerald-300 font-medium">• Sức Khỏe:</strong> Tai ương xe cộ, sông nước hay các tháng xung khắc.
                          </div>
                          <div>
                            <strong className="text-emerald-300 font-medium">• Tính Cách:</strong> Tâm trạng, căng thẳng hay phấn chấn trong từng giai đoạn.
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-400 font-sans">
                        👉 Kích hoạt Lưu Thái Tuế & Lưu Tứ Hóa của từng năm cụ thể.
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CHIỀU KHÔNG GIAN 2: BẤM TRỰC TIẾP CUNG VỊ ── */}
                <div
                  className="p-3.5 sm:p-4 rounded-xl border space-y-2"
                  style={{
                    borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(184,146,42,0.3)',
                    background: isDark ? 'rgba(212,168,67,0.05)' : '#FFFFFF',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mystic text-amber-400">✦</span>
                    <h4
                      className="font-bold font-mystic text-xs sm:text-sm uppercase tracking-wider m-0"
                      style={{ color: isDark ? '#FEF08A' : '#78350F' }}
                    >
                      2. BẤM TRỰC TIẾP VÀO 1 CUNG VỊ TRÊN BÀN CỜ ĐỂ MỔ XẺ CHI TIẾT
                    </h4>
                  </div>
                  <p className="text-xs font-sans opacity-90 m-0 leading-relaxed">
                    Bạn không cần gõ phím! Chỉ cần <strong>chạm hoặc nhấp chuột thẳng vào 1 ô vuông trên bàn cờ 12 cung</strong> (ví dụ: bấm vào cung <em>Phu Thê, Quan Lộc, Huynh Đệ, Điền Trạch...</em>):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-sans">
                    <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <strong className="text-amber-400">1. Tinh Diệu Bản Cung:</strong> Phân tích các chính tinh miếu hãm tọa thủ và bộ sao phụ tinh kích hoạt.
                    </div>
                    <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <strong className="text-amber-400">2. Đối Cung Tá Tinh:</strong> Bí pháp Nghê Hải Hà: mượn tinh tú đối diện để soi tỏ điểm mù và cơ duyên tiềm ẩn.
                    </div>
                    <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <strong className="text-amber-400">3. Tam Phương Tứ Chính:</strong> Tổng hòa cát tinh nâng đỡ hay sát tinh vây bọc, kèm lời khuyên hành vi hóa giải.
                    </div>
                  </div>
                </div>

                {/* ── CHIỀU KHÔNG GIAN 3: HỎI ĐÁP TỰ DO ── */}
                <div
                  className="p-3 rounded-xl border text-xs font-sans flex items-center justify-between gap-3"
                  style={{
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(184,146,42,0.25)',
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(254,243,199,0.3)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span>
                      <strong>Đặt câu hỏi tự do:</strong> Bạn có thể gõ câu hỏi riêng tư vào ô chat (ví dụ: <em>&quot;Năm 2026 tôi nên hùn vốn mở công ty không?&quot;</em>, <em>&quot;Lá số này vợ chồng hòa hợp hay xung khắc?&quot;</em>) để nhận lời thôi diễn tường tận.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 4: TIỆN ÍCH TRỢ LỰC ══ */}
            {activeStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div
                  className="p-3.5 sm:p-4 rounded-xl border flex items-start gap-3"
                  style={{
                    borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(184,146,42,0.3)',
                    background: isDark ? 'rgba(212,168,67,0.06)' : 'rgba(254,243,199,0.4)',
                  }}
                >
                  <span className="text-2xl mt-0.5">✨</span>
                  <div>
                    <h3
                      className="font-bold font-mystic text-sm sm:text-base m-0 mb-1"
                      style={{ color: isDark ? '#FEF08A' : '#78350F' }}
                    >
                      BƯỚC 4: BÍ KÍP TIỆN ÍCH & TRỢ LỰC CAO CẤP
                    </h3>
                    <p className="m-0 text-xs sm:text-[13px] opacity-90 leading-relaxed font-sans">
                      Các công cụ hỗ trợ trải nghiệm xem số thuận tiện, riêng tư và chuẩn xác nhất.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                  {/* Tiện ích 1: Tẩy Bàn Tái Luận */}
                  <div
                    className="p-3.5 rounded-xl border space-y-1.5"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 flex items-center gap-1.5">
                      <span>🍵</span> <span>Tẩy Bàn Tái Luận (Làm Mới Luận Giải)</span>
                    </div>
                    <p className="m-0 opacity-85 leading-relaxed">
                      Nút <strong>Tẩy Bàn Tái Luận</strong> (biểu tượng chén trà trên đầu thanh công cụ chat) giúp xóa sạch toàn bộ lịch sử trò chuyện cũ, giải phóng bộ nhớ để bắt đầu một quẻ luận đoán mới tinh khiết, tránh hiện tượng câu trả lời cũ bị lẫn lộn sang câu hỏi mới.
                    </p>
                  </div>

                  {/* Tiện ích 2: Sao Chép & Xuất Thiệp */}
                  <div
                    className="p-3.5 rounded-xl border space-y-1.5"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 flex items-center gap-1.5">
                      <span>🎴</span> <span>Sao Chép Lời Luận & Xuất Thiệp Nghệ Thuật</span>
                    </div>
                    <p className="m-0 opacity-85 leading-relaxed">
                      • Nút <strong>Sao Chép:</strong> Copy toàn bộ phân tích chi tiết của AI định dạng văn bản chuẩn chỉ trong 1 giây.
                      <br />• Nút <strong>Xuất Thiệp Lá Số:</strong> Tạo thẻ bài ảnh phong thủy cổ phong độ nét cao để lưu giữ trong điện thoại hoặc gửi tặng người thân.
                    </p>
                  </div>

                  {/* Tiện ích 3: Sổ Tay Bản Mệnh */}
                  <div
                    className="p-3.5 rounded-xl border space-y-1.5"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 flex items-center gap-1.5">
                      <span>📖</span> <span>Sổ Tay Bản Mệnh Gia Đình</span>
                    </div>
                    <p className="m-0 opacity-85 leading-relaxed">
                      Lưu trữ danh bạ không giới hạn lá số cha mẹ, vợ chồng, con cái, đối tác.
                      <br /><span className="text-emerald-400 font-semibold">🔒 An toàn tuyệt đối:</span> Dữ liệu chỉ lưu trong trình duyệt máy bạn (localStorage), tuyệt đối không gửi hay lưu trữ bất kỳ thông tin nào lên máy chủ.
                    </p>
                  </div>

                  {/* Tiện ích 4: Kênh Báo Lỗi 2 Chiều */}
                  <div
                    className="p-3.5 rounded-xl border space-y-1.5"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(184,146,42,0.2)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    }}
                  >
                    <div className="font-bold font-mystic text-amber-500 flex items-center gap-1.5">
                      <span>⚠</span> <span>Kênh Hỗ Trợ Kỹ Thuật 2 Chiều</span>
                    </div>
                    <p className="m-0 opacity-85 leading-relaxed">
                      Nút <strong>Báo lỗi / Góp ý</strong> cố định ở góc dưới bên phải màn hình kết nối trực tiếp đến quản trị viên. Khi bạn gửi phản ánh, quản trị viên sẽ phản hồi trực tiếp ngay trong khung chat của bạn.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div
            className="px-4 sm:px-6 py-3 border-t flex items-center justify-between gap-3 shrink-0"
            style={{
              borderColor: isDark ? 'rgba(212,168,67,0.2)' : 'rgba(184,146,42,0.25)',
              background: isDark ? 'rgba(7,10,16,0.85)' : 'rgba(245,238,225,0.85)',
            }}
          >
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className="h-2 rounded-full transition-all cursor-pointer"
                  style={{
                    width: activeStep === idx ? 24 : 8,
                    background:
                      activeStep === idx
                        ? isDark
                          ? '#FEF08A'
                          : '#B45309'
                        : isDark
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(0,0,0,0.15)',
                  }}
                  aria-label={`Chuyển tới bước ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {activeStep > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-mystic font-semibold transition-all cursor-pointer hover:scale-102 active:scale-98"
                  style={{
                    borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(184,146,42,0.3)',
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                    color: isDark ? '#FEF08A' : '#78350F',
                  }}
                >
                  ← Trước
                </button>
              )}

              {activeStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  className="px-4 py-1.5 rounded-lg border text-xs font-mystic font-bold transition-all cursor-pointer hover:scale-102 active:scale-98 shadow-sm"
                  style={{
                    borderColor: isDark ? '#FEF08A' : '#B45309',
                    background: isDark
                      ? 'linear-gradient(135deg, #FDE68A 0%, #D4A843 60%, #92400E 100%)'
                      : 'linear-gradient(135deg, #FFFBEB 0%, #FBBF24 60%, #D97706 100%)',
                    color: isDark ? '#1C1917' : '#451A03',
                  }}
                >
                  Tiếp Theo →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg border text-xs font-mystic font-bold transition-all cursor-pointer hover:scale-102 active:scale-98 shadow-sm"
                  style={{
                    borderColor: isDark ? '#FEF08A' : '#B45309',
                    background: isDark
                      ? 'linear-gradient(135deg, #FDE68A 0%, #D4A843 60%, #92400E 100%)'
                      : 'linear-gradient(135deg, #FFFBEB 0%, #FBBF24 60%, #D97706 100%)',
                    color: isDark ? '#1C1917' : '#451A03',
                  }}
                >
                  ✓ Đã Hiểu Bí Kíp
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
