/**
 * Bản địa hóa và Từ điển Tử Vi Đẩu Số chuẩn Mệnh lý Việt Nam
 * Cung cấp hệ thống đối soát thuật ngữ Hán - Việt chuẩn xác,
 * bảo đảm tương thích cả tầng hiển thị lẫn dữ liệu giải đoán.
 */

// ─── Can (Thập Thiên Can) ──────────────────────────────────
export const STEMS_VI = [
  'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu',
  'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'
];

export const STEM_CN_TO_VI: Record<string, string> = {
  '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu',
  '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý',
};

// ─── Chi (Thập Nhị Địa Chi) ────────────────────────────────
export const BRANCHES_VI = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'
];

export const BRANCH_CN_TO_VI: Record<string, string> = {
  '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ',
  '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi',
};

// ─── 12 Cung (Thập Nhị Cung) ───────────────────────────────
export const PALACE_NAMES_ORDER_VI = [
  'Mệnh Cung', 'Huynh Đệ', 'Phu Thê', 'Tử Tức', 'Tài Bạch', 'Tật Ách',
  'Thiên Di', 'Nô Bộc', 'Quan Lộc', 'Điền Trạch', 'Phúc Đức', 'Phụ Mẫu'
];

export const PALACE_CN_TO_VI: Record<string, string> = {
  '命宫': 'Mệnh Cung',
  '命': 'Mệnh',
  '兄弟': 'Huynh Đệ',
  '兄弟宫': 'Huynh Đệ',
  '夫妻': 'Phu Thê',
  '夫妻宫': 'Phu Thê',
  '子女': 'Tử Tức',
  '子女宫': 'Tử Tức',
  '财帛': 'Tài Bạch',
  '财帛宫': 'Tài Bạch',
  '疾厄': 'Tật Ách',
  '疾厄宫': 'Tật Ách',
  '迁移': 'Thiên Di',
  '迁移宫': 'Thiên Di',
  '交友': 'Nô Bộc',
  '交友宫': 'Nô Bộc',
  '仆役': 'Nô Bộc',
  '仆役宫': 'Nô Bộc',
  '官禄': 'Quan Lộc',
  '官禄宫': 'Quan Lộc',
  '田宅': 'Điền Trạch',
  '田宅宫': 'Điền Trạch',
  '福德': 'Phúc Đức',
  '福德宫': 'Phúc Đức',
  '父母': 'Phụ Mẫu',
  '父母宫': 'Phụ Mẫu',
  '身宫': 'Thân Cung',
  '身': 'Thân',
};

// ─── 14 Chính Tinh ─────────────────────────────────────────
export const MAJOR_STARS_CN_TO_VI: Record<string, string> = {
  '紫微': 'Tử Vi',
  '天机': 'Thiên Cơ',
  '太阳': 'Thái Dương',
  '武曲': 'Vũ Khúc',
  '天同': 'Thiên Đồng',
  '廉贞': 'Liêm Trinh',
  '天府': 'Thiên Phủ',
  '太阴': 'Thái Âm',
  '贪狼': 'Tham Lang',
  '巨门': 'Cự Môn',
  '天相': 'Thiên Tướng',
  '天梁': 'Thiên Lương',
  '七杀': 'Thất Sát',
  '破军': 'Phá Quân',
};

// ─── Cát tinh, Sát tinh & Phụ diệu ────────────────────────
export const OTHER_STARS_CN_TO_VI: Record<string, string> = {
  // Lục cát tinh & Lục sát tinh
  '文昌': 'Văn Xương',
  '文曲': 'Văn Khúc',
  '左辅': 'Tả Phù',
  '右弼': 'Hữu Bật',
  '天魁': 'Thiên Khôi',
  '天钺': 'Thiên Việt',
  '禄存': 'Lộc Tồn',
  '天马': 'Thiên Mã',
  '擎羊': 'Kình Dương',
  '陀罗': 'Đà La',
  '火星': 'Hỏa Tinh',
  '铃星': 'Linh Tinh',
  '地空': 'Địa Không',
  '地劫': 'Địa Kiếp',

  // Đào hoa & Hỷ khánh
  '红鸾': 'Hồng Loan',
  '天喜': 'Thiên Hỷ',
  '天姚': 'Thiên Diêu',
  '咸池': 'Hàm Trì',
  '沐浴': 'Mộc Dục',

  // Hình sát & Khắc kỵ
  '孤辰': 'Cô Thần',
  '寡宿': 'Quả Tú',
  '天哭': 'Thiên Khốc',
  '天虚': 'Thiên Hư',
  '天刑': 'Thiên Hình',
  '天巫': 'Thiên Vu',
  '天月': 'Thiên Nguyệt',
  '阴煞': 'Âm Sát',
  '截空': 'Triệt Không',
  '旬空': 'Tuần Không',
  '大耗': 'Đại Hao',
  '小耗': 'Tiểu Hao',
  '破碎': 'Phá Toái',
  '蜚廉': 'Phi Liêm',

  // Quý tinh & Tạp diệu
  '三台': 'Tam Thai',
  '八座': 'Bát Tọa',
  '恩光': 'Ân Quang',
  '天贵': 'Thiên Quý',
  '龙池': 'Long Trì',
  '凤阁': 'Phượng Các',
  '台辅': 'Đài Phụ',
  '封诰': 'Phong Cáo',
  '天官': 'Thiên Quan',
  '天福': 'Thiên Phúc',
  '解神': 'Giải Thần',
  '天德': 'Thiên Đức',
  '月德': 'Nguyệt Đức',
  '天才': 'Thiên Tài',
  '天寿': 'Thiên Thọ',
  '华盖': 'Hoa Cái',
};

// ─── Tứ Hóa ────────────────────────────────────────────────
export const SIHUA_CN_TO_VI: Record<string, string> = {
  '禄': 'Lộc',
  '权': 'Quyền',
  '科': 'Khoa',
  '忌': 'Kỵ',
  '化禄': 'Hóa Lộc',
  '化权': 'Hóa Quyền',
  '化科': 'Hóa Khoa',
  '化忌': 'Hóa Kỵ',
};

// ─── Độ sáng tinh diệu (Miếu, Vượng, Đắc, Lợi, Bình, Bất, Hãm) ─
export const BRIGHTNESS_CN_TO_VI: Record<string, string> = {
  '庙': 'Miếu',
  '旺': 'Vượng',
  '得': 'Đắc',
  '利': 'Lợi',
  '平': 'Bình',
  '不': 'Bất',
  '闲': 'Nhàn',
  '陷': 'Hãm',
  '地': 'Địa',
};

// ─── Cục số Ngũ Hành ───────────────────────────────────────
export const JU_NAMES_VI: Record<number | string, string> = {
  2: 'Thủy Nhị Cục',
  3: 'Mộc Tam Cục',
  4: 'Kim Tứ Cục',
  5: 'Thổ Ngũ Cục',
  6: 'Hỏa Lục Cục',
  '水二局': 'Thủy Nhị Cục',
  '木三局': 'Mộc Tam Cục',
  '金四局': 'Kim Tứ Cục',
  '土五局': 'Thổ Ngũ Cục',
  '火六局': 'Hỏa Lục Cục',
};

// ─── Giờ Sinh (12 Thời thần) ───────────────────────────────
export const SHICHEN_VI = [
  { branch: 0, name: 'Giờ Tý', range: '23:00 - 01:00' },
  { branch: 1, name: 'Giờ Sửu', range: '01:00 - 03:00' },
  { branch: 2, name: 'Giờ Dần', range: '03:00 - 05:00' },
  { branch: 3, name: 'Giờ Mão', range: '05:00 - 07:00' },
  { branch: 4, name: 'Giờ Thìn', range: '07:00 - 09:00' },
  { branch: 5, name: 'Giờ Tỵ', range: '09:00 - 11:00' },
  { branch: 6, name: 'Giờ Ngọ', range: '11:00 - 13:00' },
  { branch: 7, name: 'Giờ Mùi', range: '13:00 - 15:00' },
  { branch: 8, name: 'Giờ Thân', range: '15:00 - 17:00' },
  { branch: 9, name: 'Giờ Dậu', range: '17:00 - 19:00' },
  { branch: 10, name: 'Giờ Tuất', range: '19:00 - 21:00' },
  { branch: 11, name: 'Giờ Hợi', range: '21:00 - 23:00' },
];

// ─── Ngũ Hành Tinh Diệu (Kim, Mộc, Thủy, Hỏa, Thổ) ────────
export type WuXingElement = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

export const STAR_ELEMENT_MAP: Record<string, WuXingElement> = {
  // 14 Chính Tinh
  '紫微': 'tho',  // Tử Vi - Âm Thổ
  '天机': 'moc',  // Thiên Cơ - Âm Mộc
  '太阳': 'hoa',  // Thái Dương - Dương Hỏa
  '武曲': 'kim',  // Vũ Khúc - Âm Kim
  '天同': 'thuy', // Thiên Đồng - Dương Thủy
  '廉贞': 'hoa',  // Liêm Trinh - Âm Hỏa
  '天府': 'tho',  // Thiên Phủ - Dương Thổ
  '太阴': 'thuy', // Thái Âm - Âm Thủy
  '贪狼': 'moc',  // Tham Lang - Giáp Mộc / Nhâm Thủy
  '巨门': 'thuy', // Cự Môn - Âm Thủy
  '天相': 'thuy', // Thiên Tướng - Dương Thủy
  '天梁': 'tho',  // Thiên Lương - Dương Thổ
  '七杀': 'kim',  // Thất Sát - Dương Kim
  '破军': 'thuy', // Phá Quân - Âm Thủy

  // Lục cát tinh & Cát tinh
  '文昌': 'kim',  // Dương Kim
  '文曲': 'thuy', // Âm Thủy
  '左辅': 'tho',  // Dương Thổ
  '右弼': 'thuy', // Âm Thủy
  '天魁': 'hoa',  // Dương Hỏa
  '天钺': 'hoa',  // Âm Hỏa
  '禄存': 'tho',  // Kỷ Thổ
  '天马': 'hoa',  // Bính Hỏa

  // Lục sát tinh
  '擎羊': 'kim',  // Canh Kim
  '陀罗': 'kim',  // Tân Kim
  '火星': 'hoa',  // Dương Hỏa
  '铃星': 'hoa',  // Âm Hỏa
  '地空': 'hoa',  // Bính Hỏa
  '地劫': 'hoa',  // Bính Hỏa

  // Phụ tinh khác
  '红鸾': 'thuy',
  '天喜': 'thuy',
  '天刑': 'hoa',
  '天姚': 'thuy',
  '天哭': 'kim',
  '天虚': 'thuy',
  '龙池': 'thuy',
  '凤阁': 'tho',
  '孤辰': 'hoa',
  '寡宿': 'hoa',
  '大耗': 'hoa',
  '小耗': 'hoa',
  '截空': 'hoa',
  '旬空': 'hoa',
  '台辅': 'tho',
  '封诰': 'tho',
  '三台': 'thuy',
  '八座': 'thuy',
  '恩光': 'hoa',
  '天贵': 'tho',
  '天官': 'hoa',
  '天福': 'tho',
  '解神': 'thuy',
  '天德': 'hoa',
  '月德': 'hoa',
  '天才': 'tho',
  '天寿': 'tho',
  '华盖': 'kim',
  '咸池': 'thuy',
  '沐浴': 'thuy',
};

export interface ElementStyle {
  label: string;
  color: string;       // Text color
  colorDim: string;    // Dim text color
  bg: string;          // Badge bg
  border: string;      // Badge border
  glow: string;        // Glow drop-shadow
}

export const ELEMENT_STYLES: Record<WuXingElement, ElementStyle> = {
  kim: {
    label: 'Kim',
    color: '#F8FAFC',        // Trắng bạc ánh bạch kim
    colorDim: '#94A3B8',
    bg: 'rgba(248, 250, 252, 0.12)',
    border: 'rgba(248, 250, 252, 0.35)',
    glow: '0 0 8px rgba(248, 250, 252, 0.45)',
  },
  moc: {
    label: 'Mộc',
    color: '#34D399',        // Xanh ngọc lục bảo
    colorDim: '#059669',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(52, 211, 153, 0.35)',
    glow: '0 0 8px rgba(52, 211, 153, 0.45)',
  },
  thuy: {
    label: 'Thủy',
    color: '#38BDF8',        // Xanh lam biếc huyền thủy
    colorDim: '#0284C7',
    bg: 'rgba(14, 165, 233, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
    glow: '0 0 8px rgba(56, 189, 248, 0.45)',
  },
  hoa: {
    label: 'Hỏa',
    color: '#F87171',        // Đỏ son chu sa rực rỡ
    colorDim: '#DC2626',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(248, 113, 113, 0.35)',
    glow: '0 0 8px rgba(248, 113, 113, 0.45)',
  },
  tho: {
    label: 'Thổ',
    color: '#FBBF24',        // Hoàng kim hổ phách uy nghi
    colorDim: '#D97706',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(251, 191, 36, 0.35)',
    glow: '0 0 8px rgba(251, 191, 36, 0.45)',
  },
};

/** Bảng màu Ngũ Hành Cổ Thư (Dành riêng cho Light Mode: Đậm đà, sắc nét, tương phản cao) */
export const ELEMENT_STYLES_LIGHT: Record<WuXingElement, ElementStyle> = {
  kim: {
    label: 'Kim',
    color: '#1E293B',        // Mực tàu xám đen sắc sảo
    colorDim: '#475569',
    bg: 'rgba(30, 41, 59, 0.08)',
    border: 'rgba(30, 41, 59, 0.3)',
    glow: 'none',
  },
  moc: {
    label: 'Mộc',
    color: '#047857',        // Xanh ngọc lục bảo thẫm quý phái
    colorDim: '#065F46',
    bg: 'rgba(4, 120, 87, 0.08)',
    border: 'rgba(4, 120, 87, 0.3)',
    glow: 'none',
  },
  thuy: {
    label: 'Thủy',
    color: '#0369A1',        // Lam chàm đại dương thẫm
    colorDim: '#075985',
    bg: 'rgba(3, 105, 161, 0.08)',
    border: 'rgba(3, 105, 161, 0.3)',
    glow: 'none',
  },
  hoa: {
    label: 'Hỏa',
    color: '#B91C1C',        // Đỏ son chu sa thẫm uy nghi
    colorDim: '#991B1B',
    bg: 'rgba(185, 28, 28, 0.08)',
    border: 'rgba(185, 28, 28, 0.3)',
    glow: 'none',
  },
  tho: {
    label: 'Thổ',
    color: '#92400E',        // Nâu vàng đồng hổ phách thẫm
    colorDim: '#78350F',
    bg: 'rgba(146, 64, 14, 0.08)',
    border: 'rgba(146, 64, 14, 0.3)',
    glow: 'none',
  },
};

export function getElementStyle(elem: WuXingElement, isDark: boolean = true): ElementStyle {
  return isDark ? ELEMENT_STYLES[elem] : ELEMENT_STYLES_LIGHT[elem];
}

export function getStarElement(starName: string): WuXingElement {
  return STAR_ELEMENT_MAP[starName] ?? 'tho';
}

// ─── Tên Cách cục kinh điển ────────────────────────────────
export const PATTERN_NAMES_CN_TO_VI: Record<string, string> = {
  '君臣庆会': 'Quân Thần Khánh Hội',
  '紫府同宫': 'Tử Phủ Đồng Cung',
  '府相朝垣': 'Phủ Tướng Triều Viên',
  '阳梁昌禄': 'Dương Lương Xương Lộc',
  '火贪格': 'Hỏa Tham Cách',
  '铃贪格': 'Linh Tham Cách',
  '武贪同行': 'Vũ Tham Đồng Hành',
  '杀破狼': 'Sát Phá Tham',
  '机月同梁': 'Cơ Nguyệt Đồng Lương',
  '廉相印绶': 'Liêm Tướng Ấn Thụ',
  '武曲七杀': 'Vũ Khúc Thất Sát',
  '同梁同宫': 'Đồng Lương Đồng Cung',
  '日月同宫': 'Nhật Nguyệt Đồng Cung',
  '日月夹命': 'Nhật Nguyệt Giáp Mệnh',
  '巨日同宫': 'Cự Nhật Đồng Cung',
  '石中隐玉': 'Thạch Trung Ẩn Ngọc',
  '明珠出海': 'Minh Châu Xuất Hải',
  '紫微坐命': 'Tử Vi Tọa Mệnh',
  '辅弼夹命': 'Tả Hữu Giáp Mệnh',
  '昌曲夹命': 'Xương Khúc Giáp Mệnh',
  '魁钺夹命': 'Khôi Việt Giáp Mệnh',
  '双禄朝垣': 'Song Lộc Triều Viên',
  '三奇嘉会': 'Tam Kỳ Gia Hội',
  '化禄入命': 'Hóa Lộc Nhập Mệnh',
  '化忌冲命': 'Hóa Kỵ Xung Mệnh',
  '羊陀夹忌': 'Kình Đà Hiệp Kỵ',
  '火铃夹命': 'Hỏa Linh Giáp Mệnh',
  '空劫夹命': 'Không Kiếp Giáp Mệnh',
  '廉杀羊': 'Liêm Sát Kình (Hình Ngục)',
  '巨火羊': 'Cự Hỏa Kình (Ách Nạn Khẩu Thiệt)',
  '铃昌陀武': 'Linh Xương Đà Vũ (Hạn Trầm Nịch)',
  '马头带剑': 'Mã Đầu Đới Kiếm',
  '禄存守身': 'Lộc Tồn Thủ Thân',
  '天马入命': 'Thiên Mã Nhập Mệnh',
  '化禄入财': 'Hóa Lộc Nhập Tài',
  '化权入官': 'Hóa Quyền Nhập Quan',
  '化科入命身': 'Hóa Khoa Nhập Mệnh Thân',
  '机月同梁偏格': 'Cơ Nguyệt Đồng Lương (Thứ cách)',
  '昌曲同会': 'Xương Khúc Đồng Hội',
  '辅弼同会': 'Tả Hữu Đồng Hội',
  '魁钺同会': 'Khôi Việt Đồng Hội',
  '科权双会': 'Khoa Quyền Song Hội',
};

// ─── Các hàm Helper chuyển ngữ an toàn ─────────────────────

export function toVietnamesePalace(name: string): string {
  if (!name) return '';
  return PALACE_CN_TO_VI[name] ?? name;
}

export function toVietnameseStar(name: string): string {
  if (!name) return '';
  return MAJOR_STARS_CN_TO_VI[name] ?? OTHER_STARS_CN_TO_VI[name] ?? name;
}

export function toVietnameseSiHua(siHua?: string): string {
  if (!siHua) return '';
  return SIHUA_CN_TO_VI[siHua] ?? siHua;
}

export function toVietnameseBrightness(raw?: string): string {
  if (!raw) return '';
  return BRIGHTNESS_CN_TO_VI[raw] ?? raw;
}

export function toVietnameseStem(stem: number | string): string {
  if (typeof stem === 'number') {
    return STEMS_VI[((stem % 10) + 10) % 10] ?? String(stem);
  }
  return STEM_CN_TO_VI[stem] ?? stem;
}

export function toVietnameseBranch(branch: number | string): string {
  if (typeof branch === 'number') {
    return BRANCHES_VI[((branch % 12) + 12) % 12] ?? String(branch);
  }
  return BRANCH_CN_TO_VI[branch] ?? branch;
}

export function toVietnameseGanzhi(ganzhi: string): string {
  if (!ganzhi || ganzhi.length < 2) return ganzhi;
  const s = STEM_CN_TO_VI[ganzhi[0]] ?? ganzhi[0];
  const b = BRANCH_CN_TO_VI[ganzhi[1]] ?? ganzhi[1];
  return `${s} ${b}`;
}

export function toVietnameseJu(ju: string | number): string {
  if (!ju) return '';
  return JU_NAMES_VI[ju] ?? String(ju);
}

export function toVietnamesePatternName(name: string): string {
  return PATTERN_NAMES_CN_TO_VI[name] ?? name;
}
