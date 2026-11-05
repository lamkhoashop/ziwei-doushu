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
        className="flex items-center rounded-xl p-1 gap-1 shadow-sm"
        style={{
          background: isDark ? 'var(--t-surface)' : '#EFE4CB',
          border: isDark ? '1px solid var(--t-border)' : '1px solid rgba(184, 146, 42, 0.35)',
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
          className="relative flex-1 flex items-center justify-center rounded-lg py-1.5 gap-1 transition-all duration-200"
          style={{
            background: view === 'liunian'
              ? (isDark ? 'rgba(212,168,67,0.12)' : '#FFFFFF')
              : 'transparent',
            border: view === 'liunian'
              ? (isDark ? '1px solid rgba(212,168,67,0.25)' : '1px solid #D97706')
              : '1px solid transparent',
            boxShadow: (view === 'liunian' && !isDark) ? '0 1px 4px rgba(180,83,9,0.12)' : undefined,
          }}
        >
          <button
            onClick={() => onViewChange('liunian')}
            className="text-[10px] font-semibold flex-1 text-center"
            style={{ color: view === 'liunian' ? (isDark ? 'var(--t-gold)' : '#78350F') : (isDark ? 'var(--t-faint)' : '#64748B') }}
          >
            Lưu Niên
          </button>
          {/* Nút tăng giảm năm */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={e => { e.stopPropagation(); onYearChange(liunianYear - 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="text-[9px] w-4 h-4 flex items-center justify-center rounded hover:bg-white/10"
              style={{ color: isDark ? 'var(--t-faint)' : '#78350F' }}
              title="Năm trước"
            >
              ‹
            </button>
            <span
              className="text-[10px] font-mono min-w-[28px] text-center cursor-pointer font-bold"
              style={{ color: view === 'liunian' ? (isDark ? 'var(--t-gold)' : '#78350F') : (isDark ? 'var(--t-faint)' : '#64748B') }}
              onClick={() => onViewChange('liunian')}
            >
              {liunianYear}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onYearChange(liunianYear + 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="text-[9px] w-4 h-4 flex items-center justify-center rounded hover:bg-white/10"
              style={{ color: isDark ? 'var(--t-faint)' : '#78350F' }}
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
      className="flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all duration-200"
      style={{
        background: active
          ? (isDark ? 'rgba(212,168,67,0.12)' : '#FFFFFF')
          : 'transparent',
        color: active
          ? (isDark ? 'var(--t-gold)' : '#78350F')
          : (isDark ? 'var(--t-faint)' : '#64748B'),
        border: active
          ? (isDark ? '1px solid rgba(212,168,67,0.25)' : '1px solid #D97706')
          : '1px solid transparent',
        boxShadow: (active && !isDark) ? '0 1px 4px rgba(180,83,9,0.12)' : undefined,
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}
