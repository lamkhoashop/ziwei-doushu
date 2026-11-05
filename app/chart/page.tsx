'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import StarField from '@/components/StarField';
import ShareModal from '@/components/ShareModal';
import ProfileBookModal from '@/components/ProfileBookModal';
import { useTheme } from '@/components/ThemeProvider';
import { generateChart } from '@/lib/ziwei/algorithm';
import { getSavedProfiles, saveProfile } from '@/lib/ziwei/profiles';
import type { BirthInfo, ZiweiChart, Palace } from '@/lib/ziwei/types';

// ─── Nút chuyển đổi giao diện Sáng / Tối ───────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer select-none"
      style={{
        borderColor: isDark ? 'rgba(254,240,138,0.3)' : 'rgba(184,146,42,0.45)',
        background: isDark
          ? 'linear-gradient(145deg, rgba(32, 40, 58, 0.95) 0%, rgba(14, 18, 30, 0.98) 100%)'
          : 'linear-gradient(145deg, #FFFFFF 0%, #FAF5EA 100%)',
        boxShadow: isDark
          ? 'inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1.5px 2px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.35)'
          : 'inset 0 1px 1px rgba(255,255,255,0.85), inset 0 -1.5px 2px rgba(140,100,20,0.15), 0 2px 5px rgba(120,53,15,0.06)',
        transition: 'background 0.35s ease, border-color 0.35s ease',
      }}
    >
      <div
        className="relative flex items-center rounded-full flex-shrink-0"
        style={{
          width: 34,
          height: 18,
          background: isDark ? 'rgba(12,24,64,0.95)' : 'rgba(230,195,80,0.55)',
          padding: '2px',
          boxSizing: 'border-box',
          boxShadow: isDark ? 'inset 0 1.5px 3px rgba(0,0,0,0.8)' : 'inset 0 1.5px 3px rgba(120,53,15,0.25)',
          transition: 'background 0.35s ease',
        }}
      >
        <motion.div
          animate={{ x: isDark ? 0 : 16 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: 14,
            height: 14,
            borderRadius: '9999px',
            background: isDark
              ? 'linear-gradient(135deg, #b8a050, #e8d090)'
              : 'linear-gradient(135deg, #e89010, #f8d050)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: isDark ? '#FEF08A' : '#78350F',
          textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 0 rgba(255,255,255,0.8)',
          transition: 'color 0.35s ease',
        }}
      >
        {isDark ? 'Tối' : 'Sáng'}
      </span>
    </motion.button>
  );
}

/**
 * Trang tra cứu Mệnh Bàn Tử Vi Đẩu Số
 * Hỗ trợ an sao đầy đủ, chuyển đổi Bản mệnh / Đại hạn / Lưu niên,
 * cùng AI Agent luận giải chuyên sâu theo trường phái Thiên Kỷ Nghê Hải Hà.
 */
export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [boardHeight, setBoardHeight] = useState<number | undefined>(undefined);
  const [lastSavedInfo, setLastSavedInfo] = useState<BirthInfo | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [profileBookOpen, setProfileBookOpen] = useState(false);
  const [savedProfileCount, setSavedProfileCount] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleGenerateChart = (info: BirthInfo) => {
    try {
      localStorage.setItem('ziwei_active_birth_info', JSON.stringify(info));
      sessionStorage.setItem('ziwei_chart_active', 'true');
    } catch { /* ignore */ }
    setChart(generateChart(info));
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('ziwei_active_birth_info');
      sessionStorage.removeItem('ziwei_chart_active');
    } catch { /* ignore */ }
    setChart(null);
    setLastSavedInfo(null);
    setSelectedPalace(null);
  };

  // Đếm số lượng hồ sơ đã lưu trong sổ tay
  useEffect(() => {
    setSavedProfileCount(getSavedProfiles().length);
  }, [profileBookOpen]);

  // Khôi phục lá số từ URL tham số hoặc từ phiên trước đó
  useEffect(() => {
    try {
      // 1. Nếu có query parameters đầy đủ trên URL (từ liên kết chia sẻ), tự động hiển thị lá số
      const params = new URLSearchParams(window.location.search);
      const year = params.get('year');
      const month = params.get('month');
      const day = params.get('day');
      const hour = params.get('hour');
      if (year && month && day && hour !== null) {
        const parsedHour = parseInt(hour, 10);
        const branchHour = (parsedHour >= 0 && parsedHour <= 11)
          ? parsedHour
          : Math.floor(((parsedHour + 1) % 24) / 2);

        const info: BirthInfo = {
          name: params.get('name') || 'Bản Mệnh',
          gender: (params.get('gender') as 'male' | 'female') || 'male',
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day, 10),
          hour: branchHour,
          province: params.get('province') || undefined,
        };
        handleGenerateChart(info);
        return;
      }

      // 2. Nếu là F5 (Reload trang), khôi phục phiên đang xem
      const saved = localStorage.getItem('ziwei_active_birth_info');
      if (saved) {
        const info: BirthInfo = JSON.parse(saved);
        if (info && info.year && info.month && info.day !== undefined) {
          setLastSavedInfo(info);

          const navEntries = typeof window !== 'undefined' && window.performance?.getEntriesByType?.('navigation');
          const isPageReload = navEntries && navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
          const isViewingActive = sessionStorage.getItem('ziwei_chart_active') === 'true';

          if (isPageReload && isViewingActive) {
            setChart(generateChart(info));
          }
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!boardRef.current) return;
    const updateHeight = () => {
      if (boardRef.current && window.innerWidth > 1024) {
        const h = boardRef.current.offsetHeight;
        if (h > 0) setBoardHeight(h);
      } else {
        setBoardHeight(undefined);
      }
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(boardRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [chart]);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg-0)' }}>
      {/* Nền trời sao động */}
      <StarField />

      {/* Ánh sáng nền huyền ảo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full opacity-60"
          style={{ background: isDark ? 'radial-gradient(ellipse, rgba(212,168,67,0.08) 0%, transparent 70%)' : 'radial-gradient(ellipse, rgba(184,146,42,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full opacity-40"
          style={{ background: isDark ? 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)' : 'radial-gradient(ellipse, rgba(58,90,130,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* ── Thanh điều hướng trên cùng ── */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b"
        style={{ borderColor: 'var(--t-border)', background: isDark ? 'rgba(2,8,16,0.85)' : 'rgba(245,239,224,0.85)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" className="flex items-center gap-2.5 text-decoration-none group">
          {/* Icon Bát Quái Huyền Bí */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt="Bát Quái"
            className="w-6 h-6 rounded-full shadow-[0_0_10px_rgba(212,168,67,0.45)] group-hover:rotate-180 transition-transform duration-700 select-none"
          />
          <span className="text-sm font-bold tracking-[0.28em] font-mystic" style={{ color: 'var(--t-gold)', textShadow: '0 0 10px rgba(212,168,67,0.4)' }}>
            TỬ VI ĐẨU SỐ
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button
            onClick={() => setProfileBookOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer select-none text-xs font-mystic font-semibold tracking-wider transition-all"
            style={{
              borderColor: isDark ? 'rgba(254,240,138,0.35)' : 'rgba(184,146,42,0.45)',
              background: isDark
                ? 'linear-gradient(145deg, rgba(32, 40, 58, 0.95) 0%, rgba(14, 18, 30, 0.98) 100%)'
                : 'linear-gradient(145deg, #FFFFFF 0%, #FAF5EA 100%)',
              color: isDark ? '#FEF08A' : '#78350F',
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1.5px 2px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.35)'
                : 'inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1.5px 2px rgba(140,100,20,0.15), 0 2px 5px rgba(120,53,15,0.06)',
            }}
            title="Sổ Tay Bản Mệnh: Quản lý danh sách gia đình & người thân"
          >
            <span>📖</span>
            <span>Sổ Tay</span>
            {savedProfileCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                {savedProfileCount}
              </span>
            )}
          </motion.button>
          <Link
            href="/heming"
            className="text-xs px-3 py-1.5 rounded-full border transition-all"
            style={{
              borderColor: isDark ? 'rgba(212,168,67,0.25)' : 'rgba(184,146,42,0.35)',
              background: isDark
                ? 'linear-gradient(145deg, rgba(25, 30, 45, 0.8) 0%, rgba(10, 14, 24, 0.9) 100%)'
                : 'linear-gradient(145deg, #FFFFFF 0%, #F8F3E8 100%)',
              color: isDark ? 'var(--t-faint)' : '#57534E',
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1.5px 2px rgba(0,0,0,0.5)'
                : 'inset 0 1px 1px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            Hợp Số
          </Link>
        </div>
      </header>

      {/* ── Chưa khởi tạo: Hiển thị form nhập thông tin ── */}
      {!chart ? (
        <main className="relative z-10 max-w-[760px] mx-auto px-5 py-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center tracking-wide" style={{ color: 'var(--t-gold)' }}>
            LẬP LÁ SỐ TỬ VI ĐẨU SỐ
          </h1>
          <p className="mb-8 text-xs sm:text-sm leading-relaxed text-center" style={{ color: 'var(--t-faint)' }}>
            Nhập ngày tháng năm giờ sinh và địa phương để hệ thống tự động hiệu chỉnh giờ mặt trời thực (True Solar Time),
            thiết lập 12 cung vị, an sao chính tinh - phụ tinh và phân tích vận hạn.
          </p>

          {/* Sổ tay bản mệnh nếu đã có hồ sơ */}
          {savedProfileCount > 0 && (
            <div className="mb-4 p-3.5 rounded-xl border border-amber-500/35 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent flex items-center justify-between gap-3 text-xs flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2.5">
                <span className="text-base text-amber-400">📖</span>
                <div>
                  <div style={{ color: 'var(--t-gold)' }}>
                    Sổ Tay Bản Mệnh: <strong>{savedProfileCount} hồ sơ</strong> gia đình & người thân.
                  </div>
                  <div className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-0.5 font-sans">
                    <span>🔒</span> Dữ liệu lưu riêng tư trên máy của bạn (không lưu trên máy chủ)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileBookOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-mystic bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-500/50 cursor-pointer flex-shrink-0 transition-all shadow-[0_2px_8px_rgba(212,168,67,0.15)]"
              >
                Mở Danh Bạ Xem Ngay →
              </button>
            </div>
          )}

          {lastSavedInfo && (
            <div className="mb-6 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 text-xs flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">📋</span>
                <span style={{ color: 'var(--t-gold)' }}>
                  Lá số vừa xem gần nhất: <strong>{lastSavedInfo.name || 'Bản mệnh'}</strong> ({lastSavedInfo.day}/{lastSavedInfo.month}/{lastSavedInfo.year})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  try { sessionStorage.setItem('ziwei_chart_active', 'true'); } catch { /* ignore */ }
                  setChart(generateChart(lastSavedInfo));
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-pointer flex-shrink-0 transition-all"
              >
                Tiếp tục xem lại →
              </button>
            </div>
          )}
          <div className="card-glass rounded-2xl p-6 sm:p-8">
            <BirthForm onSubmit={handleGenerateChart} />
          </div>
        </main>
      ) : (
        /* ── Đã an sao: Hiển thị lá số + AI Luận giải ── */
        <main className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleReset}
                className="hover:scale-[1.02] active:scale-[0.98] transition-all px-3.5 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 text-xs font-mystic font-semibold tracking-wider border select-none"
                style={{
                  borderColor: isDark ? 'rgba(254,240,138,0.3)' : 'rgba(184,146,42,0.45)',
                  background: isDark
                    ? 'linear-gradient(145deg, rgba(32, 40, 58, 0.95) 0%, rgba(14, 18, 30, 0.98) 60%, rgba(8, 10, 18, 1) 100%)'
                    : 'linear-gradient(145deg, #FFFFFF 0%, #FAF5EA 60%, #F4EADA 100%)',
                  color: isDark ? '#FEF08A' : '#78350F',
                  textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(212,168,67,0.3)' : '0 1px 0 rgba(255,255,255,0.8)',
                  boxShadow: isDark
                    ? 'inset 0 1px 1.5px rgba(255,255,255,0.2), inset 0 -2px 3px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.45)'
                    : 'inset 0 1px 1.5px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(140,100,20,0.15), 0 3px 8px rgba(120,53,15,0.08)',
                }}
                title="Quay lại màn hình nhập thông tin ngày giờ sinh khác"
              >
                <span className={clsx("font-sans text-sm leading-none", isDark ? "text-amber-400" : "text-[#78350F]")}>←</span>
                <span>Nhập Lại Thông Tin Khác</span>
              </button>
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="hover:scale-[1.02] active:scale-[0.98] transition-all px-3.5 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 text-xs font-mystic font-bold tracking-wider border select-none"
                style={{
                  borderColor: isDark ? 'rgba(254, 240, 138, 0.9)' : '#B45309',
                  background: isDark
                    ? 'linear-gradient(145deg, #FDE68A 0%, #D4A843 50%, #92400E 100%)'
                    : 'linear-gradient(145deg, #FFFBEB 0%, #FBBF24 50%, #D97706 100%)',
                  color: isDark ? '#1C1917' : '#451A03',
                  textShadow: '0 1px 0 rgba(255,255,255,0.65)',
                  boxShadow: isDark
                    ? 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.6), 0 4px 16px rgba(212,168,67,0.45), 0 2px 6px rgba(0,0,0,0.5)'
                    : 'inset 0 1px 2px rgba(255,255,255,0.85), inset 0 -2px 3px rgba(146,64,14,0.4), 0 4px 14px rgba(217,119,6,0.35)',
                }}
              >
                <span>🎴</span>
                <span>Xuất Thiệp Lá Số</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileBookOpen(true)}
                className="hover:scale-[1.02] active:scale-[0.98] transition-all px-3.5 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 text-xs font-mystic font-semibold tracking-wider border select-none"
                style={{
                  borderColor: isDark ? 'rgba(254,240,138,0.3)' : 'rgba(184,146,42,0.45)',
                  background: isDark
                    ? 'linear-gradient(145deg, rgba(32, 40, 58, 0.95) 0%, rgba(14, 18, 30, 0.98) 60%, rgba(8, 10, 18, 1) 100%)'
                    : 'linear-gradient(145deg, #FFFFFF 0%, #FAF5EA 60%, #F4EADA 100%)',
                  color: isDark ? '#FEF08A' : '#78350F',
                  textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(212,168,67,0.3)' : '0 1px 0 rgba(255,255,255,0.8)',
                  boxShadow: isDark
                    ? 'inset 0 1px 1.5px rgba(255,255,255,0.2), inset 0 -2px 3px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.45)'
                    : 'inset 0 1px 1.5px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(140,100,20,0.15), 0 3px 8px rgba(120,53,15,0.08)',
                }}
                title="Xem danh bạ lá số đã lưu riêng tư trên máy của bạn"
              >
                <span>📖</span>
                <span>Sổ Tay Gia Đình</span>
                {savedProfileCount > 0 && (
                  <span className={clsx("px-1.5 py-0.2 rounded-full text-[10px] font-bold shadow-sm", isDark ? "bg-amber-500 text-slate-950" : "bg-amber-600 text-white")}>
                    {savedProfileCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (chart) {
                    saveProfile({
                      name: chart.birthInfo.name || 'Bản Mệnh',
                      relationship: 'self',
                      birthInfo: chart.birthInfo,
                    });
                    setSavedProfileCount(getSavedProfiles().length);
                    setProfileBookOpen(true);
                  }
                }}
                className="hover:scale-[1.02] active:scale-[0.98] transition-all px-3.5 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 text-xs font-mystic font-semibold tracking-wider border select-none"
                style={{
                  borderColor: isDark ? 'rgba(254,240,138,0.3)' : 'rgba(184,146,42,0.45)',
                  background: isDark
                    ? 'linear-gradient(145deg, rgba(32, 40, 58, 0.95) 0%, rgba(14, 18, 30, 0.98) 60%, rgba(8, 10, 18, 1) 100%)'
                    : 'linear-gradient(145deg, #FFFFFF 0%, #FAF5EA 60%, #F4EADA 100%)',
                  color: isDark ? '#FEF08A' : '#78350F',
                  textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(212,168,67,0.3)' : '0 1px 0 rgba(255,255,255,0.8)',
                  boxShadow: isDark
                    ? 'inset 0 1px 1.5px rgba(255,255,255,0.2), inset 0 -2px 3px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.45)'
                    : 'inset 0 1px 1.5px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(140,100,20,0.15), 0 3px 8px rgba(120,53,15,0.08)',
                }}
                title="Lưu lá số này trực tiếp vào máy của bạn (tuyệt đối không gửi lên máy chủ)"
              >
                <span>🔖</span>
                <span>Lưu Lá Số Này</span>
              </button>
            </div>
            <div className="flex items-center gap-2.5 text-[11px]" style={{ color: isDark ? 'var(--t-faint)' : '#57534E' }}>
              <span className={clsx("inline-flex items-center gap-1 font-sans", isDark ? "text-emerald-400/90" : "text-emerald-700 font-semibold")}>
                <span>🔒</span> Lưu trữ riêng trên máy
              </span>
              <span>·</span>
              <span>Trường phái Thiên Kỷ Nghê Hải Hà · Tự động hiệu chỉnh giờ mặt trời thực (v1.1.0)</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.95fr)',
              gap: 20,
              marginTop: 16,
              alignItems: 'start',
            }}
            className="chart-main-grid"
          >
            <div ref={boardRef} className="w-full overflow-x-auto pb-2">
              <div className="flex items-center justify-between text-[10px] text-amber-400/80 lg:hidden mb-1.5 px-1 font-serif">
                <span>✦ Mệnh Bàn 12 Cung Vị</span>
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 animate-pulse">
                  <span>↔</span> Vuốt ngang xem trọn lá số
                </span>
              </div>
              <div className="min-w-[560px] lg:min-w-0">
                <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
              </div>
            </div>
            <div
              className="insight-panel-container w-full"
              style={boardHeight ? { height: `${boardHeight}px`, maxHeight: `${boardHeight}px` } : undefined}
            >
              <InsightPanel chart={chart} selectedPalace={selectedPalace} />
            </div>
          </div>

          {/* Modal Xuất Thiệp Mệnh Bản Cổ Phong */}
          <ShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            chart={chart}
            shareUrl={(() => {
              if (typeof window === 'undefined') return '';
              if (!chart) return window.location.href;
              const b = chart.birthInfo;
              const url = new URL(window.location.origin + '/chart');
              if (b.name) url.searchParams.set('name', b.name);
              url.searchParams.set('gender', b.gender);
              url.searchParams.set('year', String(b.year));
              url.searchParams.set('month', String(b.month));
              url.searchParams.set('day', String(b.day));
              url.searchParams.set('hour', String(b.hour));
              if (b.province) url.searchParams.set('province', b.province);
              return url.toString();
            })()}
          />

          <style>{`
            .insight-panel-container {
              display: flex;
              flex-direction: column;
              height: 100%;
              min-height: 0;
              overflow: hidden;
            }
            @media (max-width: 1024px) {
              .chart-main-grid { grid-template-columns: 1fr !important; }
              .insight-panel-container {
                height: 580px !important;
                max-height: 580px !important;
              }
            }
          `}</style>
        </main>
      )}

      {/* Modal Sổ Tay Bản Mệnh (Gia Đình & Người Thân) */}
      <ProfileBookModal
        open={profileBookOpen}
        onClose={() => setProfileBookOpen(false)}
        onSelectProfile={(info) => {
          handleGenerateChart(info);
          setProfileBookOpen(false);
        }}
        currentBirthInfo={chart ? chart.birthInfo : lastSavedInfo}
      />
    </div>
  );
}
