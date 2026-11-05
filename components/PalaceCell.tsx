'use client';
import { motion } from 'framer-motion';
import type { Palace, Star } from '@/lib/ziwei/types';
import {
  toVietnamesePalace,
  toVietnameseStar,
  toVietnameseSiHua,
  toVietnameseBrightness,
  STEMS_VI,
  BRANCHES_VI,
  getStarElement,
  getElementStyle,
} from '@/lib/ziwei/vietnamese';
import { useTheme } from '@/components/ThemeProvider';
import clsx from 'clsx';

interface PalaceCellProps {
  palace: Palace;
  onClick?: () => void;
  onStarClick?: (star: Star) => void;
  isSelected?: boolean;
  isSanFang?: boolean;
  delay?: number;
  /** 叠加四化：星名 → 四化类型（'禄'/'权'/'科'/'忌'） */
  overlayStarSiHua?: Record<string, string>;
  /** 叠加标签：'年'（流年）或 '限'（大限） */
  overlayLabel?: string;
  /** 点击叠加四化 badge 回调 */
  onSiHuaClick?: (starName: string, siHua: string) => void;
}

// ─── Tứ Hóa Huy Hiệu Ngọc Ấn ─────────────────────────────
const SIHUA_STYLES_DARK: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  'Lộc':   { bg: 'rgba(6, 78, 59, 0.85)',   border: 'rgba(52, 211, 153, 0.7)',  text: '#6ee7b7', glow: '0 0 6px rgba(16,185,129,0.5)' },
  'Quyền': { bg: 'rgba(136, 19, 55, 0.85)', border: 'rgba(251, 113, 133, 0.7)', text: '#fda4af', glow: '0 0 6px rgba(244,63,94,0.5)' },
  'Khoa':  { bg: 'rgba(120, 53, 15, 0.85)', border: 'rgba(251, 191, 36, 0.7)',  text: '#fde68a', glow: '0 0 6px rgba(245,158,11,0.5)' },
  'Kỵ':    { bg: 'rgba(88, 28, 135, 0.85)', border: 'rgba(192, 132, 252, 0.7)', text: '#e9d5ff', glow: '0 0 6px rgba(168,85,247,0.5)' },
  '禄':    { bg: 'rgba(6, 78, 59, 0.85)',   border: 'rgba(52, 211, 153, 0.7)',  text: '#6ee7b7', glow: '0 0 6px rgba(16,185,129,0.5)' },
  '权':    { bg: 'rgba(136, 19, 55, 0.85)', border: 'rgba(251, 113, 133, 0.7)', text: '#fda4af', glow: '0 0 6px rgba(244,63,94,0.5)' },
  '科':    { bg: 'rgba(120, 53, 15, 0.85)', border: 'rgba(251, 191, 36, 0.7)',  text: '#fde68a', glow: '0 0 6px rgba(245,158,11,0.5)' },
  '忌':    { bg: 'rgba(88, 28, 135, 0.85)', border: 'rgba(192, 132, 252, 0.7)', text: '#e9d5ff', glow: '0 0 6px rgba(168,85,247,0.5)' },
};

const SIHUA_STYLES_LIGHT: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  'Lộc':   { bg: '#ECFDF5', border: '#059669', text: '#065F46', glow: 'none' },
  'Quyền': { bg: '#FFF1F2', border: '#E11D48', text: '#9F1239', glow: 'none' },
  'Khoa':  { bg: '#FEFCE8', border: '#D97706', text: '#92400E', glow: 'none' },
  'Kỵ':    { bg: '#FAF5FF', border: '#9333EA', text: '#6B21A8', glow: 'none' },
  '禄':    { bg: '#ECFDF5', border: '#059669', text: '#065F46', glow: 'none' },
  '权':    { bg: '#FFF1F2', border: '#E11D48', text: '#9F1239', glow: 'none' },
  '科':    { bg: '#FEFCE8', border: '#D97706', text: '#92400E', glow: 'none' },
  '忌':    { bg: '#FAF5FF', border: '#9333EA', text: '#6B21A8', glow: 'none' },
};

const SiHuaBadge = ({
  siHua,
  overlay,
  label,
  onClick,
}: {
  siHua: string;
  overlay?: boolean;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const displaySiHua = toVietnameseSiHua(siHua);
  const displayLabel = label === '限' ? 'Hạn' : label === '年' ? 'Niên' : label;
  const table = isDark ? SIHUA_STYLES_DARK : SIHUA_STYLES_LIGHT;
  const style = table[displaySiHua] || table[siHua] || table['Lộc'];

  return (
    <span
      className={clsx(
        'inline-flex items-center text-[8px] px-1 rounded border leading-none py-0.5 font-bold ml-1 flex-shrink-0 shadow-sm transition-all',
        overlay && 'border-dashed opacity-85',
        onClick && 'cursor-pointer hover:scale-110',
      )}
      style={{
        background: style.bg,
        borderColor: style.border,
        color: style.text,
        boxShadow: style.glow,
      }}
      onClick={onClick}
    >
      {overlay && displayLabel && <span className="mr-0.5 opacity-70 text-[7px]">{displayLabel}</span>}
      {displaySiHua}
    </span>
  );
};

export default function PalaceCell({
  palace, onClick, onStarClick, isSelected, isSanFang, delay = 0,
  overlayStarSiHua, overlayLabel, onSiHuaClick,
}: PalaceCellProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { branch, stem, name, stars, daXianAge, isCurrentDaXian, isMingGong, isShenGong } = palace;
  const ganzhi = `${STEMS_VI[stem]} ${BRANCHES_VI[branch]}`;
  const palaceName = toVietnamesePalace(name);

  const majorStars = stars.filter(s => s.type === 'major');
  const luckyStars = stars.filter(s => s.type === 'lucky');
  const shaStars = stars.filter(s => s.type === 'sha');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      className="relative flex flex-col p-2.5 cursor-pointer transition-all duration-200 h-full overflow-hidden select-none group"
      style={{
        minHeight: '135px',
        background: isDark
          ? (isCurrentDaXian
            ? 'linear-gradient(145deg, rgba(88,28,135,0.22) 0%, rgba(20,10,35,0.92) 100%)'
            : isSelected
            ? 'linear-gradient(145deg, rgba(37,99,235,0.25) 0%, rgba(10,25,50,0.92) 100%)'
            : isSanFang
            ? 'linear-gradient(145deg, rgba(37,99,235,0.12) 0%, rgba(15,20,35,0.92) 100%)'
            : isMingGong
            ? 'linear-gradient(145deg, rgba(180,83,9,0.18) 0%, rgba(25,18,10,0.92) 100%)'
            : isShenGong
            ? 'linear-gradient(145deg, rgba(14,165,233,0.15) 0%, rgba(10,20,30,0.92) 100%)'
            : 'linear-gradient(145deg, rgba(22,26,38,0.95) 0%, rgba(12,14,22,0.98) 100%)')
          : (isCurrentDaXian
            ? 'linear-gradient(145deg, #FAF5FF 0%, #F3E8FF 100%)'
            : isSelected
            ? 'linear-gradient(145deg, #FEFCE8 0%, #FEF08A 100%)'
            : isSanFang
            ? 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)'
            : isMingGong
            ? 'linear-gradient(145deg, #FFF7F7 0%, #FEE2E2 100%)'
            : isShenGong
            ? 'linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)'
            : '#FFFFFF'),
        boxShadow: isDark
          ? (isCurrentDaXian
            ? 'inset 0 0 0 1.5px rgba(168,85,247,0.7), 0 0 16px rgba(168,85,247,0.25)'
            : isSelected
            ? 'inset 0 0 0 1.8px rgba(254,240,138,0.95), 0 0 20px rgba(212,168,67,0.45)'
            : isSanFang
            ? 'inset 0 0 0 1.2px rgba(245,158,11,0.7), 0 0 12px rgba(245,158,11,0.2)'
            : isMingGong
            ? 'inset 0 0 0 1.2px rgba(239,68,68,0.55), 0 0 14px rgba(239,68,68,0.2)'
            : 'inset 0 0 0 0.5px rgba(212,168,67,0.15)')
          : (isCurrentDaXian
            ? 'inset 0 0 0 1.5px #9333EA, 0 2px 10px rgba(147,51,234,0.15)'
            : isSelected
            ? 'inset 0 0 0 2px #B45309, 0 4px 16px rgba(180,83,9,0.2)'
            : isSanFang
            ? 'inset 0 0 0 1.2px #15803D, 0 2px 8px rgba(21,128,61,0.12)'
            : isMingGong
            ? 'inset 0 0 0 1.5px #DC2626, 0 3px 12px rgba(220,38,38,0.15)'
            : isShenGong
            ? 'inset 0 0 0 1.5px #0284C7, 0 3px 12px rgba(2,132,199,0.15)'
            : 'inset 0 0 0 1px rgba(184,146,42,0.25), 0 1px 4px rgba(0,0,0,0.03)'),
      }}
    >
      {/* ── 4 Hoa văn góc cổ điển Á Đông (Oriental Corner Ornaments) ── */}
      <div className={clsx("absolute top-1 left-1 w-1.5 h-1.5 border-t border-l pointer-events-none", isDark ? "border-[#d4a843]/30" : "border-[#8c6410]/35")} />
      <div className={clsx("absolute top-1 right-1 w-1.5 h-1.5 border-t border-r pointer-events-none", isDark ? "border-[#d4a843]/30" : "border-[#8c6410]/35")} />
      <div className={clsx("absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l pointer-events-none", isDark ? "border-[#d4a843]/30" : "border-[#8c6410]/35")} />
      <div className={clsx("absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r pointer-events-none", isDark ? "border-[#d4a843]/30" : "border-[#8c6410]/35")} />

      {/* Đại hạn tuổi */}
      {daXianAge && (
        <div className={clsx(
          'absolute top-1.5 right-2 text-[9px] font-mono tabular-nums font-semibold',
          isCurrentDaXian ? (isDark ? 'text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]' : 'text-purple-700 font-bold') : ''
        )}
          style={!isCurrentDaXian ? { color: isDark ? 'var(--t-faint)' : '#64748B', opacity: 0.85 } : undefined}
        >
          {daXianAge[0]}–{daXianAge[1]}
        </div>
      )}

      {/* ── Header Cung vị & Can Chi ── */}
      <div className="flex items-center justify-between gap-1 mb-1 pr-7 border-b pb-1"
        style={{ borderColor: isMingGong ? (isDark ? 'rgba(239,68,68,0.4)' : '#DC2626') : (isDark ? 'rgba(212,168,67,0.15)' : 'rgba(184,146,42,0.25)') }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={clsx(
            'text-[12px] font-mystic font-bold tracking-wider uppercase transition-colors',
            isMingGong ? (isDark ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-red-700') :
            isShenGong ? (isDark ? 'text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'text-sky-700') :
            (isDark ? 'text-[var(--t-gold)]' : 'text-[#78350F]')
          )}>
            {palaceName}
          </span>

          {/* Dấu Ấn Triện Hoàng Cung: Mệnh Thân Đồng Cung */}
          {isMingGong && isShenGong ? (
            <span className={clsx(
              "inline-flex items-center text-[7.5px] font-mystic font-black px-1.5 py-0.5 rounded border tracking-widest select-none",
              isDark
                ? "border-amber-300/80 text-amber-100 bg-gradient-to-r from-red-800 via-purple-900 to-blue-900 shadow-[0_0_10px_rgba(239,68,68,0.6),inset_0_0_4px_rgba(254,240,138,0.4)]"
                : "border-red-500 text-white bg-gradient-to-r from-red-700 via-purple-800 to-blue-800 shadow-sm"
            )}>
              【MỆNH · THÂN】
            </span>
          ) : isMingGong ? (
            /* Dấu Ấn Chu Sa Cung Mệnh */
            <span className={clsx(
              "inline-flex items-center text-[7.5px] font-mystic font-black px-1.5 py-0.5 rounded border tracking-widest select-none",
              isDark
                ? "border-amber-300/80 text-amber-100 bg-gradient-to-r from-red-800 via-rose-700 to-red-900 shadow-[0_0_10px_rgba(239,68,68,0.7),inset_0_0_4px_rgba(254,240,138,0.4)]"
                : "border-red-400 text-white bg-gradient-to-r from-red-600 to-rose-700 shadow-sm"
            )}>
              【MỆNH】
            </span>
          ) : isShenGong ? (
            /* Dấu Ấn Lam Bích Cung Thân */
            <span className={clsx(
              "inline-flex items-center text-[7.5px] font-mystic font-black px-1.5 py-0.5 rounded border tracking-widest select-none",
              isDark
                ? "border-cyan-300/80 text-cyan-100 bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-900 shadow-[0_0_10px_rgba(14,165,233,0.7),inset_0_0_4px_rgba(186,230,253,0.4)]"
                : "border-sky-400 text-white bg-gradient-to-r from-sky-600 to-blue-700 shadow-sm"
            )}>
              【THÂN】
            </span>
          ) : null}
        </div>

        {/* Can Chi cung vị */}
        <span className="text-[10px] font-mystic font-semibold tracking-wide" style={{ color: isDark ? 'var(--t-faint)' : '#475569', opacity: 0.95 }}>
          {ganzhi}
        </span>
      </div>

      {/* ── Danh sách Chính Tinh (Màu sắc Ngũ Hành Kim-Mộc-Thủy-Hỏa-Thổ) ── */}
      <div className="flex flex-col gap-0.5 flex-1 my-0.5">
        {majorStars.length === 0 && (
          <span className="text-[10px] font-mystic italic py-1 font-medium" style={{ color: isDark ? 'var(--t-faint)' : '#64748B', opacity: 0.85 }}>
            Vô Chính Diệu
          </span>
        )}
        {majorStars.map((star) => {
          const starNameVi = toVietnameseStar(star.name);
          const brightnessVi = toVietnameseBrightness(star.brightnessRaw);
          const overlaySiHua = overlayStarSiHua?.[star.name];
          const elem = getStarElement(star.name);
          const style = getElementStyle(elem, isDark);
          const isBright = star.brightness === 'bright';
          const isDim = star.brightness === 'dim';

          return (
            <div
              key={star.name}
              className="flex items-center flex-wrap"
              onClick={e => { e.stopPropagation(); onStarClick?.(star); }}
            >
              <span
                className="text-[13px] font-mystic leading-tight font-bold tracking-wide cursor-pointer hover:scale-105 transition-all"
                style={{
                  color: isDim ? style.colorDim : style.color,
                  textShadow: (isDark && isBright) ? style.glow : undefined,
                  filter: (isDark && isBright) ? 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' : undefined,
                }}
              >
                {starNameVi}
              </span>

              {/* Độ sáng tinh diệu (Miếu/Vượng rực rỡ, Hãm đỏ thắm) */}
              {brightnessVi && (
                <span
                  className={clsx(
                    'text-[9px] font-mystic ml-1 font-semibold',
                    brightnessVi === 'Miếu' || brightnessVi === 'Vượng'
                      ? (isDark ? 'text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 'text-red-700 font-bold')
                      : brightnessVi === 'Hãm'
                      ? (isDark ? 'text-rose-400 font-bold' : 'text-rose-600 font-bold')
                      : (isDark ? 'text-sky-300/80' : 'text-blue-700 font-medium')
                  )}
                >
                  ({brightnessVi})
                </span>
              )}

              {/* Tứ Hóa nguyên bản */}
              {star.siHua && <SiHuaBadge siHua={star.siHua} />}

              {/* Tứ Hóa lưu niên / đại hạn */}
              {overlaySiHua && (
                <SiHuaBadge
                  siHua={overlaySiHua}
                  overlay
                  label={overlayLabel}
                  onClick={e => {
                    e.stopPropagation();
                    onSiHuaClick?.(star.name, overlaySiHua);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Cát Tinh & Phụ Diệu (Màu ngọc lục, lam biếc, bạch kim) ── */}
      {luckyStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-1 pt-0.5 border-t" style={{ borderColor: isDark ? 'rgba(212,168,67,0.08)' : 'rgba(184,146,42,0.18)' }}>
          {luckyStars.map(s => {
            const starNameVi = toVietnameseStar(s.name);
            const overlaySiHua = overlayStarSiHua?.[s.name];
            const elem = getStarElement(s.name);
            const style = getElementStyle(elem, isDark);

            return (
              <span
                key={s.name}
                className="inline-flex items-center text-[9.5px] font-mystic font-medium leading-tight hover:brightness-125 transition-all"
                style={{ color: style.color, opacity: isDark ? 0.88 : 1 }}
              >
                {starNameVi}
                {s.siHua && <SiHuaBadge siHua={s.siHua} />}
                {overlaySiHua && (
                  <SiHuaBadge
                    siHua={overlaySiHua}
                    overlay
                    label={overlayLabel}
                    onClick={e => {
                      e.stopPropagation();
                      onSiHuaClick?.(s.name, overlaySiHua);
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Sát Tinh (Đỏ rực, cam lửa - Cảnh báo hung tinh sắc sảo) ── */}
      {shaStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-0.5">
          {shaStars.map(s => (
            <span
              key={s.name}
              className={clsx(
                'text-[9.5px] font-mystic font-semibold leading-tight hover:brightness-125 transition-all',
                isDark ? 'text-rose-400 drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]' : 'text-red-700'
              )}
            >
              {toVietnameseStar(s.name)}{s.siHua && <SiHuaBadge siHua={s.siHua} />}
            </span>
          ))}
        </div>
      )}

    </motion.div>
  );
}
