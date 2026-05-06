import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — QR Restaurant",
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Politique de confidentialité</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : à compléter</p>

      <p className="my-6 rounded border-l-4 border-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
        ⚠️ Document type à valider avec un juriste / DPO avant ouverture commerciale.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est [Raison sociale], joignable à
        l&apos;adresse <a href="mailto:contact@qr-resto.fr">contact@qr-resto.fr</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Données collectées</h2>
      <p>
        Nous collectons les données strictement nécessaires au fonctionnement du Service :
      </p>
      <ul>
        <li>
          <strong>Côté restaurateur</strong> : email, nom, mot de passe haché, données du
          restaurant (nom, adresse, menus, commandes)
        </li>
        <li>
          <strong>Côté client final</strong> : prénom (optionnel), note de commande (optionnel),
          contenu de la commande, identifiant de table. Aucun email, téléphone ou compte
          n&apos;est requis.
        </li>
        <li>
          <strong>Données techniques</strong> : adresse IP (logs serveur, conservée 30 jours),
          cookie de session, cookie de préférence de langue
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">3. Finalités</h2>
      <ul>
        <li>fournir le Service aux restaurateurs et à leurs clients</li>
        <li>gérer la facturation et les abonnements</li>
        <li>assurer la sécurité de la plateforme</li>
        <li>améliorer le Service via des statistiques agrégées</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">4. Bases légales</h2>
      <ul>
        <li>
          <strong>Exécution du contrat</strong> : pour la fourniture du Service aux restaurateurs
        </li>
        <li>
          <strong>Intérêt légitime</strong> : sécurité, lutte contre la fraude
        </li>
        <li>
          <strong>Obligation légale</strong> : conservation des factures, allergènes
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">5. Durées de conservation</h2>
      <ul>
        <li>Compte restaurateur : pendant la durée de l&apos;abonnement + 3 ans</li>
        <li>Commandes : 10 ans (obligation comptable)</li>
        <li>Logs techniques : 30 jours</li>
        <li>Cookies : 12 mois maximum</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">6. Sous-traitants</h2>
      <p>Nous utilisons les sous-traitants suivants, choisis pour leur conformité au RGPD :</p>
      <ul>
        <li>
          <strong>Vercel</strong> (hébergement application) — Data Processing Addendum signé
        </li>
        <li>
          <strong>Neon</strong> (base de données) — DPA signé
        </li>
        <li>
          <strong>Stripe</strong> (paiements) — certifié PCI-DSS et conforme RGPD
        </li>
        <li>
          <strong>Cloudflare R2</strong> (stockage images) — conforme RGPD
        </li>
        <li>
          <strong>Pusher</strong> (temps réel) — conforme RGPD
        </li>
        <li>
          <strong>Resend</strong> (emails transactionnels) — conforme RGPD
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">7. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>droit d&apos;accès à vos données</li>
        <li>droit de rectification</li>
        <li>droit à l&apos;effacement (« droit à l&apos;oubli »)</li>
        <li>droit à la limitation du traitement</li>
        <li>droit à la portabilité</li>
        <li>droit d&apos;opposition</li>
        <li>droit d&apos;introduire une réclamation auprès de la CNIL</li>
      </ul>
      <p>
        Pour exercer ces droits, écrivez-nous à{" "}
        <a href="mailto:contact@qr-resto.fr">contact@qr-resto.fr</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">8. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles : chiffrement TLS,
        mots de passe hachés, accès aux données restreint au strict nécessaire, sauvegardes
        régulières, monitoring.
      </p>

      <h2 className="mt-8 text-xl font-semibold">9. Transferts hors UE</h2>
      <p>
        Certains de nos sous-traitants (Vercel, Neon, Stripe) peuvent traiter des données hors UE
        (États-Unis principalement). Ces transferts sont encadrés par les clauses contractuelles
        types de la Commission européenne.
      </p>
    </>
  );
}
