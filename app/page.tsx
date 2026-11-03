'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import StarField from '@/components/StarField';
import { useTheme, type Theme } from '@/components/ThemeProvider';
import AnnouncementModal from '@/components/AnnouncementModal';

// ─── Hiệu ứng FadeIn khi cuộn trang ───────────────────────
function FadeIn({
  children, delay = 0, y = 28, className = '',
}: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WeakBoundary({ line }: { line: string }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
      style={{ background: `linear-gradient(to bottom, ${line}, transparent)`, opacity: 0.45 }} />
  );
}

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

// ─── Danh sách 14 Chính Tinh ──────────────────────────────
const STARS = [
  { name: 'Tử Vi' }, { name: 'Thiên Cơ' }, { name: 'Thái Dương' }, { name: 'Vũ Khúc' },
  { name: 'Thiên Đồng' }, { name: 'Liêm Trinh' }, { name: 'Thiên Phủ' }, { name: 'Thái Âm' },
  { name: 'Tham Lang' }, { name: 'Cự Môn' }, { name: 'Thiên Tướng' }, { name: 'Thiên Lương' },
  { name: 'Thất Sát' }, { name: 'Phá Quân' },
];

// ─── Các tính năng nổi bật ────────────────────────────────
const FEATURES = [
  {
    tag: 'Hệ Thống An Sao',
    title: 'Tử Vi Đẩu Số\nChính Tông Nghê Hải Hà',
    subtitle: 'Không giản lược, tuân thủ nghiêm ngặt nguyên lý Thiên Kỷ',
    points: [
      'Khởi Cục bằng Nạp Âm Ngũ Hành bản nguyên, không dùng thuật toán giản lược',
      'An Mệnh nghịch đếm giờ sinh, an Thân thuận đếm giờ sinh theo đúng chuẩn cổ pháp',
      'Hệ thống 14 chính tinh và Tứ Hóa an theo luật định nguyên bản, minh bạch và nhất quán',
    ],
  },
  {
    tag: 'Trình Bày Lá Số',
    title: 'Trọn Vẹn 14 Chính Tinh\nVà Tứ Hóa',
    subtitle: 'Bố cục rõ ràng, nhận diện ngay trục Mệnh Thân và các thế sao trọng yếu',
    points: [
      '14 chính tinh phân bổ khoa học, tương quan tam phương tứ chính trực quan',
      'Phụ tinh và Sát tinh hiển thị đồng bộ, không bỏ sót các chỉ báo cát hung trọng điểm',
      'Độ sáng Miếu - Vượng - Đắc - Lợi - Bình - Bất - Hãm phân cấp màu rõ ràng',
      'Bấm vào bất kỳ chính tinh nào để xem tường giải chi tiết từ tinh hoa Thiên Kỷ',
    ],
  },
  {
    tag: 'AI Luận Giải',
    title: 'Luận Đoán Chuyên Sâu\nTri Mệnh Để Tạo Vận',
    subtitle: 'Kho kiến thức trường phái Nghê Hải Hà × AI Agent thông tuệ',
    points: [
      'Phân tích Mệnh cách: Khởi từ chính tinh thủ Mệnh kết hợp hội chiếu tam phương tứ chính',
      'Luận đoán 6 phương diện đời người: Sự nghiệp, Tài chính, Tình cảm gia đạo, Sức khỏe, Con cái',
      'Vận trình Đại hạn & Lưu niên: Trọng tâm bài học 10 năm và lưu niên hiện tại kèm hành động thực tế',
      'Vấn đáp tự do: Trực tiếp trò chuyện với AI Agent để tháo gỡ băn khoăn về công danh, thời vận',
    ],
  },
  {
    tag: 'Nhận Diện Cách Cục',
    title: 'Tự Động Phát Hiện\nCách Cục Cổ Điển',
    subtitle: 'Khám phá huyền cơ từ các tổ hợp tinh diệu kinh điển',
    points: [
      'Tự động nhận diện hơn 40 cách cục: Tử Phủ đồng cung, Sát Phá Tham, Cơ Nguyệt Đồng Lương, Thạch Trung Ẩn Ngọc...',
      'Cách cục giáp mệnh (Tả Hữu giáp, Nhật Nguyệt giáp) phân tích chuẩn mực theo trường phái Nghê Hải Hà',
      'Tứ Hóa nhập Mệnh/Thiên Di tự động nhận diện và chỉ ra những bài học trọng tâm cần chú ý',
      'Phân tầng cấp độ Cát cách - Thứ cách - Hung cách giúp người xem thấu suốt ưu thế và thách thức',
    ],
  },
];

// ─── 4 Phân hệ kiến thức ──────────────────────────────────
const SECTIONS = [
  {
    key: 'ziwei',
    name: 'Tử Vi',
    en: 'Tử Vi Đẩu Số',
    desc: '14 Chính Tinh · 12 Cung · AI Luận Giải',
    status: 'ready' as const,
    when: 'Hiện tại',
    icon: '◉',
    note: 'Đã sẵn sàng',
  },
  {
    key: 'tianji',
    name: 'Thiên Kỷ',
    en: 'Thiên Kỷ',
    desc: 'Tử Vi · Chu Dịch · Kỳ Môn Độn Giáp',
    status: 'soon' as const,
    when: 'Sắp ra mắt',
    icon: '⊙',
    note: '',
  },
  {
    key: 'diji',
    name: 'Địa Kỷ',
    en: 'Địa Kỷ',
    desc: 'Phong Thủy Địa Lý · Môi Trường Sống',
    status: 'soon' as const,
    when: 'Sắp ra mắt',
    icon: '⊞',
    note: 'Chuyên đề',
  },
  {
    key: 'renji',
    name: 'Nhân Kỷ',
    en: 'Nhân Kỷ',
    desc: 'Nội Kinh · Thương Hàn · Kim Quỹ · Châm Cứu',
    status: 'soon' as const,
    when: 'Sắp ra mắt',
    icon: '⊕',
    note: '',
  },
];

// ─── Tinh hoa triết lý Nghê Hải Hà ────────────────────────
const NI_TEACHINGS = [
  {
    title: 'Mệnh Cung vi Bản, Tam Phương vi Dụng',
    body: 'Thầy Nghê Hải Hà luôn nhấn mạnh: xem mệnh trước hết phải xem cung Mệnh. Chính tinh tại Mệnh quyết định bản chất và cốt cách cốt lõi; tam phương (Tài Bạch, Quan Lộc, Thiên Di) quyết định vũ đài thi triển tài năng. Bốn cung liên hoàn mới tạo nên bức tranh trọn vẹn của đời người.',
  },
  {
    title: 'Đối Cung Tá Tinh, Tuyệt Đối Không Bỏ Qua',
    body: 'Nét tinh tế trong học phái Nghê Hải Hà là đặc biệt coi trọng cung đối diện. Bất kỳ cung nào vô chính diệu đều phải mượn tinh diệu từ đối cung để luận đoán. Cung Mệnh đối diện Thiên Di, tương hỗ lẫn nhau, đây là chìa khóa mà người sơ học thường xem nhẹ.',
  },
  {
    title: 'Tứ Hóa Chính Là Bàn Tay Định Mệnh',
    body: 'Sao là thể, Tứ Hóa (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ) mới là dụng định đoạt biến hóa vận thế. Cùng một sao, khi gặp Hóa Lộc hay gặp Hóa Kỵ sẽ tạo nên quỹ đạo cuộc đời hoàn toàn trái ngược. Thầy từng nói: Không xem Tứ Hóa thì lá số mới chỉ giải được một nửa.',
  },
  {
    title: 'Đại Hạn Mười Năm, Vận Trình Có Nhịp',
    body: 'Cuộc đời chia thành các đại hạn 10 năm. Ở mỗi cung đại hạn, hoàn cảnh và vận hội đổi khác. Hiểu rõ bản thân đang ở đại hạn nào, sao nào lâm chiếu, mới có thể nắm bắt thiên thời để tiến thoái hợp lý.',
  },
];

// ─── Theme Colors Helper ──────────────────────────────────
function useColors(theme: Theme) {
  const d = theme === 'dark';
  return {
    bgBase:       d ? '#020810'                                : '#f5efe0',
    navBg:        d ? '#020810'                                : '#f5efe0',
    navBorder:    d ? 'rgba(255,255,255,0.05)'                : 'rgba(160,120,30,0.15)',
    goldGrad:     d ? 'linear-gradient(160deg,#c8993a 0%,#f0d070 40%,#c8993a 70%,#f0c755 100%)'
                    : 'linear-gradient(160deg,#6a4206 0%,#9a6a10 40%,#6a4206 70%,#885010 100%)',
    goldSolid:    d ? '#d4a843'                               : '#8b6410',
    goldLine:     d ? 'rgba(212,168,67,0.4)'                  : 'rgba(140,100,20,0.4)',
    tagText:      d ? 'rgba(212,168,67,0.6)'                  : 'rgba(120,80,10,0.65)',
    textPrimary:  d ? '#e8eef6'                               : '#1a1d24',
    textSecond:   d ? '#b8c6df'                               : '#3a3f4a',
    textMuted:    d ? '#9db0d0'                               : '#5a6275',
    textFaint:    d ? 'rgba(240,246,255,0.56)'                : '#9da4b3',
    accent:       d ? '#3a78d4'                               : '#3a5a82',
    accentSoft:   d ? 'rgba(58,120,212,0.18)'                 : 'rgba(58,90,130,0.10)',
    cardBg:       d ? 'rgba(255,255,255,0.05)'                : 'rgba(255,255,255,0.88)',
    cardBorder:   d ? 'rgba(255,255,255,0.10)'                : 'rgba(200,160,60,0.25)',
    cardShadow:   d ? '0 4px 32px rgba(0,0,0,0.5)'           : '0 4px 24px rgba(140,100,20,0.12)',
    featureBg:    d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.75)',
    featureBord:  d ? 'rgba(255,255,255,0.08)'                : 'rgba(200,160,60,0.2)',
    glowTint:     d ? 'rgba(212,168,67,0.07)'                 : 'rgba(180,140,40,0.06)',
    glowBlue:     d ? 'rgba(40,80,160,0.12)'                  : 'rgba(58,90,130,0.06)',
    glowPurple:   d ? 'rgba(120,50,180,0.08)'                 : 'rgba(96,80,140,0.04)',
    niBg:         d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.8)',
    niBorder:     d ? 'rgba(212,168,67,0.2)'                  : 'rgba(180,130,40,0.25)',
    niDivider:    d ? 'rgba(255,255,255,0.08)'                : 'rgba(180,130,40,0.12)',
    niCardBg:     d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.9)',
    niCardBord:   d ? 'rgba(255,255,255,0.08)'                : 'rgba(200,160,60,0.2)',
    niCardShadow: d ? '0 2px 20px rgba(0,0,0,0.4)'           : '0 2px 16px rgba(140,100,20,0.1)',
    starBg:       d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.7)',
    starBorder:   d ? 'rgba(212,168,67,0.22)'                 : 'rgba(160,120,30,0.3)',
    starText:     d ? 'rgba(212,168,67,0.7)'                  : 'rgba(120,80,10,0.7)',
    ctaBg:        d ? 'linear-gradient(135deg,#b8892a,#f0d070,#b8892a)'
                    : 'linear-gradient(135deg,#6a4206,#9a6810,#6a4206)',
    ctaText:      d ? '#08080a'                               : '#f8f3e8',
    footerText:   d ? 'rgba(255,255,255,0.08)'                : '#d0b878',
    scrollLine:   d ? 'rgba(212,168,67,0.3)'                  : 'rgba(140,100,20,0.3)',
    scrollText:   d ? 'rgba(255,255,255,0.12)'                : '#c0a870',
    altSection:   d ? 'rgba(255,255,255,0.02)'                : 'rgba(255,255,255,0.4)',
    quoteBg:      d ? 'rgba(212,168,67,0.04)'                 : 'rgba(255,255,255,0.9)',
  };
}

// ─── Tóm tắt Tứ Hóa ───────────────────────────────────────
const SIHUA_BRIEF: Record<string, { attr: string; brief: string }> = {
  'Hóa Lộc': { attr: 'Cát Hóa · Tăng Ích', brief: 'Phúc tinh giáng cung, chủ tài lộc gia tăng, phúc khí dồi dào, duyên lành đưa tới và công việc thuận buồm xuôi gió.' },
  'Hóa Quyền': { attr: 'Cát Hóa · Uy Quyền', brief: 'Quyền tinh giáng cung, chủ năng lực nắm bắt, quyền hành chỉ huy, quyết đoán và bản lĩnh gánh vác việc lớn.' },
  'Hóa Khoa': { attr: 'Cát Hóa · Danh Dự', brief: 'Khoa danh giáng cung, chủ học vấn, tiếng tăm thanh nhã, quý nhân nâng đỡ, thi cử đỗ đạt và hóa giải tai ương.' },
  'Hóa Kỵ': { attr: 'Biến Hóa · Thử Thách', brief: 'Ám tinh giáng cung, chủ chấp niệm, khúc mắc và trở ngại. Cung tọa Hóa Kỵ chính là bài học lớn nhất đời người cần tu dưỡng.' },
};

// ─── Tóm tắt 14 Chính Tinh ────────────────────────────────
const STAR_BRIEF: Record<string, { attr: string; brief: string }> = {
  'Tử Vi': { attr: 'Thổ · Đế Vương Tinh', brief: 'Thiên hoàng quý tinh, thống quản quần tinh. Tọa Mệnh có phong thái ung dung, tự trọng cao, thiên bẩm lãnh đạo, hợp nắm quyền chủ động.' },
  'Thiên Cơ': { attr: 'Mộc · Trí Tuệ Tinh', brief: 'Ích thọ chi tinh, chủ trí mưu và biến động linh hoạt. Tư duy sắc sảo, giỏi quyền biến, thích hợp hoạch định chiến lược và chuyên môn sâu.' },
  'Thái Dương': { attr: 'Hỏa · Quan Lộc Chủ', brief: 'Quan lộc chủ tinh, chủ danh tiếng và sự quang minh lỗi lạc. Tính tình rộng rãi, trọng tín nghĩa, thích cống hiến vì cộng đồng.' },
  'Vũ Khúc': { attr: 'Kim · Tài Bạch Chủ', brief: 'Tài bạch chi tinh, chủ tiền tài và ý chí gang thép. Cương trực, quả quyết, hành động thực tế, rất có duyên với thương trường, tài chính.' },
  'Thiên Đồng': { attr: 'Thủy · Phúc Đức Chủ', brief: 'Phúc tinh chủ an nhàn và hòa nhã. Tính cách đôn hậu, duyên giao tế tốt, trọng chất lượng cuộc sống, càng về hậu vận càng an khang.' },
  'Liêm Trinh': { attr: 'Hỏa · Tài Nghệ Tinh', brief: 'Thứ đào hoa tinh, chủ tài hoa và lý tưởng. Giàu cảm xúc, dám nghĩ dám làm, hợp với nghệ thuật, kinh doanh hoặc chính đạo.' },
  'Thiên Phủ': { attr: 'Thổ · Tài Khố Tinh', brief: 'Nam Đẩu chi chủ, chủ kho bạc và sự tích lũy. Điềm đạm, vững vàng, quản trị xuất sắc, là trụ cột ổn định cho toàn bộ lá số.' },
  'Thái Âm': { attr: 'Thủy · Điền Trạch Chủ', brief: 'Điền trạch chủ tinh, chủ phúc thọ và nhu thuận. Giàu trực giác, tính tình chu đáo, hợp với tích lũy bất động sản và sáng tạo.' },
  'Tham Lang': { attr: 'Mộc Thủy · Đào Hoa Chủ', brief: 'Chính đào hoa tinh, chủ dục vọng cầu tiến và đa tài đa nghệ. Giao thiệp rộng, thích nghi nhanh, đầy sức hút trong xã hội.' },
  'Cự Môn': { attr: 'Thủy · Hùng Biện Tinh', brief: 'Ám tinh chủ tài ăn nói và tư duy phản biện. Giỏi biện thuyết, tinh ý, hợp với luật sư, giảng dạy, truyền thông, lấy chữ tín lập nghiệp.' },
  'Thiên Tướng': { attr: 'Thủy · Ấn Thụ Tinh', brief: 'Ấn tinh chủ phò tá, chính trực và gương mẫu. Trọng danh dự, đáng tin cậy, hợp làm cố vấn, quản trị và giữ cán cân công lý.' },
  'Thiên Lương': { attr: 'Thổ · Ấm Tinh', brief: 'Ấm tinh chủ che chở, thọ khảo và từ ái. Lương thiện, nguyên tắc, có duyên gặp dữ hóa lành, thích hợp y dược, giáo dục, tâm linh.' },
  'Thất Sát': { attr: 'Kim Hỏa · Tướng Soái Tinh', brief: 'Dũng tướng tinh, chủ cương nghị và mở đường. Tính cách quật cường, quyết đoán, không ngại gian khó, rất hợp làm người tiên phong.' },
  'Phá Quân': { attr: 'Thủy · Tiên Phong Tinh', brief: 'Hao tinh chủ biến động và khai phá. Không chấp nhận lối mòn, dám phá vỡ khuôn mẫu để kiến tạo cái mới, đầy bản lĩnh khai sáng.' },
};

// ─── Visual Feature Blocks ────────────────────────────────
function FeatureVisual({ index, colors: c }: { index: number; colors: ReturnType<typeof useColors> }) {
  if (index === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <div className="grid grid-cols-4 gap-1.5 w-72 mx-auto">
          {Array.from({ length: 16 }).map((_, i) => {
            const isCenter = [5, 6, 9, 10].includes(i);
            const isActive = [0, 3, 12, 15].includes(i);
            return (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="h-14 rounded-sm flex items-center justify-center text-xs transition-all duration-300"
                style={{
                  border: `1px solid ${isActive ? c.goldLine : c.cardBorder}`,
                  background: isCenter ? 'transparent' : isActive ? c.starBg : c.featureBg,
                  color: isActive ? c.goldSolid : c.textFaint,
                  opacity: isCenter ? 0 : 1,
                }}>
                {isActive ? '★' : ''}
              </motion.div>
            );
          })}
        </div>
        <p className="text-[10px] tracking-widest transition-colors duration-300"
          style={{ color: c.textFaint }}>An sao theo chuẩn Nghê Hải Hà</p>
      </div>
    );
  }

  if (index === 1) {
    const [sel, setSel] = useState<string | null>(null);
    const selInfo = sel ? (STAR_BRIEF[sel] ?? SIHUA_BRIEF[sel] ?? null) : null;
    return (
      <div className="flex flex-col gap-4 h-full justify-center">
        {[
          { group: 'Hệ Tử Vi (Bắc Đẩu)', stars: ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh'] },
          { group: 'Hệ Thiên Phủ (Nam Đẩu)', stars: ['Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'] },
        ].map(group => (
          <div key={group.group}>
            <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
              style={{ color: c.textFaint }}>{group.group}</div>
            <div className="flex flex-wrap gap-1.5">
              {group.stars.map(s => (
                <motion.button key={s}
                  onClick={() => setSel(sel === s ? null : s)}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="text-xs px-2 py-1 rounded-md cursor-pointer"
                  style={{
                    border: `1px solid ${sel === s ? c.goldSolid : c.goldLine}`,
                    color: c.goldSolid,
                    background: sel === s ? `${c.goldLine}30` : 'transparent',
                    fontWeight: sel === s ? 600 : 400,
                  }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
            style={{ color: c.textFaint }}>Tứ Hóa Vận Hành</div>
          <div className="flex gap-2 flex-wrap">
            {[['Hóa Lộc', 'rgba(52,211,153,0.7)'], ['Hóa Quyền', 'rgba(96,165,250,0.7)'], ['Hóa Khoa', 'rgba(250,204,21,0.7)'], ['Hóa Kỵ', 'rgba(248,113,113,0.7)']].map(([label, color]) => (
              <motion.button key={label}
                onClick={() => setSel(sel === label ? null : label)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="text-xs px-2.5 py-1 rounded-md cursor-pointer"
                style={{
                  border: `1px solid ${color}`,
                  color,
                  background: sel === label ? `${color.replace('0.7', '0.15')}` : 'transparent',
                  fontWeight: sel === label ? 600 : 400,
                }}>
                {label}
              </motion.button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {selInfo && (
            <motion.div key={sel}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-4 mt-1.5"
              style={{ border: `1px solid ${c.goldLine}`, background: c.featureBg }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: c.goldSolid }}>{sel}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: c.tagText, border: `1px solid ${c.goldLine}` }}>{selInfo.attr}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: c.textSecond }}>{selInfo.brief}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (index === 2) {
    const msgs = [
      { role: 'user', text: 'Năm nay vận trình sự nghiệp của tôi thế nào?' },
      { role: 'ai', text: 'Cung Mệnh có Thiên Cơ Hóa Lộc, đại hạn chuyển về Quan Lộc, tam phương có Tả Hữu hội chiếu, báo hiệu có quý nhân nâng đỡ và cơ hội mở mang mới…' },
      { role: 'user', text: 'Giai đoạn nào tình cảm hôn nhân thuận lợi nhất?' },
    ];
    return (
      <div className="flex flex-col gap-2 h-full justify-center">
        {msgs.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] text-[11px] px-3 py-2 rounded-lg leading-relaxed"
              style={{
                border: `1px solid ${m.role === 'user' ? c.goldLine : c.cardBorder}`,
                background: m.role === 'user' ? c.starBg : c.featureBg,
                color: m.role === 'user' ? c.goldSolid : c.textSecond,
              }}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (index === 3) {
    const patterns = [
      { name: 'Sát Phá Tham', desc: 'Mệnh cách khai sáng, dũng cảm tiên phong', ok: true },
      { name: 'Liêm Tướng Ấn Thụ', desc: 'Mệnh cách quản trị hành chính, nguyên tắc', ok: true },
      { name: 'Hóa Kỵ Nhập Mệnh', desc: 'Bài học kiên nhẫn và tu dưỡng nội tâm', ok: false },
    ];
    return (
      <div className="flex flex-col gap-3 h-full justify-center">
        {patterns.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              border: `1px solid ${p.ok ? 'rgba(96,165,250,0.25)' : 'rgba(251,146,60,0.25)'}`,
              background: p.ok ? 'rgba(96,165,250,0.05)' : 'rgba(251,146,60,0.05)',
            }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: p.ok ? 'rgba(96,165,250,0.6)' : 'rgba(251,146,60,0.6)' }} />
            <div>
              <div className="text-[11px] font-medium"
                style={{ color: p.ok ? 'rgba(147,197,253,0.8)' : 'rgba(253,186,116,0.8)' }}>{p.name}</div>
              <div className="text-[10px]" style={{ color: c.textMuted }}>{p.desc}</div>
            </div>
          </motion.div>
        ))}
        <div className="text-[9px] mt-2 tracking-wider text-center" style={{ color: c.textFaint }}>
          Tự động phát hiện hơn 40 cách cục kinh điển
        </div>
      </div>
    );
  }

  return null;
}

// ─── Trang chủ chính ──────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = useColors(theme);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  useLayoutEffect(() => {
    document.documentElement.style.background = c.bgBase;
    document.body.style.background = c.bgBase;
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, [c.bgBase]);

  return (
    <div style={{ background: c.bgBase, transition: 'background 0.35s ease' }} className="overflow-x-hidden">
      <AnnouncementModal />

      <StarField />

      {/* Ánh sáng nền toàn cảnh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowTint} 0%, transparent 70%)` }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowBlue} 0%, transparent 70%)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowPurple} 0%, transparent 70%)` }} />
      </div>

      {/* ── Thanh điều hướng trên cùng ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 gap-2"
        style={{
          background: c.navBg,
        }}>
        <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] font-medium transition-colors duration-300 flex-shrink-0"
          style={{ color: c.goldSolid }}>
          TỬ VI ĐẨU SỐ
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/heming')}
            className="text-[11px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300"
            style={{ border: `1px solid ${c.navBorder}`, color: c.textMuted }}>
            Hợp Số
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="text-[11px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300"
            style={{ border: `1px solid ${c.goldLine}`, color: c.goldSolid }}>
            Lập Lá Số
          </motion.button>
        </div>
      </nav>

      {/* ══ HERO SECTION ═══════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[82svh] lg:min-h-[92vh] flex flex-col items-center justify-center px-6 z-10 pb-24 pt-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity, maxWidth: '960px' }} className="text-center w-full mx-auto mt-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[11px] tracking-[0.45em] transition-colors duration-300" style={{ color: c.tagText }}>
              TỬ VI ĐẨU SỐ · TRƯỜNG PHÁI NGHÊ HẢI HÀ
            </span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ position: 'relative', display: 'inline-block' }}>
            <h1
              className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold leading-none mb-5`}
              style={{
                fontSize: 'clamp(44px, 8vw, 100px)',
                letterSpacing: '0.05em',
              }}>
              TỬ VI ĐẨU SỐ
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-base md:text-lg tracking-[0.18em] mb-2"
            style={{ color: c.textSecond, fontWeight: 500 }}>
            Tử Vi làm cửa · Thiên Địa Nhân dẫn lối · Nghê Hải Hà khai trí
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="text-xs md:text-sm tracking-[0.3em] mb-6"
            style={{ color: c.textMuted, opacity: 0.85 }}>
            AI LUẬN ĐOÁN · TRI MỆNH ĐỊNH HƯỚNG
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="text-sm max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: c.textMuted }}>
            Nhập ngày tháng năm và giờ sinh để thiết lập lá số Tử Vi độc bản chuẩn chỉnh — Đồng hành cùng AI Agent thông tuệ luận giải chuyên sâu về Mệnh cách, Tài vận và Vận hạn.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ y: -2, filter: 'brightness(1.06)' }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/chart')}
              className="px-12 py-4 font-semibold text-base tracking-widest rounded-full"
              style={{ background: c.ctaBg, color: c.ctaText }}>
              LẬP LÁ SỐ NGAY
            </motion.button>
          </motion.div>

          {/* 14 Chính Tinh Pill Grid */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.8 }}
            className="mt-12 grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-w-[620px] mx-auto">
            {STARS.map((star, i) => (
              <motion.div key={star.name}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.05 + i * 0.03, duration: 0.35 }}
                className="flex items-center justify-center px-2 py-1 rounded-full text-center"
                style={{ background: c.starBg, border: `1px solid ${c.starBorder}` }}>
                <span className="text-[11px] tracking-wide" style={{ color: c.starText }}>{star.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: c.scrollText }}>Khám phá thêm</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${c.scrollLine}, transparent)` }} />
        </motion.div>
      </section>

      {/* ══ TRIẾT LÝ MỆNH VẬN ══════════════════════════════ */}
      <section className="relative z-10 overflow-hidden min-h-[82svh] lg:min-h-[92vh] flex items-center" style={{ padding: '72px 24px' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="absolute inset-0"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, #020810 0%, #020810 6%, #030a18 22%, #0d0820 40%, #0a0618 68%, #030a18 86%, #020810 100%)'
              : 'linear-gradient(to bottom, #f5efe0 0%, #f5efe0 6%, #c08055 18%, #6a2810 32%, #1e0a02 50%, #1e0a02 70%, #6a2810 84%, #f5efe0 100%)',
            transition: 'background 0.4s ease',
          }} />
        <FadeIn className="relative mx-auto text-center w-full" y={20}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(212,168,67,0.45))' }} />
            <span className="text-[10px] tracking-[0.55em] uppercase" style={{ color: 'rgba(212,168,67,0.5)' }}>MỆNH · VẬN · QUAN</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(212,168,67,0.45))' }} />
          </div>
          <div className="space-y-3" style={{ maxWidth: '840px', margin: '0 auto' }}>
            {[
              { text: 'Ý nghĩa của việc thấu suốt vận mệnh', size: 'clamp(17px, 2.2vw, 28px)', color: 'rgba(215,228,252,0.72)', delay: 0.1 },
              { text: 'Không phải để đón đợi tương lai một cách thụ động', size: 'clamp(21px, 2.6vw, 32px)', color: 'rgba(220,232,250,0.74)', delay: 0.25 },
              { text: 'Mà là để không ngừng thấu hiểu chính mình', size: 'clamp(24px, 3vw, 40px)', color: 'rgba(218,230,248,0.8)', delay: 0.34 },
            ].map((line, i) => (
              <motion.p key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: line.delay }}
                className="tracking-wider" style={{ fontSize: line.size, color: line.color, fontWeight: 400 }}>
                {line.text}
              </motion.p>
            ))}
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold`}
              style={{ fontSize: 'clamp(24px, 3.4vw, 48px)', letterSpacing: '0.05em', lineHeight: 1.35 }}>
              Để sau cùng tự tay viết nên kịch bản cuộc đời rực rỡ nhất
            </motion.p>
          </div>
        </FadeIn>
      </section>

      {/* ══ 4 HỌC PHẦN KIẾN THỨC ═══════════════════════════ */}
      <section className="relative z-10 py-20 lg:py-24 px-6"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.03) 50%, transparent 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.04) 50%, transparent 100%)',
        }}>
        <FadeIn className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: c.goldSolid, opacity: 0.7 }}>Hệ Thống Tri Thức</span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </div>
          <div className="text-2xl lg:text-3xl font-bold mb-2 tracking-[0.15em]" style={{ color: c.textPrimary }}>
            Phương Pháp Luận Nghê Hải Hà
          </div>
          <div className="text-xs lg:text-sm tracking-[0.1em]" style={{ color: c.textMuted }}>
            Từ Tử Vi Đẩu Số nền tảng, từng bước mở rộng Thiên Kỷ / Địa Kỷ / Nhân Kỷ
          </div>
        </FadeIn>

        <div className="max-w-sm lg:max-w-5xl mx-auto relative">
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5"
            style={{
              background: `linear-gradient(90deg, ${c.goldSolid} 0%, ${c.goldSolid} 25%, ${c.goldLine} 25%)`,
              opacity: 0.6,
            }} />

          <div className="lg:hidden absolute left-7 top-7 bottom-7 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, ${c.goldSolid} 0%, ${c.goldSolid} 22%, ${c.goldLine} 22%)`,
              opacity: 0.6,
            }} />

          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-4">
            {SECTIONS.map((s, i) => {
              const ready = s.status === 'ready';
              return (
                <motion.div key={s.key}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-4 lg:gap-0">
                  <div className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center lg:mb-3"
                    style={{
                      background: ready
                        ? `linear-gradient(135deg, ${c.goldSolid} 0%, ${c.goldSolid}cc 100%)`
                        : (theme === 'dark' ? 'rgba(184,146,42,0.05)' : '#fdf8ee'),
                      border: ready ? 'none' : `2px dashed ${c.goldLine}`,
                      color: ready ? '#fff' : c.textMuted,
                      boxShadow: ready ? `0 4px 16px ${c.goldSolid}55` : 'none',
                    }}>
                    <span className="text-2xl">{s.icon}</span>
                    {ready && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ background: '#10b981', boxShadow: '0 2px 6px rgba(16,185,129,0.4)' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="flex-1 lg:flex-none flex flex-col items-start lg:items-center min-w-0">
                    <div className="flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:mb-1">
                      <div className="text-[10px] tracking-[0.25em] lg:mb-1.5"
                        style={{ color: ready ? '#10b981' : c.textMuted, fontWeight: 500 }}>
                        {s.when}
                      </div>
                      <div className="text-base lg:text-xl font-semibold tracking-[0.15em]"
                        style={{ color: c.textPrimary }}>
                        {s.name}
                      </div>
                      {s.note && (
                        <div className="text-[9px] tracking-[0.15em] px-2 py-0.5 rounded-full lg:hidden"
                          style={{
                            color: c.goldSolid,
                            background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                            border: `1px solid ${c.goldLine}`,
                            opacity: 0.85,
                          }}>
                          {s.note}
                        </div>
                      )}
                    </div>
                    {s.note && (
                      <div className="hidden lg:block text-[9px] tracking-[0.15em] mb-1.5 px-2 py-0.5 rounded-full"
                        style={{
                          color: c.goldSolid,
                          background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                          border: `1px solid ${c.goldLine}`,
                          opacity: 0.85,
                        }}>
                        {s.note}
                      </div>
                    )}
                    <div className="text-[11px] lg:text-xs leading-relaxed lg:max-w-[200px] mt-0.5 lg:mt-0"
                      style={{ color: c.textSecond }}>
                      {s.desc}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ TÍNH NĂNG CHI TIẾT ════════════════════════════ */}
      <section className="relative z-10">
        {FEATURES.map((feature, i) => (
          <div key={i}
            className={`flex items-center px-6 md:px-10 lg:px-14 py-20 md:py-24 ${i <= 2 ? 'min-h-[82svh] lg:min-h-[92vh]' : ''}`}
            style={{ background: i % 2 === 1 ? c.altSection : 'transparent' }}>
            <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
              <div className={`grid grid-cols-1 ${i % 2 === 0 ? 'lg:grid-cols-[0.45fr_0.55fr]' : 'lg:grid-cols-[0.55fr_0.45fr]'} gap-10 lg:gap-16 items-start ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <FadeIn delay={0}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8" style={{ background: c.goldLine }} />
                      <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>{feature.tag}</span>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.1}>
                    <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold leading-tight mb-5 tracking-tight`}
                      style={{
                        fontSize: i < 2 ? 'clamp(36px, 4vw, 56px)' : 'clamp(30px, 3.5vw, 48px)',
                        whiteSpace: 'pre-line',
                      }}>
                      {feature.title}
                    </h2>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <p className="text-base mb-8 leading-relaxed" style={{ color: c.textSecond }}>{feature.subtitle}</p>
                  </FadeIn>
                  <div className="space-y-4">
                    {feature.points.map((point, j) => (
                      <FadeIn key={j} delay={0.25 + j * 0.08}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-2 w-1 h-1 rounded-full" style={{ background: c.goldSolid, opacity: 0.6 }} />
                          <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{point}</p>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
                <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <FadeIn delay={0.15}>
                    <div className="relative rounded-2xl overflow-hidden p-8 md:p-12"
                      style={{
                        border: `1px solid ${c.featureBord}`,
                        background: c.featureBg,
                        minHeight: i <= 1 ? '540px' : i === 2 ? '460px' : '320px',
                        boxShadow: c.cardShadow,
                      }}>
                      <FeatureVisual index={i} colors={c} />
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ══ THIÊN - ĐỊA - NHÂN TAM PHÂN THUYẾT ══════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20"
        style={{ background: c.altSection, minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Nghê Hải Hà · Triết Lý Mệnh Học</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-5 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                Thiên · Địa · Nhân
              </h2>
              <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: c.textSecond }}>
                Quan điểm cốt lõi của Thầy Nghê Hải Hà: Lá số tiên thiên không bao giờ là toàn bộ đời người.<br />
                Ông phân định 3 nguồn lực trọng yếu cùng tác động lên số mệnh với tỉ trọng đồng đều.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { glyph: 'Thiên', label: 'Tiên Thiên Số Mệnh', pct: '⅓', color: c.goldSolid, borderColor: c.goldLine, desc: 'Tử Vi Đẩu Số chỉ ra kết cấu tiên thiên — thời điểm chào đời định hình cung vị, ngũ hành nạp âm, các sao tọa thủ. Đây là 1/3 cuộc đời, là màu sắc nền tảng chứ không phải là bản án đóng khung.', sub: 'Mệnh Bàn · Tinh Diệu · Ngũ Hành' },
              { glyph: 'Địa', label: 'Môi Trường Địa Lý', pct: '⅓', color: 'rgba(96,165,250,0.9)', borderColor: 'rgba(96,165,250,0.3)', desc: 'Địa lý, thành phố, quốc gia, phong thủy nơi sinh sống, cũng như bối cảnh xã hội và gia đình cấu thành nên chiều kích thứ hai. Cùng một lá số, sinh trưởng ở môi trường khác nhau sẽ có trải nghiệm khác nhau.', sub: 'Không Gian · Địa Lý · Môi Trường' },
              { glyph: 'Nhân', label: 'Ý Chí & Hành Động', pct: '⅓', color: 'rgba(100,216,139,0.9)', borderColor: 'rgba(100,216,139,0.3)', desc: 'Ý chí, tâm thái, sự lựa chọn và hành động thực tế là lực lượng chủ động nhất cải biến vận số. Thầy nhấn mạnh: Thấu hiểu số mệnh là để hành xử sáng suốt hơn, chứ không phải ngồi chờ định mệnh an bài.', sub: 'Ý Chí · Lựa Chọn · Tu Dưỡng' },
            ].map((item, i) => (
              <FadeIn key={item.glyph} delay={0.1 + i * 0.12}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.1 }}
                  className="rounded-2xl p-7 h-full flex flex-col"
                  style={{ background: c.cardBg, border: `1px solid ${item.borderColor}`, boxShadow: c.cardShadow }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="text-4xl font-bold leading-none" style={{ color: item.color }}>{item.glyph}</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: item.color }}>{item.pct}</div>
                      <div className="text-[9px] mt-0.5 tracking-widest" style={{ color: c.textMuted }}>đời người</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-0.5" style={{ color: item.color }}>{item.label}</div>
                    <div className="text-[10px] tracking-wider" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                  <div className="h-px mb-4" style={{ background: item.borderColor }} />
                  <p className="text-xs leading-relaxed flex-1" style={{ color: c.textSecond }}>{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-sm leading-relaxed" style={{ color: c.textSecond }}>
                「Mệnh trời chỉ là một phần, cộng thêm Địa lý nơi sống và Nhân niệm hành động, mới tạo nên trọn vẹn đời người.」
              </p>
              <p className="mt-2 text-[10px] tracking-widest" style={{ color: c.tagText }}>— Nghê Hải Hà</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ GIỚI THIỆU THẦY NGHÊ HẢI HÀ ════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20" style={{ minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Tông Sư · 1954 – 2012</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-6 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                Tôn Sư Nghê Hải Hà
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed text-sm" style={{ color: c.textSecond }}>
                Một trong những đại sư có tầm ảnh hưởng sâu rộng nhất về Trung y và Thuật số truyền thống.<br />
                Nhà sáng lập Học viện Trung Y Hán Đường tại Hoa Kỳ · Để lại hai đại hệ thống giảng huấn bất hủ: 「Nhân Kỷ」 và 「Thiên Kỷ」.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl p-8 md:p-10 mb-8"
              style={{ border: `1px solid ${c.niBorder}`, background: c.niBg, boxShadow: c.cardShadow }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Sinh năm', value: '1954', sub: 'Đài Loan' },
                  { label: 'Tạ thế', value: '2012', sub: 'Hưởng thọ 58 tuổi' },
                  { label: 'Truyền thừa', value: 'Tử Vi Đẩu Số', sub: 'Kinh Phương Y Đạo · Dịch Lý' },
                ].map(item => (
                  <div key={item.label} className="text-center rounded-xl px-4 py-3"
                    style={{ border: `1px solid ${c.niDivider}`, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-[10px] tracking-[0.3em] mb-1" style={{ color: c.textFaint }}>{item.label}</div>
                    <div className="text-2xl font-semibold mb-0.5" style={{ color: c.goldSolid }}>{item.value}</div>
                    <div className="text-[11px]" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="h-px mb-8" style={{ background: c.niDivider }} />
              <div className="space-y-4 text-sm leading-relaxed max-w-3xl mx-auto" style={{ color: c.textSecond }}>
                <p>
                  <strong style={{ color: c.goldSolid }}>Cuộc đời & Sự nghiệp</strong>:
                  Thầy Nghê Hải Hà (1954–2012) xuất thân tại Đài Loan, sớm theo học các danh y cổ truyền, chuyên sâu Kinh Phương phái (truyền thừa Thương Hàn Luận).
                  Về sau ông hành y tại Hoa Kỳ, sáng lập Học viện Trung y Hán Đường tại Florida, trong suốt hơn hai mươi năm đã đào tạo và truyền thụ bài bản nền y học và thuật số cổ truyền.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Hệ thống trước tác</strong>:
                  Thầy đúc kết toàn bộ sở học cả đời thành hai bộ đại tài liệu giảng huấn công khai.
                  <strong>「Nhân Kỷ」</strong> bao hàm Châm Cứu Đại Thành, Thần Nông Bản Thảo Kinh, Hoàng Đế Nội Kinh, Thương Hàn Luận, Kim Quỹ Yếu Lược — đặt nền móng y đạo trọn vẹn;
                  <strong>「Thiên Kỷ」</strong> bao hàm Tử Vi Đẩu Số và Chu Dịch — nghiên cứu hệ thống quy luật vũ trụ và vận số con người.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Lập trường Tử Vi</strong>:
                  Trong Tử Vi Đẩu Số, Thầy kiên định theo <strong>Nam phái Tam Hợp</strong>, chủ trương:
                  「Lấy cung Mệnh làm gốc, lấy Tam Phương Tứ Chính làm dụng, lấy Tứ Hóa làm cương lĩnh」.
                  Thầy nhấn mạnh tinh thần "Đại đạo chí giản" — không lạm dụng phi tinh phức tạp rườm rà, mà tập trung vào cấu trúc thế sao cốt lõi và dịch lý thực tế.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Thái độ nghiên cứu</strong>:
                  Thầy phản đối việc học vẹt khẩu quyết huyền bí, đề cao tư duy logic có thể kiểm chứng, giúp thuật số thoát khỏi màu sắc mê tín và trở thành một bộ môn văn hóa tri thức thực chứng.
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NI_TEACHINGS.map((teaching, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.1 }}
                  className="rounded-xl p-6 h-full"
                  style={{ border: `1px solid ${c.niCardBord}`, background: c.niCardBg, boxShadow: c.niCardShadow }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5"
                      style={{ borderColor: c.goldLine }}>
                      <span className="text-[9px]" style={{ color: c.goldSolid }}>{i + 1}</span>
                    </div>
                    <h3 className="text-sm font-medium leading-relaxed" style={{ color: c.goldSolid }}>{teaching.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed pl-8" style={{ color: c.textSecond }}>{teaching.body}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HỢP SỐ (SONG BÀN ĐỐI CHIẾU) ════════════════════ */}
      <section className="relative z-10 px-6 md:px-10 lg:px-14 py-20">
        <div className="mx-auto" style={{ maxWidth: '1280px' }}>
          <div className="rounded-2xl p-10 md:p-14 text-center"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${c.cardBorder}`,
              boxShadow: c.cardShadow,
            }}>
            <FadeIn>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8" style={{ background: c.goldLine }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Hợp Số · Song Bàn Đối Chiếu</span>
                <div className="h-px w-8" style={{ background: c.goldLine }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-4 tracking-tight`}
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)' }}>
                Tử Vi Hợp Số
              </h2>
              <p className="text-sm leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: c.textSecond }}>
                Nhập thông tin ngày sinh của hai người, AI Agent dựa trên nguyên lý Thiên Kỷ phân tích tương quan Cung Phu Thê, độ tương thích tính cách Cung Mệnh và tương tác tam phương tứ chính,<br className="hidden md:block" />
                đưa ra đánh giá về độ hòa hợp tình cảm, khả năng hợp tác kinh doanh và lời khuyên ứng xử tối ưu.
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {['Hòa hợp tình cảm & Hôn nhân', 'Hợp tác làm ăn & Kinh doanh', 'Tương thích tính cách Mệnh/Thân', 'Lời khuyên đồng hành bền vững'].map(item => (
                  <span key={item} style={{
                    fontSize: '12px', padding: '5px 14px', borderRadius: '20px',
                    background: theme === 'dark' ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.12)',
                    border: `1px solid ${c.goldLine}`,
                    color: c.goldSolid,
                  }}>
                    {item}
                  </span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/heming')}
                className="px-10 py-3 font-medium text-sm tracking-widest rounded-full"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(140,100,20,0.1)',
                  border: `1px solid ${c.goldLine}`,
                  color: c.goldSolid,
                  cursor: 'pointer',
                }}>
                BẮT ĐẦU HỢP SỐ
              </motion.button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ CTA CUỐI TRANG ═════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 text-center" style={{ background: c.altSection }}>
        <FadeIn>
          <p className="text-[10px] tracking-[0.6em] uppercase mb-6" style={{ color: c.tagText }}>Khởi đầu hành trình thấu tỏ bản thân</p>
          <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-8 tracking-tight leading-tight`}
            style={{ fontSize: 'clamp(32px, 5vw, 60px)' }}>
            Lá Số Tử Vi Của Bạn<br />Đang Chờ Luận Giải
          </h2>
          <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: c.textSecond }}>
            Nhập ngày tháng năm và giờ sinh để thiết lập lá số chuẩn mực chỉ trong vài giây<br />
            và cùng AI Agent khám phá những chỉ dẫn sâu sắc từ cổ nhân
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="px-14 py-4 font-semibold text-base tracking-widest rounded-full"
            style={{ background: c.ctaBg, color: c.ctaText }}>
            LẬP LÁ SỐ NGAY
          </motion.button>
        </FadeIn>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════ */}
      <footer className="relative z-10 py-10 px-6"
        style={{ borderTop: `1px solid ${c.niCardBord}` }}>
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-[9px] tracking-[0.3em] text-center mb-4 uppercase"
            style={{ color: c.textMuted, opacity: 0.6 }}>
            Học Phái Nghê Hải Hà · Hệ Thống Nghiên Cứu
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {SECTIONS.map(s => {
              const ready = s.status === 'ready';
              return (
                <a
                  key={s.key}
                  href={ready ? '/chart' : undefined}
                  onClick={ready ? undefined : (e) => e.preventDefault()}
                  className="rounded-lg px-3 py-3 text-center transition-all"
                  style={{
                    background: ready ? c.starBg : 'transparent',
                    border: `1px ${ready ? 'solid' : 'dashed'} ${ready ? c.goldLine : c.navBorder}`,
                    cursor: ready ? 'pointer' : 'not-allowed',
                    opacity: ready ? 1 : 0.5,
                    textDecoration: 'none',
                  }}
                >
                  <div className="text-base font-semibold mb-0.5 tracking-[0.1em]"
                    style={{ color: ready ? c.goldSolid : c.textMuted }}>
                    {s.name}
                  </div>
                  <div className="text-[9px] tracking-wider"
                    style={{ color: ready ? '#10b981' : c.textMuted }}>
                    {ready ? '✓ Đang hoạt động' : s.when}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-wider mb-3" style={{ color: c.footerText }}>
            Tử Vi Đẩu Số · Trường phái Thiên Kỷ Nghê Hải Hà · Tri mệnh để tạo vận, tự thân nắm giữ tương lai
          </p>
          <p className="text-[10px] tracking-wider mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: c.footerText, opacity: 0.85 }}>
            Hệ thống dựa trên nghiên cứu văn hóa truyền thống phương Đông, phục vụ mục đích học thuật và định hướng cá nhân.<br className="sm:hidden" />
            Không mang tính mê tín dị đoan và không thay thế các quyết định y tế, pháp lý hay tài chính chuyên môn.
          </p>
        </div>
      </footer>
    </div>
  );
}
