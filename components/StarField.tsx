'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

interface Cloud {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  alpha: number;
  alphaDir: number;
  speed: number;
}

interface LightningSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface LightningState {
  segments: LightningSegment[];
  branches: LightningSegment[];
  birth: number;
  duration: number;
  flashAura: number;
  auraColor: string;
  glowColor: string;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const isLight = theme === 'light';
    const isMobile = w < 768;

    // ── 1. SAO TINH TÚ (Twinkling Stars) ──
    const starCount = isMobile ? (isLight ? 25 : 45) : (isLight ? 70 : 120);
    const stars: Particle[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: isLight ? Math.random() * 1.4 + 0.3 : Math.random() * 1.3 + 0.2,
      alpha: Math.random() * 0.8 + 0.2,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      speed: Math.random() * 0.005 + 0.002,
    }));

    // ── 2. MÂY ĐEN MỜ NHẸ HUYỀN BÍ (Drifting Xianxia Mist / Clouds) ──
    const cloudCount = isMobile ? 8 : 16;
    const darkCloudTones = [
      '14, 22, 44',   // Midnight Indigo
      '22, 16, 40',   // Deep Cosmic Violet
      '10, 24, 38',   // Ethereal Slate Teal
      '8, 14, 28',    // Deep Void Black
    ];
    const lightCloudTones = [
      '215, 200, 175', // Warm Antique Paper
      '228, 215, 192', // Parchment Silk
      '205, 190, 160', // Ochre Mist
    ];

    const clouds: Cloud[] = Array.from({ length: cloudCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * (isMobile ? 180 : 320) + (isMobile ? 120 : 200),
      vx: (Math.random() - 0.45) * 0.18,
      vy: (Math.random() - 0.5) * 0.06,
      alpha: isLight
        ? Math.random() * 0.035 + 0.015
        : Math.random() * 0.055 + 0.025,
      color: isLight
        ? lightCloudTones[Math.floor(Math.random() * lightCloudTones.length)]
        : darkCloudTones[Math.floor(Math.random() * darkCloudTones.length)],
    }));

    // ── 3. THIÊN LÔI / SẤM CHỚP HUYỀN ẢO (Subtle Occasional Celestial Lightning) ──
    let lightning: LightningState | null = null;
    let lastLightningTime = Date.now();
    // Lần sấm chớp đầu tiên sau 7-12s, các lần tiếp theo ngẫu nhiên 16-32s
    let nextLightningDelay = Math.random() * 5000 + 7000;

    const createLightning = (): LightningState => {
      const startX = Math.random() * (w * 0.7) + w * 0.15;
      const startY = -15;
      const targetY = Math.random() * (h * 0.55) + h * 0.25;

      const segments: LightningSegment[] = [];
      const branches: LightningSegment[] = [];

      let curX = startX;
      let curY = startY;
      const steps = Math.floor(Math.random() * 12 + 10);
      const stepY = (targetY - startY) / steps;

      for (let i = 0; i < steps; i++) {
        const nextX = curX + (Math.random() - 0.5) * (isMobile ? 30 : 45);
        const nextY = curY + stepY;
        segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

        // Tạo nhánh lôi điện phân nhánh tinh tế
        if (Math.random() < 0.35 && i > 2 && i < steps - 2) {
          let bX = nextX;
          let bY = nextY;
          const bSteps = Math.floor(Math.random() * 5 + 3);
          const bDir = Math.random() > 0.5 ? 1 : -1;
          for (let j = 0; j < bSteps; j++) {
            const nbX = bX + (Math.random() * 25 + 8) * bDir;
            const nbY = bY + stepY * 0.65;
            branches.push({ x1: bX, y1: bY, x2: nbX, y2: nbY });
            bX = nbX;
            bY = nbY;
          }
        }

        curX = nextX;
        curY = nextY;
      }

      // Màu sắc: 65% Lôi Điện Băng Lam (Cyan-Blue), 35% Kim Lôi (Celestial Gold)
      const isGolden = Math.random() < 0.35;
      const auraColor = isLight
        ? '217, 119, 6' // Light mode: ấm áp
        : isGolden ? '254, 240, 138' : '147, 197, 253';
      const glowColor = isLight
        ? '180, 83, 9'
        : isGolden ? '217, 119, 6' : '59, 130, 246';

      return {
        segments,
        branches,
        birth: Date.now(),
        duration: 320, // 320ms nhấp nháy êm dịu
        flashAura: isLight ? 0.08 : 0.15,
        auraColor,
        glowColor,
      };
    };

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // A. Vẽ Mây Đen U Vân Bồng Bềnh (Drifting Clouds)
      clouds.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        if (c.x < -c.r) c.x = w + c.r;
        if (c.x > w + c.r) c.x = -c.r;
        if (c.y < -c.r) c.y = h + c.r;
        if (c.y > h + c.r) c.y = -c.r;

        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        g.addColorStop(0, `rgba(${c.color}, ${c.alpha})`);
        g.addColorStop(0.6, `rgba(${c.color}, ${c.alpha * 0.4})`);
        g.addColorStop(1, 'transparent');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Vẽ Tinh Vân Sao Trời (Stars)
      stars.forEach((s) => {
        s.alpha += s.alphaDir * s.speed;
        if (s.alpha >= 1) { s.alpha = 1; s.alphaDir = -1; }
        if (s.alpha <= 0.15) { s.alpha = 0.15; s.alphaDir = 1; }

        const starColor = isLight
          ? `rgba(180, 120, 30, ${s.alpha * 0.6})`
          : `rgba(215, 230, 255, ${s.alpha * 0.85})`;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.fill();
      });

      // C. Xử Lý Sấm Chớp Lôi Kiếp (Celestial Lightning Flash)
      const now = Date.now();
      if (!lightning && now - lastLightningTime > nextLightningDelay) {
        lightning = createLightning();
        lastLightningTime = now;
        nextLightningDelay = Math.random() * 16000 + 16000; // 16 - 32 giây một lần
      }

      if (lightning) {
        const elapsed = now - lightning.birth;
        if (elapsed > lightning.duration) {
          lightning = null;
        } else {
          // Tính đường cong nhấp nháy tự nhiên (2 đợt chớp nhẹ)
          let flashIntensity = 0;
          if (elapsed < 50) {
            flashIntensity = elapsed / 50;
          } else if (elapsed < 110) {
            flashIntensity = 1 - ((elapsed - 50) / 60) * 0.6;
          } else if (elapsed < 170) {
            flashIntensity = 0.85; // đợt giật phụ
          } else {
            flashIntensity = Math.max(0, 1 - (elapsed - 170) / (lightning.duration - 170));
          }

          // 1. Quầng sáng rực mây trời (Ambient Cloud Glow)
          if (flashIntensity > 0) {
            ctx.fillStyle = `rgba(${lightning.auraColor}, ${lightning.flashAura * flashIntensity})`;
            ctx.fillRect(0, 0, w, h);
          }

          // 2. Tia Lôi Điện Chính (Main Bolt)
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${flashIntensity * 0.95})`;
          ctx.lineWidth = isMobile ? 1.8 : 2.4;
          ctx.shadowColor = `rgba(${lightning.glowColor}, 0.85)`;
          ctx.shadowBlur = isMobile ? 10 : 16;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'miter';

          ctx.beginPath();
          lightning.segments.forEach((seg) => {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
          });
          ctx.stroke();

          // 3. Các Nhánh Lôi Phụ (Branching Forks)
          ctx.strokeStyle = `rgba(${lightning.auraColor}, ${flashIntensity * 0.75})`;
          ctx.lineWidth = isMobile ? 0.9 : 1.2;
          ctx.shadowBlur = isMobile ? 6 : 9;
          ctx.beginPath();
          lightning.branches.forEach((b) => {
            ctx.moveTo(b.x1, b.y1);
            ctx.lineTo(b.x2, b.y2);
          });
          ctx.stroke();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}
