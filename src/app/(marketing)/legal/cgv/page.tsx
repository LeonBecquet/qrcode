import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente — QR Restaurant",
};

export default function CgvPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Conditions générales de vente</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : à compléter</p>

      <p className="my-6 rounded border-l-4 border-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
        ⚠️ Document type à valider avec un juriste avant ouverture commerciale.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Objet</h2>
      <p>
        Les présentes CGV régissent la relation contractuelle entre [Raison sociale] (ci-après «
        nous ») et tout Client souscrivant à un abonnement au Service QR Restaurant.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Formules et tarifs</h2>
      <p>Le Service est proposé selon trois formules :</p>
      <ul>
        <li>
          <strong>Mensuel</strong> : 49 € HT par mois, sans engagement, renouvellement automatique
        </li>
        <li>
          <strong>Annuel</strong> : 499 € HT par an (équivalent à 2 mois offerts), sans
          engagement, renouvellement automatique
        </li>
        <li>
          <strong>À vie</strong> : 2000 € HT, paiement unique, accès au Service tant qu&apos;il
          existe
        </li>
      </ul>
      <p>
        La TVA applicable est la TVA française au taux normal (20 %), sauf exonération applicable.
      </p>

      <h2 className="mt-8 text-xl font-semibold">3. Modalités de paiement</h2>
      <p>
        Le paiement s&apos;effectue par carte bancaire via notre prestataire Stripe. Stripe traite
        les données de paiement conformément aux normes PCI-DSS. Aucune donnée bancaire n&apos;est
        stockée sur nos serveurs.
      </p>

      <h2 className="mt-8 text-xl font-semibold">4. Renouvellement et résiliation</h2>
      <p>
        Les abonnements mensuel et annuel se renouvellent automatiquement à échéance. Le Client
        peut résilier à tout moment depuis son tableau de bord, via le portail Stripe Customer.
        La résiliation prend effet à la fin de la période en cours, sans remboursement prorata.
      </p>
      <p>
        L&apos;option « à vie » est un achat unique. Elle ne donne droit à aucun remboursement
        au-delà du délai de rétractation légal.
      </p>

      <h2 className="mt-8 text-xl font-semibold">5. Droit de rétractation</h2>
      <p>
        Les présentes CGV étant conclues entre professionnels (B2B), le droit de rétractation
        prévu par le Code de la consommation ne s&apos;applique pas.
      </p>

      <h2 className="mt-8 text-xl font-semibold">6. Évolution des tarifs</h2>
      <p>
        Nous nous réservons le droit de modifier les tarifs des nouvelles souscriptions. Les
        Clients déjà abonnés conservent leur tarif initial pendant la durée de leur abonnement
        en cours, et seront informés de toute évolution lors du renouvellement avec un préavis de
        30 jours.
      </p>

      <h2 className="mt-8 text-xl font-semibold">7. Facturation</h2>
      <p>
        Une facture électronique est émise pour chaque paiement et envoyée à l&apos;adresse email
        du Client. Elle est également téléchargeable depuis le portail Stripe.
      </p>

      <h2 className="mt-8 text-xl font-semibold">8. Garanties et limitation de responsabilité</h2>
      <p>
        Nous fournissons le Service « en l&apos;état » et nous engageons à mettre en œuvre les
        moyens raisonnables pour assurer son bon fonctionnement. Notre responsabilité est limitée
        au montant des sommes versées par le Client au cours des 12 derniers mois.
      </p>

      <h2 className="mt-8 text-xl font-semibold">9. Force majeure</h2>
      <p>
        Aucune des parties ne pourra être tenue responsable d&apos;un manquement à ses obligations
        résultant d&apos;un cas de force majeure au sens de l&apos;article 1218 du Code civil.
      </p>

      <h2 className="mt-8 text-xl font-semibold">10. Droit applicable et juridiction</h2>
      <p>
        Les présentes CGV sont régies par le droit français. Tout litige relève de la compétence
        exclusive des tribunaux de [ville].
      </p>
    </>
  );
}
