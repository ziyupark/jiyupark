"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function StickyNav() {
  const [navSticky, setNavSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavSticky(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
      style={{
        opacity: navSticky ? 1 : 0,
        transform: navSticky ? "translateY(0)" : "translateY(-100%)",
        pointerEvents: navSticky ? "auto" : "none",
        backgroundColor: "rgba(8,8,8,0.76)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <nav className="flex justify-between items-center tracking-[-0.8px] px-[calc(16px+0.66rem)] py-[18px]">
        <Link href="/"      className="nav-title-link text-[38px] font-medium text-white transition-colors">Jiyu Park</Link>
        <Link href="/about" className="nav-info-link text-[1.75rem] font-normal text-[#A3A3A3] transition-colors">Info.</Link>
      </nav>
    </div>
  );
}
