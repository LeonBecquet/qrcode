import Link from "next/link";
import { CartView } from "./cart-view";
import { resolvePublicTable } from "@/lib/server/public-resolver";

export default async function PublicCartPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  await resolvePublicTable(slug, token);

  return (
    <div className="space-y-4 py-4">
      <Link
        href={`/r/${slug}/t/${token}`}
        className="text-muted-foreground hover:text-foreground inline-block text-sm"
      >
        ← Continuer ma commande
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Mon panier</h1>
      <CartView slug={slug} token={token} />
    </div>
  );
}
