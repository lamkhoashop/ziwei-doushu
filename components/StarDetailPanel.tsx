'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Star } from '@/lib/ziwei/types';
import { STAR_DESCRIPTIONS } from '@/lib/ziwei/constants';
import {
  toVietnameseStar,
  toVietnamesePalace,
} from '@/lib/ziwei/vietnamese';

interface StarDetailPanelProps {
  star: Star | null;
  palaceName?: string;
  onClose: () => void;
}

// Luận giải chi tiết 14 Chính Tinh theo trường phái Nghê Hải Hà & Điển tịch cổ quyết
const STAR_DETAIL: Record<string, {
  niHaixia: string;
  classical: string;
  bestPalace: string;
  worstPalace: string;
  career: string;
  relationship: string;
  wealth: string;
  health: string;
}> = {
  '紫微': {
    niHaixia: 'Thầy Nghê Hải Hà xem Tử Vi là bậc Đế Tinh, tọa Mệnh có cốt cách kiêu hãnh, thích độc lập tự chủ, không chịu sự kiềm tỏa của người khác. Tử Vi bắt buộc cần có Tả Phù - Hữu Bật giáp hội hoặc đồng cung mới phát huy trọn vẹn khí chất minh quân, nếu không chỉ là "cô quân vô phụ", phú mà không quý. Đóng tại Thìn Tuất cùng Thiên Phủ tạo thế Đế Tướng tịnh lâm, tài quan song toàn, văn võ song toàn. Tử Vi kỵ gặp Hỏa Tinh, Linh Tinh, Kình Dương, Đà La; gặp sát tinh thì cô độc quyền biến mà lao tâm khổ tứ.',
    classical: 'Cổ quyết: "Tử Vi đế tọa lâm Mệnh chủ tôn quý, thống lãnh chư tinh, tọa Mệnh chủ uy quyền hiển đạt." Cổ chú: Tử Vi thủ Mệnh tại Thìn Tuất tài quan song mỹ; cư Tý cô độc nan trường cửu.',
    bestPalace: 'Mệnh Cung (Thìn, Tuất), Quan Lộc Cung',
    worstPalace: 'Tật Ách Cung, Phu Thê Cung',
    career: 'Chính giới, lãnh đạo cấp cao, khởi nghiệp độc lập, phù hợp cương vị đứng đầu chịu trách nhiệm toàn diện',
    relationship: 'Trong tình cảm khá bị động, tự trọng cao, cần đối phương thấu hiểu tôn trọng; nên kết hôn muộn',
    wealth: 'Tài vận vững vàng, năng lực quản trị thủ tài vượt trội, thích hợp đầu tư tài sản trung dài hạn',
    health: 'Hành Thổ: Chú ý tỳ vị, tiêu hóa, dạ dày. Tránh lao lực quá độ, nên duy trì sinh hoạt điều độ',
  },
  '天机': {
    niHaixia: 'Thầy Nghê coi Thiên Cơ là bậc quân sư trí tuệ, là ngôi sao thông minh mưu lược nhất trong Tử Vi Đẩu Số. Thiên Cơ thuộc Mộc, chủ sự linh hoạt biến đổi; người Mệnh Thiên Cơ đầu óc nhạy bén nhưng nhiều mưu ít quyết, nên đi xa lập nghiệp. Thiên Cơ sợ nhất Hóa Kỵ (thông minh bị thông minh hại, suy nghĩ quá nhiều sinh lo âu).',
    classical: 'Cổ quyết: "Thiên Cơ mưu lược đa cơ biến, vi nhân tinh hoạt thiện kinh doanh, đắc địa miếu vượng vi lương thần tướng tá."',
    bestPalace: 'Mệnh Cung (Mão), Quan Lộc Cung',
    worstPalace: 'Phu Thê Cung',
    career: 'Chuyên gia công nghệ, cố vấn chiến lược, IT, nghiên cứu khoa học, kế hoạch truyền thông',
    relationship: 'Tình cảm giàu biến động, suy nghĩ quá nhiều nên dễ phân tâm; nên lập gia đình muộn để chín chắn hơn',
    wealth: 'Kiếm tiền bằng trí óc và kỹ năng chuyên môn, không giỏi giữ tiền mặt, nên tích lũy tài sản cố định',
    health: 'Hành Mộc: Chú ý gan mật, hệ thần kinh, chứng mất ngủ do suy nghĩ nhiều',
  },
  '太阳': {
    niHaixia: 'Thái Dương là ngôi sao của sự quang minh, đại diện cho người cha, người chồng hoặc bậc trưởng bối. Miếu vượng từ Mão đến Ngọ sáng rực, hào sảng, vì nghĩa quên mình. Nam mạng đắc cách hiển đạt, nữ mạng nếu quá mạnh mẽ dễ lấn át phu quyền. Lạc hãm thì vất vả, lúc đầu nhiệt tình về sau lười nhác.',
    classical: 'Cổ quyết: "Thái Dương cư Ngọ nhật lệ trung thiên, quang huy đại phóng, vạn lý hà sơn giai ngưỡng vọng."',
    bestPalace: 'Mệnh Cung (Mão đến Ngọ), Quan Lộc Cung',
    worstPalace: 'Phu Thê Cung (Nữ mạng), Tật Ách Cung',
    career: 'Chính trị, ngoại giao, quản lý nhân sự, giáo dục, truyền thông đại chúng',
    relationship: 'Rộng lượng nhiệt tình nhưng cái tôi lớn; cần bạn đời thấu hiểu và tôn trọng',
    wealth: 'Kiếm tiền chính đạo, hào phóng chi tiêu, thích hợp xây dựng danh tiếng để sinh lợi ích',
    health: 'Hành Hỏa: Chú ý tim mạch, huyết áp, thị lực và mắt',
  },
  '武曲': {
    niHaixia: 'Vũ Khúc là chính tài tinh, mang tính cương nghị quả đoán của hành Kim. Tính cách dứt khoát, kiên cường, giỏi quản lý tài chính kinh doanh. Tuy nhiên do tính quá thẳng thắn nên đường tình cảm dễ cô quả, kỵ Hóa Kỵ vì chủ về tổn thương tài chính hoặc tai nạn huyết quang. Đóng tại Thìn Tuất Sửu Mùi hội Thất Sát tạo thế tướng tài đại phú.',
    classical: 'Cổ quyết: "Vũ Khúc thuộc Kim vi tài bạch chi chủ, tính tình cương quyết, tài quan song toàn vi thượng cách."',
    bestPalace: 'Mệnh Cung, Tài Bạch Cung, Quan Lộc Cung',
    worstPalace: 'Phu Thê Cung',
    career: 'Tài chính ngân hàng, quân đội công an, kế toán kiểm toán, kỹ thuật cơ khí',
    relationship: 'Ít lãng mạn, thực tế và thẳng thắn; cần người bạn đời dịu dàng bù trừ',
    wealth: 'Tài tinh bản mệnh, năng lực kiếm tiền và tích lũy bậc nhất, thích hợp đầu tư tài chính',
    health: 'Hành Kim: Chú ý phổi, hệ hô hấp, xương khớp và răng',
  },
  '天同': {
    niHaixia: 'Thiên Đồng là ngôi sao phúc thiện, hiền hòa, yêu thích sự thanh thản an nhàn. Người Mệnh Thiên Đồng tâm tính nhân hậu, dễ gần, thích làm việc trong môi trường hòa nhã, ít bon chen. Thiên Đồng Hóa Lộc là hóa lộc êm đềm nhất, một đời no ấm, vô ưu vô lo. Kỵ lạc hãm vì dễ sinh lười biếng hoặc nhu nhược.',
    classical: 'Cổ quyết: "Thiên Đồng vi phúc đức chi tinh, tọa Mệnh giả hưởng phúc diên niên, vạn sự tường hòa."',
    bestPalace: 'Mệnh Cung, Phúc Đức Cung',
    worstPalace: 'Quan Lộc Cung (thiếu tính cạnh tranh khốc liệt)',
    career: 'Dịch vụ, giáo dục, ẩm thực, văn hóa nghệ thuật, nhân sự, môi trường làm việc nhân văn',
    relationship: 'Tình cảm dịu dàng, chu đáo, hòa thuận; gia đạo nhìn chung êm ấm',
    wealth: 'Tài lộc bình ổn, thu nhập đều đặn, không có tâm lý đầu cơ mạo hiểm',
    health: 'Hành Thủy: Chú ý thận, bàng quang, hệ bài tiết; nên vận động thường xuyên',
  },
  '廉贞': {
    niHaixia: 'Liêm Trinh là thứ đào hoa kiêm tù tinh, tính cách đa đoan, tài hoa xuất chúng nhưng tâm trạng lên xuống thất thường. Liêm Trinh rất kỵ Hóa Kỵ (dễ vướng thị phi pháp luật, rắc rối tình cảm). Đi cùng Thiên Tướng thì hóa giải hung tinh biến thành ấn thụ quản lý; đi cùng Thất Sát hoặc Phá Quân thì thăng trầm hiểm trở.',
    classical: 'Cổ quyết: "Liêm Trinh thân vượng đa tài nghệ, xuất chúng phong lưu, đắc địa chưởng quyền bính."',
    bestPalace: 'Quan Lộc Cung (đồng cung Thiên Tướng), Mệnh Cung (khi Hóa Lộc)',
    worstPalace: 'Mệnh Cung (khi Hóa Kỵ), Phu Thê Cung',
    career: 'Nghệ thuật, luật pháp, ngoại giao, chính quyền hành chính, kinh doanh giải trí',
    relationship: 'Đào hoa vượng, tình cảm nồng nhiệt nhưng dễ đa đoan; cần giữ tâm vững vàng',
    wealth: 'Tài vận biến động theo năng lực và thời thế, cần đề phòng rủi ro pháp lý giấy tờ',
    health: 'Hành Hỏa: Chú ý tim mạch, tuần hoàn máu, gan nóng và tâm lý lo âu',
  },
  '天府': {
    niHaixia: 'Thiên Phủ là Nam Đẩu đệ nhất tinh, kho tiền của trời đất, chủ về giữ gìn và quản trị tài sản. Người có Thiên Phủ tọa thủ phong thái đĩnh đạc, cẩn trọng, kín kẽ, đáng tin cậy. Nữ mạng Thiên Phủ vượng phu ích tử bậc nhất. Thiên Phủ sợ nhất Địa Không, Địa Kiếp hội họp vì làm kho rỗng khó tụ tài.',
    classical: 'Cổ quyết: "Thiên Phủ vi tài khố chi thần, thủ Mệnh tắc đoan trang ôn hậu, tích ngọc đôi kim."',
    bestPalace: 'Mệnh Cung, Tài Bạch Cung, Điền Trạch Cung',
    worstPalace: 'Thiên Di Cung (thích an cư hơn bôn ba)',
    career: 'Quản lý tài chính, ngân hàng, bất động sản, hành chính công ty lớn, quản trị doanh nghiệp',
    relationship: 'Rất xem trọng sự an toàn và thủy chung của gia đình; là người bạn đời mẫu mực',
    wealth: 'Khả năng giữ của và tích sản hàng đầu, càng về trung vận điền sản càng phong phú',
    health: 'Hành Thổ: Chú ý hệ tiêu hóa, dạ dày; giữ lối sống điều độ ăn uống khoa học',
  },
  '太阴': {
    niHaixia: 'Thái Âm đại diện cho mặt trăng, người mẹ, người vợ và nguồn tài lộc bất động sản, thanh khiết. Miếu vượng tại Dậu, Tuất, Hợi, Tý sáng rực rỡ, tính tình tao nhã, bao dung, thấu hiểu lòng người. Thái Âm Hóa Lộc hoặc Hóa Quyền chủ phú túc gia tài bạc triệu; kỵ lạc hãm hoặc Hóa Kỵ chủ mẹ hoặc vợ gặp trắc trở.',
    classical: 'Cổ quyết: "Thái Âm cư Hợi nguyệt lãng thiên môn, tiến bộ siêu quần, phú quý cự vạn."',
    bestPalace: 'Mệnh Cung (Hợi, Tý), Tài Bạch Cung, Điền Trạch Cung',
    worstPalace: 'Mệnh Cung (Ngọ vị lạc hãm)',
    career: 'Bất động sản, tài chính, thiết kế mỹ thuật, giáo dục, tâm lý học, dịch vụ cao cấp',
    relationship: 'Dịu dàng, sâu sắc, hết lòng vì người thân; cần không gian an yên tinh thần',
    wealth: 'Nguồn tài phú thịnh vượng, đặc biệt có duyên lớn với đất đai, nhà cửa và cổ phiếu giá trị',
    health: 'Hành Thủy: Chú ý khí huyết, nội tiết, thị lực và giấc ngủ',
  },
  '贪狼': {
    niHaixia: 'Tham Lang là ngôi sao dục vọng, đa tài, giao tế khéo léo và mang phong vị tâm linh huyền học. Gặp Hỏa Tinh hoặc Linh Tinh đồng cung tạo thành cách cục "Hỏa Tham" hoặc "Linh Tham" cự phú phát tài nhanh chóng. Tham Lang ưa thích học hỏi nhiều lĩnh vực, về hậu vận thường quy hướng Phật Đạo hoặc triết lý.',
    classical: 'Cổ quyết: "Tham Lang nhập miếu đa tài nghệ, kiến Hỏa Linh vi hoạch phát chi tài."',
    bestPalace: 'Mệnh Cung (Thìn Tuất Sửu Mùi), Tài Bạch Cung',
    worstPalace: 'Phu Thê Cung (dễ vướng đào hoa ngoài luồng)',
    career: 'Kinh doanh buôn bán, giải trí, truyền thông, đối ngoại ngoại giao, tâm linh văn hóa',
    relationship: 'Sức hút cá nhân lớn, giao tế rộng; cần tỉnh táo giữ gìn ranh giới gia đình',
    wealth: 'Tài vận nhanh nhạy, có cơ hội bứt phá bất ngờ nhưng phải biết điểm dừng để bảo toàn',
    health: 'Hành Mộc đới Thủy: Chú ý gan mật, hệ bài tiết, tránh rượu bia thức khuya',
  },
  '巨门': {
    niHaixia: 'Cự Môn là ám tinh chủ về ngôn từ, khẩu tài, sự hoài nghi và phản biện sâu sắc. Đắc miếu tại Tý Ngọ thành cách "Thạch Trung Ẩn Ngọc" (ngọc giấu trong đá) học thức uyên bác, hùng biện đệ nhất thiên hạ. Cự Môn rất kỵ gặp Hóa Kỵ hay Hỏa Linh vì dễ sinh khẩu thiệt thị phi, kiện tụng.',
    classical: 'Cổ quyết: "Cự Môn tại Tý Ngọ thạch trung ẩn ngọc, tài hoa trác tuyệt, phú quý danh dương."',
    bestPalace: 'Quan Lộc Cung, Mệnh Cung (Tý, Ngọ)',
    worstPalace: 'Nô Bộc Cung, Phu Thê Cung',
    career: 'Luật sư, nhà ngoại giao, diễn giả, giảng viên, nhà báo, chuyên gia tư vấn chiến lược',
    relationship: 'Thường nói lời thẳng thắn dễ làm tổn thương đối phương; nên học cách lắng nghe',
    wealth: 'Lấy khẩu tài và chuyên môn làm đòn bẩy tạo dựng tài sản, hạn chế tranh chấp hợp đồng',
    health: 'Hành Thủy: Chú ý họng, phế quản, đường tiêu hóa và áp lực tinh thần',
  },
  '天相': {
    niHaixia: 'Thiên Tướng là tướng ấn của triều đình, trung trực, ngay thẳng, mẫn cán và có tinh thần phụng sự cao. Người có Thiên Tướng đóng Mệnh phong nhã, coi trọng danh dự chữ tín, phù hợp vai trò phó tướng, giám đốc điều hành (COO), trợ thủ đắc lực cho người đứng đầu.',
    classical: 'Cổ quyết: "Thiên Tướng nãi tư thừa chi tinh, chưởng ấn tín tài lộc, xử thế khoan hòa quang minh."',
    bestPalace: 'Mệnh Cung, Quan Lộc Cung',
    worstPalace: 'Tật Ách Cung',
    career: 'Quản trị điều hành, công quyền, luật pháp, trợ lý cấp cao, y tế dược phẩm',
    relationship: 'Chân thành, biết chăm sóc bạn đời, đời sống vợ chồng coi trọng danh dự nề nếp',
    wealth: 'Thu nhập vững vàng từ bổng lộc chức vị, uy tín càng lớn tài lộc càng sung túc',
    health: 'Hành Thủy: Chú ý bàng quang, thận, da liễu và huyết dịch',
  },
  '天梁': {
    niHaixia: 'Thiên Lương là ấm tinh, thọ tinh, sao của sự che chở, y dược và đạo lý làm người. Người Mệnh Thiên Lương mang phong thái người anh lớn, từ bi, sẵn sàng giúp đỡ người khác mà không tính toán. Thiên Lương hội ngộ Thái Dương thành cách "Dương Lương Xương Lộc" công danh hiển hách, thi cử đỗ đầu.',
    classical: 'Cổ quyết: "Thiên Lương ấm tinh vi thọ khảo chi thần, hóa hung vi cát, nhân từ bác ái."',
    bestPalace: 'Mệnh Cung, Phúc Đức Cung, Quan Lộc Cung',
    worstPalace: 'Tài Bạch Cung (ít tham lam tích lũy cá nhân)',
    career: 'Y dược, giáo dục, từ thiện xã hội, tư pháp kiểm toán, nghiên cứu tôn giáo triết học',
    relationship: 'Hết lòng vì bạn đời và con cái, bao dung độ lượng; gia đình hòa thuận',
    wealth: 'Tài sản tích lũy bình hòa, hưởng phúc ấm tổ tiên và hậu vận thanh nhàn phú quý',
    health: 'Hành Thổ: Chú ý xương cốt, tỳ vị; sao thọ tinh nên thường trường thọ bình an',
  },
  '七杀': {
    niHaixia: 'Thất Sát là dũng tướng tiên phong, mang tính sát phạt cương quyết, sẵn sàng đương đầu với nghịch cảnh hiểm nguy. Người Mệnh Thất Sát có chí lớn, hành động dứt khoát, không lùi bước trước khó khăn. Thất Sát tại Dần Thân tạo thế "Thất Sát Triều Đẩu" nắm đại quyền trong tay, xuất tướng nhập tướng.',
    classical: 'Cổ quyết: "Thất Sát triều đẩu tước lộc vinh hoa, nhất sinh hiển đạt, uy chấn biên cương."',
    bestPalace: 'Mệnh Cung (Dần, Thân), Quan Lộc Cung',
    worstPalace: 'Phu Thê Cung, Tật Ách Cung',
    career: 'Lực lượng vũ trang, chỉ huy tác chiến, sản xuất công nghiệp, khởi nghiệp mạo hiểm, quản lý dự án lớn',
    relationship: 'Cá tính mạnh mẽ độc lập nên đường tình cảm cần người bạn đời nhẫn nại, hiểu chuyện',
    wealth: 'Có năng lực bứt phá tài chính từ gian khó, hậu vận gặt hái thành quả xứng đáng',
    health: 'Hành Kim đới Hỏa: Chú ý hô hấp, xương khớp, đề phòng chấn thương ngoại cảnh',
  },
  '破军': {
    niHaixia: 'Phá Quân là dũng tướng phá trận, chủ về khai phá cái mới, đập tan định kiến cũ để tái thiết trật tự. Người Mệnh Phá Quân tiên phong, không thích đi theo lối mòn, dám nghĩ dám làm. Phá Quân tại Tý Ngọ đắc miếu anh hùng cái thế. Đời người Phá Quân thường trải qua vài lần lột xác biến động lớn để vươn tới đỉnh cao.',
    classical: 'Cổ quyết: "Phá Quân tại Tý Ngọ cung vi thượng cách, khai phong phá lãng, vạn lý phong vân."',
    bestPalace: 'Mệnh Cung (Tý, Ngọ), Quan Lộc Cung',
    worstPalace: 'Phu Thê Cung, Huynh Đệ Cung',
    career: 'Công nghệ đổi mới, cải cách doanh nghiệp, đầu tư mạo hiểm, xây dựng công trình, khai hoang dự án',
    relationship: 'Cảm xúc mạnh mẽ, yêu ghét rõ ràng; cần sự đồng điệu tâm hồn để tránh đổ vỡ',
    wealth: 'Kiếm tiền từ các lĩnh vực tiên phong, dòng tiền luân chuyển lớn, cần kỷ luật tài chính',
    health: 'Hành Thủy: Chú ý thận, tiêu hóa, hệ thần kinh; tránh làm việc kiệt sức',
  },
};

export default function StarDetailPanel({ star, palaceName, onClose }: StarDetailPanelProps) {
  if (!star) return null;
  const detail = STAR_DETAIL[star.name];
  const starNameVi = toVietnameseStar(star.name);
  const palaceNameVi = palaceName ? toVietnamesePalace(palaceName) : undefined;
  const starDesc = STAR_DESCRIPTIONS[star.name];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl p-6 card-glass overflow-hidden max-h-[85vh] flex flex-col"
          style={{ border: '1px solid var(--t-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wide" style={{ color: 'var(--t-gold)' }}>
                  {starNameVi}
                </h2>
                {star.type === 'major' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-500/90 bg-amber-500/10">
                    Chính Tinh
                  </span>
                )}
                {palaceNameVi && (
                  <span className="text-xs text-sky-400 font-medium">
                    · Tọa thủ {palaceNameVi}
                  </span>
                )}
              </div>
              {starDesc && (
                <p className="text-[11px] mt-1 text-slate-400">
                  {starDesc.nature} · Ngũ hành: {starDesc.element} · {starDesc.keywords}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors w-7 h-7 rounded-full flex items-center justify-center bg-white/5"
            >
              ✕
            </button>
          </div>

          {/* Body nội dung cuộn */}
          <div className="overflow-y-auto py-4 space-y-4 pr-1 flex-1 text-[12px] leading-relaxed">
            {detail ? (
              <>
                {/* Luận giải Nghê Hải Hà */}
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="text-[11px] font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <span>✦</span> NGHÊ HẢI HÀ LUẬN GIẢI
                  </div>
                  <p className="text-slate-200">{detail.niHaixia}</p>
                </div>

                {/* Điển tịch cổ quyết */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[11px] font-semibold text-sky-400 mb-1 flex items-center gap-1.5">
                    <span>📜</span> ĐIỂN TỊCH CỔ QUYẾT
                  </div>
                  <p className="text-slate-300 italic">{detail.classical}</p>
                </div>

                {/* 4 Trụ cột luận đoán */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-amber-400 font-semibold mb-1">💼 Sự Nghiệp & Định Hướng</div>
                    <p className="text-slate-300 text-[11px]">{detail.career}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-emerald-400 font-semibold mb-1">💰 Tài Lộc & Quản Lý</div>
                    <p className="text-slate-300 text-[11px]">{detail.wealth}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-rose-400 font-semibold mb-1">❤️ Tình Duyên & Gia Đạo</div>
                    <p className="text-slate-300 text-[11px]">{detail.relationship}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-blue-400 font-semibold mb-1">🌿 Sức Khỏe & Dưỡng Sinh</div>
                    <p className="text-slate-300 text-[11px]">{detail.health}</p>
                  </div>
                </div>

                {/* Cung vị tối thắng và lưu ý */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                    <div className="text-emerald-400 font-semibold text-[11px] mb-0.5">Cung vị tối hỷ</div>
                    <div className="text-emerald-300/80 text-[11px]">{detail.bestPalace}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5">
                    <div className="text-rose-400 font-semibold text-[11px] mb-0.5">Cung vị cần lưu ý</div>
                    <div className="text-rose-300/80 text-[11px]">{detail.worstPalace}</div>
                  </div>
                </div>
              </>
            ) : (
              /* Phụ tinh / Cát tinh / Sát tinh */
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-amber-400 font-semibold text-sm">
                  {starNameVi} ({star.type === 'lucky' ? 'Cát Tinh' : star.type === 'sha' ? 'Sát Tinh' : 'Phụ Tinh'})
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {star.name === '文昌' && 'Văn Xương tọa cung, chủ đường thi cử, văn bằng, bằng cấp đỗ đạt thuận lợi, giấy tờ khế ước thông hanh.'}
                  {star.name === '文曲' && 'Văn Khúc tọa cung, chủ tài hoa nghệ thuật, khiếu hùng biện giao tiếp, có tài năng thiên bẩm về sáng tạo.'}
                  {star.name === '左辅' && 'Tả Phù tọa cung, chủ quý nhân nâng đỡ, bạn bè đồng nghiệp chung tay giúp sức, gặp dữ hóa lành.'}
                  {star.name === '右弼' && 'Hữu Bật tọa cung, chủ trợ lực âm thầm, nhiều nữ quý nhân hỗ trợ, vượt qua thử thách êm đẹp.'}
                  {star.name === '天魁' && 'Thiên Khôi tọa cung, là Thiên Ất Quý Nhân, gặp sự cố có quý nhân chỉ đường dẫn lối, đứng đầu vượt trội.'}
                  {star.name === '天钺' && 'Thiên Việt tọa cung, là Ngọc Đường Quý Nhân, đem lại duyên lành may mắn và sự nâng đỡ quý giá.'}
                  {star.name === '禄存' && 'Lộc Tồn tọa cung, chủ tài lộc vững chắc, tích lũy dồi dào, là ngôi sao giữ tiền bảo thủ nhưng an toàn.'}
                  {star.name === '天马' && 'Thiên Mã tọa cung, chủ biến động, di chuyển, đi xa đắc tài, động trung sinh tài, mở rộng cơ hội.'}
                  {star.name === '地空' && 'Địa Không tọa cung, chủ hao tổn hư vô, tâm lý dễ chông chênh hoặc hướng về tôn giáo triết học.'}
                  {star.name === '地劫' && 'Địa Kiếp tọa cung, chủ bất ngờ biến động vật chất, nên cẩn trọng tiền bạc, tránh đầu cơ quá đà.'}
                  {star.name === '火星' && 'Hỏa Tinh tọa cung, tính cách nóng nảy, gấp gáp, nhưng nếu gặp Tham Lang đồng cung lại thành cách Hỏa Tham bạo phát.'}
                  {star.name === '铃星' && 'Linh Tinh tọa cung, ám sát ngấm ngầm, cần phòng tiểu nhân hoặc mâu thuẫn âm ỉ, nên làm việc công minh.'}
                  {star.name === '擎羊' && 'Kình Dương tọa cung, tính cương trực, dễ va chạm hình thương hoặc xung đột, cần học chữ Nhẫn.'}
                  {star.name === '陀罗' && 'Đà La tọa cung, chủ sự dùng dằng, trở ngại kéo dài, việc đến chậm nhưng đòi hỏi sự kiên trì bền bỉ.'}
                  {!['文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '禄存', '天马', '地空', '地劫', '火星', '铃星', '擎羊', '陀罗'].includes(star.name) &&
                    `Ngôi sao ${starNameVi} hỗ trợ tăng cường tính chất tốt đẹp hoặc tôi luyện thêm bản lĩnh tại ${palaceNameVi || 'cung vị này'}.`}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
