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
