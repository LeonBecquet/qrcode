# QR Restaurant

Plateforme SaaS B2B française : QR code par table → menu en ligne → commande directe sans serveur. Le client paie son addition au resto comme d'hab. Le resto paie un abo (mensuel / annuel / à vie).

Voir [`PLAN.md`](./PLAN.md) pour la spec et la roadmap par phases. Voir [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md) avant la mise en prod.

## Stack

- **Next.js 16** (App Router) + TypeScript strict
- **Postgres** via Neon (serverless)
- **Drizzle** ORM
- **Better Auth** pour l'authentification
- **Stripe Billing** pour les abonnements (49 €/mois · 499 €/an · 2000 € à vie)
- **Tailwind v4** + Shadcn/ui (base-ui)
- **Pusher** pour le temps réel cuisine (avec fallback polling)
- **Cloudflare R2** pour les photos et PDFs QR
- **Resend** pour les emails transactionnels
- **Playwright** pour les tests E2E
- Hébergement : Vercel

## Démarrage local

```bash
# Installer les deps
pnpm install

# Configurer l'env
cp .env.example .env.local
# remplir au minimum DATABASE_URL + BETTER_AUTH_SECRET (openssl rand -base64 32)
# Stripe / R2 / Pusher / Resend sont optionnels en dev (no-op silencieux)

# Pousser le schéma sur Neon
pnpm db:push

# Lancer en dev
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Pour rendre un user admin plateforme :

```sql
UPDATE "user" SET "isPlatformAdmin" = true WHERE email = 'votre@email.fr';
```

## Scripts

| Commande | Effet |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Build de prod |
| `pnpm start` | Lance le build de prod |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` / `format:check` | Prettier |
| `pnpm db:generate` | Drizzle : génère les migrations |
| `pnpm db:migrate` | Drizzle : applique les migrations |
| `pnpm db:push` | Drizzle : push direct du schéma (dev only) |
| `pnpm db:studio` | Drizzle Studio (UI DB) |
| `pnpm test:e2e` | Playwright (smoke tests, headless) |
| `pnpm test:e2e:ui` | Playwright en mode UI |
| `pnpm test:e2e:install` | Télécharger les browsers Chromium + WebKit |

## Structure

```
src/
├── app/
│   ├── (marketing)/        Landing + pages légales (route group)
│   ├── api/                Routes API (auth, stripe webhook, qr-pdf, analytics export)
│   ├── admin/              Interface platform admin (gated isPlatformAdmin)
│   ├── dashboard/          Interface restaurateur (auth + sub gate)
│   │   ├── menu/           Menu builder
│   │   ├── tables/         CRUD tables + génération QR
│   │   ├── kitchen/        Vue cuisine temps réel
│   │   ├── analytics/      KPIs + export CSV
│   │   └── settings/       Abo, branding, horaires
│   ├── r/[slug]/t/[token]/ Interface client publique (PWA)
│   ├── signin / signup / onboarding / pricing
│   ├── layout.tsx          Root + cookie banner + metadata SEO
│   ├── manifest.ts         PWA manifest
│   ├── sitemap.ts          /sitemap.xml
│   └── robots.ts           /robots.txt
├── components/
│   ├── ui/                 Composants Shadcn (Button, Card, Input...)
│   └── cookie-banner.tsx
├── lib/
│   ├── auth.ts             Better Auth config + hook welcome
│   ├── auth-client.ts      Client Better Auth (signIn, signUp, signOut)
│   ├── env.ts              Validation ENV (Zod)
│   ├── stripe.ts           Stripe client lazy + TIER_CONFIG
│   ├── storage.ts          R2 (AWS S3) client lazy + uploadToR2
│   ├── pusher.ts           Pusher server lazy
│   ├── pusher-client.ts    Pusher client singleton
│   ├── email.ts            Resend lazy + templates HTML
│   ├── qr.ts               Génération token + QR data URL
│   ├── pdf.tsx             @react-pdf/renderer pour PDFs imprimables
│   ├── utils.ts            cn helper
│   ├── db/
│   │   ├── client.ts       Drizzle + Neon serverless
│   │   └── schema.ts       Tous les schémas Drizzle
│   └── server/
│       ├── session.ts      requireSession, requireRestaurant
│       ├── admin.ts        isPlatformAdmin, requirePlatformAdmin
│       ├── locale.ts       getPublicLocale (cookie)
│       ├── analytics.ts    KPIs + top items + daily series
│       └── public-resolver.ts  resolvePublicTable + loadPublicMenu
└── proxy.ts                Next 16 proxy (ex-middleware) pour protection routes

drizzle/                    Migrations SQL générées
tests/e2e/                  Tests Playwright (smoke + flows complets skip)
```

## Tests

Smoke tests Playwright qui ne nécessitent pas de DB :

```bash
pnpm test:e2e:install   # 1 fois pour download les browsers
pnpm test:e2e
```

Les tests couvrent : landing page (hero, sections, footer), pages auth (formulaires + redirect non-auth), pages légales (5 pages + sitemap + robots).

Les **flows complets** (signup → checkout → menu → QR ; client scan → commande ; cuisine temps réel) sont stubés dans `tests/e2e/full-flows.spec.ts` avec `test.skip` — à activer quand un env de test avec DB sera prêt.

## Statut

- ✅ Phases 0–11 terminées (15 commits sur `main`)
- ⏳ À faire avant prod : voir [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md)
