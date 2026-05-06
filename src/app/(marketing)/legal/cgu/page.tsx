import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — QR Restaurant",
};

export default function CguPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Conditions générales d&apos;utilisation</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : à compléter</p>

      <p className="my-6 rounded border-l-4 border-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
        ⚠️ Document type à valider avec un juriste avant ouverture commerciale.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Objet</h2>
      <p>
        Les présentes CGU régissent l&apos;accès et l&apos;utilisation du service QR Restaurant
        (ci-après « le Service ») par les restaurateurs (ci-après « le Client ») et les clients
        finaux du restaurateur scannant les QR codes.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Acceptation</h2>
      <p>
        L&apos;utilisation du Service implique l&apos;acceptation pleine et entière des présentes
        CGU. Si vous n&apos;acceptez pas ces conditions, vous devez cesser d&apos;utiliser le
        Service.
      </p>

      <h2 className="mt-8 text-xl font-semibold">3. Description du Service</h2>
      <p>
        QR Restaurant fournit aux restaurateurs une plateforme permettant de :
      </p>
      <ul>
        <li>configurer un menu numérique multilingue</li>
        <li>générer des QR codes par table</li>
        <li>recevoir des commandes des clients en temps réel</li>
        <li>consulter des statistiques d&apos;activité</li>
      </ul>
      <p>
        Le règlement des commandes s&apos;effectue directement entre le client final et le
        restaurateur, sans intermédiation financière de QR Restaurant.
      </p>

      <h2 className="mt-8 text-xl font-semibold">4. Compte utilisateur</h2>
      <p>
        Le Client est responsable de la confidentialité de ses identifiants et de toute activité
        effectuée depuis son compte. Il s&apos;engage à fournir des informations exactes lors de
        l&apos;inscription.
      </p>

      <h2 className="mt-8 text-xl font-semibold">5. Obligations du Client</h2>
      <p>Le Client s&apos;engage à :</p>
      <ul>
        <li>respecter la législation française applicable à son activité (notamment l&apos;affichage des allergènes et des prix)</li>
        <li>ne pas tenter de compromettre la sécurité du Service</li>
        <li>ne pas utiliser le Service pour des activités illégales</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">6. Disponibilité du Service</h2>
      <p>
        Nous nous efforçons de maintenir une disponibilité élevée mais ne pouvons la garantir à
        100 %. En cas d&apos;indisponibilité prolongée, le Client peut résilier son abonnement.
      </p>

      <h2 className="mt-8 text-xl font-semibold">7. Suspension et résiliation</h2>
      <p>
        Nous nous réservons le droit de suspendre ou résilier un compte en cas de manquement aux
        présentes CGU, notamment en cas de défaut de paiement ou d&apos;usage abusif.
      </p>

      <h2 className="mt-8 text-xl font-semibold">8. Modification des CGU</h2>
      <p>
        Nous pouvons modifier les présentes CGU à tout moment. Les Clients seront informés des
        modifications par email ou via le tableau de bord avec un préavis raisonnable.
      </p>

      <h2 className="mt-8 text-xl font-semibold">9. Droit applicable</h2>
      <p>
        Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux
        tribunaux compétents de [ville].
      </p>
    </>
  );
}
