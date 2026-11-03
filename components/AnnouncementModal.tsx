'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANNOUNCEMENT_VERSION = '2026-05-01';
const STORAGE_KEY = `announcement_seen_${ANNOUNCEMENT_VERSION}`;

export default function AnnouncementModal() {
  const [open, setOpen] = useState(false);
  const [decided, setDecided] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch { /* skip */ }
    setDecided(true);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* skip */ }
  };

  if (!decided) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(20,12,2,0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #fefcf6 0%, #faf3e3 100%)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: 'min(85vh, 760px)',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(60,30,10,0.4), 0 4px 16px rgba(60,30,10,0.2)',
              border: '1px solid rgba(184,146,42,0.25)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'inherit',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '22px 28px 14px',
              borderBottom: '1px solid rgba(184,146,42,0.15)',
              background: 'linear-gradient(180deg, rgba(184,146,42,0.08) 0%, transparent 100%)',
              flexShrink: 0,
              position: 'relative',
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#b8922a', opacity: 0.8, marginBottom: '6px' }}>
                THÔNG ĐIỆP TỪ DỰ ÁN
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#3d2f10', letterSpacing: '0.04em', margin: 0 }}>
                Gửi tới bạn, người đang đồng hành cùng Tử Vi Đẩu Số
              </h2>
              <button
                onClick={close}
                aria-label="Đóng"
                style={{
                  position: 'absolute', top: '14px', right: '16px',
                  width: '28px', height: '28px',
                  background: 'rgba(184,146,42,0.08)',
                  border: '1px solid rgba(184,146,42,0.2)',
                  borderRadius: '50%',
                  color: '#7a5e2a', fontSize: '14px',
                  cursor: 'pointer', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>

            {/* Banner tri mệnh */}
            <div style={{
              margin: '14px 22px 0',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #fff5e3 0%, #ffe1c0 100%)',
              border: '1.5px dashed rgba(232,132,62,0.5)',
              borderRadius: '12px',
              flexShrink: 0,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#c45a2d', marginBottom: '4px', fontWeight: 600 }}>
                TRI MỆNH TẠO VẬN · TRUYỀN THỪA NGHÊ HẢI HÀ
              </div>
              <div style={{ fontSize: '13px', color: '#8b3a1a', fontWeight: 600, lineHeight: 1.6 }}>
                Khám phá bản mệnh, thấu hiểu tiềm năng và tự tin làm chủ vận mệnh cuộc đời
              </div>
            </div>

            {/* Nội dung */}
            <div style={{
              padding: '18px 28px 24px',
              overflowY: 'auto',
              fontSize: '13px',
              lineHeight: 1.85,
              color: '#5a4a30',
              flex: 1,
            }}>
              <p style={{ margin: '0 0 12px' }}>
                Chào bạn, nền tảng <strong>Tử Vi Đẩu Số</strong> được xây dựng nhằm mục đích đưa tinh hoa học thuật của trường phái Thiên Kỷ Nghê Hải Hà kết hợp cùng trí tuệ nhân tạo hiện đại, giúp việc tiếp cận Dịch học và Mệnh lý trở nên gần gũi, chuẩn xác và hữu ích cho đời sống.
              </p>
              <p style={{ margin: '0 0 12px' }}>
                Bạn không nhất thiết phải mất nhiều năm nghiên cứu cổ thư chữ Hán mới có thể thấu hiểu bản mệnh. Thông qua việc phân tích cấu trúc 12 Cung, 14 Chính Tinh, Tứ Hóa và Tam phương tứ chính, hệ thống sẽ giúp bạn nhìn nhận rõ ràng tính cách, năng lực và thời vận của chính mình.
              </p>
              <p style={{
                margin: '0 0 12px',
                padding: '10px 14px',
                background: 'rgba(184,146,42,0.07)',
                borderLeft: '3px solid rgba(184,146,42,0.45)',
                borderRadius: '0 8px 8px 0',
                fontStyle: 'italic',
                color: '#7a5e2a',
              }}>
                Thầy Nghê Hải Hà từng dạy: Mục đích chân chính của việc xem mệnh không phải để lo sợ trước tương lai, mà là "Tri mệnh để tạo vận" — hiểu rõ ưu khuyết điểm của bản thân để tu dưỡng, biết khi nào nên tiến, khi nào nên thủ.
              </p>
              <p style={{ margin: '0 0 16px', color: '#3d2f10', fontWeight: 500 }}>
                Chúc bạn luôn an lạc, thấu hiểu chính mình, nuôi dưỡng trí tuệ và mở ra con đường hanh thông rực rỡ nhất!
              </p>
              <p style={{ margin: 0, textAlign: 'right', fontSize: '13px', color: '#7a5e2a' }}>
                —— Trân trọng 🙏
              </p>
            </div>

            {/* Nút hành động */}
            <div style={{
              padding: '14px 22px',
              borderTop: '1px solid rgba(184,146,42,0.15)',
              background: 'rgba(184,146,42,0.04)',
              display: 'flex',
              justifyContent: 'flex-end',
              flexShrink: 0,
            }}>
              <button
                onClick={close}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #b8922a 0%, #9a7a20 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(184,146,42,0.3)',
                }}
              >
                Tôi đã hiểu · Bắt đầu khám phá
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
