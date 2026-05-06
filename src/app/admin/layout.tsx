import Link from "next/link";
import { SignOutButton } from "../dashboard/sign-out-button";
import { Logo } from "@/components/logo";
import { requirePlatformAdmin } from "@/lib/server/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePlatformAdmin();

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-card sticky top-0 z-10 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo size={24} />
              <span className="font-semibold">Admin plateforme</span>
            </Link>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              Internal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted-foreground text-sm hover:underline">
              ← Retour mon resto
            </Link>
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
