/**
 * Bộ Quản Lý Hàng Đợi Luận Giải AI (Daoist Concurrency Queue Manager)
 * - Giới hạn tối đa 10 người chạy stream AI đồng thời.
 * - Hỗ trợ hàng đợi FIFO thông minh, tự động đẩy khách tiếp theo khi có người xong.
 * - Đặc quyền VIP (Lệnh Bài Tri Kỷ): Không bao giờ phải đợi, ưu tiên thực thi tức thì.
 */

import { NextRequest } from 'next/server';

export const MAX_CONCURRENT_AI = parseInt(process.env.MAX_CONCURRENT_AI || '10', 10);
export const VIP_SECRET_KEY = process.env.VIP_SECRET_KEY || 'ziwei_vip_2026';
export const QUEUE_TIMEOUT_MS = 3 * 60 * 1000; // 3 phút tối đa trong hàng đợi

interface QueueItem {
  id: string;
  isVip: boolean;
  notify: (position: number, totalWaiting: number) => void;
  resolve: (release: () => void) => void;
  reject: (err: Error) => void;
  timeoutId: NodeJS.Timeout;
}

class AiQueueManager {
  private activeCount = 0;
  private queue: QueueItem[] = [];

  public getActiveCount(): number {
    return this.activeCount;
  }

  public getWaitingCount(): number {
    return this.queue.length;
  }

  /**
   * Kiểm tra xem request có mang Lệnh Bài VIP hợp lệ hay không
   * Hỗ trợ 3 loại:
   * 1. 'ltk': Lệnh Bài Tri Kỷ (thời hạn 1 tháng, làm mới mỗi lần vào link)
   * 2. 'vip1h' / '1h': Lệnh Bài Tạm Thời (thời hạn đúng 1 giờ, hết 1h là vô hiệu)
   * 3. Master Key (VIP_SECRET_KEY / ziwei2026)
   */
  public checkIsVip(req: NextRequest, clientKey?: string, clientExp?: number): boolean {
    const checkToken = (key?: string | null, exp?: number | string | null): boolean => {
      if (!key) return false;
      const clean = key.trim().toLowerCase();

      // Master key luôn hợp lệ
      if (clean === VIP_SECRET_KEY.toLowerCase() || clean === 'ziwei2026') return true;

      // Kiểm tra hạn sử dụng nếu có
      if (exp) {
        const expNum = Number(exp);
        if (!isNaN(expNum) && Date.now() > expNum) {
          return false;
        }
      }

      // VIP 1 tháng (ltk)
      if (clean === 'ltk') return true;

      // VIP 1 giờ (vip1h hoặc 1h)
      if (clean === 'vip1h' || clean === '1h') return true;

      return false;
    };

    if (checkToken(clientKey, clientExp)) return true;

    // Kiểm tra qua query param: ?vip=... hoặc ?vip1h
    const urlVip = req.nextUrl.searchParams.get('vip') || (req.nextUrl.searchParams.has('vip1h') ? 'vip1h' : null);
    if (checkToken(urlVip)) return true;

    // Kiểm tra qua header
    const headerVip = req.headers.get('x-vip-key');
    const headerExp = req.headers.get('x-vip-exp');
    if (checkToken(headerVip, headerExp)) return true;

    // Kiểm tra qua Cookie
    const cookieVip = req.cookies.get('ziwei_vip')?.value;
    const cookieExp = req.cookies.get('ziwei_vip_exp')?.value;
    if (checkToken(cookieVip, cookieExp)) return true;

    return false;
  }

  /**
   * Xin quyền thực thi AI slot
   */
  public async acquireSlot(options: {
    isVip: boolean;
    onQueue?: (position: number, totalWaiting: number) => void;
    signal?: AbortSignal;
  }): Promise<() => void> {
    const { isVip, onQueue, signal } = options;

    // 1. Nếu là VIP: Cấp slot ưu tiên ngay lập tức không cần xếp hàng
    if (isVip) {
      this.activeCount++;
      let released = false;
      return () => {
        if (!released) {
          released = true;
          this.activeCount = Math.max(0, this.activeCount - 1);
          this.processNext();
        }
      };
    }

    // 2. Nếu còn chỗ trống (< MAX_CONCURRENT_AI): Vào thẳng
    if (this.activeCount < MAX_CONCURRENT_AI) {
      this.activeCount++;
      let released = false;
      return () => {
        if (!released) {
          released = true;
          this.activeCount = Math.max(0, this.activeCount - 1);
          this.processNext();
        }
      };
    }

    // 3. Nếu đã đủ 10 người: Đưa vào hàng đợi FIFO
    return new Promise<() => void>((resolve, reject) => {
      const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const timeoutId = setTimeout(() => {
        this.removeFromQueue(id);
        reject(new Error('Thời gian chờ luận giải vượt quá giới hạn, vui lòng thử lại sau ít phút.'));
      }, QUEUE_TIMEOUT_MS);

      const item: QueueItem = {
        id,
        isVip,
        notify: (pos, total) => {
          if (onQueue) onQueue(pos, total);
        },
        resolve: (releaseFn) => {
          clearTimeout(timeoutId);
          resolve(releaseFn);
        },
        reject: (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
        timeoutId,
      };

      // Xử lý khi client ngắt kết nối trong lúc đang chờ
      if (signal) {
        signal.addEventListener('abort', () => {
          this.removeFromQueue(id);
          clearTimeout(timeoutId);
          reject(new Error('client_aborted'));
        });
      }

      this.queue.push(item);

      // Báo vị trí ban đầu cho người dùng
      const position = this.queue.length;
      if (onQueue) {
        onQueue(position, this.queue.length);
      }
    });
  }

  private removeFromQueue(id: string) {
    const idx = this.queue.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      this.broadcastQueuePositions();
    }
  }

  private broadcastQueuePositions() {
    this.queue.forEach((item, index) => {
      try {
        item.notify(index + 1, this.queue.length);
      } catch {
        /* ignore */
      }
    });
  }

  private processNext() {
    if (this.queue.length === 0) return;

    if (this.activeCount < MAX_CONCURRENT_AI) {
      const nextItem = this.queue.shift();
      if (!nextItem) return;

      this.activeCount++;
      this.broadcastQueuePositions();

      let released = false;
      const releaseFn = () => {
        if (!released) {
          released = true;
          this.activeCount = Math.max(0, this.activeCount - 1);
          this.processNext();
        }
      };

      nextItem.resolve(releaseFn);
    }
  }
}

// Global singleton instance trên Node.js runtime
const globalForQueue = globalThis as unknown as { aiQueueManager?: AiQueueManager };
export const aiQueue = globalForQueue.aiQueueManager || new AiQueueManager();
if (process.env.NODE_ENV !== 'production') globalForQueue.aiQueueManager = aiQueue;
