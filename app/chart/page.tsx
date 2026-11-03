'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import StarField from '@/components/StarField';
import { useTheme } from '@/components/ThemeProvider';
import { generateChart } from '@/lib/ziwei/algorithm';
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
        borderColor: isDark ? 'rgba(212,168,67,0.35)' : 'rgba(140,100,20,0.35)',
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,252,242,0.85)',
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
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: isDark ? 'rgba(212,180,100,0.9)' : 'rgba(110,72,8,0.85)',
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
  const boardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
        <Link href="/" className="flex items-center gap-2 text-decoration-none">
          <span className="text-sm font-semibold tracking-[0.25em]" style={{ color: 'var(--t-gold)' }}>
            ✦ TỬ VI ĐẨU SỐ
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/heming"
            className="text-xs px-3 py-1.5 rounded-full border transition-all"
            style={{ borderColor: 'var(--t-border)', color: 'var(--t-faint)' }}
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
          <div className="card-glass rounded-2xl p-6 sm:p-8">
            <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} />
          </div>
        </main>
      ) : (
        /* ── Đã an sao: Hiển thị lá số + AI Luận giải ── */
        <main className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setChart(null); setSelectedPalace(null); }}
              className="hover:bg-white/5 transition-all px-4 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 text-xs font-medium border"
              style={{
                borderColor: 'var(--t-border)',
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
                color: 'var(--t-faint)',
              }}
            >
              ← Nhập lại thông tin khác
            </button>
            <div className="text-[11px]" style={{ color: 'var(--t-faint)' }}>
              Trường phái Thiên Kỷ Nghê Hải Hà · Tự động hiệu chỉnh giờ mặt trời thực
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
            <div ref={boardRef} className="w-full">
              <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
            </div>
            <div
              className="insight-panel-container w-full"
              style={boardHeight ? { height: `${boardHeight}px`, maxHeight: `${boardHeight}px` } : undefined}
            >
              <InsightPanel chart={chart} selectedPalace={selectedPalace} />
            </div>
          </div>

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
    </div>
  );
}
