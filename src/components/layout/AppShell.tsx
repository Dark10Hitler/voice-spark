import { ReactNode, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AdSlot } from "@/components/ads/AdSlot";
import { cn } from "@/lib/utils";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reducedMotion) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--px", `${x}%`);
      el.style.setProperty("--py", `${y}%`);
    };

    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="min-h-screen bg-mesh">
      <div className="pointer-events-none fixed inset-0 opacity-70" aria-hidden>
        <div className="absolute inset-0 bg-mesh" />
      </div>

      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="glass-card glow-soft flex flex-col gap-4 rounded-2xl px-5 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-brand shadow-glow" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Premium Text-to-Speech Pro</p>
                    <h1 className="truncate text-lg font-semibold tracking-tight">Voice Studio for TikTok & YouTube</h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
                  <NavLink
                    to="/privacy-policy"
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    activeClassName="bg-accent text-foreground"
                  >
                    Privacy
                  </NavLink>
                  <NavLink
                    to="/terms-of-service"
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    activeClassName="bg-accent text-foreground"
                  >
                    Terms
                  </NavLink>
                </nav>
                <ThemeToggle />
              </div>
            </div>

            <AdSlot slotId="HEADER_LEADERBOARD" label="Sponsored" className="w-full" sizeHint="728×90" />
          </motion.div>
        </div>
      </header>

      <main className={cn("relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6", className)}>
        {children}
      </main>

      <footer className="relative z-10 mx-auto max-w-6xl px-4 pb-10">
        <div className="glass-card rounded-2xl px-5 py-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Premium Text-to-Speech Pro. Audio is processed locally on your device.</p>
            <div className="flex items-center gap-4">
              <NavLink to="/privacy-policy" className="story-link">Privacy Policy</NavLink>
              <NavLink to="/terms-of-service" className="story-link">Terms of Service</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
