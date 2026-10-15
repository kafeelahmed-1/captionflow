import { Link } from "@tanstack/react-router";
import { Logo } from "./brand";
import { TOOLS } from "@/lib/tools";

const linkCls = "text-sm text-muted-foreground transition hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            CaptionFlow is a free online video caption editor. Add text to video, style every detail, and export — privately, right in your browser.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold">Product</h3>
          <ul className="space-y-3">
            <li><Link to="/editor" className={linkCls}>Caption Editor</Link></li>
            <li><Link to="/" hash="features" className={linkCls}>Features</Link></li>
            <li><Link to="/" hash="how-it-works" className={linkCls}>How It Works</Link></li>
            <li><Link to="/" hash="tools" className={linkCls}>All Tools</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold">Tools</h3>
          <ul className="space-y-3">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                {t.href ? (
                  <Link to={t.href} className={linkCls}>{t.name}</Link>
                ) : (
                  <span className="text-sm text-muted-foreground/70">{t.name} <span className="text-[10px] uppercase tracking-wide">· soon</span></span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold">Resources</h3>
          <ul className="space-y-3">
            <li><Link to="/privacy" className={linkCls}>Privacy Policy</Link></li>
            <li><Link to="/terms" className={linkCls}>Terms</Link></li>
            <li><Link to="/contact" className={linkCls}>Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CaptionFlow. All rights reserved.</p>
          <p>Developed by <span className="font-semibold text-foreground">Kafeel Ahmed</span></p>
        </div>
      </div>
    </footer>
  );
}
