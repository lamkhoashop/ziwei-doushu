'use client';

/**
 * Thiệp Mệnh Bản Cổ Phong (Oriental Mystic Fortune Card)
 * Thiết kế tỉ lệ chuẩn hoàng gia 720x460:
 * - Bên trái: Bàn cờ 12 Cung Vị thu nhỏ sắc nét
 * - Bên phải: Khái quát Bản Mệnh, Cung Thân, Cách Cục & Lời khuyên Thiên Kỷ
 * - Kết xuất ảnh PNG độ nét cao (2x scale) tải về điện thoại / máy tính
 */

import type { ZiweiChart } from '@/lib/ziwei/types';
import {
  toVietnamesePalace,
  toVietnameseStar,
  toVietnameseJu,
  toVietnamesePatternName,
  BRANCHES_VI,
  STEMS_VI,
} from '@/lib/ziwei/vietnamese';
import { detectPatterns } from '@/lib/ziwei/patterns';

// Bố cục 12 Cung vị theo chuẩn Địa Chi Bàn Tử Vi
const ZHIWEI_LAYOUT: Array<{ branch: number; row: number; col: number }> = [
  { branch: 5,  row: 0, col: 0 }, // Tỵ
  { branch: 6,  row: 0, col: 1 }, // Ngọ
  { branch: 7,  row: 0, col: 2 }, // Mùi
  { branch: 8,  row: 0, col: 3 }, // Thân
  { branch: 4,  row: 1, col: 0 }, // Thìn
  { branch: 9,  row: 1, col: 3 }, // Dậu
  { branch: 3,  row: 2, col: 0 }, // Mão
  { branch: 10, row: 2, col: 3 }, // Tuất
  { branch: 2,  row: 3, col: 0 }, // Dần
  { branch: 1,  row: 3, col: 1 }, // Sửu
  { branch: 0,  row: 3, col: 2 }, // Tý
  { branch: 11, row: 3, col: 3 }, // Hợi
];

interface ShareCardProps {
  chart: ZiweiChart;
}

export default function ShareCardCanvas({ chart }: ShareCardProps) {
  const { birthInfo, lunarInfo, wuxingJuName, daXians, currentDaXianIndex } = chart;
  const mingPalace = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  const mingMajorStars = mingPalace?.stars.filter(s => s.type === 'major').map(s => toVietnameseStar(s.name)) ?? [];
  const mingStarStr = mingMajorStars.length > 0 ? mingMajorStars.join(' · ') : 'Vô Chính Diệu';
  const mingBranchName = BRANCHES_VI[chart.mingGongBranch] || '';
  const shenBranchName = BRANCHES_VI[chart.shenGongBranch] || '';
  const currentDx = daXians?.[currentDaXianIndex];
  const patterns = detectPatterns(chart);
  const topPattern = patterns.length > 0 ? toVietnamesePatternName(patterns[0].name) : undefined;

  const cells = ZHIWEI_LAYOUT.map(slot => {
    const palace = chart.palaces.find(p => p.branch === slot.branch);
    const majors = palace?.stars.filter(s => s.type === 'major') ?? [];
    const isMing = palace?.branch === chart.mingGongBranch;
    const isShen = palace?.branch === chart.shenGongBranch;
    return { ...slot, palace, majors, isMing, isShen };
  });

  return (
    <div
      id="share-card"
      style={{
        width: '740px',
        height: '470px',
        background: 'linear-gradient(145deg, #121622 0%, #0c0e17 50%, #16120a 100%)',
        border: '2px solid rgba(212, 168, 67, 0.45)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.8), inset 0 0 25px rgba(212,168,67,0.06)',
        padding: '20px 24px',
        fontFamily: 'serif',
        position: 'relative',
        boxSizing: 'border-box',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: '#fef08a',
      }}
    >
      {/* 4 Góc Hoa Văn Cổ Thư */}
      <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 13, color: '#d4a843', opacity: 0.5, userSelect: 'none' }}>╔</div>
      <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 13, color: '#d4a843', opacity: 0.5, userSelect: 'none' }}>╗</div>
      <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 13, color: '#d4a843', opacity: 0.5, userSelect: 'none' }}>╚</div>
      <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 13, color: '#d4a843', opacity: 0.5, userSelect: 'none' }}>╝</div>

      {/* Ánh sáng nền huyền bí */}
      <div
        style={{
          position: 'absolute', top: -50, right: -50,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Header Thiệp ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(212,168,67,0.2)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Logo Bát Quái */}
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'radial-gradient(circle, #2a1f10 0%, #0c0e17 100%)',
              border: '1.5px solid #d4a843',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', color: '#fef08a',
              boxShadow: '0 0 10px rgba(212,168,67,0.3)',
            }}
          >
            ☯
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.15em', color: '#fef08a', textTransform: 'uppercase' }}>
              THIÊN BÀN TỬ VI ĐẨU SỐ
            </div>
            <div style={{ fontSize: '9px', color: '#d4a843', opacity: 0.8, letterSpacing: '0.15em', marginTop: '1px' }}>
              TRƯỜNG PHÁI THIÊN KỶ NGHÊ HẢI HÀ · TRI MỆNH TẠO VẬN
            </div>
          </div>
        </div>

        {/* Thông tin đương số */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fef9c3', letterSpacing: '0.05em' }}>
            {birthInfo.name || 'Bản Mệnh Đương Số'} · {birthInfo.gender === 'male' ? 'Nam Mạng' : 'Nữ Mạng'}
          </div>
          <div style={{ fontSize: '9.5px', color: 'rgba(254,240,138,0.7)', marginTop: '2px', letterSpacing: '0.03em' }}>
            Dương lịch: {birthInfo.day}/{birthInfo.month}/{birthInfo.year} (Giờ {BRANCHES_VI[birthInfo.hour]})
            {birthInfo.city ? ` · ${birthInfo.city}` : ''}
          </div>
          <div style={{ fontSize: '9px', color: '#d4a843', opacity: 0.85, marginTop: '1px' }}>
            Âm lịch: {lunarInfo.lunarDay}/{lunarInfo.lunarMonth}/{lunarInfo.lunarYear} ({STEMS_VI[lunarInfo.yearStem]} {BRANCHES_VI[lunarInfo.yearBranch]})
          </div>
        </div>
      </div>

      {/* ── Thân Thiệp: Bàn cờ 12 Cung (Trái) + Tổng Quan Mệnh Lý (Phải) ── */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Bàn Cờ 12 Cung Vị Thu Nhỏ (330px) */}
        <div
          style={{
            width: '330px',
            height: '350px',
            background: 'rgba(15, 18, 28, 0.75)',
            border: '1px solid rgba(212,168,67,0.3)',
            borderRadius: '10px',
            padding: '4px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: '2px',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {cells.map((cell, idx) => {
            // Trung tâm 4 ô trống làm Thiên Bàn
            if ((cell.row === 1 || cell.row === 2) && (cell.col === 1 || cell.col === 2)) return null;

            const pName = cell.palace ? toVietnamesePalace(cell.palace.name) : '';
            const bName = cell.palace ? BRANCHES_VI[cell.palace.branch] : '';
            const starNames = cell.majors.map(s => toVietnameseStar(s.name));

            return (
              <div
                key={idx}
                style={{
                  gridRow: cell.row + 1,
                  gridColumn: cell.col + 1,
                  background: cell.isMing
                    ? 'rgba(153, 27, 27, 0.28)'
                    : cell.isShen
                    ? 'rgba(30, 58, 138, 0.28)'
                    : 'rgba(255,255,255,0.02)',
                  border: cell.isMing
                    ? '1.2px solid rgba(239, 68, 68, 0.8)'
                    : cell.isShen
                    ? '1.2px solid rgba(56, 189, 248, 0.8)'
                    : '0.5px solid rgba(212, 168, 67, 0.15)',
                  borderRadius: '5px',
                  padding: '3px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                {/* Header Cung */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: cell.isMing ? '#fca5a5' : cell.isShen ? '#7dd3fc' : '#fef08a' }}>
                    {pName}
                  </span>
                  <span style={{ fontSize: '7.5px', opacity: 0.6, color: '#fef9c3' }}>
                    {bName}
                  </span>
                </div>

                {/* Chính tinh */}
                <div style={{ fontSize: '8px', lineHeight: 1.15, fontWeight: 600, color: '#fef08a' }}>
                  {starNames.length > 0 ? starNames.join(' ') : '—'}
                </div>

                {/* Dấu Ấn Mệnh / Thân */}
                <div style={{ fontSize: '7px', textAlign: 'right' }}>
                  {cell.isMing && (
                    <span style={{ background: '#991b1b', color: '#fef2f2', padding: '1px 3px', borderRadius: '2px', fontWeight: 700 }}>
                      MỆNH
                    </span>
                  )}
                  {cell.isShen && (
                    <span style={{ background: '#1e3a8a', color: '#eff6ff', padding: '1px 3px', borderRadius: '2px', fontWeight: 700, marginLeft: 2 }}>
                      THÂN
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Ô Trung Tâm: Mandala Bát Quái & Cục Số */}
          <div
            style={{
              gridRow: '2 / 4',
              gridColumn: '2 / 4',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(30,22,12,0.95) 0%, rgba(12,14,22,0.98) 100%)',
              borderRadius: '6px',
              border: '1px solid rgba(212, 168, 67, 0.35)',
              padding: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '20px', lineHeight: 1, color: '#fef08a', marginBottom: '2px' }}>☯</div>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#d4a843', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              MỆNH BÀN ĐẨU SỐ
            </div>
            <div style={{ fontSize: '9px', color: '#fef08a', marginTop: '3px' }}>
              {toVietnameseJu(wuxingJuName)}
            </div>
            <div style={{ fontSize: '8px', color: 'rgba(254,240,138,0.7)', marginTop: '2px' }}>
              Mệnh tại {mingBranchName} · Thân tại {shenBranchName}
            </div>
          </div>
        </div>

        {/* Tổng Quan Mệnh Lý Hoàng Gia (Bên phải) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingLeft: '4px' }}>
          {/* Cung Mệnh Cốt Cách */}
          <div>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#d4a843', marginBottom: '2px' }}>
              ✦ BẢN MỆNH CỐT CÁCH (CUNG {mingBranchName.toUpperCase()})
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fef08a', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: '6px', textShadow: '0 0 12px rgba(212,168,67,0.35)' }}>
              {mingStarStr}
            </div>

            {/* Cách cục kinh điển nếu có */}
            {topPattern && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(212, 168, 67, 0.12)',
                  border: '1px solid rgba(212, 168, 67, 0.35)',
                  fontSize: '10px',
                  color: '#fef08a',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}
              >
                <span>❖</span> Cách Cục: <strong>{topPattern}</strong>
              </div>
            )}
          </div>

          {/* Đại hạn hiện tại */}
          {currentDx && (
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 168, 67, 0.2)',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            >
              <div style={{ fontSize: '9px', color: '#d4a843', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ĐẠI HẠN 10 NĂM HIỆN TẠI
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fef08a', marginTop: '2px' }}>
                {currentDx.startAge}–{currentDx.endAge} tuổi · Ngự tại cung {toVietnamesePalace(currentDx.palaceName)} ({BRANCHES_VI[currentDx.palaceBranch]})
              </div>
            </div>
          )}

          {/* Thẻ Lời Khuyên Thiên Kỷ Nghê Hải Hà */}
          <div
            style={{
              padding: '10px 12px',
              background: 'linear-gradient(135deg, rgba(212,168,67,0.15) 0%, rgba(184,146,42,0.05) 100%)',
              border: '1px solid rgba(212,168,67,0.35)',
              borderRadius: '8px',
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#fef08a', lineHeight: 1.4 }}>
              &ldquo;Tri mệnh để tạo vận, hiểu mình để làm chủ cuộc đời.&rdquo;
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(254,240,138,0.75)', fontStyle: 'italic', marginTop: '3px', lineHeight: 1.3 }}>
              Mọi cát hung đều là cơ hội tu dưỡng tâm tính và hành động thực tế.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '4px', borderTop: '0.5px solid rgba(212,168,67,0.2)' }}>
              <span style={{ fontSize: '8px', color: '#d4a843', letterSpacing: '0.15em' }}>
                tuvi.lamkhoa.store
              </span>
              <span style={{ fontSize: '8px', color: '#10b981', fontWeight: 600 }}>
                ✓ An sao & Luận giải AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chụp thẻ thiệp HTML thành ảnh PNG độ phân giải cao */
export async function captureShareCard(): Promise<string | null> {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const node = document.getElementById('share-card');
    if (!node) return null;
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('captureShareCard failed', e);
    return null;
  }
}

export function downloadDataURL(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
