"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────── */
type ImageEntry = { src?: string; aspect?: string; url?: string; ogImageUrl?: string };

type ContentItem =
  | { type: "images"; images?: ImageEntry[]; srcs?: string[]; figmaUrl?: string }
  | { type: "image";  src: string; aspect?: string; linkUrl?: string }
  | { type: "text";   content: string }
  | { type: "link";   url: string; height?: number };

interface Project {
  id: string;
  title: string;
  bgColor: string;
  imageUrl?: string;
  videoUrl?: string;
  span?: number;
  content?: ContentItem[];
  textMaxWidth?: number;
  textLetterSpacing?: number;
  textLineHeight?: number;
  textFontWeight?: number;
}

type TextStyle = { maxWidth?: number; letterSpacing?: number; lineHeight?: number; fontWeight?: number };

/* ─── UploadTrigger ──────────────────────────────────── */
function UploadTrigger({ onPath, accept }: { onPath: (p: string) => void; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const upload = useCallback(async (file: File) => {
    setLoading(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.path) onPath(data.path);
    } finally { setLoading(false); }
  }, [onPath]);
  return (
    <>
      <input ref={ref} type="file" accept={accept ?? "image/*,video/*,.gif"} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      <button type="button" onClick={() => ref.current?.click()}
        className="shrink-0 px-4 rounded-xl text-[12px] font-semibold transition-colors"
        style={{ background: loading ? "#EEF4FF" : "#3182F6", color: loading ? "#0284C7" : "#fff", height: "38px", minWidth: "60px" }}>
        {loading ? "↑" : "추가"}
      </button>
    </>
  );
}

/* ─── Toast ──────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: "ok" | "err" }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
      style={{ background: type === "ok" ? "#F0FFF4" : "#FFF0F0", color: type === "ok" ? "#16A34A" : "#FF6B6B", border: `1px solid ${type === "ok" ? "#BBF7D0" : "#FECACA"}` }}>
      {type === "ok" ? "✓" : "✕"} {msg}
    </div>
  );
}

/* ─── LoginScreen ───────────────────────────────────── */
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false); const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const submit = async () => {
    if (!pw) return; setLoading(true); setErr(false);
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    setLoading(false);
    if (res.ok) { sessionStorage.setItem("admin_auth", "1"); onSuccess(); }
    else { setErr(true); setPw(""); inputRef.current?.focus(); }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "#F4F4F4" }}>
      <div className="w-[360px] rounded-3xl p-8 flex flex-col gap-6" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div className="flex flex-col gap-1">
          <span className="text-[22px] font-bold tracking-[-0.6px]" style={{ color: "#0a0a0a" }}>관리자</span>
          <span className="text-[13px]" style={{ color: "#888" }}>비밀번호를 입력하세요</span>
        </div>
        <div className="flex flex-col gap-2">
          <input ref={inputRef} type="password" value={pw}
            onChange={e => { setPw(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="비밀번호"
            className="w-full px-4 py-3.5 rounded-2xl text-[15px] outline-none transition-all"
            style={{ background: "#F5F5F5", color: "#0a0a0a", border: err ? "1px solid #FF6B6B" : "1px solid #E0E0E0", letterSpacing: "0.1em" }} />
          {err && <p className="text-[12px] px-1" style={{ color: "#FF6B6B" }}>비밀번호가 올바르지 않습니다.</p>}
        </div>
        <button onClick={submit} disabled={loading || !pw}
          className="w-full py-3.5 rounded-2xl text-[15px] font-semibold transition-all"
          style={{ background: pw ? "#3182F6" : "#EFEFEF", color: pw ? "#fff" : "#CCC", cursor: pw ? "pointer" : "default" }}>
          {loading ? "확인 중…" : "확인"}
        </button>
      </div>
    </div>
  );
}

/* ─── PasswordPanel ──────────────────────────────────── */
function PasswordPanel({ showToast }: { showToast: (msg: string, type: "ok" | "err") => void }) {
  const [cur, setCur] = useState(""); const [next, setNext] = useState(""); const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!cur || !next) return;
    if (next !== confirm) { showToast("새 비밀번호가 일치하지 않습니다.", "err"); return; }
    setLoading(true);
    const res = await fetch("/api/auth", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: cur, next }) });
    const data = await res.json(); setLoading(false);
    if (res.ok) { showToast("비밀번호 변경 완료", "ok"); setCur(""); setNext(""); setConfirm(""); }
    else showToast(data.msg ?? "변경 실패", "err");
  };
  const pw = (label: string, val: string, set: (v: string) => void) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium" style={{ color: "#888" }}>{label}</label>
      <input type="password" value={val} onChange={e => set(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
        className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
        style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", letterSpacing: "0.08em" }} />
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      {pw("현재 비밀번호", cur, setCur)}{pw("새 비밀번호", next, setNext)}{pw("새 비밀번호 확인", confirm, setConfirm)}
      <button onClick={submit} disabled={loading || !cur || !next || !confirm}
        className="py-2.5 rounded-xl text-[13px] font-semibold transition-all mt-1"
        style={{ background: cur && next && confirm ? "#3182F6" : "#EFEFEF", color: cur && next && confirm ? "#fff" : "#CCC" }}>
        {loading ? "변경 중…" : "비밀번호 변경"}
      </button>
    </div>
  );
}

/* ─── Field ──────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, mono, upload }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; upload?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium" style={{ color: "#888" }}>{label}</label>
      <div className="flex gap-2">
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none"
          style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", fontFamily: mono ? "monospace" : undefined }} />
        {upload && <UploadTrigger onPath={onChange} />}
      </div>
    </div>
  );
}

/* ─── SliderField ─────────────────────────────────────── */
function SliderField({ label, value, onChange, min, max, step, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium" style={{ color: "#888" }}>{label}</label>
        <span className="text-[12px] font-mono tabular-nums" style={{ color: "#555" }}>{value}{unit ?? ""}</span>
      </div>
      <input type="range" min={min} max={max} step={step ?? 1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full outline-none cursor-pointer" style={{ accentColor: "#3182F6" }} />
      <div className="flex justify-between">
        <span className="text-[10px]" style={{ color: "#CCC" }}>{min}{unit ?? ""}</span>
        <span className="text-[10px]" style={{ color: "#CCC" }}>{max}{unit ?? ""}</span>
      </div>
    </div>
  );
}

/* ─── Aspect constants + shared MiniAspectPicker ─────── */
const ASPECTS = [
  { label: "자동",  value: "",      w: 28, h: 20 },
  { label: "16:9", value: "16/9",  w: 28, h: 16 },
  { label: "3:2",  value: "3/2",   w: 28, h: 19 },
  { label: "4:3",  value: "4/3",   w: 28, h: 21 },
  { label: "1:1",  value: "1/1",   w: 26, h: 26 },
  { label: "4:5",  value: "4/5",   w: 22, h: 28 },
  { label: "2:3",  value: "2/3",   w: 19, h: 28 },
];

function MiniAspectPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {ASPECTS.map(a => {
        const active = value === a.value;
        const s = 14 / Math.max(a.w, a.h);
        return (
          <button key={a.label} onClick={() => onChange(a.value)}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg"
            style={{ background: active ? "#EEF4FF" : "#F0F0F0", border: `1px solid ${active ? "#3182F6" : "#E0E0E0"}` }}>
            <div style={{
              width: `${Math.round(a.w * s)}px`, height: `${Math.round(a.h * s)}px`,
              background: active ? "#3182F6" : "#CCC", borderRadius: "2px",
              border: a.value === "" ? `1px dashed ${active ? "#3182F6" : "#CCC"}` : undefined,
            }} />
            <span className="text-[8px]" style={{ color: active ? "#3182F6" : "#AAA" }}>{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── ContentImageEditor ─────────────────────────────── */
function ContentImageEditor({ images, onChange }: { images: ImageEntry[]; onChange: (imgs: ImageEntry[]) => void }) {
  const [uploading,  setUploading]  = useState(false);
  const [fetchingOg, setFetchingOg] = useState(false);
  const [linkPopup,  setLinkPopup]  = useState(false);
  const [popUrl,     setPopUrl]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.path) onChange([...images, { src: data.path }]);
    } finally { setUploading(false); }
  };
  const updateAspect = (i: number, aspect: string) => {
    const next = [...images]; next[i] = { ...next[i], aspect: aspect || undefined }; onChange(next);
  };
  const remove = (i: number) => onChange(images.filter((_, j) => j !== i));
  const saveLink = async () => {
    if (!popUrl.trim()) return;
    setFetchingOg(true);
    let ogImageUrl: string | undefined;
    try {
      const r = await fetch(`/api/og?url=${encodeURIComponent(popUrl.trim())}`);
      const d = await r.json();
      ogImageUrl = d.imageUrl || undefined;
    } catch {}
    setFetchingOg(false);
    onChange([...images, { url: popUrl.trim(), ogImageUrl }]);
    setPopUrl(""); setLinkPopup(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <input ref={fileRef} type="file" accept="image/*,.gif" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />

      {images.map((img, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #E3E3E3" }}>
          <div className="relative shrink-0">
            <div className="w-[100px] h-[68px] rounded-lg overflow-hidden" style={{ background: img.url ? "#EEF4FF" : "#EFEFEF" }}>
              {(img.ogImageUrl ?? img.src) ? (
                <img src={img.ogImageUrl ?? img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : img.url ? (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🔗</div>
              ) : null}
            </div>
            {img.url && (
              <span className="absolute bottom-0.5 left-1 text-[8px] font-semibold" style={{ color: "#3B82F6" }}>링크</span>
            )}
            <button onClick={() => remove(i)}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
              style={{ background: "#FF6B6B", color: "#fff" }}>✕</button>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {img.url && <span className="text-[10px] truncate font-mono" style={{ color: "#3B82F6" }}>{img.url}</span>}
            <span className="text-[10px]" style={{ color: "#AAA" }}>비율</span>
            <MiniAspectPicker value={img.aspect ?? ""} onChange={aspect => updateAspect(i, aspect)} />
          </div>
        </div>
      ))}

      {/* 버튼 행 */}
      <div className="flex gap-2">
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex-1 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: uploading ? "#EEF4FF" : "#FFFFFF", color: uploading ? "#0284C7" : "#3182F6", border: "1px solid #E0E0E0" }}>
          {uploading ? "업로드 중…" : "+ 이미지 추가"}
        </button>
        <button onClick={() => { setPopUrl(""); setLinkPopup(true); }}
          className="flex-1 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: "#EEF4FF", color: "#3182F6", border: "1px solid #BFDBFE" }}>
          + 링크 추가
        </button>
      </div>

      {/* 링크 팝업 */}
      {linkPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={e => { if (e.target === e.currentTarget) setLinkPopup(false); }}>
          <div className="w-[380px] rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
            <p className="text-[17px] font-bold tracking-[-0.4px]" style={{ color: "#0a0a0a" }}>링크 추가</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium" style={{ color: "#888" }}>URL *</label>
              <input type="text" value={popUrl} onChange={e => setPopUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveLink()}
                placeholder="https://..." autoFocus
                className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", fontFamily: "monospace" }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setLinkPopup(false)}
                className="flex-1 py-2.5 rounded-xl text-[13px]"
                style={{ background: "#F5F5F5", color: "#888", border: "1px solid #E0E0E0" }}>취소</button>
              <button onClick={saveLink} disabled={!popUrl.trim() || fetchingOg}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold"
                style={{ background: popUrl.trim() && !fetchingOg ? "#3182F6" : "#EFEFEF", color: popUrl.trim() && !fetchingOg ? "#fff" : "#CCC" }}>
                {fetchingOg ? "이미지 불러오는 중…" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ContentBlockEditor (single block) ──────────────── */
function ContentBlockEditor({ item, index, total, onChange, onDelete, onMove, textStyle }: {
  item: ContentItem; index: number; total: number;
  onChange: (item: ContentItem) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  textStyle: TextStyle;
}) {
  const isImages = item.type === "images";
  const isImage  = item.type === "image";
  const isLink   = item.type === "link";
  const imgItem  = item as Extract<ContentItem, { type: "image" }>;
  const imgsItem = item as Extract<ContentItem, { type: "images" }>;
  const textItem = item as Extract<ContentItem, { type: "text" }>;
  const linkItem = item as Extract<ContentItem, { type: "link" }>;
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E0E0E0" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#F2F2F2" }}>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
          style={{
            background: isImages ? "#DCFCE7" : isImage ? "#DBEAFE" : isLink ? "#FFF7ED" : "#EDE9FE",
            color:      isImages ? "#16A34A" : isImage ? "#2563EB" : isLink ? "#EA580C" : "#6D28D9",
          }}>
          {isImages ? "멀티이미지" : isImage ? "이미지" : isLink ? "링크" : "텍스트"}
        </span>
        <span className="flex-1 text-[12px] truncate" style={{ color: "#AAA" }}>
          {isImages
            ? `${(imgsItem.images?.length ?? imgsItem.srcs?.length ?? 0)}장`
            : isImage
            ? (imgItem.src.split("/").pop() || "이미지 없음")
            : isLink
            ? (linkItem.url || "URL 없음")
            : (textItem.content.slice(0, 40) || "내용 없음")}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onMove(-1)} disabled={index === 0}
            className="w-6 h-6 flex items-center justify-center rounded text-[11px]"
            style={{ color: index === 0 ? "#D0D0D0" : "#888" }}>↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            className="w-6 h-6 flex items-center justify-center rounded text-[11px]"
            style={{ color: index === total - 1 ? "#D0D0D0" : "#888" }}>↓</button>
          <button onClick={onDelete} className="px-2 py-0.5 rounded-lg text-[11px]"
            style={{ color: "#FF6B6B", background: "#FFF0F0" }}>✕</button>
        </div>
      </div>
      {/* Body */}
      <div className="px-3 py-3" style={{ background: "#FAFAFA" }}>
        {isLink ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium" style={{ color: "#888" }}>URL</label>
              <input type="text" value={linkItem.url}
                onChange={e => onChange({ ...linkItem, url: e.target.value })}
                placeholder="https://..."
                className="px-3 py-2.5 rounded-xl text-[12px] outline-none"
                style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", fontFamily: "monospace" }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium" style={{ color: "#888" }}>높이 (px)</label>
              <input type="number" value={linkItem.height ?? 600}
                onChange={e => onChange({ ...linkItem, height: Number(e.target.value) || 600 })}
                placeholder="600"
                className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", fontFamily: "monospace" }} />
            </div>
            {linkItem.url && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#EEF4FF", border: "1px solid #BFDBFE" }}>
                <span className="text-[11px]" style={{ color: "#3B82F6" }}>🔗</span>
                <span className="text-[11px] truncate font-mono" style={{ color: "#3B82F6" }}>{linkItem.url}</span>
              </div>
            )}
          </div>
        ) : isImage ? (
          <div className="flex flex-col gap-2">
            {imgItem.src && (
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #E3E3E3" }}>
                <div className="relative shrink-0">
                  <div className="w-[100px] h-[68px] rounded-lg overflow-hidden" style={{ background: "#EFEFEF" }}>
                    <img src={imgItem.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <button onClick={() => onChange({ ...imgItem, src: "" })}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                    style={{ background: "#FF6B6B", color: "#fff" }}>✕</button>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-[10px]" style={{ color: "#AAA" }}>비율</span>
                  <MiniAspectPicker value={imgItem.aspect ?? ""} onChange={v => onChange({ ...imgItem, aspect: v || undefined })} />
                </div>
              </div>
            )}
            <UploadTrigger onPath={src => onChange({ ...imgItem, src })} accept="image/*,.gif" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium" style={{ color: "#888" }}>링크 URL (선택)</label>
              <input type="text" value={imgItem.linkUrl ?? ""}
                onChange={e => onChange({ ...imgItem, linkUrl: e.target.value || undefined })}
                placeholder="https://..."
                className="px-3 py-2.5 rounded-xl text-[12px] outline-none"
                style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", fontFamily: "monospace" }} />
            </div>
          </div>
        ) : isImages ? (
          <ContentImageEditor
            images={imgsItem.images ?? (imgsItem.srcs ?? []).map(src => ({ src }))}
            onChange={imgs => onChange({ ...imgsItem, images: imgs })}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {/* 편집 영역 */}
            <textarea
              value={textItem.content}
              onChange={e => onChange({ ...textItem, content: e.target.value })}
              placeholder="텍스트를 입력하세요&#10;&#10;빈 줄로 단락을 구분합니다."
              rows={3}
              className="w-full rounded-xl outline-none resize-y"
              style={{
                background: "#F5F5F5", color: "#0a0a0a",
                border: "1px solid #E0E0E0", padding: "0.5rem 0.75rem",
                fontSize: "12px", lineHeight: "1.5", fontFamily: "monospace",
              }}
            />
            {/* 실제 렌더링 미리보기 */}
            {textItem.content.trim() && (
              <div style={{ display: "flex", justifyContent: "center", background: "#f5f5f5", borderRadius: "12px", padding: "1.5rem 1rem", transition: "all 0.2s" }}>
                <div style={{ width: "100%", maxWidth: `${textStyle.maxWidth ?? 808}px`, transition: "max-width 0.2s ease" }}>
                  {textItem.content.split("\n\n").map((para, j, arr) => (
                    <p key={j} style={{
                      fontSize: "1.125rem",
                      lineHeight: textStyle.lineHeight ?? 1.9,
                      letterSpacing: `${textStyle.letterSpacing ?? 0}em`,
                      fontWeight: textStyle.fontWeight ?? 400,
                      color: "#0a0a0a",
                      margin: j < arr.length - 1 ? "0 0 1.75em" : "0",
                      textAlign: "center", wordBreak: "keep-all", overflowWrap: "break-word",
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}>{para}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ContentListEditor ──────────────────────────────── */
function ContentListEditor({ items, onChange, textStyle }: {
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  textStyle: TextStyle;
}) {
  const update = (i: number, item: ContentItem) => { const n = [...items]; n[i] = item; onChange(n); };
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move   = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && (
        <p className="text-[12px] py-4 text-center rounded-xl" style={{ color: "#BBB", background: "#F8F8F8", border: "1px solid #EBEBEB" }}>
          아래 버튼으로 콘텐츠를 추가하세요
        </p>
      )}
      {items.map((item, i) => (
        <ContentBlockEditor key={i} item={item} index={i} total={items.length}
          onChange={b => update(i, b)} onDelete={() => remove(i)} onMove={dir => move(i, dir)} textStyle={textStyle} />
      ))}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onChange([...items, { type: "images", images: [] }])}
          className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold"
          style={{ background: "#F0FFF4", color: "#16A34A", border: "1px solid #BBF7D0" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#E5FFE5")}
          onMouseLeave={e => (e.currentTarget.style.background = "#F0FFF4")}>
          + 이미지 추가
        </button>
        <button onClick={() => onChange([...items, { type: "text", content: "" }])}
          className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold"
          style={{ background: "#F5F0FF", color: "#6D28D9", border: "1px solid #DDD6FE" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#EDE9FF")}
          onMouseLeave={e => (e.currentTarget.style.background = "#F5F0FF")}>
          + 텍스트 추가
        </button>
        <button onClick={() => onChange([...items, { type: "link", url: "" }])}
          className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold"
          style={{ background: "#FFF7ED", color: "#EA580C", border: "1px solid #FED7AA" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#FFEDD5")}
          onMouseLeave={e => (e.currentTarget.style.background = "#FFF7ED")}>
          + 링크 단독 사용
        </button>
      </div>
    </div>
  );
}

/* ─── GridBuilder ────────────────────────────────────── */
function autoSpan(i: number, total: number): number {
  const pos = i % 5;
  if (pos < 2) return 3;
  if (pos === 2 && i === total - 1) return 6;
  return 2;
}

const RATIO_OPTS = [
  { label: "3열",   span: 2, color: "#68D391", activeText: "#fff", desc: "정방형 · 줄당 3개" },
  { label: "2열",   span: 3, color: "#63B3ED", activeText: "#fff", desc: "세로형 · 줄당 2개" },
  { label: "와이드", span: 4, color: "#F6AD55", activeText: "#fff", desc: "와이드 · 2/3 너비" },
] as const;

function GridBuilder({ projects, onChange }: { projects: Project[]; onChange: (p: Project[]) => void }) {
  const [dragSource, setDragSource] = useState<{ id: string } | null>(null);
  const [overId,     setOverId]     = useState<string | null>(null);

  const computeRows = (projs: Project[]): Project[][] => {
    const rows: Project[][] = [];
    let cur: Project[] = [], used = 0;
    projs.forEach((p, i) => {
      const span = p.span ?? autoSpan(i, projs.length);
      if (used > 0 && used + span > 6) { rows.push(cur); cur = [p]; used = span; }
      else { cur.push(p); used += span; }
    });
    if (cur.length > 0) rows.push(cur);
    return rows;
  };

  const setSpan = (id: string, span: number) =>
    onChange(projects.map(p => p.id === id ? { ...p, span } : p));

  const reorder = (fromId: string, toId: string) => {
    const arr = [...projects];
    const fi = arr.findIndex(p => p.id === fromId);
    const ti = arr.findIndex(p => p.id === toId);
    const [item] = arr.splice(fi, 1);
    arr.splice(ti, 0, item);
    onChange(arr);
  };

  const rows = computeRows(projects);

  /* 비율별 aspect-ratio 값 */
  const aspectOf = (span: number) =>
    span === 6 ? "10/11" : span === 3 ? "10/11" : span === 4 ? "2/1" : "1/1";

  return (
    <div>
      {/* 범례 */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {RATIO_OPTS.map(opt => (
          <div key={opt.label} style={{ display: "flex", alignItems: "center", gap: "8px",
            background: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "10px", padding: "8px 12px" }}>
            <div style={{
              background: opt.color + "33",
              border: `1.5px solid ${opt.color}`,
              borderRadius: "5px",
              width: opt.span === 2 ? "14px" : opt.span === 3 ? "22px" : opt.span === 4 ? "30px" : "44px",
              height: opt.span === 2 ? "14px" : opt.span === 3 ? "26px" : opt.span === 4 ? "26px" : "52px",
              flexShrink: 0,
            }} />
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#333", margin: 0 }}>{opt.label}</p>
              <p style={{ fontSize: "10px", color: "#AAA", margin: 0 }}>{opt.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "11px", fontWeight: 500, color: "#BBBBBB", marginBottom: "16px" }}>
        비율 버튼으로 카드 크기를 설정하고 드래그해서 순서를 변경하세요. <span style={{ color: "#3182F6" }}>dense 모드</span>가 적용되어 빈 공간이 자동으로 채워집니다.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            {/* 행 헤더 */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#BBBBBB", whiteSpace: "nowrap" }}>{rowIndex + 1}행</span>
              <span style={{ fontSize: "10px", color: "#CCCCCC" }}>{row.length}개</span>
              <div style={{ flex: 1, height: "1px", background: "#E8E8E8" }} />
            </div>
            {/* 6열 그리드 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
              {row.map((p) => {
                const gi   = projects.findIndex(proj => proj.id === p.id);
                const span = p.span ?? autoSpan(gi, projects.length);
                const isOver     = overId === p.id;
                const isDragging = dragSource?.id === p.id;
                const activeOpt  = RATIO_OPTS.find(o => o.span === span);
                const aspect     = aspectOf(span);
                return (
                  <div key={p.id} draggable
                    onDragStart={() => setDragSource({ id: p.id })}
                    onDragOver={e => { e.preventDefault(); setOverId(p.id); }}
                    onDrop={() => {
                      if (dragSource && dragSource.id !== p.id) reorder(dragSource.id, p.id);
                      setDragSource(null); setOverId(null);
                    }}
                    onDragEnd={() => { setDragSource(null); setOverId(null); }}
                    style={{
                      gridColumn: `span ${span}`,
                      borderRadius: "14px",
                      background: isOver ? "#EEF4FF" : "#F7F7F7",
                      border: `2px solid ${isOver ? "#3182F6" : activeOpt ? activeOpt.color + "55" : "#E8E8E8"}`,
                      cursor: "grab",
                      opacity: isDragging ? 0.35 : 1,
                      transition: "border-color 0.12s, background 0.12s, opacity 0.12s",
                      userSelect: "none", overflow: "hidden",
                    }}>
                    {/* 썸네일 미리보기 */}
                    <div style={{ width: "100%", aspectRatio: aspect, background: p.bgColor || "#EFEFEF",
                      position: "relative", overflow: "hidden", flexShrink: 0 }}>
                      {p.videoUrl
                        ? <video src={p.videoUrl} muted autoPlay loop playsInline
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : p.imageUrl
                        ? <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : null}
                      {/* 비율 표시 */}
                      {activeOpt && (
                        <span style={{ position: "absolute", top: "6px", right: "8px",
                          fontSize: "9px", fontWeight: 700, color: "#fff",
                          background: activeOpt.color + "CC",
                          borderRadius: "4px", padding: "2px 5px" }}>
                          {activeOpt.label}
                        </span>
                      )}
                    </div>
                    {/* 프로젝트명 + 비율 버튼 */}
                    <div style={{ padding: "8px 10px 10px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#333", display: "block",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "6px" }}>
                        {p.title}
                      </span>
                      <div style={{ display: "flex", gap: "4px" }}
                        onMouseDown={e => e.stopPropagation()}>
                        {RATIO_OPTS.map(opt => {
                          const active = span === opt.span;
                          return (
                            <button key={opt.label}
                              onClick={e => { e.stopPropagation(); setSpan(p.id, opt.span); }}
                              style={{
                                flex: 1, height: "24px", borderRadius: "6px",
                                border: `1.5px solid ${active ? opt.color : "#E8E8E8"}`,
                                background: active ? opt.color : "#FFFFFF",
                                color: active ? opt.activeText : "#C0C0C0",
                                fontSize: "10px", fontWeight: 700,
                                cursor: "pointer", transition: "all 0.12s",
                              }}>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── OrbitImageListEditor ───────────────────────────── */
function OrbitImageListEditor({ items, onChange }: { items: { src: string }[]; onChange: (items: { src: string }[]) => void }) {
  const [newSrc, setNewSrc] = useState(""); const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null); const dragIndex = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const add = (src = newSrc) => { if (!src.trim()) return; onChange([...items, { src: src.trim() }]); setNewSrc(""); };
  const handleUpload = async (file: File) => {
    setUploading(true); const fd = new FormData(); fd.append("file", file);
    try { const res = await fetch("/api/upload", { method: "POST", body: fd }); const data = await res.json(); if (data.path) add(data.path); }
    finally { setUploading(false); }
  };
  const onDragStart = (i: number) => { dragIndex.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const onDrop = (i: number) => {
    if (dragIndex.current === null || dragIndex.current === i) { setDragOver(null); return; }
    const next = [...items]; const [moved] = next.splice(dragIndex.current, 1); next.splice(i, 0, moved);
    onChange(next); dragIndex.current = null; setDragOver(null);
  };
  const onDragEnd = () => { dragIndex.current = null; setDragOver(null); };
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E0E0E0" }}>
        {items.length === 0 && <p className="px-3 py-3 text-[12px]" style={{ color: "#BBB" }}>이미지 없음</p>}
        {items.map((item, i) => (
          <div key={i} draggable onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e, i)}
            onDrop={() => onDrop(i)} onDragEnd={onDragEnd}
            className="flex items-center gap-2 px-3 py-2 transition-colors"
            style={{ borderBottom: i < items.length - 1 ? "1px solid #EBEBEB" : undefined, background: dragOver === i ? "#F0FFF4" : "#FFFFFF", cursor: "grab" }}>
            <span className="text-[14px] shrink-0 select-none" style={{ color: "#CCC" }}>⠿</span>
            <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "#EFEFEF" }}>
              {/\.(mp4|webm|mov|avi)$/i.test(item.src) ? <span className="text-[10px]" style={{ color: "#0284C7" }}>▶</span>
                : <img src={item.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <span className="flex-1 text-[12px] truncate" style={{ color: "#888", fontFamily: "monospace" }}>{item.src}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-[11px] shrink-0" style={{ color: "#CCC" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FF6B6B")} onMouseLeave={e => (e.currentTarget.style.color = "#CCC")}>✕</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input ref={fileRef} type="file" accept="image/*,video/*,.gif" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
        <input type="text" value={newSrc} onChange={e => setNewSrc(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          placeholder="경로 입력 또는 추가 버튼으로 파일 선택" className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none"
          style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", fontFamily: "monospace" }} />
        <button onClick={() => newSrc.trim() ? add() : fileRef.current?.click()} disabled={uploading}
          className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors"
          style={{ background: uploading ? "#EEF4FF" : "#3182F6", color: uploading ? "#0284C7" : "#fff", minWidth: "60px" }}>
          {uploading ? "↑" : "추가"}
        </button>
      </div>
    </div>
  );
}

/* ─── AboutConfig ─────────────────────────────────────── */
interface AboutConfig {
  images: { src: string }[]; imageSize: number; radius: number; speed: number;
  bioKo?: string; bioEn?: string; email?: string;
  bioLetterSpacing?: number; bioLineHeight?: number; bioFontSize?: number; bioFontWeight?: number; bioMaxWidth?: number;
}

type Panel = "grid" | "projects" | "about" | "settings";
const PANEL_LABEL: Record<Panel, string> = { grid: "그리드", projects: "프로젝트", about: "About", settings: "설정" };

/* ─── AdminPage ──────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const [authed,     setAuthed]     = useState(false);
  const [ready,      setReady]      = useState(false);
  const [panel,      setPanel]      = useState<Panel>("grid");
  const [projects,   setProjects]   = useState<Project[]>([]);
  const [selected,   setSelected]   = useState<Project | null>(null);
  const [draft,      setDraft]      = useState<Project | null>(null);
  const [search,     setSearch]     = useState("");
  const [saving,     setSaving]     = useState(false);
  const [isNew,      setIsNew]      = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [aboutDraft, setAboutDraft] = useState<AboutConfig | null>(null);
  const [aboutSaving,  setAboutSaving]  = useState(false);
  const [gridSaving,   setGridSaving]   = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { const ok = sessionStorage.getItem("admin_auth") === "1"; setAuthed(ok); setReady(true); }, []);
  useEffect(() => {
    if (authed) {
      fetch("/api/projects").then(r => r.json()).then(setProjects);
      fetch("/api/about").then(r => r.json()).then(setAboutDraft).catch(() => {});
    }
  }, [authed]);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const select = (p: Project) => { setSelected(p); setDraft(JSON.parse(JSON.stringify(p))); setIsNew(false); };
  const addNew = () => {
    const blank: Project = { id: `project-${Date.now()}`, title: "새 프로젝트", bgColor: "#1a1a1a" };
    setSelected(blank); setDraft(blank); setIsNew(true);
  };
  const save = async () => {
    if (!draft) return; setSaving(true);
    const next = isNew ? [...projects, draft] : projects.map(p => p.id === draft.id ? draft : p);
    try {
      const res = await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      if (!res.ok) throw new Error();
      setProjects(next); setSelected(draft); setIsNew(false); showToast("저장 완료", "ok");
    } catch { showToast("저장 실패", "err"); }
    finally { setSaving(false); }
  };
  const del = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const next = projects.filter(p => p.id !== id);
    try {
      await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      setProjects(next); if (selected?.id === id) { setSelected(null); setDraft(null); } showToast("삭제 완료", "ok");
    } catch { showToast("삭제 실패", "err"); }
  };
  const moveProj = async (id: string, dir: -1 | 1) => {
    const idx = projects.findIndex(p => p.id === id);
    if (idx + dir < 0 || idx + dir >= projects.length) return;
    const next = [...projects]; [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
    setProjects(next);
  };
  const logout = () => { sessionStorage.removeItem("admin_auth"); setAuthed(false); router.push("/"); };
  const updateSpan = (id: string, span: number | undefined) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, span } : p));
  const saveGrid = async () => {
    setGridSaving(true);
    try {
      const res = await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(projects) });
      if (!res.ok) throw new Error(); showToast("저장 완료", "ok");
    } catch { showToast("저장 실패", "err"); }
    finally { setGridSaving(false); }
  };
  const upd = (key: keyof Project, val: unknown) => setDraft(d => d ? { ...d, [key]: val } : d);
  const saveAbout = async () => {
    if (!aboutDraft) return; setAboutSaving(true);
    try {
      const res = await fetch("/api/about", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(aboutDraft) });
      if (!res.ok) throw new Error(); showToast("저장 완료", "ok");
    } catch { showToast("저장 실패", "err"); }
    finally { setAboutSaving(false); }
  };
  const updAbout = <K extends keyof AboutConfig>(key: K, val: AboutConfig[K]) =>
    setAboutDraft(d => d ? { ...d, [key]: val } : d);
  const filtered = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  if (!ready) return <div style={{ background: "#F4F4F4", height: "100%" }} />;
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;

  return (
    <div className="admin-page flex h-full" style={{ fontFamily: "'SF Compact Display', 'Pretendard', sans-serif", background: "#F4F4F4" }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-[260px] shrink-0 h-full" style={{ background: "#EBEBEB", borderRight: "1px solid #D8D8D8" }}>
        <div className="px-5 pt-5 pb-4 shrink-0" style={{ borderBottom: "1px solid #D8D8D8" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[17px] font-bold tracking-[-0.5px]" style={{ color: "#0a0a0a" }}>관리자</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPanel("settings")}
                className="text-[11px] px-2.5 py-1 rounded-lg"
                style={{ color: panel === "settings" ? "#3182F6" : "#888", background: panel === "settings" ? "#EEF4FF" : "#DEDEDE" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#3182F6")} onMouseLeave={e => (e.currentTarget.style.color = panel === "settings" ? "#3182F6" : "#888")}>설정</button>
              <button onClick={logout} className="text-[11px] px-2.5 py-1 rounded-lg" style={{ color: "#888", background: "#DEDEDE" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#0a0a0a")} onMouseLeave={e => (e.currentTarget.style.color = "#888")}>← 나가기</button>
            </div>
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#DEDEDE" }}>
            {(["grid", "projects", "about"] as Panel[]).map(p => (
              <button key={p} onClick={() => setPanel(p)}
                className="flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                style={{ background: panel === p ? "#FFFFFF" : "transparent", color: panel === p ? "#0a0a0a" : "#888" }}>
                {PANEL_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        {panel === "grid" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5">
            <p className="text-[12px] text-center" style={{ color: "#BBB" }}>오른쪽에서 스팬을 설정하세요</p>
          </div>
        ) : panel === "projects" ? (
          <>
            <div className="px-4 py-3 shrink-0">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="검색"
                className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0" }} />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map(p => {
                const isActive = selected?.id === p.id;
                return (
                  <div key={p.id} onClick={() => select(p)} className="group flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                    style={{ background: isActive ? "#E0E0E0" : undefined }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#E5E5E5"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = ""; }}>
                    <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden" style={{ background: p.bgColor }}>
                      {p.videoUrl ? <video src={p.videoUrl} muted className="w-full h-full object-cover" />
                        : p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: isActive ? "#0a0a0a" : "#444" }}>{p.title}</p>
                      <p className="text-[11px] truncate font-mono" style={{ color: "#AAA" }}>{p.id}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                      <button onClick={() => moveProj(p.id, -1)} className="text-[9px] leading-none" style={{ color: "#BBB" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#333")} onMouseLeave={e => (e.currentTarget.style.color = "#BBB")}>▲</button>
                      <button onClick={() => moveProj(p.id, 1)} className="text-[9px] leading-none" style={{ color: "#BBB" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#333")} onMouseLeave={e => (e.currentTarget.style.color = "#BBB")}>▼</button>
                    </div>
                    <button onClick={e => { e.stopPropagation(); del(p.id); }}
                      className="opacity-0 group-hover:opacity-100 text-[12px]" style={{ color: "#CCC" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#FF6B6B")} onMouseLeave={e => (e.currentTarget.style.color = "#CCC")}>✕</button>
                  </div>
                );
              })}
            </div>
            <div className="p-4 shrink-0" style={{ borderTop: "1px solid #D8D8D8" }}>
              <button onClick={addNew} className="w-full py-2.5 rounded-xl text-[13px] font-medium"
                style={{ background: "#FFFFFF", color: "#3182F6", border: "1px solid #E0E0E0" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#EEF4FF")}
                onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}>+ 새 프로젝트</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5">
            <p className="text-[12px] text-center" style={{ color: "#BBB" }}>오른쪽에서 편집하세요</p>
          </div>
        )}
      </aside>

      {/* ── Editor ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: "#F4F4F4" }}>

        {/* ── Grid panel ── */}
        {panel === "grid" ? (
          <>
            <div className="flex items-center justify-between px-8 py-4 shrink-0" style={{ borderBottom: "1px solid #E0E0E0", background: "#FFFFFF" }}>
              <div>
                <p className="text-[18px] font-semibold tracking-[-0.4px]" style={{ color: "#0a0a0a" }}>그리드 설정</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#AAA" }}>프로젝트별 그리드 너비를 설정하세요</p>
              </div>
              <button onClick={saveGrid} disabled={gridSaving}
                className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
                style={{ background: gridSaving ? "#F0FFF4" : "#3182F6", color: gridSaving ? "#16A34A" : "#fff" }}>
                {gridSaving ? "저장 중…" : "저장"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <GridBuilder projects={projects} onChange={p => { setProjects(p); }} />
            </div>
          </>

        ) : panel === "settings" ? (
          <>
            <div className="flex items-center justify-between px-8 py-4 shrink-0" style={{ borderBottom: "1px solid #E0E0E0", background: "#FFFFFF" }}>
              <p className="text-[18px] font-semibold tracking-[-0.4px]" style={{ color: "#0a0a0a" }}>설정</p>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6" style={{ maxWidth: "420px" }}>
              <p className="text-[13px] font-semibold mb-4" style={{ color: "#0a0a0a" }}>비밀번호 변경</p>
              <PasswordPanel showToast={showToast} />
            </div>
          </>

        ) : /* ── About panel ── */
        panel === "about" && aboutDraft ? (
          <>
            <div className="flex items-center justify-between px-8 py-4 shrink-0" style={{ borderBottom: "1px solid #E0E0E0", background: "#FFFFFF" }}>
              <div>
                <p className="text-[18px] font-semibold tracking-[-0.4px]" style={{ color: "#0a0a0a" }}>About 페이지</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#AAA" }}>오빗 갤러리 설정</p>
              </div>
              <button onClick={saveAbout} disabled={aboutSaving}
                className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
                style={{ background: aboutSaving ? "#F0FFF4" : "#3182F6", color: aboutSaving ? "#16A34A" : "#fff" }}>
                {aboutSaving ? "저장 중…" : "저장"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              <section>
                <h3 className="text-[12px] font-semibold mb-4 uppercase tracking-widest" style={{ color: "#AAA" }}>소개글</h3>
                <div className="flex flex-col gap-4">
                  {(["bioKo", "bioEn"] as const).map(key => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium" style={{ color: "#888" }}>{key === "bioKo" ? "한국어" : "English"}</label>
                      <textarea value={aboutDraft[key] ?? ""} onChange={e => updAbout(key, e.target.value)} rows={4}
                        className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-y"
                        style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", lineHeight: "1.6" }} />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium" style={{ color: "#888" }}>이메일</label>
                    <input type="text" value={aboutDraft.email ?? ""} onChange={e => updAbout("email", e.target.value)}
                      className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0" }} />
                  </div>
                  <SliderField label="폰트 크기 (Font Size)" value={aboutDraft.bioFontSize ?? 19} onChange={v => updAbout("bioFontSize", v)} min={12} max={40} step={1} unit="px" />
                  <SliderField label="폰트 두께 (Font Weight)" value={aboutDraft.bioFontWeight ?? 400} onChange={v => updAbout("bioFontWeight", v)} min={100} max={900} step={100} />
                  <SliderField label="줄 길이 (Max Width)" value={aboutDraft.bioMaxWidth ?? 500} onChange={v => updAbout("bioMaxWidth", v)} min={200} max={1200} step={10} unit="px" />
                  <SliderField label="자간 (Letter Spacing)" value={aboutDraft.bioLetterSpacing ?? 0} onChange={v => updAbout("bioLetterSpacing", v)} min={-0.1} max={0.2} step={0.005} unit="em" />
                  <SliderField label="행간 (Line Height)" value={aboutDraft.bioLineHeight ?? 1.8} onChange={v => updAbout("bioLineHeight", v)} min={1} max={3} step={0.05} />
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-medium" style={{ color: "#888" }}>미리보기</label>
                    <div className="rounded-xl overflow-hidden flex justify-center" style={{ background: "linear-gradient(to bottom, #f0ece6, #82c9f2)", border: "1px solid #E0E0E0", minHeight: "120px", padding: "2rem 1rem" }}>
                      {(aboutDraft.bioKo || aboutDraft.bioEn || aboutDraft.email) ? (
                        <div className="flex flex-col items-center gap-6 text-center" style={{ maxWidth: `${aboutDraft.bioMaxWidth ?? 500}px`, width: "100%" }}>
                          {(["bioKo", "bioEn"] as const).filter(k => aboutDraft[k]).map(k => (
                            <p key={k} style={{ color: "#030303", fontSize: `${aboutDraft.bioFontSize ?? 19}px`, fontWeight: aboutDraft.bioFontWeight ?? 400, letterSpacing: `${aboutDraft.bioLetterSpacing ?? 0}em`, lineHeight: aboutDraft.bioLineHeight ?? 1.8, wordBreak: "keep-all", overflowWrap: "break-word", textAlign: "center", fontFamily: "'Manrope', 'PretendardKR', 'Pretendard', sans-serif", margin: 0 }}>
                              {aboutDraft[k]}
                            </p>
                          ))}
                          {aboutDraft.email && (
                            <span style={{ color: "#030303", fontSize: "0.875rem", fontFamily: "'Manrope', sans-serif" }}>{aboutDraft.email}</span>
                          )}
                        </div>
                      ) : <p className="text-[12px]" style={{ color: "#888" }}>소개글을 입력하면 미리보기가 표시됩니다.</p>}
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-[12px] font-semibold mb-4 uppercase tracking-widest" style={{ color: "#AAA" }}>이미지 목록</h3>
                <OrbitImageListEditor items={aboutDraft.images} onChange={v => updAbout("images", v)} />
              </section>
              <section>
                <h3 className="text-[12px] font-semibold mb-4 uppercase tracking-widest" style={{ color: "#AAA" }}>갤러리 설정</h3>
                <div className="flex flex-col gap-6">
                  <SliderField label="이미지 크기 (imageSize)" value={aboutDraft.imageSize} onChange={v => updAbout("imageSize", v)} min={60} max={300} unit="px" />
                  <SliderField label="궤도 반지름 (radius)" value={aboutDraft.radius} onChange={v => updAbout("radius", v)} min={80} max={500} unit="px" />
                  <SliderField label="회전 속도 (speed) — 클수록 느림" value={aboutDraft.speed} onChange={v => updAbout("speed", v)} min={5} max={120} unit="s" />
                </div>
              </section>
              <section>
                <h3 className="text-[12px] font-semibold mb-3 uppercase tracking-widest" style={{ color: "#AAA" }}>미리보기 정보</h3>
                <div className="flex gap-4">
                  {[{ label: "이미지 수", val: `${aboutDraft.images.length}개` }, { label: "이미지 크기", val: `${aboutDraft.imageSize}px` }, { label: "반지름", val: `${aboutDraft.radius}px` }, { label: "한 바퀴", val: `${aboutDraft.speed}s` }].map(item => (
                    <div key={item.label} className="flex-1 rounded-xl p-3 text-center" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0" }}>
                      <p className="text-[18px] font-semibold" style={{ color: "#0a0a0a" }}>{item.val}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#AAA" }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </section>
              <div className="h-8" />
            </div>
          </>

        ) : panel !== "projects" || !draft ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <p className="text-[28px]" style={{ color: "#D0D0D0" }}>✦</p>
            <p className="text-[14px]" style={{ color: "#BBB" }}>
              {{ projects: "← 프로젝트를 선택하거나 새로 추가하세요", about: "불러오는 중…", settings: "← 설정 탭을 선택하세요" }[panel]}
            </p>
          </div>

        ) : (
          <>
            {/* Project editor header */}
            <div className="flex items-center justify-between px-8 py-4 shrink-0" style={{ borderBottom: "1px solid #E0E0E0", background: "#FFFFFF" }}>
              <div>
                <p className="text-[18px] font-semibold tracking-[-0.4px]" style={{ color: "#0a0a0a" }}>{draft.title || "새 프로젝트"}</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#AAA" }}>{isNew ? "새로 추가" : `ID: ${draft.id}`}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/projects/${draft.id}`} target="_blank"
                  className="px-4 py-2.5 rounded-xl text-[13px] font-medium"
                  style={{ color: "#888", background: "#F5F5F5", border: "1px solid #E0E0E0" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#0a0a0a")} onMouseLeave={e => (e.currentTarget.style.color = "#888")}>
                  미리보기 ↗
                </Link>
                <button onClick={save} disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
                  style={{ background: saving ? "#F0FFF4" : "#3182F6", color: saving ? "#16A34A" : "#fff" }}>
                  {saving ? "저장 중…" : "저장"}
                </button>
              </div>
            </div>

            {/* Project form */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              <section>
                <h3 className="text-[12px] font-semibold mb-4 uppercase tracking-widest" style={{ color: "#AAA" }}>기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Field label="제목" value={draft.title} onChange={v => upd("title", v)} placeholder="프로젝트 제목" /></div>
                  <Field label="ID (URL slug)" value={draft.id} onChange={v => upd("id", v)} mono />
                </div>
              </section>

              <section>
                <h3 className="text-[12px] font-semibold mb-4 uppercase tracking-widest" style={{ color: "#AAA" }}>썸네일</h3>
<div className="flex gap-4 items-start">
                  <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <Field label="이미지 URL" value={draft.imageUrl ?? ""} onChange={v => upd("imageUrl", v || undefined)} placeholder="/uploads/파일.jpg" mono upload />
                    <Field label="영상 URL" value={draft.videoUrl ?? ""} onChange={v => upd("videoUrl", v || undefined)} placeholder="/uploads/파일.mp4" mono upload />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium" style={{ color: "#888" }}>배경 색상</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={draft.bgColor || "#1a1a1a"} onChange={e => upd("bgColor", e.target.value)}
                          className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                          style={{ background: "#F5F5F5", border: "1px solid #E0E0E0" }} />
                        <input type="text" value={draft.bgColor || ""} onChange={e => upd("bgColor", e.target.value)}
                          placeholder="#1a1a1a" className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none"
                          style={{ background: "#F5F5F5", color: "#0a0a0a", border: "1px solid #E0E0E0", fontFamily: "monospace" }} />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium" style={{ color: "#888" }}>미리보기</label>
                    <div className="rounded-xl overflow-hidden" style={{ width: "144px", height: "108px", background: draft.bgColor || "#1a1a1a" }}>
                      {draft.videoUrl
                        ? <video src={draft.videoUrl} muted autoPlay loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : draft.imageUrl
                        ? <img src={draft.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : null}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[12px] font-semibold mb-4 uppercase tracking-widest" style={{ color: "#AAA" }}>텍스트 스타일</h3>
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <SliderField label="줄글 길이" value={draft.textMaxWidth ?? 808} onChange={v => upd("textMaxWidth", v)} min={300} max={1400} step={10} unit="px" />
                  <SliderField label="행간" value={draft.textLineHeight ?? 1.9} onChange={v => upd("textLineHeight", v)} min={1.0} max={3.0} step={0.05} />
                  <SliderField label="자간" value={draft.textLetterSpacing ?? 0} onChange={v => upd("textLetterSpacing", v)} min={-0.05} max={0.2} step={0.005} unit="em" />
                  <SliderField label="폰트 굵기" value={draft.textFontWeight ?? 400} onChange={v => upd("textFontWeight", v)} min={100} max={900} step={100} />
                </div>
              </section>

              <section>
                <h3 className="text-[12px] font-semibold mb-1 uppercase tracking-widest" style={{ color: "#AAA" }}>서브페이지 콘텐츠</h3>
                <p className="text-[11px] mb-4" style={{ color: "#BBB" }}>이미지와 텍스트를 자유롭게 교차 배치하세요</p>
                <ContentListEditor
                  items={(draft.content as ContentItem[]) ?? []}
                  onChange={v => upd("content", v.length ? v : undefined)}
                  textStyle={{ maxWidth: draft.textMaxWidth, letterSpacing: draft.textLetterSpacing, lineHeight: draft.textLineHeight, fontWeight: draft.textFontWeight }}
                />
              </section>
              <div className="h-8" />
            </div>
          </>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
