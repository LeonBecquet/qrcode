import Link from "next/link";
import { SignOutButton } from "./sign-out-button";
import { requireRestaurant } from "@/lib/server/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireRestaurant();

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-card sticky top-0 z-10 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="font-semibold">
              {ctx.restaurant.name}
            </Link>
            <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs">
              {ctx.role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm sm:inline">{ctx.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
