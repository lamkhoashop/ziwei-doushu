'use client';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { SI_HUA_TABLE } from '@/lib/ziwei/constants';
import {
  toVietnameseStar,
  toVietnameseStem,
  toVietnameseSiHua,
  STEMS_VI,
} from '@/lib/ziwei/vietnamese';
import type { ZiweiChart } from '@/lib/ziwei/types';

export type TimeView = 'mingpan' | 'daxian' | 'liunian';

interface TimeNavProps {
  chart: ZiweiChart;
  view: TimeView;
  liunianYear: number;
  onViewChange: (view: TimeView) => void;
  onYearChange: (year: number) => void;
}

/** Từ năm tính chỉ số Thiên can (0-9) */
export function getYearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

/** Tứ Hóa ánh xạ: starName → SiHua */
export function buildSiHuaOverlay(stemIndex: number): Record<string, string> {
  const stars = SI_HUA_TABLE[stemIndex];
  if (!stars) return {};
  return {
    [stars[0]]: '禄',
    [stars[1]]: '权',
    [stars[2]]: '科',
    [stars[3]]: '忌',
  };
}

const SIHUA_COLORS_DARK: Record<string, string> = {
  '禄': '#4ade80',
  '权': '#60a5fa',
  '科': '#facc15',
  '忌': '#f87171',
};

const SIHUA_COLORS_LIGHT: Record<string, string> = {
  '禄': '#059669',
  '权': '#0284C7',
  '科': '#D97706',
  '忌': '#DC2626',
};

export default function TimeNav({
  chart,
  view,
  liunianYear,
  onViewChange,
  onYearChange,
}: TimeNavProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const sihuaColors = isDark ? SIHUA_COLORS_DARK : SIHUA_COLORS_LIGHT;
  const currentDx = chart.daXians[chart.currentDaXianIndex];

  // Tính thông tin Tứ Hóa xếp chồng
  const getOverlayInfo = (): { stemNameVi: string; overlay: Record<string, string> } | null => {
    if (view === 'mingpan') return null;

    if (view === 'daxian' && currentDx) {
      const dxPalace = chart.palaces.find(p => p.branch === currentDx.palaceBranch);
      if (!dxPalace) return null;
      const stemIndex = dxPalace.stem;
      return {
        stemNameVi: STEMS_VI[stemIndex] ?? toVietnameseStem(stemIndex),
        overlay: buildSiHuaOverlay(stemIndex),
      };
    }

    if (view === 'liunian') {
      const stemIndex = getYearStemIndex(liunianYear);
      return {
        stemNameVi: STEMS_VI[stemIndex] ?? toVietnameseStem(stemIndex),
        overlay: buildSiHuaOverlay(stemIndex),
      };
    }

    return null;
  };

  const overlayInfo = getOverlayInfo();

  return (
    <div className="mb-3">
      {/* Hàng Tab */}
      <div
        className="flex items-center rounded-xl p-1 gap-1 select-none"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(10, 14, 24, 0.95) 0%, rgba(18, 24, 38, 0.9) 100%)'
            : 'linear-gradient(180deg, #E2D5BE 0%, #EDE1C8 100%)',
          border: isDark
            ? '1px solid rgba(212, 168, 67, 0.25)'
            : '1px solid rgba(184, 146, 42, 0.45)',
          boxShadow: isDark
            ? 'inset 0 2px 5px rgba(0,0,0,0.7), inset 0 1px 1px rgba(0,0,0,0.9), 0 1px 2px rgba(255,255,255,0.03)'
            : 'inset 0 2px 5px rgba(120,53,15,0.14), inset 0 1px 2px rgba(120,53,15,0.1), 0 1px 2px rgba(255,255,255,0.8)',
        }}
      >
        {/* Bản Mệnh */}
        <TabButton
          active={view === 'mingpan'}
          isDark={isDark}
          onClick={() => onViewChange('mingpan')}
        >
          Bản Mệnh
        </TabButton>

        {/* Đại Hạn */}
        <TabButton
          active={view === 'daxian'}
          isDark={isDark}
          onClick={() => onViewChange('daxian')}
        >
          {currentDx ? `Đại Hạn (${currentDx.startAge}–${currentDx.endAge}t)` : 'Đại Hạn'}
        </TabButton>

        {/* Lưu Niên — Kèm chuyển năm */}
        <div
          className="relative flex-1 flex items-center justify-center rounded-lg py-1.5 px-1 gap-1 transition-all duration-200"
          style={{
            background: view === 'liunian'
              ? (isDark
                  ? 'linear-gradient(145deg, rgba(38, 48, 70, 0.98) 0%, rgba(20, 26, 40, 0.98) 60%, rgba(12, 16, 26, 1) 100%)'
                  : 'linear-gradient(145deg, #FFFFFF 0%, #FAF5EA 60%, #F3E8D5 100%)')
              : 'transparent',
            border: view === 'liunian'
              ? (isDark ? '1px solid rgba(254, 240, 138, 0.45)' : '1px solid rgba(184, 146, 42, 0.55)')
              : '1px solid transparent',
            boxShadow: view === 'liunian'
              ? (isDark
                  ? 'inset 0 1px 1.5px rgba(255,255,255,0.25), inset 0 -2px 3px rgba(0,0,0,0.7), 0 3px 8px rgba(0,0,0,0.5), 0 0 8px rgba(212,168,67,0.2)'
                  : 'inset 0 1px 1.5px rgba(255,255,255,0.95), inset 0 -2px 3px rgba(140,100,20,0.15), 0 2px 6px rgba(120,53,15,0.1)')
              : undefined,
          }}
        >
          <button
            onClick={() => onViewChange('liunian')}
            className="text-[10px] font-semibold flex-1 text-center cursor-pointer select-none"
            style={{
              color: view === 'liunian'
                ? (isDark ? '#FEF08A' : '#78350F')
                : (isDark ? 'rgba(212,168,67,0.5)' : '#78716C'),
              textShadow: view === 'liunian'
                ? (isDark ? '0 1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(212,168,67,0.4)' : '0 1px 0 rgba(255,255,255,0.9)')
                : undefined,
            }}
          >
            Lưu Niên
          </button>
          {/* Nút tăng giảm năm */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={e => { e.stopPropagation(); onYearChange(liunianYear - 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="text-[9px] w-4 h-4 flex items-center justify-center rounded cursor-pointer transition-all hover:scale-110 active:scale-95"
              style={{
                color: isDark ? '#FEF08A' : '#78350F',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(184,146,42,0.12)',
                boxShadow: isDark
                  ? 'inset 0 1px 0.5px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.4)'
                  : 'inset 0 1px 0.5px rgba(255,255,255,0.8), 0 1px 2px rgba(120,53,15,0.08)',
              }}
              title="Năm trước"
            >
              ‹
            </button>
            <span
              className="text-[10px] font-mono min-w-[28px] text-center cursor-pointer font-bold select-none"
              style={{
                color: view === 'liunian'
                  ? (isDark ? '#FEF08A' : '#78350F')
                  : (isDark ? 'rgba(212,168,67,0.5)' : '#78716C'),
                textShadow: view === 'liunian'
                  ? (isDark ? '0 1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(212,168,67,0.4)' : '0 1px 0 rgba(255,255,255,0.9)')
                  : undefined,
              }}
              onClick={() => onViewChange('liunian')}
            >
              {liunianYear}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onYearChange(liunianYear + 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="text-[9px] w-4 h-4 flex items-center justify-center rounded cursor-pointer transition-all hover:scale-110 active:scale-95"
              style={{
                color: isDark ? '#FEF08A' : '#78350F',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(184,146,42,0.12)',
                boxShadow: isDark
                  ? 'inset 0 1px 0.5px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.4)'
                  : 'inset 0 1px 0.5px rgba(255,255,255,0.8), 0 1px 2px rgba(120,53,15,0.08)',
              }}
              title="Năm kế"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Dòng hiển thị Tứ Hóa xếp chồng */}
      {overlayInfo && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 mt-1.5 px-1 flex-wrap"
        >
          <span className="text-[9px]" style={{ color: isDark ? 'var(--t-faint)' : '#475569' }}>
            {view === 'daxian' ? 'Tứ Hóa Đại Hạn' : `Tứ Hóa Lưu Niên ${liunianYear}`} (Can {overlayInfo.stemNameVi}):
          </span>
          {(['禄', '权', '科', '忌'] as const).map(sh => {
            const starName = Object.keys(overlayInfo.overlay).find(k => overlayInfo.overlay[k] === sh);
            if (!starName) return null;
            const starNameVi = toVietnameseStar(starName);
            const siHuaVi = toVietnameseSiHua(sh);
            return (
              <span key={sh} className="text-[9px] font-semibold" style={{ color: sihuaColors[sh] }}>
                {starNameVi} Hóa {siHuaVi}
              </span>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function TabButton({
  active,
  isDark = true,
  onClick,
  children,
}: {
  active: boolean;
  isDark?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none"
      style={{
        background: active
          ? (isDark
              ? 'linear-gradient(145deg, rgba(38, 48, 70, 0.98) 0%, rgba(20, 26, 40, 0.98) 60%, rgba(12, 16, 26, 1) 100%)'
              : 'linear-gradient(145deg, #FFFFFF 0%, #FAF5EA 60%, #F3E8D5 100%)')
          : 'transparent',
        color: active
          ? (isDark ? '#FEF08A' : '#78350F')
          : (isDark ? 'rgba(212,168,67,0.5)' : '#78716C'),
        textShadow: active
          ? (isDark ? '0 1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(212,168,67,0.4)' : '0 1px 0 rgba(255,255,255,0.9)')
          : undefined,
        border: active
          ? (isDark ? '1px solid rgba(254, 240, 138, 0.45)' : '1px solid rgba(184, 146, 42, 0.55)')
          : '1px solid transparent',
        boxShadow: active
          ? (isDark
              ? 'inset 0 1px 1.5px rgba(255,255,255,0.25), inset 0 -2px 3px rgba(0,0,0,0.7), 0 3px 8px rgba(0,0,0,0.5), 0 0 8px rgba(212,168,67,0.2)'
              : 'inset 0 1px 1.5px rgba(255,255,255,0.95), inset 0 -2px 3px rgba(140,100,20,0.15), 0 2px 6px rgba(120,53,15,0.1)')
          : undefined,
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}
