import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo, ThemeToggle } from "./brand";
import { TOOLS } from "@/lib/tools";

function ToolsMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="grid gap-1">
      {TOOLS.map((t) => {
        const inner = (
          <>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
              <t.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                {t.name}
                {t.status === "soon" && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Soon</span>}
              </span>
              <span className="line-clamp-1 text-xs text-muted-foreground">{t.description}</span>
            </span>
          </>
        );
        return t.href ? (
          <Link key={t.slug} to={t.href} onClick={onNavigate} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-accent">
            {inner}
          </Link>
        ) : (
          <div key={t.slug} aria-disabled className="flex cursor-not-allowed items-center gap-3 rounded-xl p-2.5 opacity-60">
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), setMobile(false));
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Tools <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 top-12 w-[380px] -translate-x-1/2 rounded-2xl border border-border bg-popover p-2 shadow-lift"
                >
                  <ToolsMenu onNavigate={() => setOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/" hash="features" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">Features</Link>
          <Link to="/" hash="how-it-works" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">How It Works</Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/editor" className="hidden items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-105 sm:inline-flex">
            Start Editing Free <ArrowRight className="size-4" />
          </Link>
          <button className="grid size-9 place-items-center rounded-full border border-border md:hidden" onClick={() => setMobile((m) => !m)} aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile}>
            {mobile ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border md:hidden">
            <div className="space-y-4 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tools</p>
              <ToolsMenu onNavigate={() => setMobile(false)} />
              <div className="grid gap-1 border-t border-border pt-4">
                <Link to="/" hash="features" onClick={() => setMobile(false)} className="rounded-lg px-2 py-2 font-medium">Features</Link>
                <Link to="/" hash="how-it-works" onClick={() => setMobile(false)} className="rounded-lg px-2 py-2 font-medium">How It Works</Link>
              </div>
              <Link to="/editor" onClick={() => setMobile(false)} className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-bold text-primary-foreground">
                Start Editing Free <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
