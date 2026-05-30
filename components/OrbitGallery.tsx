"use client";

import { useEffect, useRef, useState } from "react";

const ORBIT_PAD = 20;
const TWO_PI = Math.PI * 2;

interface OrbitConfig {
  images: { src: string }[];
  imageSize: number;
  radius: number;
  speed: number; // seconds per full revolution
}

export default function OrbitGallery() {
  const [config, setConfig] = useState<OrbitConfig | null>(null);
  const [scale, setScale]   = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const anglesRef    = useRef<number[]>([]); // radians per item
  const radiiRef     = useRef<number[]>([]); // orbit radius per item
  const rafRef       = useRef<number>(0);
  const lastTimeRef  = useRef<number | null>(null);
  const scaleRef     = useRef(1);
  const dragging     = useRef<{ idx: number; offX: number; offY: number } | null>(null);

  useEffect(() => {
    fetch("/api/about").then(r => r.json()).then(setConfig).catch(() => {});
  }, []);

  // 뷰포트 크기에 맞게 orbit 스케일 계산
  useEffect(() => {
    if (!config) return;
    const size = (config.radius + config.imageSize / 2) * 2 + ORBIT_PAD * 2;
    const update = () => {
      const s = Math.min(window.innerWidth / size, window.innerHeight / size, 1);
      setScale(s);
      scaleRef.current = s;
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [config]);

  // 애니메이션 + 드래그 로직
  useEffect(() => {
    if (!config) return;
    const { images, radius, speed } = config;
    const angularSpeed = TWO_PI / speed; // rad/s

    // 초기 각도 & 반지름: 이미지들을 균등하게 배치
    anglesRef.current = images.map((_, i) => (i / images.length) * TWO_PI);
    radiiRef.current  = images.map(() => radius);

    // 애니메이션 루프
    const animate = (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1); // cap for tab focus
      lastTimeRef.current = time;

      itemRefs.current.forEach((el, i) => {
        if (!el || dragging.current?.idx === i) return;
        anglesRef.current[i] = (anglesRef.current[i] + angularSpeed * dt) % TWO_PI;
        const a = anglesRef.current[i];
        const r = radiiRef.current[i];
        el.style.transform = `translate(${r * Math.cos(a)}px, ${r * Math.sin(a)}px)`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // 드래그 핸들러 (mousemove / mouseup)
    const onMove = (e: MouseEvent) => {
      const d = dragging.current;
      if (!d || !containerRef.current) return;
      const el = itemRefs.current[d.idx];
      if (!el) return;
      const rect = containerRef.current.getBoundingClientRect();
      const s = scaleRef.current;
      const mx = (e.clientX - (rect.left + rect.width  / 2)) / s - d.offX;
      const my = (e.clientY - (rect.top  + rect.height / 2)) / s - d.offY;
      el.style.transform = `translate(${mx}px, ${my}px)`;
    };

    const onUp = (e: MouseEvent) => {
      const d = dragging.current;
      if (!d || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const s = scaleRef.current;
      const mx = (e.clientX - (rect.left + rect.width  / 2)) / s - d.offX;
      const my = (e.clientY - (rect.top  + rect.height / 2)) / s - d.offY;
      // 놓은 위치의 각도 & 거리 계산 → 제한 없이 그 자리에서 공전 재개
      const dist = Math.sqrt(mx * mx + my * my);
      radiiRef.current[d.idx]  = Math.max(dist, 1);
      anglesRef.current[d.idx] = (Math.atan2(my, mx) + TWO_PI) % TWO_PI;
      const el = itemRefs.current[d.idx];
      if (el) { el.style.zIndex = ""; el.style.cursor = "grab"; }
      document.body.style.cursor = "";
      dragging.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };

    // 각 아이템에 mousedown 연결
    const handlers: Array<(e: MouseEvent) => void> = [];
    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const onDown = (e: MouseEvent) => {
        e.preventDefault();
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const s = scaleRef.current;
        const a = anglesRef.current[idx];
        // 아이템 중심 (orbit 좌표계) — 현재 반지름 사용
        const r  = radiiRef.current[idx];
        const icx = r * Math.cos(a);
        const icy = r * Math.sin(a);
        // 마우스 (orbit 좌표계)
        const mcx = (e.clientX - (rect.left + rect.width  / 2)) / s;
        const mcy = (e.clientY - (rect.top  + rect.height / 2)) / s;
        dragging.current = { idx, offX: mcx - icx, offY: mcy - icy };
        el.style.zIndex = "10";
        el.style.cursor = "grabbing";
        document.body.style.cursor = "grabbing";
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup",   onUp);
      };
      el.addEventListener("mousedown", onDown);
      handlers[idx] = onDown;
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      handlers.forEach((h, idx) => itemRefs.current[idx]?.removeEventListener("mousedown", h));
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };
  }, [config]);

  if (!config || config.images.length === 0) return null;

  const { images, imageSize, radius } = config;
  const containerSize = (radius + imageSize / 2) * 2 + ORBIT_PAD * 2;
  const half = imageSize / 2;

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ width: containerSize, height: containerSize, flexShrink: 0, zoom: scale }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          ref={el => { itemRefs.current[i] = el; }}
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            marginTop: -half,
            marginLeft: -half,
            width: imageSize,
            height: imageSize,
            cursor: "grab",
            willChange: "transform",
            pointerEvents: "auto", // 부모의 pointer-events-none 오버라이드
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
          />
        </div>
      ))}
    </div>
  );
}
