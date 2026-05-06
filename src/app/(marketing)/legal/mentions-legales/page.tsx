import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — QR Restaurant",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Mentions légales</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : à compléter</p>

      <p className="text-muted-foreground my-6 rounded border-l-4 border-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
        ⚠️ Document type à valider avec un juriste avant ouverture commerciale. Compléter les
        champs entre crochets <code>[...]</code>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Éditeur du site</h2>
      <p>
        Le site QR Restaurant est édité par <strong>[Raison sociale]</strong>, [forme juridique]
        au capital de [montant] €, dont le siège social est situé [adresse complète], immatriculée
        au RCS de [ville] sous le numéro [SIREN/SIRET].
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        <li>Numéro de TVA intracommunautaire : [FR XX XXX XXX XXX]</li>
        <li>Directeur de la publication : [Nom Prénom]</li>
        <li>Email de contact : [contact@qr-resto.fr]</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Hébergement</h2>
      <p>
        Le site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Avenue #4133, Covina,
        CA 91723, États-Unis. La base de données est hébergée par <strong>Neon, Inc.</strong>, 209
        Barton Springs Road, Suite 304, Austin, TX 78704, États-Unis.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site (textes, graphismes, logos, code) est la propriété
        exclusive de [Raison sociale], sauf mention contraire. Toute reproduction est interdite
        sans accord écrit préalable.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Données personnelles</h2>
      <p>
        Le traitement des données personnelles fait l&apos;objet d&apos;une politique dédiée. Voir
        notre <a href="/legal/confidentialite">politique de confidentialité</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p>
        Pour toute question concernant ces mentions, vous pouvez nous écrire à{" "}
        <a href="mailto:contact@qr-resto.fr">contact@qr-resto.fr</a>.
      </p>
    </>
  );
}
