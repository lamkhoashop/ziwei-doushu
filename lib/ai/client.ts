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

  const model =
    process.env.AI_MODEL ||
    process.env.OPENAI_MODEL ||
    process.env.DEEPSEEK_MODEL ||
    process.env.MIMO_MODEL ||
    'gpt-4o-mini';

  return { apiKey, baseURL, model };
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
          'HTTP-Referer': 'http://localhost:3005',
          'X-Title': 'Tu Vi Dau So',
        },
        body: JSON.stringify({
          model,
          messages,
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
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
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
                    const sseLine = `data: ${JSON.stringify({ delta: { text: deltaText } })}\n\n`;
                    controller.enqueue(encoder.encode(sseLine));
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
