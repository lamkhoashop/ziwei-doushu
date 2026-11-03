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
  ELEMENT_STYLES,
} from '@/lib/ziwei/vietnamese';
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
const SIHUA_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  'Lộc':   { bg: 'rgba(6, 78, 59, 0.85)',   border: 'rgba(52, 211, 153, 0.7)',  text: '#6ee7b7', glow: '0 0 6px rgba(16,185,129,0.5)' },
  'Quyền': { bg: 'rgba(136, 19, 55, 0.85)', border: 'rgba(251, 113, 133, 0.7)', text: '#fda4af', glow: '0 0 6px rgba(244,63,94,0.5)' },
  'Khoa':  { bg: 'rgba(120, 53, 15, 0.85)', border: 'rgba(251, 191, 36, 0.7)',  text: '#fde68a', glow: '0 0 6px rgba(245,158,11,0.5)' },
  'Kỵ':    { bg: 'rgba(88, 28, 135, 0.85)', border: 'rgba(192, 132, 252, 0.7)', text: '#e9d5ff', glow: '0 0 6px rgba(168,85,247,0.5)' },
  '禄':    { bg: 'rgba(6, 78, 59, 0.85)',   border: 'rgba(52, 211, 153, 0.7)',  text: '#6ee7b7', glow: '0 0 6px rgba(16,185,129,0.5)' },
  '权':    { bg: 'rgba(136, 19, 55, 0.85)', border: 'rgba(251, 113, 133, 0.7)', text: '#fda4af', glow: '0 0 6px rgba(244,63,94,0.5)' },
  '科':    { bg: 'rgba(120, 53, 15, 0.85)', border: 'rgba(251, 191, 36, 0.7)',  text: '#fde68a', glow: '0 0 6px rgba(245,158,11,0.5)' },
  '忌':    { bg: 'rgba(88, 28, 135, 0.85)', border: 'rgba(192, 132, 252, 0.7)', text: '#e9d5ff', glow: '0 0 6px rgba(168,85,247,0.5)' },
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
  const displaySiHua = toVietnameseSiHua(siHua);
  const displayLabel = label === '限' ? 'Hạn' : label === '年' ? 'Niên' : label;
  const style = SIHUA_STYLES[displaySiHua] || SIHUA_STYLES[siHua] || SIHUA_STYLES['Lộc'];

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
  const { branch, stem, name, stars, daXianAge, isCurrentDaXian, isMingGong, isShenGong } = palace;
  const ganzhi = `${STEMS_VI[stem]} ${BRANCHES_VI[branch]}`;
  const palaceName = toVietnamesePalace(name);

  const majorStars = stars.filter(s => s.type === 'major');
  const luckyStars = stars.filter(s => s.type === 'lucky');
  const shaStars = stars.filter(s => s.type === 'sha');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      onClick={onClick}
      className="relative flex flex-col p-2.5 cursor-pointer transition-all duration-200 h-full overflow-hidden select-none group"
      style={{
        minHeight: '135px',
        background: isCurrentDaXian
          ? 'linear-gradient(145deg, rgba(88,28,135,0.22) 0%, rgba(20,10,35,0.92) 100%)'
          : isSelected
          ? 'linear-gradient(145deg, rgba(37,99,235,0.25) 0%, rgba(10,25,50,0.92) 100%)'
          : isSanFang
          ? 'linear-gradient(145deg, rgba(37,99,235,0.12) 0%, rgba(15,20,35,0.92) 100%)'
          : isMingGong
          ? 'linear-gradient(145deg, rgba(180,83,9,0.18) 0%, rgba(25,18,10,0.92) 100%)'
          : isShenGong
          ? 'linear-gradient(145deg, rgba(14,165,233,0.15) 0%, rgba(10,20,30,0.92) 100%)'
          : 'linear-gradient(145deg, rgba(22,26,38,0.95) 0%, rgba(12,14,22,0.98) 100%)',
        boxShadow: isCurrentDaXian
          ? 'inset 0 0 0 1.5px rgba(168,85,247,0.7), 0 0 16px rgba(168,85,247,0.25)'
          : isSelected
          ? 'inset 0 0 0 1.5px rgba(56,189,248,0.8), 0 0 16px rgba(56,189,248,0.3)'
          : isSanFang
          ? 'inset 0 0 0 1px rgba(56,189,248,0.45)'
          : isMingGong
          ? 'inset 0 0 0 1px rgba(245,158,11,0.4)'
          : 'inset 0 0 0 0.5px rgba(212,168,67,0.15)',
      }}
    >
      {/* ── 4 Hoa văn góc cổ điển Á Đông (Oriental Corner Ornaments) ── */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#d4a843]/30 pointer-events-none" />
      <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#d4a843]/30 pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#d4a843]/30 pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#d4a843]/30 pointer-events-none" />

      {/* Đại hạn tuổi */}
      {daXianAge && (
        <div className={clsx(
          'absolute top-1.5 right-2 text-[9px] font-mono tabular-nums font-semibold',
          isCurrentDaXian ? 'text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]' : ''
        )}
          style={!isCurrentDaXian ? { color: 'var(--t-faint)', opacity: 0.7 } : undefined}
        >
          {daXianAge[0]}–{daXianAge[1]}
        </div>
      )}

      {/* ── Header Cung vị & Can Chi ── */}
      <div className="flex items-center justify-between gap-1 mb-1 pr-7 border-b pb-1"
        style={{ borderColor: isMingGong ? 'rgba(245,158,11,0.3)' : 'rgba(212,168,67,0.12)' }}>
        <div className="flex items-center gap-1.5">
          <span className={clsx(
            'text-[11px] font-serif font-bold tracking-wide transition-colors',
            isMingGong ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
            isShenGong ? 'text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' :
            'text-[var(--t-gold)]'
          )}>
            {palaceName}
          </span>

          {/* Dấu ấn Chu Sa Mệnh Cung */}
          {isMingGong && (
            <span className="text-[7.5px] font-bold px-1 py-0.2 rounded text-white bg-gradient-to-r from-red-600 to-rose-700 border border-red-300/60 shadow-[0_0_8px_rgba(239,68,68,0.7)] uppercase tracking-wider">
              Mệnh
            </span>
          )}

          {/* Ngọc Bài Lam Bích Thân Cung */}
          {isShenGong && (
            <span className="text-[7.5px] font-bold px-1 py-0.2 rounded text-white bg-gradient-to-r from-sky-600 to-blue-700 border border-sky-300/60 shadow-[0_0_8px_rgba(14,165,233,0.7)] uppercase tracking-wider">
              Thân
            </span>
          )}
        </div>

        {/* Can Chi cung vị */}
        <span className="text-[9px] font-serif font-medium" style={{ color: 'var(--t-faint)', opacity: 0.85 }}>
          {ganzhi}
        </span>
      </div>

      {/* ── Danh sách Chính Tinh (Màu sắc Ngũ Hành Kim-Mộc-Thủy-Hỏa-Thổ) ── */}
      <div className="flex flex-col gap-0.5 flex-1 my-0.5">
        {majorStars.length === 0 && (
          <span className="text-[9.5px] font-serif italic py-1" style={{ color: 'var(--t-faint)', opacity: 0.55 }}>
            Vô Chính Diệu
          </span>
        )}
        {majorStars.map((star) => {
          const starNameVi = toVietnameseStar(star.name);
          const brightnessVi = toVietnameseBrightness(star.brightnessRaw);
          const overlaySiHua = overlayStarSiHua?.[star.name];
          const elem = getStarElement(star.name);
          const style = ELEMENT_STYLES[elem];
          const isBright = star.brightness === 'bright';
          const isDim = star.brightness === 'dim';

          return (
            <div
              key={star.name}
              className="flex items-center flex-wrap"
              onClick={e => { e.stopPropagation(); onStarClick?.(star); }}
            >
              <span
                className="text-[12px] leading-tight font-bold tracking-tight cursor-pointer hover:scale-105 transition-all"
                style={{
                  color: isDim ? style.colorDim : style.color,
                  textShadow: isBright ? style.glow : undefined,
                  filter: isBright ? 'drop-shadow(0 0 3px rgba(255,255,255,0.25))' : undefined,
                }}
              >
                {starNameVi}
              </span>

              {/* Độ sáng tinh diệu (Miếu/Vượng rực rỡ, Hãm đỏ thắm) */}
              {brightnessVi && (
                <span
                  className={clsx(
                    'text-[8px] ml-1 font-semibold',
                    brightnessVi === 'Miếu' || brightnessVi === 'Vượng'
                      ? 'text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                      : brightnessVi === 'Hãm'
                      ? 'text-rose-400 font-bold'
                      : 'text-sky-300/80'
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
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-1 pt-0.5 border-t border-[rgba(212,168,67,0.08)]">
          {luckyStars.map(s => {
            const starNameVi = toVietnameseStar(s.name);
            const overlaySiHua = overlayStarSiHua?.[s.name];
            const elem = getStarElement(s.name);
            const style = ELEMENT_STYLES[elem];

            return (
              <span
                key={s.name}
                className="inline-flex items-center text-[9px] font-medium leading-tight hover:brightness-125 transition-all"
                style={{ color: style.color, opacity: 0.88 }}
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
              className="text-[9px] font-semibold text-rose-400 leading-tight drop-shadow-[0_0_3px_rgba(244,63,94,0.3)] hover:brightness-125 transition-all"
            >
              {toVietnameseStar(s.name)}{s.siHua && <SiHuaBadge siHua={s.siHua} />}
            </span>
          ))}
        </div>
      )}

    </motion.div>
  );
}
