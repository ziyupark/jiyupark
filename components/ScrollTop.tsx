"use client";
import { useEffect } from "react";

export default function ScrollTop() {
  useEffect(() => {
    // 브라우저 스크롤 복원을 수동으로 전환 → 자동 복원 차단
    if (history.scrollRestoration) history.scrollRestoration = "manual";
    // scroll-behavior: smooth 우회하여 즉시 최상단 이동
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return null;
}
