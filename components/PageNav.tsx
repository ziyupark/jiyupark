"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function PageNav({
  className,
  navStyle,
  hideOnScroll,
}: {
  className?: string;
  navStyle?: CSSProperties;
  hideOnScroll?: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (!hideOnScroll) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 10) { setHidden(false); lastY.current = y; return; }
      setHidden(y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll]);

  return (
    <nav
      className={`page-nav sticky top-0 z-50 flex items-end justify-between tracking-[-0.8px] mb-4${className ? ` ${className}` : ""}`}
      style={{
        ...navStyle,
        ...(hideOnScroll ? {
          transform: hidden ? "translateY(-120%)" : "translateY(0)",
          transition: "transform 0.35s ease",
        } : {}),
      }}
    >
      <Link href="/" className="nav-title nav-title-link transition-colors pointer-events-auto">
        Jiyu Park
      </Link>
      <Link href="/about" className="nav-about nav-info-link transition-colors pointer-events-auto">
        About
      </Link>
    </nav>
  );
}
