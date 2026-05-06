import type { Metadata } from "next";
import Link from "next/link";
import { HeroContent } from "./hero-content";
import { HeroMockup } from "./hero-mockup";
import { MotionSection, MotionStagger, MotionStaggerItem } from "@/components/motion-section";
import { buttonVariants } from "@/components/ui/button";
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

const STATS = [
  { value: "0%", label: "Commission sur les commandes" },
  { value: "< 5 min", label: "Pour configurer votre 1er menu" },
  { value: "FR + EN", label: "Bilingue dès le départ" },
];

const STEPS = [
  {
    num: "1",
    emoji: "📝",
    title: "Construisez votre carte",
    body: "Photos, allergènes, options de cuisson, suppléments. En français et anglais.",
    bg: "bg-[var(--brand-saffron)]/20",
  },
  {
    num: "2",
    emoji: "🖨️",
    title: "Imprimez vos QR codes",
    body: "Un PDF prêt à plastifier pour toutes vos tables. Beaux à voir, faciles à scanner.",
    bg: "bg-[var(--brand-orange)]/20",
  },
  {
    num: "3",
    emoji: "🍽️",
    title: "Recevez les commandes",
    body: "Le client scanne, commande, paie en fin de repas comme d'habitude. Cuisine en direct.",
    bg: "bg-[var(--brand-forest)]/15",
  },
];

const FEATURES = [
  {
    emoji: "📱",
    title: "Sans application",
    body: "Vos clients scannent et commandent depuis leur navigateur. Aucune installation.",
  },
  {
    emoji: "🌍",
    title: "Bilingue FR + EN",
    body: "Activez l'anglais en un clic. Les touristes adorent.",
  },
  {
    emoji: "⚠️",
    title: "Allergènes UE",
    body: "Les 14 allergènes obligatoires affichés clairement. Conformité française intégrée.",
  },
  {
    emoji: "⚡",
    title: "Cuisine temps réel",
    body: "Tablette en cuisine, nouvelles commandes affichées instantanément. Plus de tickets perdus.",
  },
  {
    emoji: "💰",
    title: "Vous gardez tout",
    body: "Pas de commission sur les commandes. Vous payez juste votre abonnement.",
  },
  {
    emoji: "📊",
    title: "Statistiques claires",
    body: "Chiffre d'affaires, top plats, ticket moyen. Export CSV pour votre comptable.",
  },
];

const FAQ = [
  {
    q: "Comment les clients paient-ils ?",
    a: "Comme d'habitude, au restaurant, en fin de repas. Notre plateforme ne prend aucune commission sur les commandes. Vous payez seulement votre abonnement, et vous gardez 100% du ticket.",
  },
  {
    q: "Faut-il que le client télécharge une application ?",
    a: "Non. Le QR code ouvre directement votre menu dans le navigateur. Aucune installation, aucun compte à créer pour le client.",
  },
  {
    q: "Que se passe-t-il si un QR code est volé ou photographié ?",
    a: "Vous régénérez le token de la table en un clic depuis votre tableau de bord. L'ancien QR devient instantanément invalide. Réimprimez juste celui-là.",
  },
  {
    q: "Est-ce conforme à la législation française ?",
    a: "Oui. Les 14 allergènes UE sont gérés. La commande digitale n'a pas valeur de facture, votre note papier en fin de repas reste l'officielle. Toutes nos pages légales sont prêtes.",
  },
  {
    q: "Puis-je résilier à tout moment ?",
    a: "Oui pour les abonnements mensuel et annuel, sans engagement, depuis le portail Stripe. L'option à vie est un achat unique sans renouvellement.",
  },
  {
    q: "Combien de tables et de plats puis-je créer ?",
    a: "Sans limite, sur tous les plans. Que vous ayez 4 tables ou 80 couverts, c'est le même tarif.",
  },
];

const PLAN_DETAILS: Record<
  keyof typeof TIER_CONFIG,
  { tagline: string; cadence: string; cta: string; highlight?: boolean; perks: string[] }
> = {
  monthly: {
    tagline: "Pour démarrer sans engagement.",
    cadence: "/mois",
    cta: "Commencer ce mois",
    perks: ["Sans engagement", "Annulable en 1 clic", "Toutes les fonctionnalités"],
  },
  annual: {
    tagline: "L'option populaire — 2 mois offerts.",
    cadence: "/an",
    cta: "Économiser 89 €",
    highlight: true,
    perks: ["2 mois offerts", "Toutes les fonctionnalités", "Économie immédiate"],
  },
  lifetime: {
    tagline: "Payez une fois, gardez à vie.",
    cadence: "une fois",
    cta: "Acheter à vie",
    perks: ["Aucun renouvellement", "Mises à jour incluses", "Soutien aux early adopters"],
  },
};

export default function HomePage() {
  return (
    <>
      {/* ============= HERO ============= */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="animate-blob-1 pointer-events-none absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-blob-2 pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[var(--brand-forest)]/15 blur-3xl"
        />

        <div className="relative container mx-auto grid items-center gap-12 px-4 pt-16 pb-20 md:grid-cols-2 md:pt-24 md:pb-28">
          <HeroContent />
          <HeroMockup />
        </div>
      </section>

      {/* ============= STATS BAR ============= */}
      <section className="border-y bg-[var(--brand-forest)] text-[var(--brand-cream)]">
        <MotionStagger
          className="container mx-auto grid divide-y divide-[var(--brand-cream)]/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          staggerDelay={0.12}
        >
          {STATS.map((stat) => (
            <MotionStaggerItem key={stat.label} className="px-6 py-8 text-center">
              <div className="text-4xl font-bold tracking-tight md:text-5xl">{stat.value}</div>
              <p className="mt-1 text-sm text-[var(--brand-cream)]/70">{stat.label}</p>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </section>

      {/* ============= COMMENT ÇA MARCHE ============= */}
      <section className="container mx-auto px-4 py-20">
        <MotionSection className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium tracking-wide text-[var(--brand-orange)] uppercase">
            En 3 étapes
          </p>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Démarrer ce soir, c&apos;est possible.
          </h2>
        </MotionSection>
        <MotionStagger className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
          {STEPS.map((step) => (
            <MotionStaggerItem
              key={step.num}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${step.bg}`}
            >
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-30 transition-transform duration-500 group-hover:scale-110">
                {step.emoji}
              </div>
              <div className="bg-foreground text-background mb-4 flex size-10 items-center justify-center rounded-full text-lg font-bold">
                {step.num}
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{step.body}</p>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </section>

      {/* ============= FEATURES ============= */}
      <section
        id="fonctionnalites"
        className="bg-[var(--brand-forest)] py-20 text-[var(--brand-cream)]"
      >
        <div className="container mx-auto px-4">
          <MotionSection className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium tracking-wide text-[var(--brand-saffron)] uppercase">
              Tout inclus
            </p>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Pensé pour votre service.
            </h2>
            <p className="mt-3 text-lg text-[var(--brand-cream)]/70">
              Du menu jusqu&apos;à la cuisine, tout est en place.
            </p>
          </MotionSection>
          <MotionStagger
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.07}
          >
            {FEATURES.map((feat) => (
              <MotionStaggerItem
                key={feat.title}
                className="group relative overflow-hidden rounded-xl border border-[var(--brand-cream)]/10 bg-[var(--brand-cream)]/5 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-cream)]/30 hover:bg-[var(--brand-cream)]/10"
              >
                <div className="text-3xl transition-transform duration-300 group-hover:scale-110">
                  {feat.emoji}
                </div>
                <h3 className="mt-3 text-lg font-bold">{feat.title}</h3>
                <p className="mt-1 text-sm text-[var(--brand-cream)]/70">{feat.body}</p>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* ============= TARIFS ============= */}
      <section id="tarifs" className="container mx-auto px-4 py-20">
        <MotionSection className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium tracking-wide text-[var(--brand-orange)] uppercase">
            Tarifs simples
          </p>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Choisissez votre formule.
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Pas de commission sur les ventes. Juste votre abonnement.
          </p>
        </MotionSection>
        <MotionStagger className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3" staggerDelay={0.1}>
          {(Object.keys(PLAN_DETAILS) as (keyof typeof TIER_CONFIG)[]).map((tier) => {
            const config = TIER_CONFIG[tier];
            const detail = PLAN_DETAILS[tier];
            return (
              <MotionStaggerItem
                key={tier}
                className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  detail.highlight
                    ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5 shadow-lg"
                    : "bg-card hover:border-[var(--brand-orange)]/40"
                }`}
              >
                {detail.highlight ? (
                  <div className="absolute -top-3 right-6 rounded-full bg-[var(--brand-orange)] px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Le plus choisi
                  </div>
                ) : null}
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">{config.label}</h3>
                  <p className="text-muted-foreground text-sm">{detail.tagline}</p>
                </div>
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">{config.amountEur}</span>
                  <span className="text-2xl font-bold">€</span>
                  <span className="text-muted-foreground ml-1 text-sm">{detail.cadence}</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {detail.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="text-[var(--brand-forest)]">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block w-full text-center transition-transform hover:scale-[1.02] ${buttonVariants({
                    variant: detail.highlight ? "default" : "outline",
                    size: "lg",
                  })}`}
                >
                  {detail.cta}
                </Link>
              </MotionStaggerItem>
            );
          })}
        </MotionStagger>
        <p className="text-muted-foreground mt-8 text-center text-xs">
          Tarifs HT. Paiement sécurisé Stripe. Annulable à tout moment.
        </p>
      </section>

      {/* ============= FAQ ============= */}
      <section id="faq" className="bg-[var(--brand-saffron)]/15 py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <MotionSection className="mb-10 text-center">
            <p className="mb-2 text-sm font-medium tracking-wide text-[var(--brand-orange)] uppercase">
              FAQ
            </p>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Questions fréquentes.
            </h2>
          </MotionSection>
          <MotionStagger className="space-y-3" staggerDelay={0.05}>
            {FAQ.map((item) => (
              <MotionStaggerItem
                key={item.q}
                className="bg-card overflow-hidden rounded-xl border transition-colors hover:border-[var(--brand-orange)]/50"
              >
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 font-medium">
                    {item.q}
                    <span className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] flex size-8 shrink-0 items-center justify-center rounded-full text-xl transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-muted-foreground border-t px-5 py-4 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </details>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* ============= CTA FINAL ============= */}
      <section className="bg-foreground text-background relative overflow-hidden py-20">
        <div
          aria-hidden="true"
          className="animate-blob-1 pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[var(--brand-orange)]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-blob-2 pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[var(--brand-forest)]/30 blur-3xl"
        />
        <MotionSection className="relative container mx-auto px-4 text-center">
          <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Prêt à libérer vos serveurs ?
          </h2>
          <p className="text-background/70 mx-auto mt-4 max-w-xl text-lg">
            Configurez votre menu en moins d&apos;une heure. Premier QR imprimé ce soir.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="animate-pulse-glow inline-flex items-center justify-center rounded-md bg-[var(--brand-orange)] px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-110"
            >
              Créer mon compte →
            </Link>
            <Link
              href="#tarifs"
              className="text-background/80 hover:text-background underline-offset-4 hover:underline"
            >
              Voir les tarifs
            </Link>
          </div>
        </MotionSection>
      </section>
    </>
  );
}
