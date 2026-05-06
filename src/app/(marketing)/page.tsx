import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TIER_CONFIG } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "QR Restaurant — Commandes par QR code pour restaurants",
  description:
    "Vos clients commandent depuis leur table en scannant un QR code. Sans application. Sans attendre le serveur. Pour restaurants français.",
  openGraph: {
    title: "QR Restaurant",
    description: "Commandes par QR code pour restaurants français. Sans application, sans attente.",
    type: "website",
    locale: "fr_FR",
  },
};

const STEPS = [
  {
    num: "1",
    title: "Construisez votre menu",
    body: "Photos, allergènes, options (cuisson, suppléments). En français et anglais si vous le souhaitez.",
  },
  {
    num: "2",
    title: "Imprimez vos QR codes",
    body: "Un PDF prêt à imprimer pour toutes vos tables. Vous plastifiez et collez.",
  },
  {
    num: "3",
    title: "Recevez les commandes",
    body: "Le client scanne, commande, paie au comptoir comme d'habitude. Vous voyez tout en cuisine en temps réel.",
  },
];

const FEATURES = [
  {
    title: "Sans application",
    body: "Vos clients scannent et commandent directement depuis leur navigateur. Aucune installation.",
  },
  {
    title: "Bilingue FR + EN",
    body: "Activez l'anglais en un clic. Idéal pour les zones touristiques.",
  },
  {
    title: "Allergènes UE",
    body: "Les 14 allergènes obligatoires affichés clairement. Conformité française.",
  },
  {
    title: "Cuisine temps réel",
    body: "Tablette en cuisine, nouvelles commandes affichées instantanément. Plus de tickets perdus.",
  },
  {
    title: "Vous gardez vos clients",
    body: "Pas de commission sur les commandes. Le client paie au resto comme d'habitude.",
  },
  {
    title: "Statistiques claires",
    body: "Chiffre d'affaires, top plats, ticket moyen. Export CSV pour votre comptable.",
  },
];

const FAQ = [
  {
    q: "Comment les clients paient-ils ?",
    a: "Comme d'habitude, au restaurant. Notre plateforme ne prend aucune commission sur les commandes. Vous payez seulement votre abonnement.",
  },
  {
    q: "Faut-il une application ?",
    a: "Non. Vos clients scannent le QR code avec leur téléphone et accèdent directement à votre menu. Aucun téléchargement.",
  },
  {
    q: "Que se passe-t-il si un QR code est volé ou photographié ?",
    a: "Vous pouvez régénérer le token d'une table en un clic. L'ancien QR devient instantanément invalide.",
  },
  {
    q: "Est-ce légalement conforme en France ?",
    a: "Oui. Les 14 allergènes UE sont gérés. La commande digitale n'a pas valeur de facture, votre note papier en fin de repas reste l'officielle.",
  },
  {
    q: "Puis-je résilier à tout moment ?",
    a: "Oui pour les abonnements mensuel et annuel, sans engagement. L'option à vie est un achat unique sans renouvellement.",
  },
];

const PLAN_DETAILS: Record<
  keyof typeof TIER_CONFIG,
  { tagline: string; cadence: string; cta: string; highlight?: boolean }
> = {
  monthly: { tagline: "Pour démarrer.", cadence: "/mois", cta: "Choisir le mensuel" },
  annual: {
    tagline: "2 mois offerts. Le plus populaire.",
    cadence: "/an",
    cta: "Choisir l'annuel",
    highlight: true,
  },
  lifetime: {
    tagline: "Payez une fois, gardez à vie.",
    cadence: "une fois",
    cta: "Acheter à vie",
  },
};

export default function HomePage() {
  return (
    <>
      <section className="container mx-auto px-4 pt-20 pb-16 text-center md:pt-32 md:pb-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Vos clients commandent <br className="hidden md:inline" />
          <span className="text-muted-foreground">depuis leur table.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg md:text-xl">
          Un QR code par table, votre menu en ligne, les commandes en cuisine en temps réel. Sans
          application. Sans commission sur les ventes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Démarrer mon restaurant
          </Link>
          <Link href="#tarifs" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Voir les tarifs
          </Link>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">
          Sans engagement · Annulable à tout moment
        </p>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Comment ça marche</h2>
          <p className="text-muted-foreground mt-2">3 étapes pour démarrer ce soir.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.num} className="border-none shadow-none">
              <CardHeader>
                <div className="bg-foreground text-background flex size-10 items-center justify-center rounded-full text-lg font-bold">
                  {step.num}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription>{step.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="fonctionnalites" className="bg-muted/30 border-y py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Tout pour votre service</h2>
            <p className="text-muted-foreground mt-2">
              Du menu jusqu&apos;aux statistiques, en passant par le QR code à plastifier.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => (
              <Card key={feat.title}>
                <CardHeader>
                  <CardTitle className="text-base">{feat.title}</CardTitle>
                  <CardDescription>{feat.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Tarifs simples</h2>
          <p className="text-muted-foreground mt-2">
            Pas de commission sur les commandes. Juste votre abonnement.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {(Object.keys(PLAN_DETAILS) as (keyof typeof TIER_CONFIG)[]).map((tier) => {
            const config = TIER_CONFIG[tier];
            const detail = PLAN_DETAILS[tier];
            return (
              <Card
                key={tier}
                className={detail.highlight ? "border-foreground shadow-md" : undefined}
              >
                <CardHeader>
                  <CardTitle>{config.label}</CardTitle>
                  <CardDescription>{detail.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{config.amountEur} €</span>
                    <span className="text-muted-foreground text-sm">{detail.cadence}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/signup"
                    className={`w-full text-center ${buttonVariants({
                      variant: detail.highlight ? "default" : "outline",
                    })}`}
                  >
                    {detail.cta}
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="faq" className="bg-muted/30 border-y py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="bg-card group rounded-lg border p-4">
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-medium">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-muted-foreground mt-2 text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Prêt à démarrer ?</h2>
        <p className="text-muted-foreground mt-2">
          Configurez votre menu en moins d&apos;une heure. Premier QR imprimé ce soir.
        </p>
        <div className="mt-6">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Créer mon compte
          </Link>
        </div>
      </section>
    </>
  );
}
