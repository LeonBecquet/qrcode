import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique cookies — QR Restaurant",
};

export default function CookiesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Politique cookies</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : à compléter</p>

      <h2 className="mt-8 text-xl font-semibold">Cookies utilisés</h2>
      <p>
        QR Restaurant utilise un nombre limité de cookies, exclusivement nécessaires au
        fonctionnement du Service. Aucun cookie tiers de tracking publicitaire n&apos;est posé.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Cookies strictement nécessaires</h2>
      <p>
        Ces cookies ne nécessitent pas de consentement (article 82 de la loi Informatique et
        Libertés) :
      </p>
      <ul>
        <li>
          <code>better-auth.session</code> : identifiant de session pour rester connecté.
          Durée : 30 jours.
        </li>
        <li>
          <code>qr_locale</code> : préférence de langue côté client (FR ou EN). Durée : 1 an.
        </li>
        <li>
          <code>qr_cookie_consent</code> : mémorise votre choix de bandeau cookies. Durée : 1 an.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Stockage local</h2>
      <p>
        Le panier de commande est stocké dans le <code>localStorage</code> de votre navigateur
        (clé <code>qr_cart_*</code>), uniquement pour conserver votre commande en cours sur la
        table que vous scannez. Aucune donnée ne quitte votre appareil tant que vous ne validez
        pas la commande.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Pas de tracking publicitaire</h2>
      <p>
        Nous n&apos;utilisons ni Google Analytics, ni Meta Pixel, ni aucun outil de tracking
        publicitaire tiers. Vos données ne sont pas vendues ni partagées à des fins
        commerciales.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Gestion via votre navigateur</h2>
      <p>
        Vous pouvez à tout moment supprimer les cookies via les paramètres de votre navigateur.
        Note : la suppression des cookies de session vous déconnectera.
      </p>
    </>
  );
}
