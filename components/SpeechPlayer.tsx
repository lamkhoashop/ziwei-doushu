'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { useTheme } from '@/components/ThemeProvider';

export function prepareTextForSpeech(raw: string): string {
  if (!raw) return '';
  let s = raw;
  s = s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '');
  s = s.replace(/【(.+?)】/g, '$1. ');
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

export function splitIntoSentences(text: string): string[] {
  const cleaned = prepareTextForSpeech(text);
  if (!cleaned) return [];

  // Tách câu dựa trên dấu chấm, chấm than, hỏi, hai chấm hoặc xuống dòng
  const rawParts = cleaned.split(/(?<=[.?!;:\n])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).length > 160 && current.length > 0) {
      chunks.push(current.trim());
      current = trimmed;
    } else {
      current = current ? current + ' ' + trimmed : trimmed;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

interface SpeechPlayerProps {
  text: string;
  disabled?: boolean;
  className?: string;
}

export default function SpeechPlayer({ text, disabled = false, className }: SpeechPlayerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const chunksRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const isCancelledRef = useRef(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Tìm giọng đọc tiếng Việt tối ưu nhất
  const getVietnameseVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    // Ưu tiên giọng tự nhiên (Natural / Neural) tiếng Việt của Edge/Chrome
    const naturalVi = voices.find(v =>
      (v.lang.toLowerCase().startsWith('vi') || v.lang.toLowerCase().includes('vie')) &&
      (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('NamMinh') || v.name.includes('HoaiMy'))
    );
    if (naturalVi) return naturalVi;

    // Giọng tiếng Việt tiêu chuẩn bất kỳ
    const standardVi = voices.find(v =>
      v.lang.toLowerCase().startsWith('vi') || v.lang.toLowerCase().includes('vie') || v.name.toLowerCase().includes('vietnam')
    );
    return standardVi || null;
  }, []);

  const speakChunk = useCallback((index: number) => {
    if (!synthRef.current || isCancelledRef.current) return;
    const chunks = chunksRef.current;
    if (index >= chunks.length) {
      // Đã đọc xong toàn bộ luận giải
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentChunkIndex(0);
      return;
    }

    const chunkText = chunks[index];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    const voice = getVietnameseVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'vi-VN';
    } else {
      utterance.lang = 'vi-VN';
    }

    // Tinh chỉnh âm điệu: chậm rãi, trầm ấm, trang nghiêm như Đạo trưởng đàm đạo
    utterance.rate = 0.95;
    utterance.pitch = 0.95;

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        const nextIdx = index + 1;
        currentIndexRef.current = nextIdx;
        setCurrentChunkIndex(nextIdx);
        speakChunk(nextIdx);
      }
    };

    utterance.onerror = (e) => {
      // Bỏ qua lỗi do người dùng chủ động cancel
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.warn('SpeechSynthesis error:', e.error);
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  }, [getVietnameseVoice]);

  const handleStart = () => {
    if (!synthRef.current || !text) return;

    // Dừng tiến trình đọc cũ nếu đang chạy
    synthRef.current.cancel();
    isCancelledRef.current = false;

    const chunks = splitIntoSentences(text);
    if (chunks.length === 0) return;

    chunksRef.current = chunks;
    setTotalChunks(chunks.length);
    currentIndexRef.current = 0;
    setCurrentChunkIndex(0);
    setIsPlaying(true);
    setIsPaused(false);

    speakChunk(0);
  };

  const handleStop = () => {
    if (!synthRef.current) return;
    isCancelledRef.current = true;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
  };

  const handleTogglePause = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  if (!isSupported || !text || text.trim().length === 0) {
    return null;
  }

  return (
    <div className={clsx("inline-flex items-center gap-1.5 select-none", className)}>
      {!isPlaying ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={disabled}
          title="Nghe Đạo Trưởng đọc luận giải quẻ này"
          className={clsx(
            "group relative px-2.5 py-1 rounded-md text-[10.5px] font-mystic font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95",
            disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105"
          )}
          style={{
            background: isDark
              ? 'linear-gradient(145deg, rgba(38, 48, 70, 0.95) 0%, rgba(18, 24, 38, 0.98) 100%)'
              : 'linear-gradient(145deg, #FFFFFF 0%, #FEF9EE 100%)',
            border: isDark ? '1px solid rgba(254, 240, 138, 0.45)' : '1px solid rgba(184, 146, 42, 0.55)',
            color: isDark ? '#FEF08A' : '#78350F',
            textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(212,168,67,0.3)' : '0 1px 0 rgba(255,255,255,0.8)',
            boxShadow: isDark
              ? 'inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -1.5px 2px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.35)'
              : 'inset 0 1px 1.5px rgba(255,255,255,0.9), inset 0 -1.5px 2px rgba(140,100,20,0.15), 0 2px 5px rgba(120,53,15,0.1)',
          }}
        >
          <span className="text-[12px] group-hover:scale-110 transition-transform text-amber-400">🔊</span>
          <span>Nghe Đạo Trưởng Đọc</span>
        </button>
      ) : (
        <div className="flex items-center gap-1">
          {/* Nút Tạm Dừng / Tiếp Tục */}
          <button
            type="button"
            onClick={handleTogglePause}
            title={isPaused ? "Tiếp tục đọc" : "Tạm dừng"}
            className="px-2 py-1 rounded-md text-[10px] font-mystic font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            style={{
              background: isDark
                ? 'linear-gradient(145deg, rgba(45, 36, 18, 0.95) 0%, rgba(26, 18, 8, 0.98) 100%)'
                : 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: isDark ? '1px solid rgba(251, 191, 36, 0.6)' : '1px solid rgba(217, 119, 6, 0.6)',
              color: isDark ? '#FDE68A' : '#92400E',
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.4)'
                : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 4px rgba(120,53,15,0.12)',
            }}
          >
            <span>{isPaused ? '▶ Tiếp Tục' : '⏸ Tạm Dừng'}</span>
          </button>

          {/* Nút Dừng Đọc */}
          <button
            type="button"
            onClick={handleStop}
            title="Dừng đọc luận giải"
            className="px-2 py-1 rounded-md text-[10px] font-mystic font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            style={{
              background: isDark
                ? 'linear-gradient(145deg, rgba(60, 20, 20, 0.95) 0%, rgba(35, 10, 10, 0.98) 100%)'
                : 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
              border: isDark ? '1px solid rgba(248, 113, 113, 0.6)' : '1px solid rgba(239, 68, 68, 0.6)',
              color: isDark ? '#FCA5A5' : '#991B1B',
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.4)'
                : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 4px rgba(185,28,28,0.12)',
            }}
          >
            {/* Hiệu ứng sóng âm thanh động khi đang đọc */}
            <span className="flex items-center gap-0.5 h-2.5">
              <span className={clsx("w-0.5 bg-current rounded-full transition-all", !isPaused && "animate-[pulse_0.8s_ease-in-out_infinite] h-2.5")} />
              <span className={clsx("w-0.5 bg-current rounded-full transition-all", !isPaused && "animate-[pulse_0.6s_ease-in-out_0.2s_infinite] h-3.5")} />
              <span className={clsx("w-0.5 bg-current rounded-full transition-all", !isPaused && "animate-[pulse_0.9s_ease-in-out_0.4s_infinite] h-2")} />
            </span>
            <span>⏹ Dừng</span>
            {totalChunks > 1 && (
              <span className="text-[8.5px] opacity-75 font-sans">
                ({currentChunkIndex + 1}/{totalChunks})
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
