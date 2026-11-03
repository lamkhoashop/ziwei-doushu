import { NextRequest } from 'next/server';
import type { ZiweiChart } from '@/lib/ziwei/types';
import {
  toVietnameseStar,
  toVietnamesePalace,
  toVietnameseSiHua,
  toVietnameseBrightness,
  toVietnameseJu,
  toVietnamesePatternName,
  STEMS_VI,
  BRANCHES_VI,
} from '@/lib/ziwei/vietnamese';
import { detectPatterns, getMingGongSummary } from '@/lib/ziwei/patterns';
import { streamOpenAiResponse, type AiMessage } from '@/lib/ai/client';
import { aiQueue } from '@/lib/ai/queue';

export const runtime = 'nodejs';

/**
 * Xây dựng báo cáo dữ liệu lá số Tử Vi có cấu trúc mạch lạc để đưa vào System Prompt
 */
function buildChartContext(chart: ZiweiChart): string {
  const { birthInfo, lunarInfo, palaces, mingGongBranch, shenGongBranch, wuxingJuName, daXians, currentDaXianIndex } = chart;
  const patterns = detectPatterns(chart);
  const mingSummary = getMingGongSummary(chart);
  const currentDx = daXians[currentDaXianIndex];

  const lines: string[] = [];

  lines.push('=== DỮ LIỆU LÁ SỐ TỬ VI ĐẨU SỐ (BẢN MỆNH) ===');
  if (birthInfo.name) lines.push(`Họ và tên: ${birthInfo.name}`);
  lines.push(`Giới tính: ${birthInfo.gender === 'male' ? 'Nam mạng' : 'Nữ mạng'}`);
  lines.push(`Dương lịch: Ngày ${birthInfo.day} tháng ${birthInfo.month} năm ${birthInfo.year}`);
  lines.push(
    `Âm lịch: Ngày ${lunarInfo.lunarDay} tháng ${lunarInfo.lunarMonth} năm ${lunarInfo.lunarYear} (${STEMS_VI[lunarInfo.yearStem]} ${BRANCHES_VI[lunarInfo.yearBranch]})${lunarInfo.isLeapMonth ? ' [Tháng nhuận]' : ''}`
  );
  lines.push(`Thời khắc sinh: Giờ ${BRANCHES_VI[birthInfo.hour]}`);
  if (birthInfo.city) lines.push(`Nơi sinh: ${birthInfo.city} (Kinh độ: ${birthInfo.longitude?.toFixed(2)}°Đ)`);
  lines.push(`Mệnh cư tại cung: ${BRANCHES_VI[mingGongBranch]}`);
  lines.push(`Thân cư tại cung: ${BRANCHES_VI[shenGongBranch]}`);
  lines.push(`Cục số: ${toVietnameseJu(wuxingJuName)}`);

  if (currentDx) {
    lines.push(
      `Đại Hạn hiện tại: ${currentDx.startAge}–${currentDx.endAge} tuổi, ngự tại ${toVietnamesePalace(currentDx.palaceName)} (Cung vị: ${BRANCHES_VI[currentDx.palaceBranch]})`
    );
  }

  // Khái quát cung Mệnh
  const mingStars = mingSummary.stars.map(s => toVietnameseStar(s));
  lines.push(`Chính tinh cung Mệnh: ${mingStars.length > 0 ? mingStars.join(', ') : 'Vô Chính Diệu (mượn đối cung)'}`);
  if (mingSummary.nature) lines.push(`Tính chất Mệnh chủ: ${mingSummary.nature}`);

  // Tứ Hóa Năm Sinh
  const siHuaList: string[] = [];
  palaces.forEach(p => {
    p.stars.forEach(s => {
      if (s.siHua) {
        siHuaList.push(`${toVietnameseStar(s.name)} Hóa ${toVietnameseSiHua(s.siHua)} (tại ${toVietnamesePalace(p.name)})`);
      }
    });
  });
  if (siHuaList.length > 0) {
    lines.push(`Tứ Hóa Năm Sinh: ${siHuaList.join('; ')}`);
  }

  // 12 Cung vị chi tiết
  lines.push('\n--- CHI TIẾT 12 CUNG VỊ ---');
  palaces.forEach(p => {
    const palaceName = toVietnamesePalace(p.name);
    const branchName = BRANCHES_VI[p.branch];
    const stemName = STEMS_VI[p.stem];
    const isM = p.isMingGong ? ' [MỆNH]' : '';
    const isS = p.isShenGong ? ' [THÂN]' : '';

    const major = p.stars
      .filter(s => s.type === 'major')
      .map(s => {
        const b = toVietnameseBrightness(s.brightnessRaw);
        const sh = s.siHua ? ` Hóa ${toVietnameseSiHua(s.siHua)}` : '';
        return `${toVietnameseStar(s.name)}${b ? `(${b})` : ''}${sh}`;
      });

    const other = p.stars
      .filter(s => s.type !== 'major')
      .map(s => {
        const sh = s.siHua ? ` Hóa ${toVietnameseSiHua(s.siHua)}` : '';
        return `${toVietnameseStar(s.name)}${sh}`;
      });

    let starDesc = '';
    if (major.length > 0) {
      starDesc = `Chính tinh: ${major.join(', ')}`;
    } else {
      const borrowed = p.borrowedStars?.map(s => toVietnameseStar(s)) || [];
      starDesc = `Vô Chính Diệu${borrowed.length > 0 ? ` (Mượn đối cung: ${borrowed.join(', ')})` : ''}`;
    }

    if (other.length > 0) {
      starDesc += ` | Phụ tinh & Sát tinh: ${other.join(', ')}`;
    }

    lines.push(`• ${palaceName} (${stemName} ${branchName})${isM}${isS}: ${starDesc}`);
  });

  // Cách cục kinh điển nhận diện được
  if (patterns.length > 0) {
    lines.push('\n--- CÁCH CỤC KINH ĐIỂN NHẬN DIỆN ĐƯỢC ---');
    patterns.forEach(pt => {
      const nameVi = toVietnamesePatternName(pt.name);
      const palacesVi = pt.palaces.map(pa => toVietnamesePalace(pa)).join(', ');
      lines.push(`* Cách cục [${nameVi}] (Độ cát hung: ${pt.level}) tại ${palacesVi}: ${pt.description}`);
    });
  }

  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chart, messages, vipKey } = body as {
      chart: ZiweiChart;
      messages?: { role: string; content: string }[];
      vipKey?: string;
    };

    if (!chart || !chart.palaces) {
      return new Response(JSON.stringify({ error: 'Dữ liệu lá số (chart) không hợp lệ' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isVip = aiQueue.checkIsVip(req, vipKey);
    const chartContext = buildChartContext(chart);

    const systemPrompt = `Bạn là bậc thầy Tử Vi Đẩu Số thông tuệ, điềm tĩnh, thấu tình đạt lý, am tường sâu sắc trường phái Thiên Kỷ của cụ Nghê Hải Hà (倪海厦) kết hợp với Dịch lý và học thuật Tử Vi Đẩu Số chính thống Việt Nam.

NGUYÊN TẮC LUẬN GIẢI:
1. Triết lý chỉ đạo: "Tri mệnh để tạo vận" (Biết mệnh để tạo dựng vận số, hiểu mình để làm chủ cuộc đời). Tuyệt đối KHÔNG phán xét mê tín dị đoan, không dọa dẫm tiêu cực. Mọi thách thức hay sát tinh đều được nhìn nhận như môi trường trui rèn bản lĩnh và có giải pháp hóa giải bằng nhận thức và hành động thực tế.
2. Về thuật pháp:
   - Dựa trên Mệnh Cung, Thân Cung, Cục số, Tam phương tứ chính (Mệnh - Tài - Quan - Di).
   - "Xem hôn nhân thì ngoài cung Phu Thê bắt buộc phải hội chiếu cung Phúc Đức".
   - Coi trọng Tứ Hóa (Lộc, Quyền, Khoa, Kỵ): Tứ Hóa là bàn tay xoay vần khí số, biến tinh diệu từ tĩnh sang động.
   - Cung Vô Chính Diệu mượn tinh diệu đối cung để luận đoán.
   - Tận dụng thông tin các cách cục kinh điển đã nhận diện để đưa ra phân tích sâu sắc.
3. Phong cách phản hồi:
   - Văn phong tiếng Việt tự nhiên, trang nhã, giàu trí tuệ, thấu hiểu tâm lý con người.
   - Trình bày mạch lạc bằng Markdown rõ ràng, làm nổi bật các đề mục bằng **【Tiêu Đề Mục】** để giao diện hiển thị sang trọng.
   - Luôn kết thúc bằng lời khuyên tu dưỡng, định hướng hành động thiết thực (tâm thế và việc làm cụ thể).

THÔNG TIN LÁ SỐ CỦA ĐƯƠNG SỐ ĐƯỢC CUNG CẤP DƯỚI ĐÂY:
${chartContext}
`;

    const aiMessages: AiMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (Array.isArray(messages) && messages.length > 0) {
      for (const m of messages) {
        if (m.role === 'user' || m.role === 'assistant') {
          aiMessages.push({ role: m.role as 'user' | 'assistant', content: m.content });
        }
      }
    } else {
      aiMessages.push({
        role: 'user',
        content: 'Xin phân tích tổng quan mệnh cách, sự nghiệp, tài lộc, tình cảm và đưa ra lời khuyên định hướng thực tế cho tôi.',
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let releaseSlot: (() => void) | null = null;
        try {
          // Báo tín hiệu VIP nếu hợp lệ
          if (isVip) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'vip', message: 'Lệnh Bài Tri Kỷ đã ứng nghiệm' })}\n\n`)
            );
          }

          // Xin cấp slot hoặc vào hàng đợi nếu đã đủ 10 người
          releaseSlot = await aiQueue.acquireSlot({
            isVip,
            signal: req.signal,
            onQueue: (position, total) => {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'queue',
                    position,
                    total,
                    message: `Lúc này trong tĩnh thất, bần đạo đang dốc lòng nhập định thôi diễn thiên cơ cho các vị đạo hữu phía trước. Thiên cơ huyền ảo, dục tốc bất đạt. Kính mời đạo hữu hoan hỉ tĩnh tâm thưởng một chung trà, người đang ở vị trí số ${position} trong hàng đợi...`,
                  })}\n\n`
                )
              );
            },
          });

          // Khi đã được cấp slot: gửi thông báo bắt đầu
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));

          // Chạy luồng AI từ OpenRouter
          const aiResponse = await streamOpenAiResponse(aiMessages);
          if (!aiResponse.body) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }

          const reader = aiResponse.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err: any) {
          if (err.message !== 'client_aborted') {
            const errPayload = `data: ${JSON.stringify({
              type: 'error',
              delta: { text: `⚠️ ${err?.message || 'Lỗi hàng đợi luận giải'}` },
            })}\n\ndata: [DONE]\n\n`;
            controller.enqueue(encoder.encode(errPayload));
          }
          controller.close();
        } finally {
          if (releaseSlot) {
            releaseSlot();
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Lỗi xử lý yêu cầu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
