import { readFileSync } from "fs";
import { join } from "path";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import PageNav from "@/components/PageNav";
import LinkEmbed from "@/components/LinkEmbed";
import ScrollTop from "@/components/ScrollTop";
import DandelionScene from "@/components/DandelionScene";

export const dynamic = "force-dynamic";

/* ─── Types ──────────────────────────────────────────── */
type ImageEntry  = { src?: string; aspect?: string; url?: string };
type TextStyle   = { maxWidth?: number; letterSpacing?: number; lineHeight?: number; fontWeight?: number };

type ContentItem =
  | { type: "images";    images?: ImageEntry[]; srcs?: string[]; figmaUrl?: string }
  | { type: "image";     src: string; aspect?: string; linkUrl?: string }
  | { type: "text";      content: string }
  | { type: "link";      url: string; height?: number }
  | { type: "dandelion" };

interface Project {
  id: string;
  title: string;
  bgColor: string;
  imageUrl?: string;
  videoUrl?: string;
  content?: ContentItem[];
  textMaxWidth?: number;
  textLetterSpacing?: number;
  textLineHeight?: number;
  textFontWeight?: number;
}

/* ─── renderContentItem ──────────────────────────────── */
function renderContentItem(item: ContentItem, i: number, ts: TextStyle = {}) {
  if (item.type === "image" && item.src) {
    const { src, aspect, linkUrl } = item;
    const imgBox = (
      <div style={{ aspectRatio: aspect || undefined, borderRadius: "66px", overflow: "hidden", boxShadow: "0 0 0 0.6px #e7e7e7" }}>
        <img src={src} alt="" style={{ width: "100%", height: aspect ? "100%" : "auto", objectFit: "cover", display: "block" }} />
      </div>
    );
    return (
      <section key={i} className="home-proj-section">
        {linkUrl ? <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>{imgBox}</a> : imgBox}
      </section>
    );
  }

  if (item.type === "images") {
    const imgs: ImageEntry[] = item.images ?? (item.srcs ?? []).map(src => ({ src }));
    if (imgs.length === 0) return null;
    return (
      <section key={i} className="home-proj-section">
        <div style={{ display: "flex", gap: "36px", alignItems: "center", flexWrap: "wrap" }}>
          {imgs.map((img, j) => (
            <div key={j} style={{ flex: 1, minWidth: 0, aspectRatio: img.aspect ?? (img.url ? "16/9" : undefined), borderRadius: "66px", overflow: "hidden", boxShadow: "0 0 0 0.6px #e7e7e7" }}>
              {img.url
                ? <iframe src={img.url} style={{ width: "100%", height: "100%", border: "none", display: "block" }} allow="fullscreen" />
                : <img src={img.src} alt="" style={{ width: "100%", height: img.aspect ? "100%" : "auto", objectFit: "cover", display: "block" }} />
              }
            </div>
          ))}
        </div>
        {item.figmaUrl && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <a href={item.figmaUrl} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 18px", borderRadius: "999px",
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "-0.02em",
              color: "#0a0a0a", textDecoration: "none",
              background: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(20px) saturate(180%) brightness(1.08)",
              WebkitBackdropFilter: "blur(20px) saturate(180%) brightness(1.08)",
              border: "0.5px solid rgba(255,255,255,0.65)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75), 0 4px 24px rgba(0,0,0,0.10)",
            }}>
              Figma ↗
            </a>
          </div>
        )}
      </section>
    );
  }

  if (item.type === "dandelion") {
    return <DandelionScene key={i} />;
  }

  if (item.type === "link" && item.url) {
    return (
      <section key={i} style={{ paddingInline: "10vw", marginTop: "-150px" }}>
        <LinkEmbed url={item.url} height={item.height ?? 600} />
      </section>
    );
  }

  if (item.type === "text" && item.content.trim()) {
    const pStyle: CSSProperties = {
      ...(ts.maxWidth      !== undefined && { maxWidth:      `${ts.maxWidth}px`      }),
      ...(ts.letterSpacing !== undefined && { letterSpacing: `${ts.letterSpacing}em` }),
      ...(ts.lineHeight    !== undefined && { lineHeight:    ts.lineHeight           }),
      ...(ts.fontWeight    !== undefined && { fontWeight:    ts.fontWeight           }),
    };
    return (
      <section key={i} className="home-proj-section">
        <div className="proj-desc w-full">
          {item.content.split("\n\n").map((para, j) => <p key={j} style={pStyle}>{para}</p>)}
        </div>
      </section>
    );
  }

  return null;
}

/* ─── ProjectPage ────────────────────────────────────── */
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = JSON.parse(
    readFileSync(join(process.cwd(), "data", "projects.json"), "utf-8")
  ) as Project[];

  const project = projects.find(p => p.id === id);
  if (!project) notFound();

  const hasContent = !!project.content?.length;
  const isDandelion = project.content?.length === 1 && project.content[0].type === "dandelion";
  const textStyle: TextStyle = {
    maxWidth:      project.textMaxWidth,
    letterSpacing: project.textLetterSpacing,
    lineHeight:    project.textLineHeight,
    fontWeight:    project.textFontWeight,
  };

  return (
    <div className={`pt-[0.66rem] project-detail-page ${isDandelion ? "" : "pb-16"}`}>
      <ScrollTop />
      <div className="fixed inset-0 -z-10" style={{ background: "#ffffff" }} />
      <PageNav hideOnScroll />

      {hasContent && (
        <div
          className={isDandelion ? "mt-[80px]" : "mt-[150px]"}
          style={{ display: "flex", flexDirection: "column", gap: isDandelion ? "0" : "36px" }}
        >
          {project.content!.map((item, i) => renderContentItem(item, i, textStyle))}
        </div>
      )}
    </div>
  );
}
