"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Header transparent en haut, plus opaque + shadow au scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll quand mobile drawer ouvert
  useEffect(() => {
    if (!mobileOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all ${
          scrolled
            ? "bg-background/85 supports-[backdrop-filter]:bg-background/70 border-b shadow-sm backdrop-blur"
            : "bg-background/0 border-b border-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          {/* Brand */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <span className="transition-transform group-hover:scale-105 group-hover:rotate-[-3deg]">
              <Logo size={32} variant="mark" />
            </span>
            <span className="text-foreground hidden text-base font-bold tracking-tight sm:inline">
              QR Restaurant
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink key={l.href} href={l.href}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="text-muted-foreground hover:text-foreground hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors md:inline-flex"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="group hidden items-center gap-1.5 rounded-lg bg-[var(--brand-orange)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[var(--brand-orange)]/30 transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-orange)]/95 hover:shadow-lg sm:inline-flex"
            >
              <Sparkles className="size-3.5 opacity-90" />
              Commencer
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile burger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="hover:bg-muted flex size-10 items-center justify-center rounded-lg md:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
              aria-label="Fermer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="bg-card absolute top-0 right-0 bottom-0 flex w-72 flex-col border-l shadow-2xl"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <Logo size={32} variant="mark" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="hover:bg-muted flex size-9 items-center justify-center rounded-lg"
                  aria-label="Fermer"
                >
                  <X className="size-4" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 p-3">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground hover:bg-muted flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  >
                    {l.label}
                    <ArrowRight className="text-muted-foreground size-3.5" />
                  </Link>
                ))}
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground hover:bg-muted mt-3 flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  Se connecter
                  <ArrowRight className="text-muted-foreground size-3.5" />
                </Link>
              </nav>
              <div className="border-t p-3">
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-orange)] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[var(--brand-orange)]/30 transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-orange)]/95"
                >
                  <Sparkles className="size-3.5 opacity-90" />
                  Commencer gratuitement
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    >
      {children}
      {/* Underline anim */}
      <span className="pointer-events-none absolute right-3 bottom-1 left-3 h-0.5 origin-left scale-x-0 rounded-full bg-[var(--brand-orange)] transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}
