import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Clock, Download, Lock, MousePointer2, Move, Palette, Sparkles, Type, Upload, UserX, Zap, Check,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroPreview } from "@/components/hero-preview";
import { TOOLS, type Tool } from "@/lib/tools";
import { SEO, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SEO.title },
      { name: "description", content: SEO.description },
      { name: "keywords", content: "online video caption editor, add text to video, video caption maker, video text editor" },
      { property: "og:title", content: SEO.title },
      { property: "og:description", content: SEO.description },
      { property: "og:url", content: SITE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

const ease = [0.22, 1, 0.36, 1] as const;
const up = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={up}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function Index() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <Hero />
        <ToolsSection />
        <Features />
        <HowItWorks />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 lg:grid-cols-[1.15fr_1fr] lg:pb-28 lg:pt-20">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-soft"
          >
            <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Sparkles className="size-3" /></span>
            Free online video caption editor
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.08 }}
            className="mt-6 text-5xl font-extrabold leading-[0.98] sm:text-6xl lg:text-7xl"
          >
            Every Caption.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">Perfectly</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-[0.32em] rounded-sm bg-primary/80" aria-hidden />
            </span>{" "}
            <span className="text-highlight">Placed.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.18 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Add beautiful captions to your videos, customize every detail, and export your creation — all directly in your browser.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.28 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link to="/editor" className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-bold text-primary-foreground shadow-glow transition hover:-translate-y-0.5">
              Start Editing Free <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/" hash="how-it-works" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-4 font-semibold transition hover:-translate-y-0.5 hover:bg-accent">
              See How It Works
            </Link>
          </motion.div>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            {[
              { icon: Check, t: "100% free editing" },
              { icon: Lock, t: "Videos never leave your device" },
              { icon: UserX, t: "No account required" },
            ].map(({ icon: I, t }) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-primary/20 text-highlight"><I className="size-3" /></span>
                {t}
              </li>
            ))}
          </motion.ul>
        </div>
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, ease, delay: 0.2 }}>
          <HeroPreview />
        </motion.div>
      </div>
    </section>
  );
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const featured = tool.status === "available";
  const body = (
    <motion.article
      whileHover={featured ? { y: -4 } : undefined}
      transition={{ duration: 0.25 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition ${featured ? "border-primary/50 bg-ink text-ink-foreground shadow-lift" : "border-border bg-card"}`}
    >
      <div className="flex items-start justify-between">
        <span className={`grid size-12 place-items-center rounded-2xl ${featured ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
          <tool.icon className="size-5" />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${featured ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {featured ? "Available" : "Coming soon"}
        </span>
      </div>
      {featured && (
        <div className="my-6 rounded-2xl border border-ink-foreground/10 bg-ink-foreground/5 p-4">
          <div className="mx-auto w-fit border-2 border-dashed border-primary px-3 py-1.5 font-black uppercase tracking-tight" style={{ fontFamily: "Montserrat" }}>
            Add text to video
          </div>
          <div className="mt-4 flex gap-1">
            {[30, 18, 26, 14].map((w, i) => (
              <span key={i} className={`h-2 rounded-full ${i === 1 ? "bg-primary" : "bg-ink-foreground/20"}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      )}
      <h3 className={`text-xl font-bold ${featured ? "" : "mt-6"}`}>{tool.name}</h3>
      <p className={`mt-2 flex-1 text-sm leading-relaxed ${featured ? "text-ink-foreground/70" : "text-muted-foreground"}`}>{tool.description}</p>
      <div className={`mt-6 flex items-center gap-1.5 text-sm font-semibold ${featured ? "text-primary" : "text-muted-foreground"}`}>
        {featured ? (<>Open editor <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>) : "In development"}
      </div>
    </motion.article>
  );
  return (
    <Reveal delay={index * 0.08} className={featured ? "md:row-span-2" : ""}>
      {tool.href ? <Link to={tool.href} className="block h-full">{body}</Link> : <div aria-disabled className="h-full">{body}</div>}
    </Reveal>
  );
}

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: React.ReactNode; desc: string }) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">{title}</h2>
      <p className="mt-4 text-lg text-muted-foreground">{desc}</p>
    </Reveal>
  );
}

function ToolsSection() {
  return (
    <section id="tools" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead eyebrow="Tools" title="A studio of caption tools" desc="Start with the full video caption maker today. More creative tools are on the way." />
        <div className="grid gap-5 md:grid-cols-3">
          {TOOLS.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Move, title: "Precise drag & resize", desc: "Real corner and edge handles. Move and resize captions independently with pixel-accurate control." },
  { icon: Type, title: "16 curated fonts", desc: "Display, serif, script, and mono typefaces with live previews, weights, italic, and underline." },
  { icon: Palette, title: "Full styling control", desc: "Colors, background boxes, outlines, shadows, spacing, and one-click social presets." },
  { icon: Clock, title: "Frame-synced timing", desc: "Set start and end times against the real video duration — or show a caption for the entire video." },
  { icon: Download, title: "Genuine export", desc: "Captions are rendered into every frame and saved as a real video file with the original audio." },
  { icon: Lock, title: "Private by design", desc: "Your video is processed locally. Nothing is uploaded, nothing is stored on a server." },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-y border-border bg-card/50 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead eyebrow="Features" title={<>Built like pro software. <span className="text-highlight">Free</span> like it shouldn't be.</>} desc="Everything you need to add text to video — without installing anything." />
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08} className="group bg-card p-8 transition hover:bg-accent/50">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-highlight transition group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Upload, title: "Upload your video", desc: "Drop an MP4 or WebM. We read its real duration, size, and aspect ratio instantly." },
  { icon: MousePointer2, title: "Add & style captions", desc: "Type text, drag it into place, resize the box, and pick a look that fits your brand." },
  { icon: Zap, title: "Export & share", desc: "Render a captioned video in your browser and download it, ready for any platform." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead eyebrow="How it works" title="Three steps to perfect captions" desc="From raw clip to captioned video in minutes." />
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <li className="relative h-full rounded-3xl border border-border bg-card p-8 shadow-soft">
                <span className="font-display text-6xl font-extrabold text-primary/40">0{i + 1}</span>
                <s.icon className="absolute right-8 top-8 size-6 text-highlight" />
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="px-5 pb-24">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-ink px-8 py-16 text-center text-ink-foreground sm:py-20">
        <div className="absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" aria-hidden />
        <h2 className="relative text-4xl font-extrabold sm:text-5xl">Your next video deserves <span className="text-primary">better captions.</span></h2>
        <p className="relative mx-auto mt-4 max-w-xl text-ink-foreground/70">No sign-up, no watermark, no uploads. Open the editor and start captioning.</p>
        <Link to="/editor" className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-glow transition hover:-translate-y-0.5">
          Start Editing Free <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </section>
  );
}
