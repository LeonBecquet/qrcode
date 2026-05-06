import { Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import { Logo } from "@/components/logo";
import type { SubStatus } from "@/lib/db/schema";
import { isPlatformAdmin } from "@/lib/server/admin";
import { requireRestaurant } from "@/lib/server/session";

const ALLOWED_SUB_STATUSES: SubStatus[] = ["active", "trialing", "past_due"];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireRestaurant();

  // Sub gate
  if (!ctx.restaurant.subStatus || !ALLOWED_SUB_STATUSES.includes(ctx.restaurant.subStatus)) {
    redirect("/pricing");
  }

  // Si trial expiré → redirect /pricing
  const isTrialing = ctx.restaurant.subStatus === "trialing";
  const trialEndDate = ctx.restaurant.currentPeriodEnd;
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  if (isTrialing && trialEndDate && trialEndDate.getTime() < nowMs) {
    redirect("/pricing?trial=expired");
  }

  const showAdminLink = await isPlatformAdmin(ctx.user.id);
  const isPastDue = ctx.restaurant.subStatus === "past_due";
  const trialDaysLeft =
    isTrialing && trialEndDate
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - nowMs) / (24 * 3600 * 1000)))
      : null;

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-card sticky top-0 z-10 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Logo size={24} />
              <span className="font-semibold">{ctx.restaurant.name}</span>
            </Link>
            <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs">
              {ctx.role}
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="hover:underline">
              Vue d&apos;ensemble
            </Link>
            <Link href="/dashboard/kitchen" className="hover:underline">
              Cuisine
            </Link>
            <Link href="/dashboard/menu" className="hover:underline">
              Menus
            </Link>
            <Link href="/dashboard/tables" className="hover:underline">
              Tables
            </Link>
            <Link href="/dashboard/analytics" className="hover:underline">
              Stats
            </Link>
            <Link href="/dashboard/settings" className="hover:underline">
              Réglages
            </Link>
            {showAdminLink ? (
              <Link
                href="/admin"
                className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400"
              >
                Admin
              </Link>
            ) : null}
            <span className="text-muted-foreground hidden text-sm sm:inline">{ctx.user.email}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>

      {isPastDue ? (
        <div className="bg-destructive/10 text-destructive border-destructive/20 border-b">
          <div className="container mx-auto px-4 py-2 text-sm">
            Paiement échoué.{" "}
            <Link href="/dashboard/settings" className="underline">
              Mettez à jour votre moyen de paiement
            </Link>{" "}
            pour éviter une suspension.
          </div>
        </div>
      ) : null}

      {trialDaysLeft !== null ? (
        <div className="border-b border-[var(--brand-orange)]/30 bg-gradient-to-r from-[var(--brand-saffron)]/15 via-[var(--brand-orange)]/10 to-[var(--brand-saffron)]/15">
          <div className="text-foreground container mx-auto flex items-center justify-between gap-3 px-4 py-2 text-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--brand-orange)]" />
              <span>
                <strong>Essai gratuit</strong> ·{" "}
                {trialDaysLeft === 0
                  ? "se termine aujourd'hui"
                  : trialDaysLeft === 1
                    ? "1 jour restant"
                    : `${trialDaysLeft} jours restants`}
              </span>
            </span>
            <Link
              href="/pricing"
              className="text-[var(--brand-orange)] font-medium underline-offset-4 hover:underline"
            >
              Choisir une formule →
            </Link>
          </div>
        </div>
      ) : null}

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
