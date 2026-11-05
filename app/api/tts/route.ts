import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

function prepareTextForSpeech(raw: string): string {
  if (!raw) return '';
  let s = raw;
  s = s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '');
  s = s.replace(/【(.+?)】/g, 'Mục: $1. ');
  s = s.replace(/\[(.+?)\]/g, '$1. ');
  s = s.replace(/\*{1,3}/g, '');
  s = s.replace(/\s*->\s*|\s*=>\s*/g, ' dẫn tới ');
  s = s.replace(/\s*\+\s*/g, ' cùng ');
  s = s.replace(/\s*=\s*/g, ' là ');
  s = s.replace(/~/g, ' khoảng ');
  s = s.replace(/([a-zA-ZÀ-ỹ0-9])\/([a-zA-ZÀ-ỹ0-9])/g, '$1 hoặc $2');
  s = s.replace(/^[-•*|]\s*/gm, '');
  s = s.replace(/[✦☯✨🍵◆❖꧁꧂]/g, '');
  s = s.replace(/["“”]/g, '');
  s = s.replace(/&/g, ' và ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  const sentences = text.split(/(?<=[.?!;:\n])\s+/);
  const parts: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).length > maxLen && current.length > 0) {
      parts.push(current.trim());
      current = trimmed;
    } else {
      current = current ? current + ' ' + trimmed : trimmed;
    }
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

async function fetchGoogleTtsChunk(text: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Google TTS returned HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Biến âm thanh thành giọng Nam trầm ấm, khoan thai, huyền bí (Âm sắc Đạo Trưởng) qua FFmpeg
function transformToDaoistMasterVoice(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve) => {
    // Bộ lọc âm thanh Đạo Trưởng:
    // - rubberband: pitch=0.72 (hạ 6 bán âm vào dải baritone trầm nam tính), tempo=0.96 (tiết tấu đĩnh đạc)
    // - equalizer 115Hz (+5dB) & 260Hz (+3dB): tạo độ ấm, dày của lồng ngực
    // - equalizer 3800Hz (-4dB): làm dịu các âm gió chói gắt
    // - aecho 35ms: độ vang vọng nhẹ nhàng của gian tĩnh thất / thiền tự huyền bí
    const filter = 'rubberband=pitch=0.72:tempo=0.96,equalizer=f=115:width_type=o:width=1.5:g=5,equalizer=f=260:width_type=o:width=1.2:g=3,equalizer=f=3800:width_type=o:width=1:g=-4,aecho=0.8:0.88:35:0.12';

    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-f', 'mp3',
      '-i', 'pipe:0',
      '-af', filter,
      '-f', 'mp3',
      'pipe:1',
    ]);

    const outChunks: Buffer[] = [];
    ffmpeg.stdout.on('data', (chunk: Buffer) => outChunks.push(chunk));

    ffmpeg.on('close', (code) => {
      if (code === 0 && outChunks.length > 0) {
        resolve(Buffer.concat(outChunks));
      } else {
        // Nếu FFmpeg gặp lỗi, trả về âm thanh gốc để đảm bảo hệ thống không bị gián đoạn
        resolve(inputBuffer);
      }
    });

    ffmpeg.on('error', () => {
      resolve(inputBuffer);
    });

    ffmpeg.stdin.write(inputBuffer);
    ffmpeg.stdin.end();
  });
}

// Bộ nhớ đệm trong tiến trình để tải tức thì (0ms) cho các quẻ đã nạp
const audioCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const MAX_CACHE_SIZE = 100;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawText = body.text;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return NextResponse.json({ error: 'Nội dung văn bản trống' }, { status: 400 });
    }

    const cleanText = prepareTextForSpeech(rawText);
    if (!cleanText) {
      return NextResponse.json({ error: 'Không thể xử lý văn bản để đọc' }, { status: 400 });
    }

    // Kiểm tra bộ nhớ đệm
    const cached = audioCache.get(cleanText);
    if (cached) {
      return new Response(new Uint8Array(cached.buffer), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    const chunks = splitTextIntoChunks(cleanText, 160);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Không có đoạn văn bản hợp lệ' }, { status: 400 });
    }

    // Lấy tối đa 25 đoạn để đảm bảo tốc độ phản hồi nhanh
    const limitedChunks = chunks.slice(0, 25);

    // Tải các đoạn âm thanh song song
    const buffers = await Promise.all(limitedChunks.map(c => fetchGoogleTtsChunk(c)));
    const combinedBuffer = Buffer.concat(buffers);

    // Chuyển hóa âm sắc sang Giọng Nam Trầm Ấm Huyền Bí (Đạo Trưởng)
    const masterBuffer = await transformToDaoistMasterVoice(combinedBuffer);

    // Lưu bộ nhớ đệm
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = audioCache.keys().next().value;
      if (oldestKey) audioCache.delete(oldestKey);
    }
    audioCache.set(cleanText, { buffer: masterBuffer, timestamp: Date.now() });

    return new Response(new Uint8Array(masterBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    console.error('Lỗi tạo giọng đọc TTS:', err);
    return NextResponse.json(
      { error: err?.message || 'Không thể tạo âm thanh giọng đọc' },
      { status: 500 }
    );
  }
}
