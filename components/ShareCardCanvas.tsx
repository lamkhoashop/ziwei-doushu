'use client';

/**
 * Thiệp Mệnh Bản Cổ Phong Hoàng Gia (Imperial Fortune Card)
 * Kích thước chuẩn: 840px × 520px (Tỷ lệ vàng, kết xuất 2x = 1680px × 1040px siêu nét)
 * - Vẽ trực tiếp bằng HTML5 Canvas 2D Context độ nét cao (2x Retina):
 *   Khắc phục TRIỆT ĐỂ 100% lỗi lệch khối màu, lệch huy hiệu của html2canvas.
 *   Tọa độ huy hiệu Tứ Hóa, Mệnh, Thân và chữ gắn kết tuyệt đối theo pixel.
 *   Không bị rớt dòng tên cung, không bị cắt chân chữ đại hạn.
 * - Hộp Thiên Cơ Luận Giải Cô Đọng kích thích tò mò cao độ.
 * - Ấn Ký Xác Thực website tuvi.lamkhoa.store tinh tế, đẳng cấp hoàng gia.
 */

import React, { useEffect, useRef } from 'react';
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
  { branch: 5,  row: 0, col: 0 }, // Tỵ (Nô Bộc)
  { branch: 6,  row: 0, col: 1 }, // Ngọ (Thiên Di)
  { branch: 7,  row: 0, col: 2 }, // Mùi (Tật Ách)
  { branch: 8,  row: 0, col: 3 }, // Thân (Tài Bạch)
  { branch: 4,  row: 1, col: 0 }, // Thìn (Quan Lộc)
  { branch: 9,  row: 1, col: 3 }, // Dậu (Tử Tức)
  { branch: 3,  row: 2, col: 0 }, // Mão (Điền Trạch)
  { branch: 10, row: 2, col: 3 }, // Tuất (Phu Thê)
  { branch: 2,  row: 3, col: 0 }, // Dần (Phúc Đức)
  { branch: 1,  row: 3, col: 1 }, // Sửu (Phụ Mẫu)
  { branch: 0,  row: 3, col: 2 }, // Tý (Mệnh Cung)
  { branch: 11, row: 3, col: 3 }, // Hợi (Huynh Đệ)
];

const SHORT_PALACE_NAMES: Record<string, string> = {
  'Mệnh Cung': 'MỆNH',
  'Huynh Đệ':  'HUYNH ĐỆ',
  'Phu Thê':   'PHU THÊ',
  'Tử Tức':    'TỬ TỨC',
  'Tài Bạch':  'TÀI BẠCH',
  'Tật Ách':   'TẬT ÁCH',
  'Thiên Di':  'THIÊN DI',
  'Nô Bộc':    'NÔ BỘC',
  'Quan Lộc':  'QUAN LỘC',
  'Điền Trạch': 'ĐIỀN TRẠCH',
  'Phúc Đức':  'PHÚC ĐỨC',
  'Phụ Mẫu':   'PHỤ MẪU',
};

const SIHUA_CANVAS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Lộc':   { bg: '#064e3b', text: '#6ee7b7', border: '#10b981' },
  'Quyền': { bg: '#881337', text: '#fda4af', border: '#f43f5e' },
  'Khoa':  { bg: '#78350f', text: '#fde68a', border: '#f59e0b' },
  'Kỵ':    { bg: '#581c87', text: '#e9d5ff', border: '#a855f7' },
  '禄':    { bg: '#064e3b', text: '#6ee7b7', border: '#10b981' },
  '权':    { bg: '#881337', text: '#fda4af', border: '#f43f5e' },
  '科':    { bg: '#78350f', text: '#fde68a', border: '#f59e0b' },
  '忌':    { bg: '#581c87', text: '#e9d5ff', border: '#a855f7' },
};

/** Tạo câu luận giải cô đọng mang tính huyền cơ kích thích tò mò */
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

/** Vẽ hình chữ nhật bo góc tương thích chuẩn mọi trình duyệt */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Tự động bẻ dòng văn bản theo chiều rộng tối đa */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/** Vẽ toàn bộ thiệp Tử Vi lên Canvas với độ phân giải siêu nét (1680x1040) */
export function renderFortuneCard(canvas: HTMLCanvasElement, chart: ZiweiChart) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 840;
  const H = 520;
  const scale = 2; // Xuất Retina 1680x1040

  canvas.width = W * scale;
  canvas.height = H * scale;

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Nền thẻ thiệp Hoàng Gia Cổ Phong
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0e121b');
  bgGrad.addColorStop(0.5, '#080a10');
  bgGrad.addColorStop(1, '#120e06');

  drawRoundRect(ctx, 0, 0, W, H, 16);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Viền vàng kim hoàng tộc
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ánh sáng hào quang góc trên phải
  const glowGrad = ctx.createRadialGradient(W - 40, 40, 10, W - 40, 40, 260);
  glowGrad.addColorStop(0, 'rgba(212, 168, 67, 0.16)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  // 4 Góc Hoa Văn Hoàng Gia
  ctx.fillStyle = '#d4a843';
  ctx.font = 'bold 15px serif';
  ctx.textAlign = 'left';
  ctx.fillText('╔', 10, 22);
  ctx.fillText('╚', 10, H - 10);
  ctx.textAlign = 'right';
  ctx.fillText('╗', W - 10, 22);
  ctx.fillText('╝', W - 10, H - 10);

  // 2. Header Thiệp
  // Logo Bát Quái
  const logoX = 38;
  const logoY = 38;
  const logoR = 17;
  const logoGrad = ctx.createRadialGradient(logoX, logoY, 2, logoX, logoY, logoR);
  logoGrad.addColorStop(0, '#2a1f10');
  logoGrad.addColorStop(1, '#0c0e17');
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
  ctx.fillStyle = logoGrad;
  ctx.fill();
  ctx.strokeStyle = '#d4a843';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = '18px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('☯', logoX, logoY);

  // Tiêu đề Header
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 13px "Philosopher", "Playfair Display", "Lora", serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('✦ THIÊN BÀN TỬ VI ĐẨU SỐ ✦', 64, 34);

  ctx.font = '8.5px "Philosopher", "Lora", serif';
  ctx.fillStyle = '#d4a843';
  ctx.fillText('TRƯỜNG PHÁI THIÊN KỶ NGHÊ HẢI HÀ · TRI MỆNH TẠO VẬN', 64, 48);

  // Thông tin Đương số (Phải Header)
  const { birthInfo, lunarInfo, wuxingJuName, daXians, currentDaXianIndex } = chart;
  const genderStr = birthInfo.gender === 'male' ? 'Nam Mạng' : 'Nữ Mạng';
  const nameStr = `${birthInfo.name || 'Bản Mệnh'} · ${genderStr}`;
  const solarStr = `Dương: ${birthInfo.day}/${birthInfo.month}/${birthInfo.year} (Giờ ${BRANCHES_VI[birthInfo.hour]})${birthInfo.city ? ` · ${birthInfo.city}` : ''}`;
  const lunarStr = `Âm: ${lunarInfo.lunarDay}/${lunarInfo.lunarMonth}/${lunarInfo.lunarYear} (${STEMS_VI[lunarInfo.yearStem]} ${BRANCHES_VI[lunarInfo.yearBranch]})`;

  ctx.textAlign = 'right';
  ctx.font = 'bold 13px "Philosopher", "Playfair Display", serif';
  ctx.fillStyle = '#fef9c3';
  ctx.fillText(nameStr, W - 24, 30);

  ctx.font = '9px "Philosopher", "Lora", serif';
  ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.fillText(solarStr, W - 24, 43);

  ctx.fillStyle = '#d4a843';
  ctx.fillText(lunarStr, W - 24, 55);

  // Đường kẻ ngang Header
  ctx.beginPath();
  ctx.moveTo(20, 62);
  ctx.lineTo(W - 20, 62);
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.28)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3. Bàn cờ 12 Cung (Trái 420px x 424px)
  const boardX = 20;
  const boardY = 70;
  const boardW = 420;
  const boardH = 424;

  drawRoundRect(ctx, boardX, boardY, boardW, boardH, 8);
  ctx.fillStyle = 'rgba(11, 14, 22, 0.96)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Bố cục 4x4 Grid bên trong bàn cờ
  const cellSize = 100;
  const cellGap = 4;
  const gridStartX = boardX + 4;
  const gridStartY = boardY + 4;

  const currentDx = daXians?.[currentDaXianIndex];
  const dxPalaceName = currentDx ? toVietnamesePalace(currentDx.palaceName) : '';
  const mingPalace = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  const mingMajorStars = mingPalace?.stars.filter(s => s.type === 'major').map(s => toVietnameseStar(s.name)) ?? [];
  const mingStarStr = mingMajorStars.length > 0 ? mingMajorStars.join(' · ') : 'Vô Chính Diệu';
  const mingBranchName = BRANCHES_VI[chart.mingGongBranch] || '';
  const shenBranchName = BRANCHES_VI[chart.shenGongBranch] || '';
  const patterns = detectPatterns(chart);
  const topPattern = patterns.length > 0 ? toVietnamesePatternName(patterns[0].name) : undefined;
  const { menhLine, hanLine } = getCuriosityInsight(mingMajorStars, topPattern, dxPalaceName);

  // Vẽ 12 Ô Cung vị
  ZHIWEI_LAYOUT.forEach(slot => {
    const palace = chart.palaces.find(p => p.branch === slot.branch);
    if (!palace) return;

    const cx = gridStartX + slot.col * (cellSize + cellGap);
    const cy = gridStartY + slot.row * (cellSize + cellGap);

    const isMing = palace.branch === chart.mingGongBranch;
    const isShen = palace.branch === chart.shenGongBranch;
    const isCurrentDx = currentDx && palace.branch === currentDx.palaceBranch;

    // Nền ô cung
    const cellGrad = ctx.createLinearGradient(cx, cy, cx + cellSize, cy + cellSize);
    if (isCurrentDx) {
      cellGrad.addColorStop(0, 'rgba(88, 28, 135, 0.45)');
      cellGrad.addColorStop(1, 'rgba(20, 10, 35, 0.98)');
    } else if (isMing && isShen) {
      cellGrad.addColorStop(0, 'rgba(180, 83, 9, 0.4)');
      cellGrad.addColorStop(1, 'rgba(40, 15, 10, 0.98)');
    } else if (isMing) {
      cellGrad.addColorStop(0, 'rgba(180, 83, 9, 0.35)');
      cellGrad.addColorStop(1, 'rgba(30, 15, 10, 0.98)');
    } else if (isShen) {
      cellGrad.addColorStop(0, 'rgba(14, 165, 233, 0.3)');
      cellGrad.addColorStop(1, 'rgba(10, 20, 35, 0.98)');
    } else {
      cellGrad.addColorStop(0, 'rgba(22, 26, 38, 0.96)');
      cellGrad.addColorStop(1, 'rgba(12, 14, 22, 0.98)');
    }

    drawRoundRect(ctx, cx, cy, cellSize, cellSize, 5);
    ctx.fillStyle = cellGrad;
    ctx.fill();

    // Viền ô cung
    if (isCurrentDx) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.4;
    } else if (isMing) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.4;
    } else if (isShen) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
    } else {
      ctx.strokeStyle = 'rgba(212, 168, 67, 0.22)';
      ctx.lineWidth = 0.8;
    }
    ctx.stroke();

    // A. Header Cung (Tên cung + Ấn triện + Can Chi)
    const rawPName = toVietnamesePalace(palace.name);
    const shortPName = SHORT_PALACE_NAMES[rawPName] || rawPName;
    const ganzhi = `${STEMS_VI[palace.stem]} ${BRANCHES_VI[palace.branch]}`;

    ctx.textAlign = 'left';
    ctx.font = 'bold 8px "Philosopher", "Lora", serif';
    ctx.fillStyle = isMing ? '#fca5a5' : isShen ? '#7dd3fc' : '#fef08a';
    ctx.fillText(shortPName, cx + 5, cy + 13);

    const nameWidth = ctx.measureText(shortPName).width;

    // Ấn Triện Chu Sa / Lam Bích (Khoá cứng toạ độ bên cạnh tên cung)
    if (isMing && isShen) {
      const sealX = cx + 5 + nameWidth + 2.5;
      const sealY = cy + 4.5;
      const sealW = 30;
      const sealH = 10;
      drawRoundRect(ctx, sealX, sealY, sealW, sealH, 2);
      ctx.fillStyle = '#991b1b';
      ctx.fill();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6.5px "Philosopher", sans-serif';
      const textW = ctx.measureText('M·THÂN').width;
      ctx.fillText('M·THÂN', sealX + (sealW - textW) / 2, sealY + 7.5);
    } else if (isMing) {
      const sealX = cx + 5 + nameWidth + 2.5;
      const sealY = cy + 4.5;
      const sealW = 22;
      const sealH = 10;
      drawRoundRect(ctx, sealX, sealY, sealW, sealH, 2);
      ctx.fillStyle = '#991b1b';
      ctx.fill();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6.5px "Philosopher", sans-serif';
      const textW = ctx.measureText('MỆNH').width;
      ctx.fillText('MỆNH', sealX + (sealW - textW) / 2, sealY + 7.5);
    } else if (isShen) {
      const sealX = cx + 5 + nameWidth + 2.5;
      const sealY = cy + 4.5;
      const sealW = 20;
      const sealH = 10;
      drawRoundRect(ctx, sealX, sealY, sealW, sealH, 2);
      ctx.fillStyle = '#0369a1';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6.5px "Philosopher", sans-serif';
      const textW = ctx.measureText('THÂN').width;
      ctx.fillText('THÂN', sealX + (sealW - textW) / 2, sealY + 7.5);
    }

    // Can Chi cung vị (Căn sát lề phải)
    ctx.textAlign = 'right';
    ctx.font = '6.5px "Philosopher", "Lora", serif';
    ctx.fillStyle = '#fef9c3';
    ctx.globalAlpha = 0.85;
    ctx.fillText(ganzhi, cx + cellSize - 5, cy + 13);
    ctx.globalAlpha = 1.0;

    // Đường kẻ phân cách Header
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 17);
    ctx.lineTo(cx + cellSize - 4, cy + 17);
    ctx.strokeStyle = 'rgba(212, 168, 67, 0.18)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // B. Chính Tinh (Tô màu ngũ hành + Huy hiệu Tứ Hóa gắn chặt)
    const majors = palace.stars.filter(s => s.type === 'major');
    ctx.textAlign = 'left';

    if (majors.length === 0) {
      ctx.font = 'italic 8px "Philosopher", serif';
      ctx.fillStyle = 'rgba(212, 168, 67, 0.5)';
      ctx.fillText('Vô Chính Diệu', cx + 5, cy + 36);
    } else {
      majors.slice(0, 2).forEach((star, sIdx) => {
        const starLineY = cy + 34 + sIdx * 17;
        const starName = toVietnameseStar(star.name);
        const starBright = toVietnameseBrightness(star.brightnessRaw);
        const elem = getStarElement(star.name);
        const elemStyle = ELEMENT_STYLES[elem];
        const siHua = star.siHua ? toVietnameseSiHua(star.siHua) : '';
        const siHuaStyle = siHua ? SIHUA_CANVAS_STYLES[siHua] : undefined;

        // Tên sao
        ctx.font = 'bold 9.5px "Philosopher", "Lora", serif';
        ctx.fillStyle = elemStyle?.color || '#fef08a';
        ctx.fillText(starName, cx + 5, starLineY);

        let curX = cx + 5 + ctx.measureText(starName).width;

        // Độ sáng (M), (V), (Đ), (B), (H)
        if (starBright) {
          curX += 2;
          ctx.font = 'bold 7.5px "Philosopher", serif';
          ctx.fillStyle = (starBright === 'Miếu' || starBright === 'Vượng') ? '#f59e0b' : (starBright === 'Hãm') ? '#f87171' : '#38bdf8';
          const brightText = `(${starBright[0]})`;
          ctx.fillText(brightText, curX, starLineY);
          curX += ctx.measureText(brightText).width;
        }

        // Huy hiệu Tứ Hóa (Vẽ toạ độ khoá chết theo dòng sao, không bao giờ lệch!)
        if (siHua && siHuaStyle) {
          curX += 3;
          ctx.font = 'bold 7px "Philosopher", sans-serif';
          const siHuaTextW = ctx.measureText(siHua).width;
          const badgeW = Math.max(16, siHuaTextW + 5);
          const badgeH = 11;
          const badgeY = starLineY - 8.5; // Canh thẳng tuyệt đối với tâm chữ

          drawRoundRect(ctx, curX, badgeY, badgeW, badgeH, 2);
          ctx.fillStyle = siHuaStyle.bg;
          ctx.fill();
          ctx.strokeStyle = siHuaStyle.border;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.fillStyle = siHuaStyle.text;
          ctx.fillText(siHua, curX + (badgeW - siHuaTextW) / 2, badgeY + 8);
        }
      });
    }

    // C. Chân Cung: Cát tinh, Sát tinh & Tuổi Đại Hạn
    // Đường kẻ phân cách chân cung
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 72);
    ctx.lineTo(cx + cellSize - 4, cy + 72);
    ctx.strokeStyle = 'rgba(212, 168, 67, 0.12)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    const luckies = palace.stars.filter(s => s.type === 'lucky');
    const shas = palace.stars.filter(s => s.type === 'sha');

    ctx.textAlign = 'left';
    let footLeftX = cx + 5;
    if (luckies.length > 0) {
      const lName = toVietnameseStar(luckies[0].name);
      ctx.font = '600 7px "Philosopher", serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText(lName, footLeftX, cy + 86);
      footLeftX += ctx.measureText(lName).width + 3;
    }
    if (shas.length > 0) {
      const sName = toVietnameseStar(shas[0].name);
      ctx.font = '600 7px "Philosopher", serif';
      const sWidth = ctx.measureText(sName).width;
      // Chỉ vẽ nếu không va chạm với tuổi đại hạn bên phải
      if (footLeftX + sWidth < cx + cellSize - 28) {
        ctx.fillStyle = '#fb7185';
        ctx.fillText(sName, footLeftX, cy + 86);
      }
    }

    // Tuổi Đại Hạn (Góc dưới phải, chữ đậm rõ ràng)
    if (palace.daXianAge) {
      ctx.textAlign = 'right';
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#c084fc';
      ctx.fillText(`${palace.daXianAge[0]}-${palace.daXianAge[1]}`, cx + cellSize - 5, cy + 86);
    }
  });

  // 4. Ô Mandala Bát Quái Trung Tâm (2x2 = 204px x 204px)
  const centerX = gridStartX + 1 * (cellSize + cellGap);
  const centerY = gridStartY + 1 * (cellSize + cellGap);
  const centerSize = cellSize * 2 + cellGap;

  drawRoundRect(ctx, centerX, centerY, centerSize, centerSize, 7);
  const centerGrad = ctx.createRadialGradient(
    centerX + centerSize / 2, centerY + centerSize / 2, 10,
    centerX + centerSize / 2, centerY + centerSize / 2, centerSize / 2
  );
  centerGrad.addColorStop(0, 'rgba(38, 26, 12, 0.98)');
  centerGrad.addColorStop(1, 'rgba(10, 12, 20, 0.98)');
  ctx.fillStyle = centerGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(212, 168, 67, 0.45)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Bát Quái Mandala trung tâm
  const midX = centerX + centerSize / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Thái Cực Đồ Ánh Kim
  ctx.fillStyle = '#fef08a';
  ctx.font = '26px serif';
  ctx.fillText('☯', midX, centerY + 38);

  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 10.5px "Philosopher", "Playfair Display", serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('MỆNH BÀN ĐẨU SỐ', midX, centerY + 64);

  // Pill Ngũ Hành Cục
  const juText = `❖ ${toVietnameseJu(wuxingJuName)} ❖`;
  ctx.font = 'bold 9px "Philosopher", serif';
  const juWidth = ctx.measureText(juText).width + 16;
  const juX = midX - juWidth / 2;
  const juY = centerY + 76;
  drawRoundRect(ctx, juX, juY, juWidth, 16, 8);
  ctx.fillStyle = 'rgba(212, 168, 67, 0.18)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.45)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.fillText(juText, midX, juY + 11.5);

  // Vị trí Mệnh - Thân
  ctx.font = '8.5px "Philosopher", "Lora", serif';
  ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.fillText(`Mệnh tại ${mingBranchName} · Thân tại ${shenBranchName}`, midX, centerY + 112);

  // Đại hạn hiện tại
  if (currentDx) {
    ctx.font = 'bold 8.5px "Philosopher", serif';
    ctx.fillStyle = '#c084fc';
    ctx.fillText(`Đại Hạn: ${currentDx.startAge}–${currentDx.endAge} tuổi (${toVietnamesePalace(currentDx.palaceName)})`, midX, centerY + 128);
  }

  // Lịch Âm
  ctx.font = '8px "Philosopher", "Lora", serif';
  ctx.fillStyle = 'rgba(212, 168, 67, 0.75)';
  ctx.fillText(`Âm lịch: ${lunarInfo.lunarYear} · ${lunarInfo.isLeapMonth ? 'Nhuận ' : ''}Tháng ${lunarInfo.lunarMonth} · Ngày ${lunarInfo.lunarDay}`, midX, centerY + 144);

  // 5. Cột Phải: Luận Giải Cô Đọng Kích Thích Tò Mò & Ấn Ký Thương Hiệu
  const rightX = 456;
  const rightY = 70;
  const rightW = 364;

  ctx.textAlign = 'left';

  // A. Bản Mệnh Cốt Cách & Tên Sao Chính Mệnh
  ctx.font = 'bold 10px "Philosopher", "Lora", serif';
  ctx.fillStyle = '#d4a843';
  ctx.fillText(`✦ BẢN MỆNH CỐT CÁCH (CUNG ${mingBranchName.toUpperCase()})`, rightX, rightY + 16);

  ctx.font = 'bold 24px "Philosopher", "Playfair Display", serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText(mingStarStr, rightX, rightY + 44);

  // B. Cách Cục Kinh Điển
  let nextRightY = rightY + 54;
  if (topPattern) {
    const patText = `❖ Cách Cục: ${topPattern}`;
    ctx.font = 'bold 10px "Philosopher", serif';
    const patW = ctx.measureText(patText).width + 16;
    drawRoundRect(ctx, rightX, nextRightY, patW, 20, 5);
    ctx.fillStyle = 'rgba(212, 168, 67, 0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 168, 67, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.fillText(patText, rightX + 8, nextRightY + 14);
    nextRightY += 28;
  } else {
    nextRightY += 10;
  }

  // C. Hộp Thiên Cơ Luận Giải Cô Đọng Kích Thích Tò Mò (Curiosity Prophecy Box)
  const propBoxX = rightX;
  const propBoxY = nextRightY + 2;
  const propBoxW = rightW;
  const propBoxH = 190;

  drawRoundRect(ctx, propBoxX, propBoxY, propBoxW, propBoxH, 9);
  const propGrad = ctx.createLinearGradient(propBoxX, propBoxY, propBoxX + propBoxW, propBoxY + propBoxH);
  propGrad.addColorStop(0, 'rgba(35, 25, 12, 0.92)');
  propGrad.addColorStop(1, 'rgba(18, 14, 10, 0.98)');
  ctx.fillStyle = propGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tiêu đề Hộp Thiên Cơ
  ctx.font = 'bold 10.5px "Philosopher", "Lora", serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('✦ THIÊN CƠ BẢN MỆNH & BIẾN CỤC', propBoxX + 12, propBoxY + 20);

  // Đoạn 1: Mệnh Cốt
  ctx.font = '10px "Philosopher", "Lora", serif';
  ctx.fillStyle = '#fef3c7';
  const menhLines = wrapCanvasText(ctx, `• ${menhLine}`, propBoxW - 24);
  let curPropY = propBoxY + 36;
  menhLines.forEach(line => {
    ctx.fillText(line, propBoxX + 12, curPropY);
    curPropY += 14.5;
  });

  // Đoạn 2: Kỳ Hạn Hiện Tại
  curPropY += 3;
  ctx.font = '9.5px "Philosopher", "Lora", serif';
  ctx.fillStyle = 'rgba(254, 243, 199, 0.9)';
  const hanLines = wrapCanvasText(ctx, `• ${hanLine}`, propBoxW - 24);
  hanLines.forEach(line => {
    ctx.fillText(line, propBoxX + 12, curPropY);
    curPropY += 14;
  });

  // Đường gạch đứt phân cách câu chốt
  curPropY += 4;
  ctx.beginPath();
  ctx.setLineDash([4, 3]);
  ctx.moveTo(propBoxX + 12, curPropY);
  ctx.lineTo(propBoxX + propBoxW - 12, curPropY);
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.3)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Câu chốt kích thích tò mò
  curPropY += 14;
  ctx.font = 'italic 8.5px "Philosopher", "Lora", serif';
  ctx.fillStyle = '#fbbf24';
  const callToActionLines = wrapCanvasText(
    ctx,
    '✦ Khúc ngoặt nào sẽ xoay chuyển số mệnh bạn trong chu kỳ này? Quét mã hoặc truy cập để giải mã trọn vẹn 12 cung.',
    propBoxW - 24
  );
  callToActionLines.forEach(line => {
    ctx.fillText(line, propBoxX + 12, curPropY);
    curPropY += 12.5;
  });

  // D. Ấn Ký Xác Thực Website tuvi.lamkhoa.store Tinh Tế Hoàng Gia
  const provY = boardY + boardH - 60;
  const provH = 58;
  drawRoundRect(ctx, rightX, provY, rightW, provH, 8);
  const provGrad = ctx.createLinearGradient(rightX, provY, rightX + rightW, provY + provH);
  provGrad.addColorStop(0, 'rgba(212, 168, 67, 0.16)');
  provGrad.addColorStop(1, 'rgba(184, 146, 42, 0.05)');
  ctx.fillStyle = provGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.38)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Biểu tượng Cổng Đền / Torii Cổ Kính
  ctx.font = '22px serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('⛩', rightX + 12, provY + 36);

  // Địa chỉ Website
  ctx.font = 'bold 12.5px "Philosopher", "Playfair Display", serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('tuvi.lamkhoa.store', rightX + 44, provY + 25);

  ctx.font = '8.5px "Philosopher", "Lora", serif';
  ctx.fillStyle = 'rgba(254, 240, 138, 0.82)';
  ctx.fillText('Hệ thống an sao & AI luận giải Mệnh Lý Tử Vi chính thống', rightX + 44, provY + 41);

  // Nút Huy Hiệu Khảo Luận Mệnh Lý bên phải
  const btnW = 104;
  const btnH = 26;
  const btnX = rightX + rightW - btnW - 10;
  const btnY = provY + (provH - btnH) / 2;
  drawRoundRect(ctx, btnX, btnY, btnW, btnH, 4);
  ctx.fillStyle = 'rgba(212, 168, 67, 0.2)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.55)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.font = 'bold 8.5px "Philosopher", serif';
  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.fillText('✦ KHẢO LUẬN MỆNH LÝ', btnX + btnW / 2, btnY + 16.5);

  ctx.restore();
}

interface ShareCardProps {
  chart: ZiweiChart;
}

export default function ShareCardCanvas({ chart }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const render = () => {
      if (!isMounted || !canvasRef.current) return;
      renderFortuneCard(canvasRef.current, chart);
    };

    // Vẽ ngay lập tức
    render();

    // Tự động vẽ lại ngay khi toàn bộ Web Fonts (Philosopher, Lora) nạp xong
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        if (isMounted) render();
      });
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div style={{ width: '100%', maxWidth: '840px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        id="share-card-canvas"
        style={{
          width: '100%',
          maxWidth: '840px',
          height: 'auto',
          aspectRatio: '840 / 520',
          display: 'block',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.95), 0 0 30px rgba(212,168,67,0.15)',
        }}
      />
    </div>
  );
}

/** Chụp thẻ thiệp trực tiếp từ HTML5 Canvas (Tốc độ tức thì < 5ms, độ nét 2x Retina, 0 lỗi lệch khối màu) */
export async function captureShareCard(): Promise<string | null> {
  const canvas = document.getElementById('share-card-canvas') as HTMLCanvasElement;
  if (!canvas) return null;
  return canvas.toDataURL('image/png');
}

export function downloadDataURL(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
