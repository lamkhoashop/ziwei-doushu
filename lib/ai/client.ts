/**
 * Client kết nối AI Model theo chuẩn OpenAI Compatible API
 * Hỗ trợ linh hoạt OpenAI, DeepSeek, Claude, Gemini hoặc OpenRouter
 * Cung cấp luồng SSE trực tiếp tương thích với Frontend.
 * Hỗ trợ nhiều API Key (xoay vòng Round-Robin & Failover tự động chuyển key khi gặp lỗi 429 Rate Limit).
 */

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

let globalKeyIndex = 0;

export function getApiKeys(): string[] {
  const raw =
    process.env.AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.MIMO_API_KEY ||
    '';
  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k && !k.includes('your-'));
}

export function getAiConfig(): AiConfig {
  const keys = getApiKeys();
  const apiKey = keys.length > 0 ? keys[0] : '';

  let baseURL =
    process.env.AI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    process.env.MIMO_BASE_URL ||
    'https://api.openai.com/v1';

  // Chuẩn hóa loại bỏ dấu gạch chéo cuối
  baseURL = baseURL.replace(/\/+$/, '');

  let model =
    process.env.AI_MODEL ||
    process.env.OPENAI_MODEL ||
    process.env.DEEPSEEK_MODEL ||
    process.env.MIMO_MODEL ||
    'gpt-4o-mini';

  // Chuẩn hóa model ID nếu người dùng điền tên hiển thị
  const normalized = model.trim().toLowerCase();
  if (
    normalized.includes('deepseek v4.1 flash uncensored') ||
    normalized.includes('deepseek-v4.1-flash-uncensored') ||
    normalized.includes('deepseek v4.1 flash')
  ) {
    if (baseURL.includes('wusrouter')) {
      model = 'uncensored/deepseek-v4.1-flash:free';
    }
  }

  return { apiKey, baseURL, model };
}

/**
 * Chuẩn hóa danh sách messages trước khi gửi tới Upstream AI:
 * Với các proxy hoặc mô hình uncensored/jailbreak (như WusRouter),
 * `role: 'system'` thường bị proxy bỏ qua hoặc ghi đè bằng prompt nội bộ của proxy.
 * Do đó, ta gộp toàn bộ hướng dẫn hệ thống và dữ liệu lá số vào đầu tin nhắn 'user' đầu tiên,
 * đồng thời lọc sạch các từ rác còn sót lại từ lịch sử chat.
 */
export function prepareMessagesForUpstream(messages: AiMessage[]): AiMessage[] {
  let systemContent = '';
  const result: AiMessage[] = [];

  for (const m of messages) {
    if (m.role === 'system') {
      systemContent += (systemContent ? '\n\n' : '') + m.content;
    } else {
      // Làm sạch các từ rác proxy nếu có trong lịch sử trò chuyện
      const cleanContent = m.content
        .replace(/epileptichurts/gi, '')
        .replace(/WsThanhDieu/gi, '')
        .replace(/^I am ready,?\s*WusRouter\.Com\.?\s*/gi, '')
        .trim();

      if (cleanContent) {
        result.push({ role: m.role, content: cleanContent });
      }
    }
  }

  // Nếu không có systemContent thì trả về danh sách đã lọc
  if (!systemContent) {
    return result.length > 0 ? result : messages;
  }

  // Nhúng toàn bộ systemContent vào tin nhắn 'user' đầu tiên để đảm bảo 100% dữ liệu được truyền tới model
  const firstUserIdx = result.findIndex(m => m.role === 'user');
  if (firstUserIdx >= 0) {
    result[firstUserIdx].content =
      `[HƯỚNG DẪN HỆ THỐNG & DỮ LIỆU LÁ SỐ TỬ VI]:\n${systemContent}\n\n[YÊU CẦU CỦA ĐƯƠNG SỐ]:\n${result[firstUserIdx].content}`;
  } else {
    result.unshift({
      role: 'user',
      content: `[HƯỚNG DẪN HỆ THỐNG & DỮ LIỆU LÁ SỐ TỬ VI]:\n${systemContent}\n\nXin hãy luận giải lá số theo đúng các đề mục trên.`,
    });
  }

  return result;
}

/**
 * Tạo phản hồi dạng luồng (Server-Sent Events) tương thích với ChatPanel & InsightPanel
 * Tự động xoay vòng nhiều key và chuyển sang key kế tiếp nếu gặp lỗi 429
 */
export async function streamOpenAiResponse(messages: AiMessage[]): Promise<Response> {
  const keys = getApiKeys();
  const { baseURL, model } = getAiConfig();

  // Kiểm tra nếu chưa cấu hình API Key
  if (keys.length === 0) {
    const hintMessage =
      `**【THÔNG BÁO TỪ HỆ THỐNG】**\n\n` +
      `Chưa tìm thấy \`AI_API_KEY\` trong cấu hình môi trường.\n\n` +
      `Để kích hoạt tính năng AI Luận Giải Mệnh Lý thông minh:\n` +
      `1. Mở file \`.env.local\` trong thư mục dự án \`E:\\0AITool\\ziwei-doushu\`.\n` +
      `2. Điền khóa API của bạn vào biến \`AI_API_KEY=...\` (Có thể điền nhiều key cách nhau bởi dấu phẩy để tự động giảm tải).\n` +
      `3. (Tùy chọn) Điền \`AI_BASE_URL\` và \`AI_MODEL\` tương ứng.\n\n` +
      `*Lưu ý: Tính năng an sao, xem lá số, đại hạn và nhận diện 41 cách cục hoạt động 100% offline không cần API Key.*`;

    const stream = new ReadableStream({
      start(controller) {
        const payload = `data: ${JSON.stringify({ delta: { text: hintMessage } })}\n\ndata: [DONE]\n\n`;
        controller.enqueue(new TextEncoder().encode(payload));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  }

  const payloadMessages = prepareMessagesForUpstream(messages);
  const endpoint = `${baseURL}/chat/completions`;
  const startIndex = globalKeyIndex++ % keys.length;
  let lastErrorMsg = '';

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const currentKey = keys[(startIndex + attempt) % keys.length];

    try {
      const upstreamRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://tuvi.lamkhoa.store',
          'X-Title': 'Tu Vi Dau So',
        },
        body: JSON.stringify({
          model,
          messages: payloadMessages,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text().catch(() => '');
        let errorMsg = `Lỗi từ nhà cung cấp AI (${upstreamRes.status}): `;
        try {
          const parsed = JSON.parse(errText);
          errorMsg += parsed.error?.message || errText;
        } catch {
          errorMsg += errText || upstreamRes.statusText;
        }

        // Nếu bị Rate limit (429) và còn key dự phòng, thử key tiếp theo
        if (upstreamRes.status === 429 && attempt < keys.length - 1) {
          continue;
        }

        lastErrorMsg = errorMsg;
        break;
      }

      if (!upstreamRes.body) {
        lastErrorMsg = 'Upstream không trả về response body';
        break;
      }

      // Biến đổi luồng từ OpenAI-compatible thành SSE định dạng delta.text
      const reader = upstreamRes.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      const transformStream = new ReadableStream({
        async start(controller) {
          let buffer = '';
          let carry = '';
          let preambleBuffer = '';
          let streamStarted = false;

          const sendRawDelta = (str: string) => {
            if (!str) return;
            const sseLine = `data: ${JSON.stringify({ delta: { text: str } })}\n\n`;
            controller.enqueue(encoder.encode(sseLine));
          };

          const emitDelta = (rawChunk: string) => {
            if (!rawChunk) return;

            let text = carry + rawChunk;
            carry = '';

            // Lọc bỏ triệt để các token nội bộ của proxy jailbreak ở bất kỳ vị trí nào
            text = text.replace(/epileptichurts/gi, '');
            text = text.replace(/WsThanhDieu/gi, '');

            // Xử lý trường hợp từ khóa bị chia cắt giữa các chunks (ví dụ chunk A kết thúc bằng "epilep")
            const lower = text.toLowerCase();
            const blacklist = ['epileptichurts', 'wusrouter.com', 'wsthanhdieu'];
            let partialLen = 0;
            for (const word of blacklist) {
              for (let l = Math.min(word.length - 1, text.length); l > 0; l--) {
                if (word.startsWith(lower.slice(-l))) {
                  if (l > partialLen) partialLen = l;
                }
              }
            }

            if (partialLen > 0) {
              carry = text.slice(-partialLen);
              text = text.slice(0, -partialLen);
            }

            if (!text) return;

            // Nếu luồng chưa bắt đầu: kiểm tra và lọc sạch lời độc thoại/nháp tư duy trước nội dung chính thức
            if (!streamStarted) {
              preambleBuffer += text;

              // 1. Kiểm tra nếu có phân cách chuyển từ nháp tư duy sang bài luận chính thức:
              // Mô hình uncensored thường nháp tư duy rồi dùng \n---\n hoặc \n\n---\n trước khi xuất bài luận thật
              const separatorMatch = preambleBuffer.match(/\n\s*---\s*\n+/);
              if (separatorMatch && typeof separatorMatch.index === 'number') {
                const afterSeparator = preambleBuffer.slice(separatorMatch.index + separatorMatch[0].length);
                if (afterSeparator.trim().length > 0) {
                  preambleBuffer = '';
                  streamStarted = true;
                  sendRawDelta(afterSeparator);
                  return;
                }
              }

              // 2. Hoặc nếu bài luận bắt đầu trực tiếp bằng tiêu đề chính thức ngay từ đầu:
              // Ví dụ: # LUẬN GIẢI, **LÁ SỐ, **【, ## 
              const titleMatch = preambleBuffer.match(/(?:^|\n)(#+\s+|(?:\*\*)?【|(?:\*\*)?LÁ SỐ)/);
              if (titleMatch && typeof titleMatch.index === 'number') {
                const startIdx = titleMatch.index + (titleMatch[0].startsWith('\n') ? 1 : 0);
                if (startIdx < 30) {
                  const validText = preambleBuffer.slice(startIdx);
                  preambleBuffer = '';
                  streamStarted = true;
                  sendRawDelta(validText);
                  return;
                }
              }

              // 3. Fallback: Nếu phần nháp dài quá 3500 ký tự mà chưa thấy separator
              if (preambleBuffer.length > 3500) {
                sendRawDelta(preambleBuffer);
                preambleBuffer = '';
                streamStarted = true;
              }
            } else {
              sendRawDelta(text);
            }
          };

          const flushCarry = () => {
            let remaining = (preambleBuffer + carry)
              .replace(/epileptichurts/gi, '')
              .replace(/WsThanhDieu/gi, '')
              .replace(/^(?:I am ready,?\s*WusRouter\.Com\.?\s*)+/i, '');

            if (remaining) {
              const separatorMatch = remaining.match(/\n\s*---\s*\n+/);
              if (separatorMatch && typeof separatorMatch.index === 'number') {
                remaining = remaining.slice(separatorMatch.index + separatorMatch[0].length);
              }
              if (remaining.trim()) {
                sendRawDelta(remaining);
              }
            }
            preambleBuffer = '';
            carry = '';
          };

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                flushCarry();
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                break;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                const rawData = trimmed.slice(6);
                if (rawData === '[DONE]') {
                  flushCarry();
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(rawData);
                  const deltaText =
                    parsed.choices?.[0]?.delta?.content ||
                    parsed.choices?.[0]?.text ||
                    parsed.delta?.text ||
                    '';
                  if (deltaText) {
                    emitDelta(deltaText);
                  }
                } catch {
                  // Bỏ qua dòng json không hợp lệ
                }
              }
            }
          } catch (err: any) {
            const errPayload = `data: ${JSON.stringify({ delta: { text: `\n\n[Lỗi luồng: ${err?.message || 'ngắt kết nối'}]` } })}\n\ndata: [DONE]\n\n`;
            controller.enqueue(encoder.encode(errPayload));
            controller.close();
          }
        },
      });

      return new Response(transformStream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    } catch (err: any) {
      lastErrorMsg = `Lỗi kết nối tới AI API: ${err?.message || String(err)}`;
      if (attempt < keys.length - 1) {
        continue;
      }
    }
  }

  // Nếu tất cả các key đều lỗi
  const stream = new ReadableStream({
    start(controller) {
      const payload = `data: ${JSON.stringify({ delta: { text: `⚠️ ${lastErrorMsg}` } })}\n\ndata: [DONE]\n\n`;
      controller.enqueue(new TextEncoder().encode(payload));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
