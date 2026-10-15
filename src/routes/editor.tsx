import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Copy, Download, Italic, Loader2, Pause, Play, Plus, Redo2, Trash2, Underline, Undo2, Upload, X } from "lucide-react";
import { Logo, ThemeToggle } from "@/components/brand";
import {
  FONTS, MIN_H, MIN_W, PRESETS, drawCaption, formatTime, getMeasureCtx, isVisible, layoutCaption, newCaption, timing,
  type Caption, type PresetKey,
} from "@/lib/captions";
import { exportVideo, type ExportResult } from "@/lib/export-video";
import creatorVideo from "@/assets/creator.mp4.asset.json";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Video Caption Editor — Add Text to Video | CaptionFlow" },
      { name: "description", content: "Upload a video, add and style captions, resize and position them precisely, and export a captioned video in your browser." },
      { property: "og:title", content: "Video Caption Editor | CaptionFlow" },
      { property: "og:description", content: "Add, resize, style and time captions, then export — free, in your browser." },
    ],
  }),
  component: Editor,
});

type Meta = { url: string; name: string; size: number; w: number; h: number; duration: number; owned: boolean };

function useHistory(initial: Caption[]) {
  const [s, setS] = useState({ past: [] as Caption[][], present: initial, future: [] as Caption[][] });
  const last = useRef(0);
  const set = useCallback((fn: (c: Caption[]) => Caption[], record: boolean | "coalesce" = true) => {
    setS((st) => {
      const next = fn(st.present);
      let rec = record === true;
      if (record === "coalesce") { rec = Date.now() - last.current > 600; last.current = Date.now(); }
      return rec ? { past: [...st.past.slice(-80), st.present], present: next, future: [] } : { ...st, present: next };
    });
  }, []);
  const checkpoint = useCallback(() => setS((st) => ({ past: [...st.past.slice(-80), st.present], present: st.present, future: [] })), []);
  const undo = () => setS((st) => st.past.length ? { past: st.past.slice(0, -1), present: st.past[st.past.length - 1], future: [st.present, ...st.future] } : st);
  const redo = () => setS((st) => st.future.length ? { past: [...st.past, st.present], present: st.future[0], future: st.future.slice(1) } : st);
  const reset = (c: Caption[]) => setS({ past: [], present: c, future: [] });
  return { captions: s.present, set, checkpoint, undo, redo, reset, canUndo: s.past.length > 0, canRedo: s.future.length > 0 };
}

function Editor() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const h = useHistory([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [exp, setExp] = useState<{ p: number; result?: ExportResult & { url: string }; error?: string; ctrl?: AbortController } | null>(null);
  const duration = meta?.duration ?? 0;
  const selected = h.captions.find((c) => c.id === sel) ?? null;

  const load = useCallback((url: string, name: string, size: number, owned: boolean) => {
    setError(null);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = url;
    v.onloadedmetadata = () => {
      const finish = (d: number) => {
        if (!v.videoWidth || !isFinite(d) || d <= 0) { setError("This video couldn't be read. It may be corrupted or use an unsupported codec."); if (owned) URL.revokeObjectURL(url); return; }
        setMeta((old) => { if (old?.owned) URL.revokeObjectURL(old.url); return { url, name, size, w: v.videoWidth, h: v.videoHeight, duration: d, owned }; });
        setT(0); setPlaying(false);
        h.set((cs) => cs.map((c) => ({ ...c, start: Math.min(c.start, d), end: Math.min(Math.max(c.end, Math.min(c.start, d)), d) })), false);
        if (!h.captions.length) { const c = newCaption(d, 0); c.fullDuration = false; h.reset([c]); setSel(c.id); }
      };
      if (v.duration === Infinity) { v.currentTime = 1e9; v.ontimeupdate = () => { v.ontimeupdate = null; finish(v.duration); }; } else finish(v.duration);
    };
    v.onerror = () => { setError("Unsupported or corrupted video. Please use an MP4 (H.264) or WebM file."); if (owned) URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h.captions.length]);

  const onFile = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) return setError(`"${f.name}" isn't a video file. Use MP4 or WebM.`);
    const probe = document.createElement("video");
    if (f.type && !probe.canPlayType(f.type)) return setError(`Your browser can't play ${f.type} files. Try MP4 or WebM.`);
    load(URL.createObjectURL(f), f.name, f.size, true);
  };

  useEffect(() => () => { if (meta?.owned) URL.revokeObjectURL(meta.url); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync playhead with video.currentTime
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => { const v = videoRef.current; if (v) setT(v.currentTime); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const seek = (time: number) => { const v = videoRef.current; const c = Math.max(0, Math.min(duration, time)); if (v) v.currentTime = c; setT(c); };
  const togglePlay = () => { const v = videoRef.current; if (!v) return; if (v.paused) { if (v.ended) v.currentTime = 0; v.play(); } else v.pause(); };
  const update = (patch: Partial<Caption>, rec: boolean | "coalesce" = "coalesce") => sel && h.set((cs) => cs.map((c) => (c.id === sel ? { ...c, ...patch } : c)), rec);
  const add = () => { const c = newCaption(duration, h.captions.length, t); h.set((cs) => [...cs, c]); setSel(c.id); };
  const dup = () => { if (!selected) return; const c = { ...selected, id: newCaption(duration, 0).id, y: Math.min(0.9, selected.y + 0.05) }; h.set((cs) => [...cs, c]); setSel(c.id); };
  const del = () => { if (!sel) return; h.set((cs) => cs.filter((c) => c.id !== sel)); setSel(null); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) h.redo(); else h.undo(); }
      else if (e.key === " ") { e.preventDefault(); togglePlay(); }
      else if ((e.key === "Delete" || e.key === "Backspace") && sel) del();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const runExport = async () => {
    if (!meta) return;
    const ctrl = new AbortController();
    videoRef.current?.pause();
    setExp({ p: 0, ctrl });
    try {
      const r = await exportVideo({ src: meta.url, captions: h.captions, duration, signal: ctrl.signal, onProgress: (p) => setExp((e) => (e ? { ...e, p } : e)) });
      setExp({ p: 1, result: { ...r, url: URL.createObjectURL(r.blob) } });
    } catch (e) {
      if ((e as Error).name === "AbortError") setExp(null);
      else setExp({ p: 0, error: (e as Error).message });
    }
  };
  const closeExport = () => { exp?.ctrl?.abort(); if (exp?.result) URL.revokeObjectURL(exp.result.url); setExp(null); };

  if (!meta) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar />
        <main className="flex flex-1 items-center justify-center p-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
            className={`w-full max-w-2xl rounded-3xl border-2 border-dashed p-12 text-center transition ${drag ? "border-primary bg-primary/10" : "border-border bg-card"}`}
          >
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow"><Upload className="size-7" /></span>
            <h1 className="mt-6 text-3xl font-extrabold">Upload a video to start captioning</h1>
            <p className="mt-2 text-muted-foreground">Drag & drop an MP4 or WebM, or pick a file. It stays on your device.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => fileRef.current?.click()} className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Choose video</button>
              <button onClick={() => load(creatorVideo.url, "sample-creator.mp4", 0, false)} className="rounded-full border border-border px-6 py-3 font-semibold hover:bg-accent">Try sample video</button>
            </div>
            {error && <p role="alert" className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
            <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen">
      <TopBar>
        <div className="hidden min-w-0 text-xs text-muted-foreground md:block">
          <p className="truncate font-semibold text-foreground">{meta.name}</p>
          <p>{meta.w}×{meta.h} · {formatTime(duration)}{meta.size ? ` · ${(meta.size / 1048576).toFixed(1)} MB` : ""}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <IconBtn label="Undo (Ctrl+Z)" onClick={h.undo} disabled={!h.canUndo}><Undo2 className="size-4" /></IconBtn>
          <IconBtn label="Redo (Ctrl+Shift+Z)" onClick={h.redo} disabled={!h.canRedo}><Redo2 className="size-4" /></IconBtn>
          <button onClick={() => fileRef.current?.click()} className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-accent sm:block">Replace video</button>
          <ThemeToggle />
          <button onClick={runExport} disabled={!!exp} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"><Download className="size-4" /> Export</button>
        </div>
        <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      </TopBar>
      {error && <p role="alert" className="bg-destructive/10 px-5 py-2 text-sm text-destructive">{error}</p>}

      <div className="grid flex-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-[240px_1fr_300px]">
        {/* Layers */}
        <aside className="order-2 flex flex-col rounded-2xl border border-border bg-panel p-3 lg:order-1 lg:min-h-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Captions</h2>
            <div className="flex gap-1">
              <IconBtn label="Duplicate" onClick={dup} disabled={!selected}><Copy className="size-4" /></IconBtn>
              <IconBtn label="Delete" onClick={del} disabled={!selected}><Trash2 className="size-4" /></IconBtn>
            </div>
          </div>
          <button onClick={add} className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"><Plus className="size-4" /> Add caption</button>
          <ul className="space-y-1.5 overflow-auto">
            {h.captions.map((c) => {
              const tm = timing(c, duration);
              return (
                <li key={c.id}>
                  <button onClick={() => { setSel(c.id); seek(tm.start); }} className={`w-full rounded-xl border p-2.5 text-left transition ${sel === c.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}>
                    <p className="truncate text-sm font-semibold" style={{ fontFamily: c.fontFamily }}>{c.text || "Empty"}</p>
                    <p className="text-[11px] tabular-nums text-muted-foreground">{formatTime(tm.start)} – {formatTime(tm.end)}</p>
                  </button>
                </li>
              );
            })}
            {!h.captions.length && <p className="text-sm text-muted-foreground">No captions yet.</p>}
          </ul>
        </aside>

        {/* Stage */}
        <section className="order-1 flex flex-col gap-3 lg:order-2 lg:min-h-0">
          <Stage meta={meta} videoRef={videoRef} captions={h.captions} t={t} duration={duration} sel={sel} setSel={setSel}
            onPlay={() => setPlaying(true)} onPause={() => { setPlaying(false); setT(videoRef.current?.currentTime ?? 0); }}
            onSeeked={() => setT(videoRef.current?.currentTime ?? 0)}
            checkpoint={h.checkpoint} live={(id, p) => h.set((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)), false)}
            onEditText={() => textRef.current?.focus()} />
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-panel px-3 py-2">
            <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</button>
            <span className="text-sm tabular-nums">{formatTime(t)} <span className="text-muted-foreground">/ {formatTime(duration)}</span></span>
            <input type="range" aria-label="Seek" min={0} max={duration} step={0.01} value={t} onChange={(e) => seek(+e.target.value)} className="flex-1" />
          </div>
          <Timeline captions={h.captions} duration={duration} t={t} sel={sel} setSel={setSel} seek={seek} checkpoint={h.checkpoint}
            live={(id, p) => h.set((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)), false)} />
        </section>

        {/* Properties */}
        <aside className="order-3 overflow-auto rounded-2xl border border-border bg-panel p-4 lg:min-h-0">
          {selected ? <Properties c={selected} duration={duration} update={update} textRef={textRef} /> : <p className="text-sm text-muted-foreground">Select a caption to edit its text, style, and timing.</p>}
        </aside>
      </div>

      {exp && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-5 backdrop-blur" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lift">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Export video</h2><IconBtn label="Close" onClick={closeExport}><X className="size-4" /></IconBtn></div>
            {exp.error ? <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{exp.error}</p>
              : exp.result ? (
                <div className="mt-4 space-y-4">
                  <video src={exp.result.url} controls className="max-h-72 w-full rounded-xl bg-stage" />
                  <p className="text-xs text-muted-foreground">Format: {exp.result.ext.toUpperCase()} · {(exp.result.blob.size / 1048576).toFixed(1)} MB{exp.result.hasAudio ? "" : " · audio could not be captured"}</p>
                  <a href={exp.result.url} download={meta.name.replace(/\.[^.]+$/, "") + `-captioned.${exp.result.ext}`} className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-bold text-primary-foreground"><Download className="size-4" /> Download</a>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Rendering captions into frames… {Math.round(exp.p * 100)}%</p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${exp.p * 100}%` }} /></div>
                  <p className="text-xs text-muted-foreground">Export runs in real time. Keep this tab visible until it finishes.</p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

function TopBar({ children }: { children?: React.ReactNode }) {
  return <header className="flex h-14 items-center gap-4 border-b border-border bg-panel px-4"><Logo />{children ?? <div className="ml-auto flex items-center gap-2"><ThemeToggle /><Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">Home</Link></div>}</header>;
}

function IconBtn({ label, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button type="button" title={label} aria-label={label} className="grid size-8 place-items-center rounded-lg text-foreground hover:bg-accent disabled:opacity-35" {...p}>{children}</button>;
}

type Mode = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const HANDLES: { m: Mode; cls: string; cur: string }[] = [
  { m: "nw", cls: "-left-1.5 -top-1.5", cur: "nwse-resize" }, { m: "ne", cls: "-right-1.5 -top-1.5", cur: "nesw-resize" },
  { m: "sw", cls: "-left-1.5 -bottom-1.5", cur: "nesw-resize" }, { m: "se", cls: "-right-1.5 -bottom-1.5", cur: "nwse-resize" },
  { m: "n", cls: "left-1/2 -top-1.5 -ml-1.5", cur: "ns-resize" }, { m: "s", cls: "left-1/2 -bottom-1.5 -ml-1.5", cur: "ns-resize" },
  { m: "w", cls: "top-1/2 -left-1.5 -mt-1.5", cur: "ew-resize" }, { m: "e", cls: "top-1/2 -right-1.5 -mt-1.5", cur: "ew-resize" },
];

function Stage(p: {
  meta: Meta; videoRef: React.RefObject<HTMLVideoElement | null>; captions: Caption[]; t: number; duration: number; sel: string | null; setSel: (id: string | null) => void;
  onPlay: () => void; onPause: () => void; onSeeked: () => void; checkpoint: () => void; live: (id: string, patch: Partial<Caption>) => void; onEditText: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [fontTick, setFontTick] = useState(0);
  const { w: VW, h: VH } = p.meta;

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => {
      const aw = el.clientWidth, ah = Math.max(240, el.clientHeight);
      const s = Math.min(aw / VW, ah / VH);
      setSize({ w: Math.floor(VW * s), h: Math.floor(VH * s) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [VW, VH]);

  useEffect(() => {
    p.captions.forEach((c) => document.fonts.load(`${c.italic ? "italic " : ""}${c.fontWeight} 40px "${c.fontFamily}"`).then(() => setFontTick((x) => x + 1)).catch(() => null));
  }, [p.captions.map((c) => c.fontFamily + c.fontWeight + c.italic).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  // Draw captions with the same renderer used for export
  useEffect(() => {
    const cv = canvas.current;
    if (!cv || !size.w) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = size.w * dpr; cv.height = size.h * dpr;
    const ctx = cv.getContext("2d")!;
    const s = (size.w / VW) * dpr;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.clearRect(0, 0, VW, VH);
    for (const c of p.captions) {
      const vis = isVisible(c, p.t, p.duration);
      if (vis) drawCaption(ctx, c, VW, VH);
      else if (c.id === p.sel) drawCaption(ctx, c, VW, VH, 0.35);
    }
  }, [p.captions, p.t, p.duration, p.sel, size, VW, VH, fontTick]);

  const start = (e: React.PointerEvent, c: Caption, mode: Mode) => {
    e.stopPropagation(); e.preventDefault();
    p.setSel(c.id); p.checkpoint();
    const rect = canvas.current!.getBoundingClientRect();
    const L = layoutCaption(getMeasureCtx(), c, VW, VH);
    const s0 = { x: c.x, y: c.y, w: c.w, h: Math.max(c.h, L.boxH / VH), px: e.clientX, py: e.clientY };
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - s0.px) / rect.width, dy = (ev.clientY - s0.py) / rect.height;
      if (mode === "move") return p.live(c.id, { x: clamp(s0.x + dx, 0, 1 - s0.w), y: clamp(s0.y + dy, 0, Math.max(0, 1 - s0.h)) });
      let { x, y, w, h } = s0;
      if (mode.includes("e")) w = clamp(s0.w + dx, MIN_W, 1 - s0.x);
      if (mode.includes("w")) { x = clamp(s0.x + dx, 0, s0.x + s0.w - MIN_W); w = s0.x + s0.w - x; }
      if (mode.includes("s")) h = clamp(s0.h + dy, MIN_H, 1 - s0.y);
      if (mode.includes("n")) { y = clamp(s0.y + dy, 0, s0.y + s0.h - MIN_H); h = s0.y + s0.h - y; }
      p.live(c.id, { x, y, w, h });
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  };

  const mctx = typeof document !== "undefined" ? getMeasureCtx() : null;
  const k = size.w / VW;

  return (
    <div ref={wrap} className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden rounded-2xl bg-stage p-3 lg:min-h-0" onPointerDown={() => p.setSel(null)}>
      <div className="relative select-none" style={{ width: size.w, height: size.h, touchAction: "none" }}>
        <video ref={p.videoRef} src={p.meta.url} playsInline preload="auto" className="absolute inset-0 size-full bg-black" onPlay={p.onPlay} onPause={p.onPause} onSeeked={p.onSeeked} onEnded={p.onPause} />
        <canvas ref={canvas} className="pointer-events-none absolute inset-0 size-full" />
        {mctx && p.captions.filter((c) => c.id === p.sel || isVisible(c, p.t, p.duration)).map((c) => {
          const L = layoutCaption(mctx, c, VW, VH);
          const on = c.id === p.sel;
          return (
            <div key={c.id} onPointerDown={(e) => start(e, c, "move")} onDoubleClick={p.onEditText}
              className={`absolute cursor-move ${on ? "outline-2 outline-primary" : "hover:outline hover:outline-1 hover:outline-primary/60"}`}
              style={{ left: L.boxX * k, top: L.boxY * k, width: L.boxW * k, height: L.boxH * k, touchAction: "none", outlineStyle: on ? "solid" : undefined }}>
              {on && HANDLES.map((hd) => (
                <span key={hd.m} onPointerDown={(e) => start(e, c, hd.m)} className={`absolute size-3 rounded-[3px] border-2 border-primary bg-card ${hd.cls} before:absolute before:-inset-2 before:content-['']`} style={{ cursor: hd.cur, touchAction: "none" }} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Timeline(p: { captions: Caption[]; duration: number; t: number; sel: string | null; setSel: (id: string) => void; seek: (t: number) => void; checkpoint: () => void; live: (id: string, patch: Partial<Caption>) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const d = p.duration || 1;
  const scrub = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const go = (x: number) => p.seek(((x - r.left) / r.width) * d);
    go(e.clientX);
    const mv = (ev: PointerEvent) => go(ev.clientX);
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  const dragBar = (e: React.PointerEvent, c: Caption, mode: "move" | "l" | "r") => {
    e.stopPropagation(); p.setSel(c.id); p.checkpoint();
    const r = ref.current!.getBoundingClientRect();
    const tm = timing(c, d); const x0 = e.clientX;
    const mv = (ev: PointerEvent) => {
      const dt = ((ev.clientX - x0) / r.width) * d;
      const len = tm.end - tm.start;
      if (mode === "move") { const s = clamp(tm.start + dt, 0, d - len); p.live(c.id, { start: s, end: s + len, fullDuration: false }); }
      if (mode === "l") p.live(c.id, { start: clamp(tm.start + dt, 0, tm.end - 0.1), end: tm.end, fullDuration: false });
      if (mode === "r") p.live(c.id, { start: tm.start, end: clamp(tm.end + dt, tm.start + 0.1, d), fullDuration: false });
    };
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  const ticks = Math.min(20, Math.max(2, Math.floor(d)));
  return (
    <div className="rounded-2xl border border-border bg-panel p-3">
      <div ref={ref} className="relative">
        <div className="relative h-6 cursor-pointer border-b border-border" onPointerDown={scrub} style={{ touchAction: "none" }}>
          {Array.from({ length: ticks + 1 }, (_, i) => (
            <span key={i} className="absolute top-0 text-[10px] tabular-nums text-muted-foreground" style={{ left: `${(i / ticks) * 100}%`, transform: i === ticks ? "translateX(-100%)" : undefined }}>{formatTime((i / ticks) * d, false)}</span>
          ))}
        </div>
        <div className="max-h-36 space-y-1 overflow-auto py-2">
          {p.captions.map((c) => {
            const tm = timing(c, d);
            return (
              <div key={c.id} className="relative h-7 rounded-md bg-muted">
                <div onPointerDown={(e) => dragBar(e, c, "move")} className={`absolute inset-y-0 cursor-grab overflow-hidden rounded-md border text-[11px] font-semibold leading-[26px] ${p.sel === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
                  style={{ left: `${(tm.start / d) * 100}%`, width: `${((tm.end - tm.start) / d) * 100}%`, touchAction: "none" }}>
                  <span className="block truncate px-3">{c.text}</span>
                  <span onPointerDown={(e) => dragBar(e, c, "l")} className="absolute inset-y-0 left-0 w-2 cursor-ew-resize bg-foreground/10" />
                  <span onPointerDown={(e) => dragBar(e, c, "r")} className="absolute inset-y-0 right-0 w-2 cursor-ew-resize bg-foreground/10" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute -top-1 bottom-0 w-0.5 bg-highlight" style={{ left: `${(p.t / d) * 100}%` }} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
const inp = "w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm";

function Properties({ c, duration, update, textRef }: { c: Caption; duration: number; update: (p: Partial<Caption>, rec?: boolean | "coalesce") => void; textRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const [fontOpen, setFontOpen] = useState(false);
  const tm = timing(c, duration);
  const Toggle = ({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) => (
    <button type="button" title={label} aria-label={label} aria-pressed={on} onClick={onClick} className={`grid h-8 flex-1 place-items-center rounded-lg border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}>{children}</button>
  );
  return (
    <div className="space-y-5">
      <Field label="Text"><textarea ref={textRef} rows={3} value={c.text} onChange={(e) => update({ text: e.target.value })} className={inp} /></Field>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Presets</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
            <button key={k} onClick={() => update(PRESETS[k].style, true)} className="rounded-lg border border-border px-2 py-2 text-xs font-semibold hover:border-primary">{PRESETS[k].label}</button>
          ))}
        </div>
      </div>
      <Field label="Font">
        <div className="relative">
          <button type="button" onClick={() => setFontOpen((o) => !o)} className={`${inp} text-left`} style={{ fontFamily: c.fontFamily }}>{c.fontFamily}</button>
          {fontOpen && (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-lift">
              {FONTS.map((f) => (
                <li key={f.family}><button type="button" onClick={() => { update({ fontFamily: f.family, fontWeight: f.weights.includes(c.fontWeight) ? c.fontWeight : f.weights[f.weights.length - 1] }, true); setFontOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-base hover:bg-accent ${f.family === c.fontFamily ? "bg-accent" : ""}`} style={{ fontFamily: f.family }}>
                  {f.family}<span className="font-sans text-[10px] text-muted-foreground">{f.category}</span></button></li>
              ))}
            </ul>
          )}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Size (${c.fontSize}px)`}><input type="number" min={8} max={300} value={c.fontSize} onChange={(e) => update({ fontSize: clamp(+e.target.value || 8, 8, 300) })} className={inp} /></Field>
        <Field label="Weight"><select value={c.fontWeight} onChange={(e) => update({ fontWeight: +e.target.value }, true)} className={inp}>{(FONTS.find((f) => f.family === c.fontFamily)?.weights ?? [400, 700]).map((w) => <option key={w} value={w}>{w}</option>)}</select></Field>
      </div>
      <input type="range" aria-label="Font size" min={8} max={200} value={c.fontSize} onChange={(e) => update({ fontSize: +e.target.value })} className="w-full" />
      <div className="flex gap-1.5">
        <Toggle label="Italic" on={c.italic} onClick={() => update({ italic: !c.italic }, true)}><Italic className="size-4" /></Toggle>
        <Toggle label="Underline" on={c.underline} onClick={() => update({ underline: !c.underline }, true)}><Underline className="size-4" /></Toggle>
        <Toggle label="Align left" on={c.align === "left"} onClick={() => update({ align: "left" }, true)}><AlignLeft className="size-4" /></Toggle>
        <Toggle label="Align center" on={c.align === "center"} onClick={() => update({ align: "center" }, true)}><AlignCenter className="size-4" /></Toggle>
        <Toggle label="Align right" on={c.align === "right"} onClick={() => update({ align: "right" }, true)}><AlignRight className="size-4" /></Toggle>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Text color"><input type="color" value={c.color} onChange={(e) => update({ color: e.target.value })} className="h-9 w-full rounded-lg border border-input bg-background" /></Field>
        <Field label="Background"><input type="color" value={c.bgColor} onChange={(e) => update({ bgColor: e.target.value, bgOpacity: c.bgOpacity || 0.7 })} className="h-9 w-full rounded-lg border border-input bg-background" /></Field>
      </div>
      <Field label={`Background opacity (${Math.round(c.bgOpacity * 100)}%)`}><input type="range" min={0} max={1} step={0.05} value={c.bgOpacity} onChange={(e) => update({ bgOpacity: +e.target.value })} className="w-full" /></Field>
      <div className="grid grid-cols-[1fr_2fr] items-end gap-3">
        <Field label="Outline"><input type="color" value={c.outlineColor} onChange={(e) => update({ outlineColor: e.target.value })} className="h-9 w-full rounded-lg border border-input bg-background" /></Field>
        <Field label={`Width (${c.outlineWidth})`}><input type="range" min={0} max={20} value={c.outlineWidth} onChange={(e) => update({ outlineWidth: +e.target.value })} className="w-full" /></Field>
      </div>
      <div className="grid grid-cols-[1fr_2fr] items-end gap-3">
        <Field label="Shadow"><button type="button" onClick={() => update({ shadow: !c.shadow }, true)} className={`h-9 w-full rounded-lg border text-xs font-semibold ${c.shadow ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{c.shadow ? "On" : "Off"}</button></Field>
        <Field label={`Blur (${c.shadowBlur})`}><input type="range" min={0} max={40} value={c.shadowBlur} disabled={!c.shadow} onChange={(e) => update({ shadowBlur: +e.target.value })} className="w-full" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Letter spacing (${c.letterSpacing})`}><input type="range" min={-5} max={30} value={c.letterSpacing} onChange={(e) => update({ letterSpacing: +e.target.value })} className="w-full" /></Field>
        <Field label={`Line height (${c.lineHeight.toFixed(2)})`}><input type="range" min={0.8} max={2.2} step={0.05} value={c.lineHeight} onChange={(e) => update({ lineHeight: +e.target.value })} className="w-full" /></Field>
      </div>
      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timing</p>
        <label className="flex items-center justify-between text-sm font-medium">Show for entire video
          <input type="checkbox" checked={c.fullDuration} onChange={(e) => update({ fullDuration: e.target.checked, start: 0, end: duration }, true)} className="size-4 accent-primary" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start (s)"><input type="number" step={0.1} min={0} max={duration} disabled={c.fullDuration} value={+tm.start.toFixed(2)} onChange={(e) => { const s = clamp(+e.target.value, 0, Math.max(0, tm.end - 0.1)); update({ start: s, end: tm.end }); }} className={inp} /></Field>
          <Field label="End (s)"><input type="number" step={0.1} min={0} max={duration} disabled={c.fullDuration} value={+tm.end.toFixed(2)} onChange={(e) => { const en = clamp(+e.target.value, tm.start + 0.1, duration); update({ end: en, start: tm.start }); }} className={inp} /></Field>
        </div>
        <p className="text-xs text-muted-foreground">Duration {(tm.end - tm.start).toFixed(2)}s of {duration.toFixed(2)}s</p>
      </div>
    </div>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}
