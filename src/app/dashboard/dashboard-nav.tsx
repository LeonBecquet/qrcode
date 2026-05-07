"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  BookOpen,
  ChefHat,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Logo } from "@/components/logo";
import { signOut } from "@/lib/auth-client";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Match exact ou aussi enfants */
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/kitchen", label: "Cuisine", icon: ChefHat },
  { href: "/dashboard/menu", label: "Menus", icon: BookOpen },
  { href: "/dashboard/tables", label: "Tables", icon: QrCode },
  { href: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Réglages", icon: Settings },
];

type Props = {
  restaurantName: string;
  role: string;
  userEmail: string;
  showAdminLink: boolean;
};

export function DashboardNav({ restaurantName, role, userEmail, showAdminLink }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock scroll quand mobile drawer ouvert
  useEffect(() => {
    if (!mobileOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [mobileOpen]);

  // Ferme le drawer quand on change de page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <header className="bg-card/95 supports-[backdrop-filter]:bg-card/85 sticky top-0 z-30 border-b backdrop-blur">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2.5 lg:gap-6">
        {/* === Brand (left) === */}
        <Link
          href="/dashboard"
          className="group flex shrink-0 items-center gap-2.5 transition-all hover:opacity-90"
        >
          <span className="transition-transform group-hover:scale-105 group-hover:rotate-[-3deg]">
            <Logo size={36} variant="mark" />
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="text-foreground max-w-[160px] truncate text-sm leading-tight font-semibold">
              {restaurantName}
            </p>
            <p className="text-muted-foreground text-[10px] leading-tight font-medium tracking-wide uppercase">
              {role}
            </p>
          </div>
        </Link>

        {/* === Main nav (desktop) === */}
        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item)} />
          ))}
        </nav>

        {/* === Right cluster === */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-0">
          {showAdminLink ? (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-200 sm:inline-flex dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
            >
              <Shield className="size-3.5" />
              Admin
            </Link>
          ) : null}

          <UserMenu email={userEmail} restaurantName={restaurantName} role={role} />

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="hover:bg-muted ml-1 flex size-9 items-center justify-center rounded-lg lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* === Mobile drawer === */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
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
                <span className="text-foreground truncate text-sm font-semibold">
                  {restaurantName}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="hover:bg-muted flex size-8 items-center justify-center rounded-lg"
                  aria-label="Fermer"
                >
                  <X className="size-4" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {NAV.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActive(item)}
                    full
                  />
                ))}
                {showAdminLink ? (
                  <Link
                    href="/admin"
                    className="mt-2 flex items-center gap-3 rounded-lg bg-amber-100 px-3 py-2.5 text-sm font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  >
                    <Shield className="size-4" />
                    Admin
                  </Link>
                ) : null}
              </nav>
              <div className="border-t p-3">
                <p className="text-muted-foreground mb-2 px-2 text-xs">{userEmail}</p>
                <SignOutInline />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  item,
  active,
  full,
}: {
  item: NavItem;
  active: boolean;
  full?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={
        full
          ? `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--brand-orange)]/12 text-[var(--brand-orange)]"
                : "text-foreground hover:bg-muted"
            }`
          : `relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-[var(--brand-orange)]/12 text-[var(--brand-orange)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
      }
    >
      <Icon className="size-4" />
      <span>{item.label}</span>
      {active && !full ? (
        <motion.span
          layoutId="dashnav-active-bar"
          className="absolute inset-x-2 -bottom-2.5 h-0.5 rounded-full bg-[var(--brand-orange)]"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      ) : null}
    </Link>
  );
}

function UserMenu({
  email,
  restaurantName,
  role,
}: {
  email: string;
  restaurantName: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Initiales depuis l'email
  const initial = email.slice(0, 1).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="hover:bg-muted flex items-center gap-1.5 rounded-full p-1 pr-2 transition-colors"
        aria-label="Menu utilisateur"
        aria-expanded={open}
      >
        <span className="bg-gradient-to-br from-[var(--brand-forest)] to-[var(--brand-orange)] flex size-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm">
          {initial}
        </span>
        <ChevronDown
          className={`text-muted-foreground hidden size-3.5 transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="bg-card absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border shadow-xl"
          >
            {/* Header user */}
            <div className="bg-gradient-to-br from-[var(--brand-forest)]/10 via-[var(--brand-orange)]/8 to-[var(--brand-saffron)]/10 border-b p-3">
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-br from-[var(--brand-forest)] to-[var(--brand-orange)] flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md">
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{restaurantName}</p>
                  <p className="text-muted-foreground truncate text-xs">{email}</p>
                  <span className="mt-1 inline-flex rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase dark:bg-black/30">
                    {role}
                  </span>
                </div>
              </div>
            </div>
            {/* Items */}
            <div className="p-1.5">
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors"
              >
                <Settings className="text-muted-foreground size-4" />
                Réglages
              </Link>
              <Link
                href="/dashboard/settings/branding"
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors"
              >
                <User className="text-muted-foreground size-4" />
                Mon restaurant
              </Link>
            </div>
            <div className="border-t p-1.5">
              <SignOutInline onDone={() => setOpen(false)} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SignOutInline({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await signOut();
          onDone?.();
          router.push("/signin");
          router.refresh();
        });
      }}
      className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors disabled:opacity-60"
    >
      <LogOut className="size-4" />
      {pending ? "Déconnexion..." : "Déconnexion"}
    </button>
  );
}
