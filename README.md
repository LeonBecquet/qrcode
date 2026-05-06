# QR Restaurant

Plateforme SaaS B2B française : QR code par table → menu en ligne → commande directe sans serveur. Le client paie son addition au resto comme d'hab. Le resto paie un abo (mensuel / annuel / à vie).

Voir [`PLAN.md`](./PLAN.md) pour la spec complète et la roadmap par phases.

## Stack

- **Next.js 16** (App Router) + TypeScript strict
- **Postgres** via Neon (serverless)
- **Drizzle** ORM
- **Better Auth** pour l'authentification
- **Stripe Billing** pour les abonnements
- **Tailwind v4** + Shadcn/ui
- **Pusher** pour le temps réel cuisine (Phase 7)
- **Cloudflare R2** pour les photos et PDFs (Phase 3+)
- Hébergement : Vercel

## Démarrage local

```bash
# Installer les deps
pnpm install

# Configurer l'env
cp .env.example .env.local
# remplir DATABASE_URL (Neon), BETTER_AUTH_SECRET (openssl rand -base64 32)

# Lancer en dev
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande | Effet |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Build de prod |
| `pnpm start` | Lance le build de prod |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check |
| `pnpm db:generate` | Drizzle : génère les migrations depuis le schéma |
| `pnpm db:migrate` | Drizzle : applique les migrations |
| `pnpm db:push` | Drizzle : push direct du schéma (dev only) |
| `pnpm db:studio` | Drizzle Studio (UI DB) |

## Structure

```
src/
├── app/                Next.js App Router (routes)
├── components/
│   └── ui/             Composants Shadcn
├── lib/
│   ├── auth.ts         Better Auth config
│   ├── env.ts          Validation ENV (Zod)
│   ├── utils.ts        cn helper
│   └── db/
│       ├── client.ts   Drizzle + Neon
│       └── schema.ts   Tables (Phase 1+)
└── ...
```

## Statut

Phase 0 (bootstrap) terminée. Phase 1 (auth + multi-tenant) à attaquer.
