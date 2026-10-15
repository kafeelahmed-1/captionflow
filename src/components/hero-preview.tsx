import { motion } from "framer-motion";
import { Pause, Play, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import creatorVideo from "@/assets/creator.mp4.asset.json";
import poster from "@/assets/creator-poster.jpg";

const LINES = [
  { text: "3 tips for better", hl: "captions", at: 0 },
  { text: "Keep them", hl: "short & bold", at: 2.7 },
  { text: "Place them", hl: "perfectly", at: 5.4 },
];

export function HeroPreview() {
  const ref = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(8);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (ref.current) setT(ref.current.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const line = [...LINES].reverse().find((l) => t >= l.at) ?? LINES[0];
  const pct = (t / dur) * 100;

  return (
    <div className="relative mx-auto w-full max-w-[400px]">
      <div className="absolute -inset-10 -z-10 rounded-full bg-primary/25 blur-3xl" aria-hidden />
      <div className="rounded-[2rem] border border-border bg-card p-2.5 shadow-lift">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-stage">
          <video
            ref={ref}
            src={creatorVideo.url}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 8)}
            className="absolute inset-0 size-full object-cover"
            aria-label="Female content creator speaking to camera in a vertical video"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">9:16 · Reel</span>
            <span className="flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-destructive" /> Editing
            </span>
          </div>
          {/* Caption with editor selection box */}
          <div className="absolute inset-x-[8%] top-[64%]">
            <div className="relative border-2 border-primary px-2 py-3">
              {(["-left-1.5 -top-1.5", "-right-1.5 -top-1.5", "-left-1.5 -bottom-1.5", "-right-1.5 -bottom-1.5", "left-1/2 -top-1.5 -ml-1.5", "left-1/2 -bottom-1.5 -ml-1.5", "top-1/2 -left-1.5 -mt-1.5", "top-1/2 -right-1.5 -mt-1.5"]).map((p) => (
                <span key={p} className={`absolute size-3 rounded-[3px] border-2 border-primary bg-card ${p}`} />
              ))}
              <motion.p
                key={line.text}
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="text-center text-[26px] font-black uppercase leading-[1.05] text-white sm:text-[30px]"
                style={{ fontFamily: "Montserrat", WebkitTextStroke: "6px #000", paintOrder: "stroke fill", textShadow: "0 3px 12px rgba(0,0,0,.6)" }}
              >
                {line.text} <span style={{ color: "#c6f432" }}>{line.hl}</span>
              </motion.p>
            </div>
          </div>
        </div>
        {/* Timeline */}
        <div className="mt-2.5 rounded-2xl bg-muted p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <button
              onClick={() => {
                const v = ref.current;
                if (!v) return;
                if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
              }}
              aria-label={playing ? "Pause preview" : "Play preview"}
              className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
            </button>
            <span className="tabular-nums">0:{Math.floor(t).toString().padStart(2, "0")}</span>
            <span className="ml-auto flex items-center gap-1"><Type className="size-3" /> 3 captions</span>
          </div>
          <div className="relative h-7">
            {LINES.map((l, i) => (
              <div
                key={i}
                className={`absolute top-0 h-full rounded-md border text-[9px] font-semibold leading-7 transition ${line === l ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}
                style={{ left: `${(l.at / dur) * 100}%`, width: `calc(${(2.6 / dur) * 100}% - 3px)` }}
              >
                <span className="block truncate px-1.5">{l.hl}</span>
              </div>
            ))}
            <div className="pointer-events-none absolute -bottom-1 -top-1 w-0.5 rounded bg-foreground" style={{ left: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
