import { test } from "@playwright/test";

/**
 * Flows end-to-end complets — nécessitent une vraie DB Neon, Stripe en mode test,
 * et un domain Resend vérifié (ou onboarding@resend.dev).
 *
 * Ces tests sont skip par défaut. Pour les activer :
 *   1. Configure .env.test.local avec une DB de test (jamais la prod !)
 *   2. Run : `pnpm exec playwright test --grep @full`
 *
 * Ils sont à compléter quand on aura un vrai env de test.
 */

test.describe("Flows complets @full", () => {
  test.skip(
    "signup → onboarding → pricing → checkout → menu créé → QR généré",
    async () => {
      // 1. /signup avec email aléatoire
      // 2. Vérifier redirect /onboarding
      // 3. Soumettre nom du resto → /dashboard
      // 4. Sub gate redirige vers /pricing
      // 5. Choisir mensuel → checkout Stripe (intercepter ou utiliser test mode)
      // 6. Webhook → DB updated → /dashboard accessible
      // 7. Créer une catégorie + un item
      // 8. Créer une table T1
      // 9. Télécharger PDF QR
    },
  );

  test.skip("client scan QR → commande passée → suivi", async () => {
    // Setup : créer resto + menu + table en DB direct
    // 1. Aller à /r/{slug}/t/{token}
    // 2. Cliquer un item, ajouter au panier
    // 3. /cart → soumettre → redirect /order/[id]
    // 4. Vérifier statut "Reçue"
  });

  test.skip("cuisine reçoit la commande et change le statut", async () => {
    // Setup : resto + commande pending
    // 1. Login owner
    // 2. /dashboard/kitchen → voir la commande dans colonne "Reçues"
    // 3. Cliquer "Accepter" → bouge en "Acceptées"
    // 4. Verifier polling/Pusher refresh
  });
});
