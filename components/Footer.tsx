"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAbout = pathname === "/about";

  return (
    <footer
      className="relative z-10 border-t py-3 flex items-center justify-between px-[16px]"
      style={{ borderColor: isAbout ? "rgba(255,255,255,0.5)" : "#b3b3b3" }}
    >
      <div className="flex items-center gap-6">
        <p className="text-xs" style={{ color: isAbout ? "#ffffff" : "#969696" }}>Seoul, South Korea</p>
        <a
          href="https://linkedin.com/in/jiyupark"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors"
          style={{ color: isAbout ? "#ffffff" : "#969696" }}
        >
          LinkedIn
        </a>
        <a
          href="mailto:ziyupark.kr@gmail.com"
          className="text-xs transition-colors"
          style={{ color: isAbout ? "#ffffff" : "#969696" }}
        >
          ziyupark.kr@gmail.com
        </a>
      </div>

      <div className="flex items-center gap-6">
        <p className="text-xs" style={{ color: isAbout ? "#ffffff" : "#969696" }}>
          © {new Date().getFullYear()} Jiyu Park. All rights reserved.
        </p>
        {isAbout && (
          <Link
            href="/admin"
            className="text-xs transition-colors"
            style={{ color: "#ffffff" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#0a0a0a")}
            onMouseLeave={e => (e.currentTarget.style.color = "#ffffff")}
          >
            Admin
          </Link>
        )}
      </div>
    </footer>
  );
}
