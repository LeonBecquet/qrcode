export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-2xl space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">QR Restaurant</h1>
        <p className="text-muted-foreground">
          Plateforme de commande par QR code pour restaurants français.
        </p>
        <p className="text-muted-foreground text-sm">
          Phase 0 · Bootstrap. Voir{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">PLAN.md</code> pour le plan
          complet.
        </p>
      </div>
    </main>
  );
}
