"use client";

import { useEffect, useRef, useState } from "react";

const ORBIT_PAD = 20;

function getSeoulTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000); // UTC+9
}

interface Props {
  /** orbit radius (px, unscaled) */
  radius: number;
  /** orbit item size (px) */
  imageSize: number;
  /** vertical offset matching the orbit translateY (px) */
  orbitOffsetY?: number;
}

export default function SeoulClock({ radius, imageSize, orbitOffsetY = 0 }: Props) {
  const containerSize = (radius + imageSize / 2) * 2 + ORBIT_PAD * 2;
  // Clock face fills the inner clear space of the orbit
  const D  = (radius - imageSize / 2 - 8) * 2; // face diameter
  const R  = D / 2;                             // face radius
  const CX = R;
  const CY = R;

  const [scale, setScale] = useState(1);
  const frameRef = useRef<number>(0);
  const [, forceUpdate] = useState(0);

  // Same scale logic as OrbitGallery
  useEffect(() => {
    const update = () => {
      const s = Math.min(
        window.innerWidth  / containerSize,
        window.innerHeight / containerSize,
        1
      );
      setScale(s);
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [containerSize]);

  // Smooth tick at ~10fps (battery-friendly, smooth enough)
  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    id = setInterval(() => forceUpdate(n => n + 1), 100);
    return () => clearInterval(id);
  }, []);

  const toXY = (deg: number, len: number) => ({
    x: CX + len * Math.cos((deg - 90) * (Math.PI / 180)),
    y: CY + len * Math.sin((deg - 90) * (Math.PI / 180)),
  });

  const t   = getSeoulTime();
  const sec = t.getSeconds() + t.getMilliseconds() / 1000;
  const min = t.getMinutes() + sec / 60;
  const hr  = (t.getHours() % 12) + min / 60;

  const hDeg = (hr  / 12) * 360;
  const mDeg = (min / 60) * 360;
  const sDeg = (sec / 60) * 360;

  const h     = toXY(hDeg, R * 0.46);
  const m     = toXY(mDeg, R * 0.70);
  const sFwd  = toXY(sDeg, R * 0.84);
  const sTail = toXY(sDeg + 180, R * 0.20);

  const svgH = D + 36; // extra room for label

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `translateY(${orbitOffsetY}px)` }}
    >
      <svg
        width={D}
        height={svgH}
        viewBox={`0 0 ${D} ${svgH}`}
        style={{ zoom: scale, overflow: "visible" }}
      >


        {/* ── Hour hand ── */}
        <line
          x1={CX} y1={CY} x2={h.x} y2={h.y}
          stroke="#0a0a0a"
          strokeWidth={R * 0.016}
          strokeLinecap="round"
        />

        {/* ── Minute hand ── */}
        <line
          x1={CX} y1={CY} x2={m.x} y2={m.y}
          stroke="#0a0a0a"
          strokeWidth={R * 0.009}
          strokeLinecap="round"
        />

        {/* ── Second hand + counterbalance tail ── */}
        <line
          x1={sTail.x} y1={sTail.y} x2={sFwd.x} y2={sFwd.y}
          stroke="#0a0a0a"
          strokeWidth={R * 0.004}
          strokeLinecap="round"
        />

        {/* ── Center dot ── */}
        <circle cx={CX} cy={CY} r={R * 0.010} fill="#0a0a0a" />

        {/* ── Label ── */}
        <text
          x={CX}
          y={D + 24}
          textAnchor="middle"
          fontFamily="'Manrope', sans-serif"
          fontSize={18}
          fontWeight={600}
          letterSpacing="-0.3"
          fill="#030303"
        >
          SEOUL, KOREA
        </text>
      </svg>
    </div>
  );
}
