'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart } from '@/lib/ziwei/types';
import ShareCardCanvas, { captureShareCard, downloadDataURL } from './ShareCardCanvas';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  chart: ZiweiChart | null;
  highlight?: string;
}

export default function ShareModal({ open, onClose, shareUrl, chart }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadImage = async () => {
    setDownloading(true);
    try {
      const dataURL = await captureShareCard();
      if (!dataURL) {
        alert('Không thể tạo ảnh, vui lòng thử chụp màn hình hoặc tải lại trang.');
        return;
      }
      downloadDataURL(dataURL, `Thiep_La_So_Tu_Vi_${Date.now()}.png`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
          style={{ background: 'rgba(2, 6, 12, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={e => e.stopPropagation()}
            className="rounded-2xl overflow-hidden border border-amber-500/30 flex flex-col"
            style={{
              background: '#0c0a06',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '92vh',
              boxShadow: '0 24px 70px rgba(0,0,0,0.8), 0 0 30px rgba(212,168,67,0.15)',
            }}
          >
            {/* Thanh tiêu đề Modal */}
            <div className="px-5 py-3.5 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-black to-amber-950/40">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm tracking-widest uppercase">
                <span className="text-amber-400">✦</span>
                <span>XUẤT THIỆP MỆNH BẢN CỔ PHONG</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center border border-amber-500/30 bg-white/5 text-amber-200/80 hover:text-amber-100 hover:bg-white/10 text-base cursor-pointer transition-all"
              >
                ×
              </button>
            </div>

            {/* Vùng xem trước thẻ */}
            <div className="p-4 sm:p-6 bg-black/60 flex items-center justify-center overflow-x-auto">
              {chart && (
                <div className="shadow-2xl rounded-lg overflow-hidden border border-amber-500/30">
                  <ShareCardCanvas chart={chart} />
                </div>
              )}
            </div>

            <div className="px-6 py-1.5 text-center text-[10px] text-amber-300/60 font-serif italic">
              Thiệp mệnh chuẩn tỷ lệ vàng 740 × 470 px · Tương thích Zalo, Facebook, Story, In ấn
            </div>

            {/* Vùng thao tác */}
            <div className="p-4 sm:p-6 bg-gradient-to-b from-transparent to-black/80 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={downloadImage}
                  disabled={downloading}
                  className="py-3 px-4 rounded-xl border border-amber-400/40 text-amber-950 font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,168,67,0.3)] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #f5d77f 0%, #d4a843 50%, #b38321 100%)',
                  }}
                >
                  {downloading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                      <span>Đang Kết Xuất Thiệp...</span>
                    </>
                  ) : (
                    <>
                      <span>⬇</span>
                      <span>TẢI THIỆP VỀ MÁY (PNG)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={copyLink}
                  className="py-3 px-4 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-medium text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  {copied ? (
                    <span className="text-emerald-400 font-bold">✓ Đã Sao Chép Liên Kết!</span>
                  ) : (
                    <>
                      <span>🔗</span>
                      <span>SAO CHÉP LIÊN KẾT LÁ SỐ</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 text-[11px] text-amber-100/70 font-sans leading-relaxed">
                <strong className="text-amber-300">✦ Hướng dẫn:</strong> Bạn có thể tải thiệp ảnh độ phân giải cao để lưu trữ vào thư viện điện thoại, gửi tặng bạn bè hoặc đăng lên Zalo/Facebook. Người nhận quét mã hoặc bấm liên kết có thể luận giải tương tác trực tiếp.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
