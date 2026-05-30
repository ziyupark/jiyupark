"use client";
import { useEffect, useRef } from "react";

const GRID   = 7;  // grid cell size (px)
const SPREAD = 50; // brush radius
const STEP   = 3;  // sample step along spline (px)
const TTL    = 13;  // 0.22s at 60fps

interface Cell {
  size: number;
  opacity: number;
  ttl: number;
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
  );
}

export default function MouseTrail() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cells      = useRef<Map<string, Cell>>(new Map());
  const rafRef     = useRef<number>(0);
  const history    = useRef<[number, number][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const paintAt = (cx: number, cy: number) => {
      const x0 = Math.floor((cx - SPREAD) / GRID);
      const x1 = Math.ceil((cx + SPREAD) / GRID);
      const y0 = Math.floor((cy - SPREAD) / GRID);
      const y1 = Math.ceil((cy + SPREAD) / GRID);

      for (let gx = x0; gx <= x1; gx++) {
        for (let gy = y0; gy <= y1; gy++) {
          const pcx = gx * GRID + GRID / 2;
          const pcy = gy * GRID + GRID / 2;
          const dist = Math.sqrt((pcx - cx) ** 2 + (pcy - cy) ** 2);
          if (dist > SPREAD) continue;

          let size: number;
          let opacity: number;

          if (dist < 12) {
            size = 4; opacity = 0.85 + Math.random() * 0.15;
          } else if (dist < 25) {
            size = 3; opacity = 0.65 + Math.random() * 0.2;
          } else if (dist < 38) {
            if (Math.random() > 0.55) continue;
            size = 2; opacity = 0.45 + Math.random() * 0.25;
          } else {
            if (Math.random() > 0.2) continue;
            size = 1; opacity = 0.35 + Math.random() * 0.2;
          }

          const key = `${gx},${gy}`;
          const cur = cells.current.get(key);
          if (!cur || cur.size <= size) {
            cells.current.set(key, { size, opacity, ttl: TTL });
          } else {
            cur.ttl = TTL;
          }
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const cx = e.clientX;
      const cy = e.clientY;
      const h = history.current;

      h.push([cx, cy]);
      if (h.length > 4) h.shift();

      if (h.length < 4) {
        // Linear fallback until enough points
        if (h.length >= 2) {
          const [px, py] = h[h.length - 2];
          const dx = cx - px, dy = cy - py;
          const steps = Math.ceil(Math.sqrt(dx * dx + dy * dy) / STEP);
          for (let i = 0; i <= steps; i++) {
            const t = steps ? i / steps : 0;
            paintAt(px + dx * t, py + dy * t);
          }
        } else {
          paintAt(cx, cy);
        }
        return;
      }

      // Catmull-Rom spline through last 4 points
      const [p0x, p0y] = h[0];
      const [p1x, p1y] = h[1];
      const [p2x, p2y] = h[2];
      const [p3x, p3y] = h[3];

      const dx = p2x - p1x, dy = p2y - p1y;
      const steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / STEP));

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        paintAt(
          catmullRom(p0x, p1x, p2x, p3x, t),
          catmullRom(p0y, p1y, p2y, p3y, t),
        );
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Group by opacity to minimize globalAlpha changes
      ctx.fillStyle = "#eae5de";
      for (const [key, cell] of cells.current) {
        ctx.globalAlpha = cell.opacity;
        const comma = key.indexOf(",");
        const gx = +key.slice(0, comma);
        const gy = +key.slice(comma + 1);
        ctx.fillRect(
          gx * GRID + (GRID - cell.size) / 2,
          gy * GRID + (GRID - cell.size) / 2,
          cell.size, cell.size,
        );
        if (--cell.ttl <= 0) cells.current.delete(key);
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2]"
    />
  );
}
