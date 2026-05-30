import { readFileSync } from "fs";
import { join } from "path";
import OrbitGallery from "@/components/OrbitGallery";
import PageNav from "@/components/PageNav";
import MouseTrail from "@/components/MouseTrail";
import SeoulClock from "@/components/SeoulClock";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About — Jiyu Park",
};

export default function AboutPage() {
  const about = JSON.parse(readFileSync(join(process.cwd(), "data/about.json"), "utf8"));
  const bioKo:            string = about.bioKo ?? "";
  const bioEn:            string = about.bioEn ?? "";
  const email:            string = about.email ?? "";
  const bioFontSize:      string = `${about.bioFontSize  ?? 19}px`;
  const bioMaxWidth:      string = `${about.bioMaxWidth  ?? 500}px`;
  const bioLetterSpacing: string = `${about.bioLetterSpacing ?? 0}em`;
  const bioLineHeight:    number = about.bioLineHeight   ?? 1.8;
  const bioFontWeight:    number = about.bioFontWeight   ?? 400;

  return (
    <div className="pt-[0.66rem] flex flex-col flex-1 relative about-page">

      <MouseTrail />

      {/* Gradient background */}
      <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(to bottom, #f0ece6, #82c9f2)" }} />

      {/* Nav */}
      <PageNav className="relative z-10 pointer-events-none" />

      {/* Orbit + Clock — centred, offset 70px down */}
      <div className="absolute inset-0">
        {/* Orbit */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <div style={{ transform: "translateY(80px)" }}>
            <OrbitGallery />
          </div>
        </div>
        {/* Seoul Clock — overlaid at orbit center */}
        <SeoulClock
          radius={about.radius ?? 431}
          imageSize={about.imageSize ?? 99}
          orbitOffsetY={110}
        />
      </div>

      {/* Bio — centred on screen */}
      <section className="relative z-10 pt-[26px] pb-14 pointer-events-none flex justify-center">
        <div className="flex flex-col items-center gap-6 text-center" style={{ maxWidth: bioMaxWidth }}>
          {bioKo && (
            <p className="pointer-events-auto" style={{ color: "var(--fg)", wordBreak: "keep-all", overflowWrap: "break-word", fontSize: bioFontSize, fontWeight: bioFontWeight, letterSpacing: bioLetterSpacing, lineHeight: bioLineHeight, textAlign: "center", fontFamily: "'Manrope', 'PretendardKR', 'Pretendard', sans-serif" }}>
              {bioKo}
            </p>
          )}

          {bioEn && (
            <p className="pointer-events-auto" style={{ color: "var(--fg)", wordBreak: "keep-all", overflowWrap: "break-word", fontSize: bioFontSize, fontWeight: bioFontWeight, letterSpacing: bioLetterSpacing, lineHeight: bioLineHeight, textAlign: "center", fontFamily: "'Manrope', 'PretendardKR', 'Pretendard', sans-serif" }}>
              {bioEn}
            </p>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="text-sm transition-colors pointer-events-auto"
              style={{ color: "var(--fg)" }}
            >
              {email}
            </a>
          )}
        </div>
      </section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ASCII art */}
      <div className="relative z-10 flex items-end justify-end pb-[1px] pr-[16px] -translate-y-[3px] select-none pointer-events-none">
        <pre
          className="font-mono font-bold text-[13px] leading-[1.5]"
          style={{ color: "#ffffff", fontFamily: "ui-monospace, 'Courier New', monospace" }}
        >{`    /)/)
  (-.- )
(")(")_o`}</pre>
      </div>
    </div>
  );
}
