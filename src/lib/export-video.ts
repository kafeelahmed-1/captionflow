import { drawCaption, isVisible, type Caption } from "./captions";

export type ExportResult = { blob: Blob; mime: string; ext: string; hasAudio: boolean };

const CANDIDATES = [
  { mime: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", ext: "mp4" },
  { mime: "video/mp4", ext: "mp4" },
  { mime: "video/webm;codecs=vp9,opus", ext: "webm" },
  { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
  { mime: "video/webm", ext: "webm" },
];

export function pickFormat() {
  if (typeof MediaRecorder === "undefined") return null;
  return CANDIDATES.find((c) => MediaRecorder.isTypeSupported(c.mime)) ?? null;
}

/**
 * Real-time render: plays the source once, draws each frame + captions onto a canvas,
 * and records the canvas + original audio with MediaRecorder. No re-upload, no server.
 */
export async function exportVideo(opts: {
  src: string;
  captions: Caption[];
  duration: number;
  onProgress: (p: number) => void;
  signal: AbortSignal;
}): Promise<ExportResult> {
  const fmt = pickFormat();
  if (!fmt) throw new Error("This browser can't record video (MediaRecorder is unavailable). Try the latest Chrome, Edge, Firefox, or Safari.");
  const canvasProbe = document.createElement("canvas") as HTMLCanvasElement & { captureStream?: unknown };
  if (typeof canvasProbe.captureStream !== "function") throw new Error("This browser can't capture canvas video for export.");

  const video = document.createElement("video");
  video.src = opts.src;
  video.playsInline = true;
  video.preload = "auto";
  await new Promise<void>((res, rej) => {
    video.onloadeddata = () => res();
    video.onerror = () => rej(new Error("Could not load the video for export."));
  });

  let W = video.videoWidth;
  let H = video.videoHeight;
  const maxSide = 2160;
  if (Math.max(W, H) > maxSide) {
    const s = maxSide / Math.max(W, H);
    W = Math.round(W * s);
    H = Math.round(H * s);
  }
  W -= W % 2;
  H -= H % 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Make sure every caption font is ready before the first frame.
  await Promise.all(opts.captions.map((c) => document.fonts.load(`${c.italic ? "italic " : ""}${c.fontWeight} 40px "${c.fontFamily}"`).catch(() => null)));

  const stream = canvas.captureStream(30);
  let audioCtx: AudioContext | null = null;
  let hasAudio = false;
  try {
    audioCtx = new AudioContext();
    await audioCtx.resume();
    const srcNode = audioCtx.createMediaElementSource(video);
    const dest = audioCtx.createMediaStreamDestination();
    srcNode.connect(dest); // routed only to the recorder, so export stays silent
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    hasAudio = dest.stream.getAudioTracks().length > 0;
  } catch {
    video.muted = true;
  }

  const recorder = new MediaRecorder(stream, {
    mimeType: fmt.mime,
    videoBitsPerSecond: Math.min(16_000_000, Math.max(2_500_000, W * H * 30 * 0.12)),
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  const draw = () => {
    ctx.drawImage(video, 0, 0, W, H);
    const t = video.currentTime;
    for (const c of opts.captions) if (isVisible(c, t, opts.duration)) drawCaption(ctx, c, W, H);
    opts.onProgress(Math.min(0.999, t / opts.duration));
  };

  const cleanup = () => {
    stream.getTracks().forEach((t) => t.stop());
    audioCtx?.close().catch(() => null);
    video.pause();
    video.removeAttribute("src");
    video.load();
  };

  try {
    video.currentTime = 0;
    await new Promise((r) => (video.onseeked = r));
    draw();
    const done = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () => reject(new Error("Recording failed in the browser."));
      opts.signal.addEventListener("abort", () => {
        if (recorder.state !== "inactive") recorder.stop();
        reject(new DOMException("Export cancelled", "AbortError"));
      });
      video.onended = () => {
        draw();
        setTimeout(() => recorder.state !== "inactive" && recorder.stop(), 120);
      };
    });
    recorder.start(250);
    const v = video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
    const loop = () => {
      if (video.ended || opts.signal.aborted) return;
      draw();
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(loop);
      else requestAnimationFrame(loop);
    };
    try {
      await video.play();
    } catch {
      video.muted = true;
      hasAudio = false;
      await video.play();
    }
    loop();
    await done;
    const blob = new Blob(chunks, { type: fmt.mime.split(";")[0] });
    if (!blob.size) throw new Error("The browser produced an empty recording.");
    opts.onProgress(1);
    return { blob, mime: fmt.mime, ext: fmt.ext, hasAudio };
  } finally {
    cleanup();
  }
}
