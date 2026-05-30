"use client";

import { useRef, useEffect, useState } from "react";

const EMBED_WIDTH = 1280;
const SCROLLBAR_GUTTER = 20; // pushes iframe scrollbar outside the clipped area

export default function LinkEmbed({ url, height }: { url: string; height: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      if (wrapperRef.current) {
        setScale(wrapperRef.current.offsetWidth / EMBED_WIDTH);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const displayHeight = scale !== null ? Math.round(height * scale) : height;

  return (
    <div ref={wrapperRef} style={{ overflow: "hidden", height: `${displayHeight}px` }}>
      <iframe
        src={url}
        style={{
          width:  scale !== null ? `${EMBED_WIDTH + SCROLLBAR_GUTTER}px` : "100%",
          height: scale !== null ? `${height}px`                          : "100%",
          border: "none",
          display: "block",
          transform: scale !== null ? `scale(${scale})` : undefined,
          transformOrigin: "top left",
        }}
        allow="fullscreen; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </div>
  );
}
