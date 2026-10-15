export type Align = "left" | "center" | "right";

export type Caption = {
  id: string;
  text: string;
  /** Box geometry, normalized 0..1 relative to the video frame. */
  x: number;
  y: number;
  w: number;
  h: number;
  fontFamily: string;
  /** Font size in px at a 1080px reference (short side of the video). */
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  align: Align;
  color: string;
  bgColor: string;
  bgOpacity: number;
  outlineColor: string;
  outlineWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  letterSpacing: number;
  lineHeight: number;
  start: number;
  end: number;
  fullDuration: boolean;
};

export const MIN_W = 0.06;
export const MIN_H = 0.03;

export const FONTS: { family: string; weights: number[]; category: string }[] = [
  { family: "Montserrat", weights: [400, 700, 900], category: "Sans" },
  { family: "Poppins", weights: [400, 700, 900], category: "Sans" },
  { family: "Manrope", weights: [400, 700, 800], category: "Sans" },
  { family: "Space Grotesk", weights: [400, 700], category: "Sans" },
  { family: "Bricolage Grotesque", weights: [400, 700, 800], category: "Display" },
  { family: "Bebas Neue", weights: [400], category: "Display" },
  { family: "Anton", weights: [400], category: "Display" },
  { family: "Oswald", weights: [400, 700], category: "Display" },
  { family: "Archivo Black", weights: [400], category: "Display" },
  { family: "Bangers", weights: [400], category: "Display" },
  { family: "Playfair Display", weights: [400, 700, 900], category: "Serif" },
  { family: "DM Serif Display", weights: [400], category: "Serif" },
  { family: "Permanent Marker", weights: [400], category: "Handwritten" },
  { family: "Pacifico", weights: [400], category: "Script" },
  { family: "Lobster", weights: [400], category: "Script" },
  { family: "Roboto Mono", weights: [400, 700], category: "Mono" },
];

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400..800" +
  "&family=Montserrat:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Poppins:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900" +
  "&family=Space+Grotesk:wght@400;700&family=Bebas+Neue&family=Anton&family=Oswald:wght@400;700&family=Archivo+Black&family=Bangers" +
  "&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Serif+Display:ital@0;1&family=Permanent+Marker" +
  "&family=Pacifico&family=Lobster&family=Roboto+Mono:wght@400;700&display=swap";

export type PresetKey = "social" | "bold" | "minimal" | "cinematic";
export const PRESETS: Record<PresetKey, { label: string; style: Partial<Caption> }> = {
  social: {
    label: "Social pop",
    style: {
      fontFamily: "Montserrat", fontWeight: 900, fontSize: 64, italic: false, underline: false,
      color: "#ffffff", bgColor: "#000000", bgOpacity: 0, outlineColor: "#000000", outlineWidth: 6,
      shadow: true, shadowColor: "#000000", shadowBlur: 12, letterSpacing: 0, lineHeight: 1.15, align: "center",
    },
  },
  bold: {
    label: "Bold subtitle",
    style: {
      fontFamily: "Poppins", fontWeight: 700, fontSize: 48, italic: false, underline: false,
      color: "#111111", bgColor: "#c6f432", bgOpacity: 1, outlineWidth: 0, shadow: false,
      letterSpacing: 0, lineHeight: 1.2, align: "center",
    },
  },
  minimal: {
    label: "Minimal",
    style: {
      fontFamily: "Manrope", fontWeight: 700, fontSize: 40, italic: false, underline: false,
      color: "#ffffff", bgColor: "#000000", bgOpacity: 0.55, outlineWidth: 0, shadow: false,
      letterSpacing: 0, lineHeight: 1.3, align: "center",
    },
  },
  cinematic: {
    label: "Cinematic",
    style: {
      fontFamily: "Playfair Display", fontWeight: 400, fontSize: 56, italic: true, underline: false,
      color: "#f5ecd7", bgColor: "#000000", bgOpacity: 0, outlineWidth: 0, shadow: true,
      shadowColor: "#000000", shadowBlur: 24, letterSpacing: 2, lineHeight: 1.2, align: "center",
    },
  },
};

let idc = 0;
export function newCaption(duration: number, index: number, current = 0): Caption {
  idc += 1;
  const start = Math.min(current, Math.max(0, duration - 0.5));
  return {
    id: `c${Date.now().toString(36)}${idc}`,
    text: index === 0 ? "Your caption here" : `Caption ${index + 1}`,
    x: 0.1,
    y: Math.min(0.7, 0.62 + index * 0.04),
    w: 0.8,
    h: 0.1,
    ...(PRESETS.social.style as Omit<Caption, "id">),
    fontFamily: "Montserrat",
    fontSize: 64,
    fontWeight: 900,
    italic: false,
    underline: false,
    align: "center",
    color: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 0,
    outlineColor: "#000000",
    outlineWidth: 6,
    shadow: true,
    shadowColor: "#000000",
    shadowBlur: 12,
    letterSpacing: 0,
    lineHeight: 1.15,
    start,
    end: Math.min(duration, start + 3),
    fullDuration: false,
  };
}

export function timing(c: Caption, duration: number) {
  if (c.fullDuration) return { start: 0, end: duration };
  return { start: Math.max(0, Math.min(c.start, duration)), end: Math.max(0, Math.min(c.end, duration)) };
}

export function isVisible(c: Caption, t: number, duration: number) {
  const { start, end } = timing(c, duration);
  // Inclusive end at the very end of the video so full-length captions never blink off.
  return t >= start && (t < end || (end >= duration - 0.001 && t <= end + 0.05));
}

export function fontString(c: Caption, px: number) {
  return `${c.italic ? "italic " : ""}${c.fontWeight} ${px}px "${c.fontFamily}"`;
}

export function scaleFor(W: number, H: number) {
  return Math.min(W, H) / 1080;
}

export type Layout = {
  lines: string[];
  fs: number;
  pad: number;
  lineH: number;
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
  textH: number;
};

let measureCtx: CanvasRenderingContext2D | null = null;
export function getMeasureCtx() {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  return measureCtx!;
}

function applyFont(ctx: CanvasRenderingContext2D, c: Caption, fs: number, k: number) {
  ctx.font = fontString(c, fs);
  const anyCtx = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in ctx) anyCtx.letterSpacing = `${c.letterSpacing * k}px`;
}

/** Shared layout used by the preview overlay, selection box, and export renderer. */
export function layoutCaption(ctx: CanvasRenderingContext2D, c: Caption, W: number, H: number): Layout {
  const k = scaleFor(W, H);
  const fs = Math.max(4, c.fontSize * k);
  applyFont(ctx, c, fs, k);
  const pad = fs * 0.3;
  const boxW = c.w * W;
  const maxW = Math.max(fs, boxW - pad * 2);
  const lines: string[] = [];
  for (const para of c.text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxW || !line) line = test;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  const lineH = fs * c.lineHeight;
  const textH = lines.length * lineH;
  const boxH = Math.max(c.h * H, textH + pad * 2);
  return { lines, fs, pad, lineH, boxX: c.x * W, boxY: c.y * H, boxW, boxH, textH };
}

function rgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function drawCaption(ctx: CanvasRenderingContext2D, c: Caption, W: number, H: number, alpha = 1) {
  const L = layoutCaption(ctx, c, W, H);
  const k = scaleFor(W, H);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (c.bgOpacity > 0) {
    ctx.fillStyle = rgba(c.bgColor, c.bgOpacity);
    const r = Math.min(L.fs * 0.25, L.boxH / 2);
    ctx.beginPath();
    ctx.roundRect(L.boxX, L.boxY, L.boxW, L.boxH, r);
    ctx.fill();
  }
  ctx.textBaseline = "middle";
  ctx.textAlign = c.align;
  ctx.lineJoin = "round";
  const tx = c.align === "left" ? L.boxX + L.pad : c.align === "right" ? L.boxX + L.boxW - L.pad : L.boxX + L.boxW / 2;
  const top = L.boxY + (L.boxH - L.textH) / 2;
  L.lines.forEach((line, i) => {
    const y = top + i * L.lineH + L.lineH / 2;
    if (c.shadow) {
      ctx.shadowColor = rgba(c.shadowColor, 0.85);
      ctx.shadowBlur = c.shadowBlur * k;
      ctx.shadowOffsetY = 2 * k;
    }
    if (c.outlineWidth > 0) {
      ctx.strokeStyle = c.outlineColor;
      ctx.lineWidth = c.outlineWidth * k * 2;
      ctx.strokeText(line, tx, y);
      ctx.shadowColor = "transparent";
    }
    ctx.fillStyle = c.color;
    ctx.fillText(line, tx, y);
    ctx.shadowColor = "transparent";
    if (c.underline && line) {
      const w = ctx.measureText(line).width;
      const x0 = c.align === "left" ? tx : c.align === "right" ? tx - w : tx - w / 2;
      ctx.fillRect(x0, y + L.fs * 0.42, w, Math.max(1, L.fs * 0.06));
    }
  });
  ctx.restore();
  return L;
}

export function formatTime(t: number, ms = true) {
  if (!isFinite(t)) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t % 1) * 100);
  return `${m}:${s.toString().padStart(2, "0")}${ms ? "." + cs.toString().padStart(2, "0") : ""}`;
}
