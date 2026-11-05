'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

interface Point {
  x: number;
  y: number;
}

interface ArcBranch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ElectricArc {
  points: Point[];
  branches: ArcBranch[];
  birth: number;
  duration: number;
  color: string;
  glow: string;
}

export default function CenterLightning() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    };
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);

    const isLight = theme === 'light';

    let currentArc: ElectricArc | null = null;
    let lastTrigger = Date.now();
    // Lần đầu xuất hiện nhanh sau 3-5 giây để người dùng cảm nhận ngay
    let delay = Math.random() * 2000 + 3000;

    const createArc = (): ElectricArc => {
      const cx = w / 2;
      const cy = h / 2;

      const patternType = Math.random();
      const points: Point[] = [];
      const branches: ArcBranch[] = [];

      if (patternType < 0.45) {
        // Kiểu 1: Tơ lôi điện lượn quanh vành cung Bát Quái
        const baseAngle = Math.random() * Math.PI * 2;
        const sweep = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 0.55 + Math.random() * 0.45);
        const radius = Math.min(w, h) * (0.28 + Math.random() * 0.14);

        const steps = Math.floor(Math.random() * 7 + 8);
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const a = baseAngle + sweep * t;
          const r = radius + (Math.random() - 0.5) * 12;
          points.push({
            x: cx + Math.cos(a) * r,
            y: cy + Math.sin(a) * r,
          });
        }
      } else if (patternType < 0.8) {
        // Kiểu 2: Tia sét nhẹ nhàng lướt ngang qua khu vực trên/dưới Thái Cực
        const startLeft = Math.random() > 0.5;
        const startX = startLeft ? w * 0.15 : w * 0.85;
        const endX = startLeft ? w * 0.85 : w * 0.15;
        const yBase = cy + (Math.random() > 0.5 ? -1 : 1) * (h * (0.15 + Math.random() * 0.22));

        const steps = Math.floor(Math.random() * 7 + 8);
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const px = startX + (endX - startX) * t;
          const py = yBase + (Math.random() - 0.5) * 16;
          points.push({ x: px, y: py });
        }
      } else {
        // Kiểu 3: Tia sét lượn chéo góc qua tâm Mệnh Bàn
        const startCorner = Math.random() > 0.5;
        const startX = startCorner ? w * 0.2 : w * 0.8;
        const startY = h * 0.2;
        const endX = startCorner ? w * 0.75 : w * 0.25;
        const endY = h * 0.8;

        const steps = Math.floor(Math.random() * 7 + 8);
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const px = startX + (endX - startX) * t + (Math.random() - 0.5) * 14;
          const py = startY + (endY - startY) * t + (Math.random() - 0.5) * 14;
          points.push({ x: px, y: py });
        }
      }

      // Nhánh phụ nhỏ (1 nhánh rẽ nhẹ)
      if (points.length > 5 && Math.random() < 0.65) {
        const branchIdx = Math.floor(Math.random() * (points.length - 4)) + 2;
        const bp = points[branchIdx];
        let bx = bp.x;
        let by = bp.y;
        const bDirX = (Math.random() - 0.5) * 16;
        const bDirY = (Math.random() - 0.5) * 16;
        for (let j = 0; j < 3; j++) {
          const nbx = bx + bDirX + (Math.random() - 0.5) * 6;
          const nby = by + bDirY + (Math.random() - 0.5) * 6;
          branches.push({ x1: bx, y1: by, x2: nbx, y2: nby });
          bx = nbx;
          by = nby;
        }
      }

      // Màu sắc: 70% Kim Lôi Hoàng Kim, 30% Lam Lôi Băng Lam
      const isGold = Math.random() < 0.7;
      const color = isLight
        ? isGold ? '#D97706' : '#0284C7'
        : isGold ? '#FDE047' : '#93C5FD';
      const glow = isLight
        ? isGold ? 'rgba(217, 119, 6, 0.6)' : 'rgba(2, 132, 199, 0.6)'
        : isGold ? 'rgba(234, 179, 8, 0.8)' : 'rgba(59, 130, 246, 0.8)';

      return {
        points,
        branches,
        birth: Date.now(),
        duration: Math.random() * 150 + 500, // 500ms - 650ms chạy mượt mà nhẹ nhàng
        color,
        glow,
      };
    };

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      const now = Date.now();
      // Kích hoạt định kỳ 7 đến 16 giây một lần (êm dịu, không dày đặc)
      if (!currentArc && now - lastTrigger > delay) {
        currentArc = createArc();
        lastTrigger = now;
        delay = Math.random() * 9000 + 7000;
      }

      if (currentArc && currentArc.points.length > 2) {
        const elapsed = now - currentArc.birth;
        if (elapsed > currentArc.duration) {
          currentArc = null;
        } else {
          const progress = elapsed / currentArc.duration; // 0 to 1

          // Đầu tia sét chạy từ 0 đến 1 (trong 75% thời gian đầu)
          const headT = Math.min(1, progress * 1.35);
          // Đuôi tia sét chạy theo sau (từ 25% đến 100%)
          const tailT = Math.max(0, (progress - 0.22) * 1.28);

          const totalPoints = currentArc.points.length;
          const headIdx = Math.floor(headT * (totalPoints - 1));
          const tailIdx = Math.floor(tailT * (totalPoints - 1));

          if (headIdx > tailIdx) {
            ctx.save();
            ctx.strokeStyle = currentArc.color;
            ctx.lineWidth = isLight ? 1.4 : 1.7;
            ctx.shadowColor = currentArc.glow;
            ctx.shadowBlur = isLight ? 8 : 12;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'bevel';

            ctx.beginPath();
            ctx.moveTo(currentArc.points[tailIdx].x, currentArc.points[tailIdx].y);
            for (let i = tailIdx + 1; i <= headIdx; i++) {
              ctx.lineTo(currentArc.points[i].x, currentArc.points[i].y);
            }
            ctx.stroke();

            // Đốm sáng linh động dẫn đường ở đầu tia sét
            const headPoint = currentArc.points[headIdx];
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = currentArc.color;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(headPoint.x, headPoint.y, isLight ? 1.8 : 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Nhánh rẽ phụ nhẹ
            if (progress > 0.2 && progress < 0.75 && currentArc.branches.length > 0) {
              const bAlpha = Math.sin(((progress - 0.2) / 0.55) * Math.PI);
              ctx.strokeStyle = currentArc.color;
              ctx.lineWidth = 1.0;
              ctx.shadowBlur = 6;
              ctx.globalAlpha = Math.max(0, Math.min(1, bAlpha * 0.75));
              ctx.beginPath();
              currentArc.branches.forEach((b) => {
                ctx.moveTo(b.x1, b.y1);
                ctx.lineTo(b.x2, b.y2);
              });
              ctx.stroke();
            }

            ctx.restore();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
}