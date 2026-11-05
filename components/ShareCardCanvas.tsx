'use client';

/**
 * Thiệp Mệnh Bản Cổ Phong Hoàng Gia (Imperial Fortune Card)
 * Thiết kế tỉ lệ chuẩn vàng 780x500px:
 * - Bên trái (375px): Mệnh Bàn 12 Cung Vị thu nhỏ ĐẸP CHUẨN NHƯ BÊN TRONG (đầy đủ màu sao ngũ hành, độ sáng, tứ hóa, triện hoàng cung, 4 góc hoa văn, bát quái thái cực)
 * - Bên phải (365px): Tổng quan Bản Mệnh, Cách Cục, vài dòng Luận Giải Cô Đọng kích thích sự tò mò, và Ấn ký quảng cáo website tinh tế
 */

import type { ZiweiChart, Star } from '@/lib/ziwei/types';
import {
  toVietnamesePalace,
  toVietnameseStar,
  toVietnameseSiHua,
  toVietnameseBrightness,
  toVietnameseJu,
  toVietnamesePatternName,
  BRANCHES_VI,
  STEMS_VI,
  getStarElement,
  ELEMENT_STYLES,
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

const SIHUA_MINI_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Lộc':   { bg: '#064e3b', text: '#6ee7b7', border: '#10b981' },
  'Quyền': { bg: '#881337', text: '#fda4af', border: '#f43f5e' },
  'Khoa':  { bg: '#78350f', text: '#fde68a', border: '#f59e0b' },
  'Kỵ':    { bg: '#581c87', text: '#e9d5ff', border: '#a855f7' },
  '禄':    { bg: '#064e3b', text: '#6ee7b7', border: '#10b981' },
  '权':    { bg: '#881337', text: '#fda4af', border: '#f43f5e' },
  '科':    { bg: '#78350f', text: '#fde68a', border: '#f59e0b' },
  '忌':    { bg: '#581c87', text: '#e9d5ff', border: '#a855f7' },
};

/** Tạo các câu luận giải cô đọng mang tính huyền cơ kích thích tò mò */
function getCuriosityInsight(stars: string[], patternName: string | undefined, palaceName: string): { menhLine: string; hanLine: string } {
  const starsStr = stars.join(' ');
  let menhLine = '';

  if (patternName && patternName.includes('Phủ Tướng')) {
    menhLine = 'Mệnh nhập Phủ Tướng Triều Viên, tài khố song toàn; tâm cơ thâm trầm quyền biến, tay trắng dựng đại nghiệp nhưng tiền vận phải kinh qua sóng gió mới hiển vinh.';
  } else if (starsStr.includes('Vũ Khúc') && starsStr.includes('Thiên Phủ')) {
    menhLine = 'Vũ Khúc triều Thiên Phủ, mệnh đới tài tinh đế vương; mưu lược kinh thương quán tuyệt, nhưng số định tiền nan hậu dị, cần biết điểm dừng để giữ trọn cơ đồ.';
  } else if (starsStr.includes('Tử Vi')) {
    menhLine = 'Đế tinh tọa thủ, cốt cách uy nghi tôn quý; mang mệnh lãnh đạo quần hùng nhưng nội tâm cô độc, càng trải gian truân thì hậu vận càng phong quang chói lọi.';
  } else if (starsStr.includes('Thất Sát') || starsStr.includes('Phá Quân') || starsStr.includes('Tham Lang')) {
    menhLine = 'Sát Phá Tham dũng tướng xung thiên; một đời đại biến đại thành, dám phá vỡ nghịch cảnh lập kỳ tích, song cần tiết chế sát khí để vạn sự được chu toàn.';
  } else if (starsStr.includes('Thái Dương') || starsStr.includes('Thái Âm')) {
    menhLine = 'Nhật Nguyệt quang huy chiếu mệnh, tâm tư đa đoan tài trí hơn người; số định ly hương tạo dựng sự nghiệp mới mong công thành danh toại đỉnh cao.';
  } else if (starsStr.includes('Thiên Cơ') || starsStr.includes('Thiên Đồng')) {
    menhLine = 'Trí tuệ trác việt, mưu lược như thần; giỏi bề phò tá tạo dựng cơ đồ, tâm tính lương thiện nhưng nội tâm đa cảm, hậu vận đại an khang.';
  } else if (starsStr.includes('Liêm Trinh')) {
    menhLine = 'Liêm Trinh cương nghị tài hoa, trực giác sắc bén; công danh thăng tiến phi phàm nhưng cuộc đời đan xen nhiều khúc ngoặt thị phi duyên nợ.';
  } else {
    menhLine = 'Khí số bản mệnh tàng phong tụ khí; cơ biến linh hoạt, mượn sức càn khôn hóa giải gian nan, một khi gặp thời tất tạo nên bước ngoặt bất ngờ.';
  }

  let hanLine = '';
  if (palaceName.includes('Điền Trạch')) {
    hanLine = 'Đại hạn 10 năm tại Điền Trạch: Khí số sản nghiệp chuyển biến dữ dội, mở ra thời cơ vàng về tích lũy đất đai tài khố và ổn định gia đạo.';
  } else if (palaceName.includes('Quan Lộc')) {
    hanLine = 'Đại hạn 10 năm tại Quan Lộc: Cờ lệnh công danh đã điểm, cơ hội thăng tiến mở lối nhưng thị phi chốn quan trường cũng đang rình rập.';
  } else if (palaceName.includes('Tài Bạch')) {
    hanLine = 'Đại hạn 10 năm tại Tài Bạch: Thủy triều tài lộc dâng cao, đại vận tạo tiền đồ nhưng là lúc thử thách bản lĩnh giữ của và dòng tiền.';
  } else if (palaceName.includes('Thiên Di')) {
    hanLine = 'Đại hạn 10 năm tại Thiên Di: Vận số xuất ngoại đắc lộc, bước chân ra ngoài gặp quý nhân tương trợ, càng dịch chuyển càng hưng thịnh.';
  } else if (palaceName.includes('Phu Thê')) {
    hanLine = 'Đại hạn 10 năm tại Phu Thê: Nhân duyên tiền định tương phùng, người bạn đồng hành giữ chìa khóa 7 phần thành bại đời người.';
  } else if (palaceName.includes('Phúc Đức')) {
    hanLine = 'Đại hạn 10 năm tại Phúc Đức: Tâm tính thăng hoa, âm đức tổ tiên hộ trì, vận may ngầm chuyển biến thành tựu lớn.';
  } else {
    hanLine = `Đại hạn 10 năm tại ${palaceName}: Bước vào chu kỳ then chốt xoay chuyển cục diện cuộc đời, hung cát đan xen đòi hỏi nội lực vững vàng.`;
  }

  return { menhLine, hanLine };
}

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
  const dxPalaceName = currentDx ? toVietnamesePalace(currentDx.palaceName) : '';
  const patterns = detectPatterns(chart);
  const topPattern = patterns.length > 0 ? toVietnamesePatternName(patterns[0].name) : undefined;

  const { menhLine, hanLine } = getCuriosityInsight(mingMajorStars, topPattern, dxPalaceName);

  const cells = ZHIWEI_LAYOUT.map(slot => {
    const palace = chart.palaces.find(p => p.branch === slot.branch);
    const majors = palace?.stars.filter(s => s.type === 'major') ?? [];
    const luckies = palace?.stars.filter(s => s.type === 'lucky') ?? [];
    const shas = palace?.stars.filter(s => s.type === 'sha') ?? [];
    const isMing = palace?.branch === chart.mingGongBranch;
    const isShen = palace?.branch === chart.shenGongBranch;
    const isCurrentDx = currentDx && palace?.branch === currentDx.palaceBranch;
    return { ...slot, palace, majors, luckies, shas, isMing, isShen, isCurrentDx };
  });

  return (
    <div
      id="share-card"
      style={{
        width: '780px',
        height: '495px',
        background: 'linear-gradient(145deg, #0e121b 0%, #080a10 50%, #120e06 100%)',
        border: '2px solid rgba(212, 168, 67, 0.45)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 0 35px rgba(212,168,67,0.08)',
        padding: '16px 20px',
        fontFamily: 'var(--font-mystic)',
        position: 'relative',
        boxSizing: 'border-box',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: '#fef08a',
      }}
    >
      {/* 4 Góc Hoa Văn Hoàng Gia */}
      <div style={{ position: 'absolute', top: 5, left: 8, fontSize: 13, color: '#d4a843', opacity: 0.6, userSelect: 'none' }}>╔</div>
      <div style={{ position: 'absolute', top: 5, right: 8, fontSize: 13, color: '#d4a843', opacity: 0.6, userSelect: 'none' }}>╗</div>
      <div style={{ position: 'absolute', bottom: 5, left: 8, fontSize: 13, color: '#d4a843', opacity: 0.6, userSelect: 'none' }}>╚</div>
      <div style={{ position: 'absolute', bottom: 5, right: 8, fontSize: 13, color: '#d4a843', opacity: 0.6, userSelect: 'none' }}>╝</div>

      {/* Ánh sáng nền huyền bí */}
      <div
        style={{
          position: 'absolute', top: -60, right: -60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,67,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Header Thiệp ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(212,168,67,0.22)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          {/* Logo Bát Quái */}
          <div
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'radial-gradient(circle, #2a1f10 0%, #0c0e17 100%)',
              border: '1.5px solid #d4a843',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: '#fef08a',
              boxShadow: '0 0 10px rgba(212,168,67,0.4)',
            }}
          >
            ☯
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, letterSpacing: '0.22em', color: '#fef08a', textTransform: 'uppercase' }}>
              ✦ THIÊN BÀN TỬ VI ĐẨU SỐ ✦
            </div>
            <div style={{ fontSize: '8.5px', color: '#d4a843', opacity: 0.85, letterSpacing: '0.12em', marginTop: '1px' }}>
              TRƯỜNG PHÁI THIÊN KỶ NGHÊ HẢI HÀ · TRI MỆNH TẠO VẬN
            </div>
          </div>
        </div>

        {/* Thông tin đương số */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#fef9c3', letterSpacing: '0.06em' }}>
            {birthInfo.name || 'Bản Mệnh'} · {birthInfo.gender === 'male' ? 'Nam Mạng' : 'Nữ Mạng'}
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(254,240,138,0.75)', marginTop: '1px' }}>
            Dương: {birthInfo.day}/{birthInfo.month}/{birthInfo.year} (Giờ {BRANCHES_VI[birthInfo.hour]})
            {birthInfo.city ? ` · ${birthInfo.city}` : ''}
          </div>
          <div style={{ fontSize: '8.5px', color: '#d4a843', opacity: 0.9, marginTop: '1px' }}>
            Âm: {lunarInfo.lunarDay}/{lunarInfo.lunarMonth}/{lunarInfo.lunarYear} ({STEMS_VI[lunarInfo.yearStem]} {BRANCHES_VI[lunarInfo.yearBranch]})
          </div>
        </div>
      </div>

      {/* ── Thân Thiệp: Bàn cờ 12 Cung (Trái 375px) + Tổng Quan Mệnh Lý & Tò Mò (Phải 355px) ── */}
      <div style={{ display: 'flex', gap: '14px', flex: 1, minHeight: 0 }}>
        {/* Bàn Cờ 12 Cung Vị CHUẨN ĐẸP NHƯ BÊN TRONG (375px x 380px) */}
        <div
          style={{
            width: '375px',
            height: '380px',
            background: 'rgba(11, 14, 22, 0.95)',
            border: '1.2px solid rgba(212,168,67,0.35)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            borderRadius: '8px',
            padding: '3px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: '2px',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {cells.map((cell, idx) => {
            // Trung tâm 4 ô trống làm Mandala
            if ((cell.row === 1 || cell.row === 2) && (cell.col === 1 || cell.col === 2)) return null;

            const pName = cell.palace ? toVietnamesePalace(cell.palace.name) : '';
            const ganzhi = cell.palace ? `${STEMS_VI[cell.palace.stem]} ${BRANCHES_VI[cell.palace.branch]}` : '';
            const daXianAge = cell.palace?.daXianAge;

            return (
              <div
                key={idx}
                style={{
                  gridRow: cell.row + 1,
                  gridColumn: cell.col + 1,
                  background: cell.isCurrentDx
                    ? 'linear-gradient(145deg, rgba(88,28,135,0.3) 0%, rgba(20,10,35,0.95) 100%)'
                    : cell.isMing && cell.isShen
                    ? 'linear-gradient(145deg, rgba(180,83,9,0.35) 0%, rgba(40,15,10,0.95) 100%)'
                    : cell.isMing
                    ? 'linear-gradient(145deg, rgba(180,83,9,0.3) 0%, rgba(30,15,10,0.95) 100%)'
                    : cell.isShen
                    ? 'linear-gradient(145deg, rgba(14,165,233,0.25) 0%, rgba(10,20,35,0.95) 100%)'
                    : 'linear-gradient(145deg, rgba(22,26,38,0.95) 0%, rgba(12,14,22,0.98) 100%)',
                  border: cell.isCurrentDx
                    ? '1.2px solid rgba(168,85,247,0.75)'
                    : cell.isMing
                    ? '1.2px solid rgba(239, 68, 68, 0.75)'
                    : cell.isShen
                    ? '1.2px solid rgba(56, 189, 248, 0.75)'
                    : '0.5px solid rgba(212, 168, 67, 0.2)',
                  borderRadius: '4px',
                  padding: '3px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: cell.isMing
                    ? '0 0 8px rgba(239,68,68,0.3)'
                    : cell.isShen
                    ? '0 0 8px rgba(56,189,248,0.3)'
                    : undefined,
                }}
              >
                {/* 4 Hoa văn góc mini */}
                <div style={{ position: 'absolute', top: 1, left: 1, width: 3, height: 3, borderTop: '1px solid rgba(212,168,67,0.35)', borderLeft: '1px solid rgba(212,168,67,0.35)' }} />
                <div style={{ position: 'absolute', top: 1, right: 1, width: 3, height: 3, borderTop: '1px solid rgba(212,168,67,0.35)', borderRight: '1px solid rgba(212,168,67,0.35)' }} />
                <div style={{ position: 'absolute', bottom: 1, left: 1, width: 3, height: 3, borderBottom: '1px solid rgba(212,168,67,0.35)', borderLeft: '1px solid rgba(212,168,67,0.35)' }} />
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 3, height: 3, borderBottom: '1px solid rgba(212,168,67,0.35)', borderRight: '1px solid rgba(212,168,67,0.35)' }} />

                {/* Header Cung: Tên Cung + Can Chi + Đại Hạn */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(212,168,67,0.15)', paddingBottom: '1.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{
                      fontSize: '8px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: cell.isMing ? '#fca5a5' : cell.isShen ? '#7dd3fc' : '#fef08a',
                      letterSpacing: '0.03em',
                    }}>
                      {pName}
                    </span>
                    {/* Dấu Ấn Triện Mini */}
                    {cell.isMing && cell.isShen ? (
                      <span style={{ fontSize: '6px', background: 'linear-gradient(135deg, #991b1b, #1e3a8a)', color: '#fff', padding: '0.5px 2px', borderRadius: '1.5px', fontWeight: 800 }}>
                        M·THÂN
                      </span>
                    ) : cell.isMing ? (
                      <span style={{ fontSize: '6px', background: '#991b1b', color: '#fff', padding: '0.5px 2.5px', borderRadius: '1.5px', fontWeight: 800, border: '0.5px solid #f87171' }}>
                        MỆNH
                      </span>
                    ) : cell.isShen ? (
                      <span style={{ fontSize: '6px', background: '#0369a1', color: '#fff', padding: '0.5px 2.5px', borderRadius: '1.5px', fontWeight: 800, border: '0.5px solid #38bdf8' }}>
                        THÂN
                      </span>
                    ) : null}
                  </div>
                  <span style={{ fontSize: '7px', opacity: 0.75, color: '#fef9c3' }}>
                    {ganzhi}
                  </span>
                </div>

                {/* Danh sách Chính Tinh (Tô màu ngũ hành chuẩn) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', margin: '1px 0' }}>
                  {cell.majors.length === 0 ? (
                    <span style={{ fontSize: '7.5px', fontStyle: 'italic', opacity: 0.5, color: '#d4a843' }}>
                      Vô Chính Diệu
                    </span>
                  ) : (
                    cell.majors.map((star: Star) => {
                      const sName = toVietnameseStar(star.name);
                      const sBright = toVietnameseBrightness(star.brightnessRaw);
                      const elem = getStarElement(star.name);
                      const style = ELEMENT_STYLES[elem];
                      const siHua = star.siHua ? toVietnameseSiHua(star.siHua) : '';
                      const siHuaStyle = siHua ? SIHUA_MINI_STYLES[siHua] : undefined;

                      return (
                        <div key={star.name} style={{ display: 'flex', alignItems: 'center', lineHeight: 1.15 }}>
                          <span style={{
                            fontSize: '8.5px',
                            fontWeight: 700,
                            color: style.color,
                            letterSpacing: '0.02em',
                          }}>
                            {sName}
                          </span>
                          {sBright && (
                            <span style={{
                              fontSize: '6.5px',
                              marginLeft: '2px',
                              fontWeight: 600,
                              color: sBright === 'Miếu' || sBright === 'Vượng' ? '#f59e0b' : sBright === 'Hãm' ? '#f87171' : '#38bdf8',
                            }}>
                              ({sBright[0]})
                            </span>
                          )}
                          {siHua && siHuaStyle && (
                            <span style={{
                              fontSize: '6px',
                              marginLeft: '2px',
                              padding: '0.5px 2px',
                              borderRadius: '1.5px',
                              background: siHuaStyle.bg,
                              color: siHuaStyle.text,
                              border: `0.5px solid ${siHuaStyle.border}`,
                              fontWeight: 700,
                            }}>
                              {siHua}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Cung: 1-2 Cát tinh / Sát tinh tiêu biểu & Đại hạn */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '6.5px', opacity: 0.85 }}>
                  <div style={{ display: 'flex', gap: '3px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {cell.luckies.slice(0, 1).map((s: Star) => (
                      <span key={s.name} style={{ color: '#34d399', fontWeight: 600 }}>{toVietnameseStar(s.name)}</span>
                    ))}
                    {cell.shas.slice(0, 1).map((s: Star) => (
                      <span key={s.name} style={{ color: '#fb7185', fontWeight: 600 }}>{toVietnameseStar(s.name)}</span>
                    ))}
                  </div>
                  {daXianAge && (
                    <span style={{ color: '#c084fc', fontWeight: 700, fontFamily: 'monospace' }}>
                      {daXianAge[0]}-{daXianAge[1]}
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
              background: 'radial-gradient(circle, rgba(35,24,12,0.98) 0%, rgba(10,12,20,0.98) 100%)',
              borderRadius: '6px',
              border: '1px solid rgba(212, 168, 67, 0.4)',
              boxShadow: 'inset 0 0 15px rgba(212,168,67,0.15)',
              padding: '6px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Vòng bát quái mờ nền */}
            <div style={{ fontSize: '20px', lineHeight: 1, color: '#fef08a', marginBottom: '2px', filter: 'drop-shadow(0 0 6px rgba(212,168,67,0.5))' }}>
              ☯
            </div>
            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#fef08a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              MỆNH BÀN ĐẨU SỐ
            </div>
            <div style={{
              fontSize: '8.5px',
              color: '#fef08a',
              marginTop: '3px',
              padding: '1px 6px',
              borderRadius: '999px',
              border: '0.5px solid rgba(212,168,67,0.4)',
              background: 'rgba(212,168,67,0.15)',
              fontWeight: 700,
            }}>
              ❖ {toVietnameseJu(wuxingJuName)} ❖
            </div>
            <div style={{ fontSize: '7.5px', color: 'rgba(254,240,138,0.75)', marginTop: '3px' }}>
              Mệnh tại {mingBranchName} · Thân tại {shenBranchName}
            </div>
            {currentDx && (
              <div style={{ fontSize: '7.5px', color: '#c084fc', marginTop: '1px', fontWeight: 600 }}>
                Đại Hạn {currentDx.startAge}–{currentDx.endAge} tuổi ({toVietnamesePalace(currentDx.palaceName)})
              </div>
            )}
          </div>
        </div>

        {/* ── Cột Phải (365px): Luận Giải Cô Đọng Kích Thích Tò Mò & Ấn Ký Thương Hiệu ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingLeft: '2px' }}>
          {/* Cung Mệnh Cốt Cách & Tiêu Đề Sao */}
          <div>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.22em', color: '#d4a843', fontWeight: 700 }}>
              ✦ BẢN MỆNH CỐT CÁCH (CUNG {mingBranchName.toUpperCase()})
            </div>
            <div style={{
              fontSize: '23px',
              fontWeight: 800,
              color: '#fef08a',
              letterSpacing: '0.04em',
              lineHeight: 1.15,
              marginTop: '1px',
              textShadow: '0 0 14px rgba(212,168,67,0.45)',
            }}>
              {mingStarStr}
            </div>

            {/* Cách Cục Kinh Điển */}
            {topPattern && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2.5px 8px',
                  borderRadius: '6px',
                  background: 'rgba(212, 168, 67, 0.15)',
                  border: '1px solid rgba(212, 168, 67, 0.4)',
                  fontSize: '9.5px',
                  color: '#fef08a',
                  fontWeight: 700,
                  marginTop: '4px',
                }}
              >
                <span style={{ color: '#f59e0b' }}>❖</span> Cách Cục: <strong>{topPattern}</strong>
              </div>
            )}
          </div>

          {/* Hộp Luận Giải Cô Đọng Kích Thích Tò Mò (Curiosity Prophecy Box) */}
          <div
            style={{
              padding: '10px 12px',
              background: 'linear-gradient(135deg, rgba(35,25,12,0.85) 0%, rgba(18,14,10,0.92) 100%)',
              border: '1px solid rgba(212, 168, 67, 0.35)',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 0 12px rgba(212,168,67,0.06)',
              margin: '8px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <span style={{ color: '#f59e0b', fontSize: '10px' }}>✦</span>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#fef08a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                THIÊN CƠ BẢN MỆNH & BIẾN CỤC
              </span>
            </div>

            {/* Đoạn 1: Mệnh cốt */}
            <p style={{
              fontSize: '10px',
              lineHeight: 1.45,
              color: '#fef3c7',
              margin: '0 0 5px 0',
              textAlign: 'justify',
            }}>
              • {menhLine}
            </p>

            {/* Đoạn 2: Kỳ hạn hiện tại */}
            <p style={{
              fontSize: '9.5px',
              lineHeight: 1.4,
              color: 'rgba(254, 243, 199, 0.85)',
              margin: '0 0 5px 0',
              textAlign: 'justify',
            }}>
              • {hanLine}
            </p>

            {/* Câu chốt gợi mở tò mò */}
            <div style={{
              fontSize: '8.5px',
              fontStyle: 'italic',
              color: '#fbbf24',
              lineHeight: 1.35,
              borderTop: '0.5px dashed rgba(212,168,67,0.25)',
              paddingTop: '4px',
            }}>
              ✦ Khúc ngoặt nào sẽ xoay chuyển số mệnh bạn trong chu kỳ này? Quét mã hoặc truy cập để giải mã trọn vẹn 12 cung.
            </div>
          </div>

          {/* Dòng Quảng Cáo Địa Chỉ Trang Web Tinh Tế (Imperial Provenance Seal) */}
          <div
            style={{
              padding: '7px 12px',
              background: 'linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(184,146,42,0.04) 100%)',
              border: '1px solid rgba(212,168,67,0.3)',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', color: '#fef08a' }}>⛩</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#fef08a', letterSpacing: '0.1em' }}>
                  tuvi.lamkhoa.store
                </div>
                <div style={{ fontSize: '8px', color: 'rgba(254,240,138,0.75)', letterSpacing: '0.02em' }}>
                  Hệ thống an sao & AI luận giải Mệnh Lý Tử Vi chính thống
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '0.5px solid rgba(212,168,67,0.5)',
                background: 'rgba(212,168,67,0.15)',
                fontSize: '8px',
                fontWeight: 700,
                color: '#fef08a',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}
            >
              ✦ KHÁO LUẬN MỆNH LÝ
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
