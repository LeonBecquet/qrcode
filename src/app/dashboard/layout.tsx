import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import type { SubStatus } from "@/lib/db/schema";
import { isPlatformAdmin } from "@/lib/server/admin";
import { requireRestaurant } from "@/lib/server/session";

const ALLOWED_SUB_STATUSES: SubStatus[] = ["active", "trialing", "past_due"];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireRestaurant();

  if (!ctx.restaurant.subStatus || !ALLOWED_SUB_STATUSES.includes(ctx.restaurant.subStatus)) {
    redirect("/pricing");
  }

  const showAdminLink = await isPlatformAdmin(ctx.user.id);
  const isPastDue = ctx.restaurant.subStatus === "past_due";

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-card sticky top-0 z-10 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-semibold">
              {ctx.restaurant.name}
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
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
