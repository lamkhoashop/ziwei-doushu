'use client';

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useTheme } from '@/components/ThemeProvider';

interface SpeechPlayerProps {
  text: string;
  disabled?: boolean;
  className?: string;
}

// Biến toàn cục để đảm bảo chỉ có duy nhất 1 giọng đọc phát tại 1 thời điểm trên toàn trang
declare global {
  interface Window {
    __ziweiActiveAudio?: HTMLAudioElement | null;
    __ziweiStopActiveAudio?: (() => void) | null;
  }
}

export default function SpeechPlayer({ text, disabled = false, className }: SpeechPlayerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Dọn dẹp âm thanh khi component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleStart = async () => {
    if (!text || isLoading) return;

    // Dừng bất kỳ âm thanh nào đang phát trên toàn trang
    if (typeof window !== 'undefined' && window.__ziweiStopActiveAudio) {
      window.__ziweiStopActiveAudio();
    }

    // Nếu đã nạp audio trước đó và đang tạm dừng, phát tiếp
    if (audioRef.current && isPaused) {
      audioRef.current.play().catch(console.error);
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ máy chủ tạo giọng đọc');
      }

      const blob = await res.blob();
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      // Đăng ký tiến trình toàn cục
      if (typeof window !== 'undefined') {
        window.__ziweiActiveAudio = audio;
        window.__ziweiStopActiveAudio = () => {
          handleStop();
        };
      }

      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setIsLoading(false);
      };

      audio.onpause = () => {
        if (!audio.ended) {
          setIsPaused(true);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
      };

      await audio.play();
    } catch (err) {
      console.error('Không thể phát âm thanh giọng đọc:', err);
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
    }
  };

  const handleTogglePause = () => {
    if (!audioRef.current) return;
    if (isPaused) {
      audioRef.current.play().catch(console.error);
      setIsPaused(false);
    } else {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!text || text.trim().length === 0) {
    return null;
  }

  return (
    <div className={clsx("inline-flex items-center gap-1.5 select-none", className)}>
      {!isPlaying && !isPaused ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={disabled || isLoading}
          title="Nghe Đạo Trưởng đọc luận giải quẻ này (tiếng Việt chuẩn)"
          className={clsx(
            "group relative px-2.5 py-1 rounded-md text-[10.5px] font-mystic font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95",
            (disabled || isLoading) ? "opacity-40 cursor-not-allowed" : "hover:scale-105"
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
          {isLoading ? (
            <>
              <span className="w-2.5 h-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Đang nạp âm...</span>
            </>
          ) : (
            <>
              <span className="text-[12px] group-hover:scale-110 transition-transform text-amber-400">🔊</span>
              <span>Nghe Đạo Trưởng Đọc</span>
            </>
          )}
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
          </button>
        </div>
      )}
    </div>
  );
}
