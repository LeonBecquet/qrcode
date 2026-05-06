import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-8">
      <div className="max-w-2xl space-y-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">QR Restaurant</h1>
        <p className="text-muted-foreground text-lg">
          Vos clients commandent depuis leur table en scannant un QR code. Sans télécharger
          d&apos;application. Sans attendre le serveur.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/signup" className={buttonVariants({ size: "lg" })}>
          Créer mon compte
        </Link>
        <Link href="/signin" className={buttonVariants({ size: "lg", variant: "outline" })}>
          Se connecter
        </Link>
      </div>
      <p className="text-muted-foreground text-xs">
        Phase 1 · Auth + multi-tenant. Voir <code>PLAN.md</code> pour la roadmap.
      </p>
    </main>
  );
}
