import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

export function WaveVisualizer({
  isActive,
  pulse = 0,
  analyser,
  className,
}: {
  isActive: boolean;
  pulse?: number;
  analyser?: AnalyserNode | null;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const freq = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const draw = (t: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const bars = 56;
      const gap = 2;
      const barW = (width - gap * (bars - 1)) / bars;
      const base = height * 0.22;

      // gradient fill
      const g = ctx.createLinearGradient(0, 0, width, 0);
      g.addColorStop(0, "hsla(var(--brand) / 0.90)");
      g.addColorStop(1, "hsla(var(--brand-2) / 0.90)");

      for (let i = 0; i < bars; i++) {
        let level = 0;

        if (analyser && freq) {
          analyser.getByteFrequencyData(freq);
          const idx = Math.floor((i / bars) * freq.length);
          level = freq[idx] / 255;
        } else {
          // synthetic motion: subtle, premium
          const wobble = Math.sin(t / 240 + i * 0.32) * 0.35 + 0.65;
          const burst = isActive ? Math.min(1, 0.25 + (pulse % 7) * 0.06) : 0.08;
          level = (isActive ? wobble : 0.18) * burst;
        }

        const h = base + level * (height - base);
        const x = i * (barW + gap);
        const y = (height - h) / 2;

        ctx.fillStyle = g;
        roundRect(ctx, x, y, barW, h, 999);
      }

      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [analyser, isActive, pulse, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-24 w-full rounded-xl glass-card", className)}
      aria-label="Audio wave visualizer"
      role="img"
    />
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
}
