import { NextRequest } from 'next/server';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import {
  toVietnameseStar,
  toVietnamesePalace,
  toVietnameseSiHua,
  toVietnameseBrightness,
  toVietnameseJu,
  STEMS_VI,
  BRANCHES_VI,
} from '@/lib/ziwei/vietnamese';
import { streamOpenAiResponse, type AiMessage } from '@/lib/ai/client';
import { aiQueue } from '@/lib/ai/queue';

export const runtime = 'nodejs';

function summarizePalace(palace?: Palace): string {
  if (!palace) return 'Không có dữ liệu';
  const major = palace.stars
    .filter(s => s.type === 'major')
    .map(s => {
      const b = toVietnameseBrightness(s.brightnessRaw);
      const sh = s.siHua ? ` Hóa ${toVietnameseSiHua(s.siHua)}` : '';
      return `${toVietnameseStar(s.name)}${b ? `(${b})` : ''}${sh}`;
    });

  const other = palace.stars
    .filter(s => s.type !== 'major')
    .map(s => {
      const sh = s.siHua ? ` Hóa ${toVietnameseSiHua(s.siHua)}` : '';
      return `${toVietnameseStar(s.name)}${sh}`;
    });

  const starText = major.length > 0
    ? major.join(', ')
    : `Vô Chính Diệu${palace.borrowedStars?.length ? ` (Mượn: ${palace.borrowedStars.map(s => toVietnameseStar(s)).join(', ')})` : ''}`;

  return `${starText}${other.length > 0 ? ` | Phụ tinh: ${other.join(', ')}` : ''}`;
}

function buildDualChartContext(chartA: ZiweiChart, chartB: ZiweiChart): string {
  const getPalace = (chart: ZiweiChart, namePattern: string) =>
    chart.palaces.find(p => p.name.includes(namePattern));

  const formatPerson = (chart: ZiweiChart, label: string) => {
    const { birthInfo, lunarInfo, mingGongBranch, shenGongBranch, wuxingJuName } = chart;
    const mingPalace = chart.palaces.find(p => p.branch === mingGongBranch);
    const fuqiPalace = getPalace(chart, '夫妻');
    const fudePalace = getPalace(chart, '福德');
    const guanPalace = getPalace(chart, '官禄');
    const caiPalace = getPalace(chart, '财帛');

    return `=== LÁ SỐ ${label}: ${birthInfo.name || label} ===
- Giới tính: ${birthInfo.gender === 'male' ? 'Nam' : 'Nữ'}
- Năm sinh: ${birthInfo.year} (Âm lịch: ${lunarInfo.lunarYear} - ${STEMS_VI[lunarInfo.yearStem]} ${BRANCHES_VI[lunarInfo.yearBranch]})
- Mệnh Cung tại: ${BRANCHES_VI[mingGongBranch]} (${summarizePalace(mingPalace)})
- Thân Cung tại: ${BRANCHES_VI[shenGongBranch]}
- Cục số: ${toVietnameseJu(wuxingJuName)}
- Cung Phu Thê: tại ${fuqiPalace ? BRANCHES_VI[fuqiPalace.branch] : '?'} (${summarizePalace(fuqiPalace)})
- Cung Phúc Đức: tại ${fudePalace ? BRANCHES_VI[fudePalace.branch] : '?'} (${summarizePalace(fudePalace)})
- Cung Quan Lộc: tại ${guanPalace ? BRANCHES_VI[guanPalace.branch] : '?'} (${summarizePalace(guanPalace)})
- Cung Tài Bạch: tại ${caiPalace ? BRANCHES_VI[caiPalace.branch] : '?'} (${summarizePalace(caiPalace)})
`;
  };

  return `${formatPerson(chartA, 'A')}\n${formatPerson(chartB, 'B')}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chartA, chartB, question } = body as {
      chartA: ZiweiChart;
      chartB: ZiweiChart;
      question?: string;
    };

    if (!chartA || !chartB || !chartA.palaces || !chartB.palaces) {
      return new Response(JSON.stringify({ error: 'Dữ liệu của 2 lá số không đầy đủ' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dualContext = buildDualChartContext(chartA, chartB);

    const systemPrompt = `Bạn là bậc thầy Tử Vi Đẩu Số thông tuệ, chuyên gia phân tích Song bàn đối chiếu (Hợp số / Hợp hôn / Hợp tác) theo trường phái Thiên Kỷ Nghê Hải Hà và học thuật Dịch lý chính thống.

NGUYÊN TẮC HỢP SỐ THEO THẦY NGHÊ HẢI HÀ:
1. "Xem hôn nhân thì ngoài cung Phu Thê, bắt buộc phải đồng thời quan sát cung Phúc Đức." Cung Phúc Đức thể hiện quan niệm sống, nội tâm, sự bao dung và thọ khảo tinh thần.
2. Tương tác sao Mệnh và Phu Thê hai chiều:
   - Cung Phu Thê của A có tương ứng với Mệnh của B không và ngược lại.
   - Các cặp sao hòa hợp cổ điển: Tử Vi - Thiên Phủ (Đế tinh gặp Tài khố); Thái Dương - Thái Âm (Âm Dương hòa hợp); Thiên Tướng - Thiên Lương (Trợ tá gặp ấm che).
   - Tứ Hóa tương tác: Hóa Lộc, Hóa Khoa đem lại thiện duyên quý mến; Hóa Kỵ xung chiếu cần học cách cảm thông và nhường nhịn.
3. Hợp tác làm ăn: Chú trọng cung Quan Lộc, Tài Bạch và Huynh Đệ/Nô Bộc.
4. Triết lý chỉ đạo: "Không có cặp số nào là tuyệt đối hoàn hảo, cũng không có cặp số nào là tuyệt đối xung đột không thể hóa giải." Tử Vi chỉ ra tính cách và năng lượng để hai bên biết cách thấu hiểu, bù trừ và cùng nhau vun đắp.

HÃY PHÂN TÍCH VÀ TRÌNH BÀY THEO CẤU TRÚC SAU (sử dụng Markdown rõ ràng):
**【TỔNG QUAN DUYÊN PHẬN & NĂNG LƯỢNG TƯƠNG HỢP】**
Khái quát về duyên nợ, mức độ tương hợp ngũ hành và ấn tượng năng lượng giữa 2 lá số.

**【HÒA HỢP TÍNH CÁCH & NHÂN SINH QUAN】**
So sánh bản tính tiên thiên (cung Mệnh và Thân), cách nhìn nhận cuộc sống và phong cách ứng xử của hai người.

**【PHƯƠNG DIỆN TÌNH CẢM & HÔN NHÂN GIA ĐẠO】**
Đối chiếu cung Phu Thê và Phúc Đức của cả hai bên; phân tích độ bền chặt, sự gắn kết và khả năng đồng hành lâu dài.

**【PHƯƠNG DIỆN TÀI LỘC & CỘNG HƯỞNG SỰ NGHIỆP】**
Đánh giá mức độ bổ trợ về công việc, tiền bạc, có phải là đòn bẩy may mắn nâng đỡ nhau phát triển hay không.

**【ĐIỂM NGHẼN MÂU THUẪN & NGUY CƠ TIỀM ẨN】**
Những điểm bất đồng có thể xảy ra trong giao tiếp, sinh hoạt hoặc tài chính cần tỉnh thức lưu tâm.

**【LỜI KHUYÊN DUNG HÒA & HÀNH ĐỘNG THỰC TẾ】**
Những nguyên tắc vàng cụ thể để hai người dung hòa, giữ gìn hòa khí và cùng tạo dựng hạnh phúc bền lâu.

DỮ LIỆU ĐỐI CHIẾU HAI LÁ SỐ:
${dualContext}
`;

    const userPrompt = question && question.trim()
      ? `Người dùng đặt câu hỏi cụ thể cho cuộc hợp số này: "${question}". Xin hãy ưu tiên giải đáp thấu đáo vấn đề này dựa trên song bàn đối chiếu.`
      : `Xin hãy phân tích toàn diện cuộc hợp số giữa Bên A và Bên B theo cấu trúc chuẩn trên.`;

    const aiMessages: AiMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const isVip = aiQueue.checkIsVip(req, body.vipKey);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let releaseSlot: (() => void) | null = null;
        try {
          if (isVip) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'vip', message: 'Lệnh Bài Tri Kỷ đã ứng nghiệm' })}\n\n`)
            );
          }

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
                    message: `Lúc này trong tĩnh thất, bần đạo đang dốc lòng nhập định thôi diễn thiên cơ cho các vị đạo hữu phía trước. Kính mời đạo hữu hoan hỉ tĩnh tâm thưởng một chung trà, người đang ở vị trí số ${position} trong hàng đợi...`,
                  })}\n\n`
                )
              );
            },
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));

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
    return new Response(JSON.stringify({ error: error?.message || 'Lỗi xử lý hợp số' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
