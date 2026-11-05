'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace, Star } from '@/lib/ziwei/types';
import {
  toVietnamesePalace,
  toVietnameseJu,
  BRANCHES_VI,
} from '@/lib/ziwei/vietnamese';
import PalaceCell from './PalaceCell';
import TimeNav, { type TimeView, getYearStemIndex, buildSiHuaOverlay } from './TimeNav';

interface ChartBoardProps {
  chart: ZiweiChart;
  onStarSelect?: (star: Star, palace: Palace) => void;
  onPalaceSelect?: (palace: Palace) => void;
  onSiHuaClick?: (starName: string, siHua: string, view: TimeView) => void;
}

const BRANCH_GRID_POS: Record<number, [number, number]> = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4],
  4: [2, 1], 9: [2, 4],
  3: [3, 1], 10: [3, 4],
  2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};

// Mỗi cung địa chi tọa độ tâm lưới (%)
const BRANCH_SVG_POS: Record<number, [number, number]> = {
  5: [12.5, 12.5], 6: [37.5, 12.5], 7: [62.5, 12.5], 8: [87.5, 12.5],
  4: [12.5, 37.5],                                      9: [87.5, 37.5],
  3: [12.5, 62.5],                                     10: [87.5, 62.5],
  2: [12.5, 87.5], 1: [37.5, 87.5], 0: [62.5, 87.5], 11: [87.5, 87.5],
};

const CLOCKWISE_INDEX: Record<number, number> = {
  5: 0, 6: 1, 7: 2, 8: 3,
  9: 4, 10: 5,
  11: 6, 0: 7, 1: 8, 2: 9,
  3: 10, 4: 11,
};

function sortClockwise(branches: number[]): number[] {
  return [...branches].sort((a, b) => CLOCKWISE_INDEX[a] - CLOCKWISE_INDEX[b]);
}

/** Tam phương tứ chính: Bản cung + Đối cung + 2 Cung tam hợp */
function getSanFangSiZheng(branch: number): [number, number, number, number] {
  return [
    branch,
    (branch + 6) % 12,   // Đối cung
    (branch + 4) % 12,   // Tam hợp 1
    (branch + 8) % 12,   // Tam hợp 2
  ];
}

const ANIMATION_ORDER = [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4];

export default function ChartBoard({ chart, onStarSelect, onPalaceSelect, onSiHuaClick }: ChartBoardProps) {
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [timeView, setTimeView] = useState<TimeView>('mingpan');
  const [liunianYear, setLiunianYear] = useState<number>(new Date().getFullYear());

  const palaceMap: Record<number, Palace> = {};
  chart.palaces.forEach(p => { palaceMap[p.branch] = p; });

  // Tính toán dữ liệu Tứ Hóa xếp chồng (Đại hạn hoặc Lưu niên)
  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const overlayData: Record<string, string> = (() => {
    if (timeView === 'daxian' && currentDx) {
      const dxPalace = chart.palaces.find(p => p.branch === currentDx.palaceBranch);
      if (dxPalace) return buildSiHuaOverlay(dxPalace.stem);
    }
    if (timeView === 'liunian') {
      return buildSiHuaOverlay(getYearStemIndex(liunianYear));
    }
    return {};
  })();
  const overlayLabel = timeView === 'daxian' ? 'Hạn' : timeView === 'liunian' ? 'Niên' : undefined;

  const handlePalaceClick = (branch: number) => {
    const isDeselecting = selectedBranch === branch;
    setSelectedBranch(prev => prev === branch ? null : branch);
    if (!isDeselecting) {
      const palace = palaceMap[branch];
      if (palace) onPalaceSelect?.(palace);
    }
  };

  // Tam phương tứ chính
  const sanFangBranches = selectedBranch !== null ? getSanFangSiZheng(selectedBranch) : null;
  const sanFangSet = sanFangBranches ? new Set(sanFangBranches) : null;

  // Tọa độ SVG (%) cho 4 cung vị Tam Phương Tứ Chính
  const benPos = selectedBranch !== null ? BRANCH_SVG_POS[selectedBranch] : null;
  const duiPos = selectedBranch !== null ? BRANCH_SVG_POS[(selectedBranch + 6) % 12] : null;
  const th1Pos = selectedBranch !== null ? BRANCH_SVG_POS[(selectedBranch + 4) % 12] : null;
  const th2Pos = selectedBranch !== null ? BRANCH_SVG_POS[(selectedBranch + 8) % 12] : null;

  return (
    <div className="w-full select-none">
      {/* Thanh điều hướng thời gian */}
      <TimeNav
        chart={chart}
        view={timeView}
        liunianYear={liunianYear}
        onViewChange={setTimeView}
        onYearChange={setLiunianYear}
      />

      {/* Tiêu đề lá số cổ điển Á Đông */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-3"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#d4a843]" />
          <span className="text-[11px] tracking-[0.45em] font-mystic uppercase font-bold" style={{ color: 'var(--t-gold)', textShadow: '0 0 10px rgba(212,168,67,0.4)' }}>
            ✦ THIÊN BÀN TỬ VI ĐẨU SỐ ✦
          </span>
          <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#d4a843]" />
        </div>
        <h2 className="text-lg font-mystic tracking-[0.2em] font-bold" style={{ color: 'var(--t-gold)', textShadow: '0 0 16px rgba(212,168,67,0.45)' }}>
          {chart.birthInfo.name ? `Lá Số Tử Vi: ${chart.birthInfo.name}` : 'Lá Số Tử Vi Mệnh Bàn'}
        </h2>
      </motion.div>

      {/* Lưới 4x4 Mệnh Bàn (kèm viền cổ phong & tia nối SVG) */}
      <div
        className="grid rounded-xl overflow-hidden relative"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, minmax(135px, 1fr))',
          gap: '1px',
          background: 'rgba(212,168,67,0.25)',
          border: '1px solid rgba(212,168,67,0.35)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(212,168,67,0.2)',
        }}
      >
        {ANIMATION_ORDER.map((branch, i) => {
          const [row, col] = BRANCH_GRID_POS[branch];
          const palace = palaceMap[branch];
          if (!palace) return null;
          return (
            <div key={branch} style={{ gridRow: row, gridColumn: col, background: 'var(--t-bg)' }}>
              <PalaceCell
                palace={palace}
                onClick={() => handlePalaceClick(branch)}
                onStarClick={(star) => onStarSelect?.(star, palace)}
                isSelected={selectedBranch === branch}
                isSanFang={!!(sanFangSet?.has(branch) && selectedBranch !== branch)}
                delay={i * 0.04}
                overlayStarSiHua={Object.keys(overlayData).length > 0 ? overlayData : undefined}
                overlayLabel={overlayLabel}
                onSiHuaClick={(starName, siHua) => onSiHuaClick?.(starName, siHua, timeView)}
              />
            </div>
          );
        })}

        {/* ── Khu vực trung tâm: Bát Quái Trận Đồ & Thiên Bàn ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="relative flex flex-col items-center justify-center p-4 gap-2 text-center overflow-hidden"
          style={{ gridRow: '2 / 4', gridColumn: '2 / 4', background: 'radial-gradient(circle at center, rgba(30,22,12,0.95) 0%, rgba(12,14,22,0.98) 100%)' }}
        >
          {/* Vòng Bát Quái Trận Đồ chìm tinh xảo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.12] select-none text-[var(--t-gold)]">
            <svg viewBox="0 0 200 200" className="w-56 h-56 animate-[spin_180s_linear_infinite]">
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4,2" />
              <g fontSize="8" fontWeight="bold" textAnchor="middle" fill="currentColor">
                <text x="100" y="24">☰ CÀN</text>
                <text x="156" y="47">☱ ĐOÀI</text>
                <text x="180" y="103">☲ LY</text>
                <text x="156" y="160">☳ CHẤN</text>
                <text x="100" y="184">☴ TỐN</text>
                <text x="44" y="160">☵ KHẢM</text>
                <text x="20" y="103">☶ CẤN</text>
                <text x="44" y="47">☷ KHÔN</text>
              </g>
            </svg>
          </div>

          {/* Thái Cực Đồ Ánh Kim */}
          <div className="relative text-4xl select-none leading-none drop-shadow-[0_0_16px_rgba(212,168,67,0.4)]" style={{ color: 'var(--t-gold)' }}>
            ☯
          </div>

          <div className="relative z-10 space-y-1.5 w-full max-w-[220px]">
            <div className="text-[11px] tracking-[0.35em] font-mystic font-bold uppercase text-amber-200/90 border-b border-[#d4a843]/20 pb-1">
              MỆNH BÀN ĐẨU SỐ
            </div>

            <div className="text-[11.5px] font-mystic space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-white/60 text-[10px]">Mệnh tại:</span>
                <span className="font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                  {BRANCHES_VI[chart.mingGongBranch]}
                </span>
                <span className="text-white/60 text-[10px]">Thân tại:</span>
                <span className="font-bold text-sky-300 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/30">
                  {BRANCHES_VI[chart.shenGongBranch]}
                </span>
              </div>

              {/* Ngũ Hành Cục */}
              <div>
                <span className="inline-block text-[10.5px] font-mystic font-bold px-2 py-0.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                  ❖ {toVietnameseJu(chart.wuxingJuName)} ❖
                </span>
              </div>
            </div>
          </div>

          {/* Đại Hạn Hiện Tại */}
          {chart.currentDaXianIndex >= 0 && (() => {
            const dx = chart.daXians[chart.currentDaXianIndex];
            return (
              <div className="relative z-10 border border-purple-400/40 rounded-lg px-3 py-1 text-center shadow-[0_0_10px_rgba(168,85,247,0.15)] font-mystic"
                style={{ background: 'linear-gradient(135deg, rgba(88,28,135,0.2) 0%, rgba(59,7,100,0.25) 100%)' }}>
                <div className="text-[8.5px] text-purple-300/90 tracking-widest uppercase font-semibold">ĐẠI HẠN HIỆN TẠI</div>
                <div className="text-[12px] text-purple-200 font-bold tabular-nums">{dx.startAge}–{dx.endAge} tuổi</div>
                <div className="text-[9.5px] text-purple-300/90 font-medium">Tại cung {toVietnamesePalace(dx.palaceName)}</div>
              </div>
            );
          })()}

          {/* Lịch Âm */}
          <div className="relative z-10 text-[9.5px] text-center leading-relaxed font-mystic text-amber-100/70 border-t border-[#d4a843]/15 pt-1">
            Âm lịch: {chart.lunarInfo.lunarYear} · {chart.lunarInfo.isLeapMonth ? 'Nhuận ' : ''}Tháng {chart.lunarInfo.lunarMonth} · Ngày {chart.lunarInfo.lunarDay}
          </div>
        </motion.div>

        {/* ── Tam phương tứ chính SVG liên kết ── */}
        <AnimatePresence>
          {sanFangBranches !== null && (
            <motion.div
              key={`sf-${selectedBranch}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <defs>
                  {/* Bộ lọc phát quang hào quang (Golden Aura Glow) */}
                  <filter id="sfGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Gradient tia Tam Hợp Hoàng Kim */}
                  <linearGradient id="goldRayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
                  </linearGradient>

                  {/* Gradient tia Đối Cung Xung Chiếu (Chu Sa Hỏa Diễm) */}
                  <linearGradient id="redRayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {(() => {
                  // Chuyển đổi tọa độ % sang hệ tọa độ số nguyên (0..1000)
                  const p0x = Math.round(BRANCH_SVG_POS[sanFangBranches[0]][0] * 10);
                  const p0y = Math.round(BRANCH_SVG_POS[sanFangBranches[0]][1] * 10);

                  const p1x = Math.round(BRANCH_SVG_POS[sanFangBranches[1]][0] * 10);
                  const p1y = Math.round(BRANCH_SVG_POS[sanFangBranches[1]][1] * 10);

                  const p2x = Math.round(BRANCH_SVG_POS[sanFangBranches[2]][0] * 10);
                  const p2y = Math.round(BRANCH_SVG_POS[sanFangBranches[2]][1] * 10);

                  const p3x = Math.round(BRANCH_SVG_POS[sanFangBranches[3]][0] * 10);
                  const p3y = Math.round(BRANCH_SVG_POS[sanFangBranches[3]][1] * 10);

                  return (
                    <>
                      {/* 1. Mặt Đa Giác Tam Giác Tam Hợp (Vùng hào quang bao phủ) */}
                      <polygon
                        points={`${p0x},${p0y} ${p2x},${p2y} ${p3x},${p3y}`}
                        fill="rgba(212, 168, 67, 0.14)"
                        stroke="url(#goldRayGrad)"
                        strokeWidth="3.5"
                        strokeDasharray="10,6"
                        filter="url(#sfGlow)"
                      />

                      {/* 2. Ba Cạnh Phát Sáng Của Tam Giác Tam Hợp (Đảm bảo luôn hiện rõ nét) */}
                      <line
                        x1={p0x} y1={p0y} x2={p2x} y2={p2y}
                        stroke="url(#goldRayGrad)"
                        strokeWidth="2.8"
                        strokeDasharray="10,6"
                        filter="url(#sfGlow)"
                      />
                      <line
                        x1={p2x} y1={p2y} x2={p3x} y2={p3y}
                        stroke="url(#goldRayGrad)"
                        strokeWidth="2.8"
                        strokeDasharray="10,6"
                        filter="url(#sfGlow)"
                      />
                      <line
                        x1={p3x} y1={p3y} x2={p0x} y2={p0y}
                        stroke="url(#goldRayGrad)"
                        strokeWidth="2.8"
                        strokeDasharray="10,6"
                        filter="url(#sfGlow)"
                      />

                      {/* 3. Tia Xung Chiếu Đối Cung (Tia lửa năng lượng Chu Sa) */}
                      <line
                        x1={p0x} y1={p0y}
                        x2={p1x} y2={p1y}
                        stroke="url(#redRayGrad)"
                        strokeWidth="3.2"
                        strokeDasharray="8,5"
                        filter="url(#sfGlow)"
                      />

                      {/* 4. Tinh Châu tại Đối Cung (Chu Sa) */}
                      <circle cx={p1x} cy={p1y} r="16" fill="rgba(239, 68, 68, 0.25)" />
                      <circle cx={p1x} cy={p1y} r="8.5" fill="#ef4444" stroke="#fecaca" strokeWidth="1.8" filter="url(#sfGlow)" />

                      {/* 5. Tinh Châu tại 2 Cung Tam Hợp (Hoàng Kim) */}
                      <circle cx={p2x} cy={p2y} r="14" fill="rgba(245, 158, 11, 0.25)" />
                      <circle cx={p2x} cy={p2y} r="7.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.8" filter="url(#sfGlow)" />

                      <circle cx={p3x} cy={p3y} r="14" fill="rgba(245, 158, 11, 0.25)" />
                      <circle cx={p3x} cy={p3y} r="7.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.8" filter="url(#sfGlow)" />

                      {/* 6. Tinh Châu Trung Tâm tại Bản Cung (Hoàng Kim Ngọc Tỷ) */}
                      <circle cx={p0x} cy={p0y} r="18" fill="rgba(212, 168, 67, 0.35)" />
                      <circle cx={p0x} cy={p0y} r="10.5" fill="#fef08a" stroke="#d97706" strokeWidth="2.2" filter="url(#sfGlow)" />
                    </>
                  );
                })()}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
