# QR Restaurant — Plan technique

> Plateforme SaaS B2B FR : QR code par table → menu en ligne → commande directe sans passer par un serveur. Le restaurateur paie un abo (mensuel / annuel / à vie). Aucune commission sur les commandes : le client paie son addition au resto comme d'hab.

---

## 1. Cadrage produit

### Acteurs

| Acteur | Rôle |
|---|---|
| **Client final** | Scanne le QR, parcourt le menu, commande. Pas de compte, pas de paiement en ligne. Anonyme. |
| **Personnel resto** | Reçoit les commandes en temps réel, change leur statut (accepté → en cuisine → prêt → servi). |
| **Owner resto** | Configure son resto, construit ses menus, gère ses tables, génère ses QR, paie l'abo. |
| **Admin plateforme** | Nous. Voit la liste des restos, MRR, churn. |

### Flux client (le cœur de la valeur)

1. Scan QR de la table T5
2. Atterrit sur `qr-resto.fr/r/{slug}/t/{token}` (PWA installable)
3. Voit le menu du resto branded (logo, couleurs, photos)
4. Ajoute au panier, valide la commande (nom optionnel, allergies/notes optionnelles)
5. Commande envoyée en cuisine en temps réel
6. Écran de suivi : "Reçue → en préparation → prête"
7. Le serveur amène les plats. Le client paie en fin de repas comme d'hab (CB, espèces, peu importe — hors plateforme).

### Flux owner

1. Sign up → choisit son plan → paie via Stripe → onboarding wizard
2. Renseigne resto (nom, adresse, horaires, branding)
3. Construit son menu (catégories, plats, photos, allergènes, options/cuissons)
4. Configure ses tables (nombre, groupes terrasse/intérieur)
5. Télécharge le PDF des QR à imprimer/plastifier
6. Forme son personnel sur le dashboard cuisine

---

## 2. Stack technique

| Couche | Choix | Pourquoi |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript strict | full-stack, SSR/SSG, API routes, RSC |
| **DB** | Postgres via **Neon** | serverless (scale-to-zero), branching pour dev/preview, free tier OK |
| **ORM** | **Drizzle** | léger, SQL-like, type-safe, edge-compatible, migrations propres |
| **Auth** | **Better Auth** | moderne, type-safe, on possède les données (vs Clerk), plus léger que NextAuth |
| **Paiements abo** | **Stripe Billing** | 3 prix : `price_monthly`, `price_annual`, `price_lifetime` (one-time) |
| **Storage fichiers** | **Cloudflare R2** | photos menus + PDFs QR. Pas de coût d'egress (vs S3), Next/Image compatible |
| **Temps réel** | **Pusher Channels** | dashboard cuisine reçoit nouvelles commandes en push. Free tier suffit MVP |
| **Email transactionnel** | **Resend** | signup, sub events, résumé quotidien |
| **Génération QR/PDF** | `qrcode` + `@react-pdf/renderer` | PDFs server-rendered, layout A4 imprimable |
| **UI** | Tailwind + **Shadcn/ui** + Radix primitives | design system cohérent, headless = on contrôle le style |
| **Validation** | **Zod** | schémas partagés client/serveur, validation forms + API |
| **Forms** | React Hook Form + zodResolver | DX top, perf bonne |
| **i18n** | **next-intl** | FR par défaut, EN prêt pour les touristes |
| **Tests** | Vitest (unit) + Playwright (E2E) | E2E sur les flows critiques uniquement |
| **Monitoring** | Sentry + Vercel Analytics | erreurs + perfs |
| **Hébergement** | **Vercel** (frontend + API) | natif Next.js, déploiement preview par PR |
| **Package manager** | **pnpm** | rapide, monorepo-friendly si on étend |
| **CI/CD** | GitHub Actions : lint + typecheck + test ; deploy auto via Vercel | |

### Pourquoi PAS d'autres options qu'on aurait pu choisir

- **Pas Supabase** : on a déjà Neon (Postgres pur, plus simple) + Better Auth (séparation propre). Supabase = couplage fort, vendor lock-in.
- **Pas Prisma** : magique, plus lourd, moins edge-friendly que Drizzle.
- **Pas SSE / polling** pour le temps réel : Pusher = battle-tested, fiable même en mauvais wifi resto.
- **Pas de monorepo Turborepo** au début : single Next.js app suffit, on splittera si besoin (kitchen app native, etc.).

---

## 3. Architecture

### Mono app Next.js, route segments séparés

```
app/
├── (marketing)/           Landing publique + pricing
│   ├── page.tsx
│   ├── pricing/
│   ├── cgu/ cgv/ rgpd/ mentions/
├── (auth)/                Sign in / sign up / mot de passe oublié
├── (dashboard)/           Interface resto (auth + sub active requis)
│   ├── layout.tsx         sidebar, sub gate
│   ├── page.tsx           overview commandes du jour
│   ├── menu/              builder menu
│   ├── tables/            tables + génération QR
│   ├── orders/            historique commandes
│   ├── kitchen/           écran cuisine temps réel
│   ├── analytics/         CA, top produits
│   └── settings/          resto, branding, abo, équipe
├── (admin)/               Interface platform admin (nous)
├── r/[slug]/t/[token]/    Interface CLIENT publique (PWA)
│   ├── page.tsx           menu
│   ├── cart/              panier
│   └── order/[orderId]/   suivi commande
└── api/
    ├── stripe/webhook/    webhooks Stripe
    ├── orders/            CRUD commandes
    ├── upload/            uploads R2 signés
    └── pusher/auth/       auth canaux Pusher
```

### Multi-tenancy

- **1 abonnement = 1 restaurant** (décision actée). Pas de notion d'organisation séparée pour MVP.
- L'entité `restaurant` porte tout : branding, abo Stripe, memberships staff.
- Toujours scoper par `restaurantId` sur chaque query.
- Helper `requireRestaurantFromSession()` côté serveur, jamais de query sans scope.
- Si un même user gère 2 restos plus tard → 2 signups = 2 memberships = switcher de compte. Pas un cas MVP prioritaire.

### Sécurité QR / tables

- Le QR code encode `https://qr-resto.fr/r/{slug}/t/{token}` où `token` est un `nanoid(16)` aléatoire stocké en DB.
- **Pas l'ID numérique de la table** dans l'URL : sinon on peut deviner `?table=5` etc.
- Token rotatable (regenerate dans le dashboard si compromis).
- Rate-limit anonyme par IP sur l'endpoint commande (anti-spam).

---

## 4. Modèle de données

```
users (via Better Auth)
  id, email, name, password_hash, email_verified, is_platform_admin, created_at

restaurants  (entité abonnée — fusionnée avec sub)
  id, slug (unique global), name, description,
  address, postal_code, city, phone, email,
  logo_url, cover_url,
  theme (jsonb : { primary, accent, font }),
  timezone (default 'Europe/Paris'),
  currency (default 'EUR'),
  languages (text[] default ['fr','en']),  -- FR+EN dès le départ
  -- billing intégré au resto :
  stripe_customer_id,
  stripe_subscription_id (null si lifetime),
  tier (monthly | annual | lifetime),
  sub_status (trialing | active | past_due | canceled),
  current_period_end, lifetime_purchased_at,
  is_published, created_at

memberships
  id, user_id → users, restaurant_id → restaurants,
  role (owner | admin | staff_kitchen | staff_waiter), created_at

restaurant_hours
  id, restaurant_id → restaurants,
  day_of_week (0-6), open_time, close_time, is_closed

tables
  id, restaurant_id → restaurants,
  label (ex "T1", "Terrasse 3"),
  group_name (nullable, ex "Intérieur" / "Terrasse"),
  token (nanoid 16, unique),
  is_active, created_at

menus
  id, restaurant_id → restaurants,
  name (ex "Carte midi", "Carte du soir"),
  is_default,
  active_from, active_to (time of day, null = always),
  active_days (int[] 0-6, null = all),
  is_published, created_at

menu_categories
  id, menu_id → menus,
  name_i18n (jsonb { fr, en }),
  description_i18n (jsonb), sort_order, is_visible

menu_items
  id, category_id → menu_categories,
  name_i18n (jsonb), description_i18n (jsonb),
  price_cents (int),
  image_url, allergens (text[]),  -- gluten, lactose, oeuf, fruits-coque, etc.
  is_available (toggle rupture), sort_order

menu_item_options
  id, menu_item_id → menu_items,
  name_i18n (jsonb)  -- ex "Cuisson", "Suppléments"
  type (single | multiple),
  is_required, sort_order

menu_item_option_choices
  id, option_id → menu_item_options,
  name_i18n (jsonb),       -- ex "Saignant"
  price_delta_cents (int default 0),
  is_default, sort_order

orders
  id, restaurant_id → restaurants, table_id → tables,
  status (pending | accepted | in_kitchen | ready | served | canceled),
  customer_name (nullable), customer_note (nullable),
  subtotal_cents, locale,
  created_at, updated_at, served_at

order_items
  id, order_id → orders,
  menu_item_id → menu_items,
  name_snapshot, price_cents_snapshot,    -- figés au moment de la commande
  quantity,
  options_snapshot (jsonb),               -- ex [{ option: "Cuisson", choice: "Saignant", priceDelta: 0 }]
  subtotal_cents

order_events  (audit log)
  id, order_id → orders,
  from_status, to_status, by_user_id, created_at
```

### Décisions clés

- **Snapshots prix/nom** sur `order_items` : si le resto change un prix après la commande, l'historique reste fidèle.
- **Allergènes en tableau** : enum côté code (gluten, lactose, oeuf, arachide, fruits-coque, soja, poisson, crustacés, mollusques, céleri, moutarde, sésame, sulfites, lupin) — affichage standardisé.
- **i18n en jsonb** : pas de table de traduction séparée, simple, query-friendly.

---

## 5. Plan de build par phases

Chaque phase produit un livrable testable. On ne passe pas à la suivante sans valider la précédente.

### **Phase 0 — Bootstrap** ✅ FAIT
- ✅ Next.js 16 + TS strict (`noUncheckedIndexedAccess`) + ESLint + Prettier
- ✅ Tailwind v4 + Shadcn/ui (base color neutral) + thème dark/light
- ✅ Drizzle + Neon, schema vide en attente Phase 1
- ✅ Better Auth installé (skeleton, wiring complet en Phase 1)
- ✅ Env vars validées avec Zod (`src/lib/env.ts`)
- ⏳ GH Actions (à ajouter quand on aura un remote — non bloquant)
- ✅ Layout shell + page d'accueil placeholder
- ✅ Scripts pnpm : `dev / build / lint / typecheck / format / db:*`
- **Livrable** : `pnpm dev` démarre. `pnpm typecheck` et `pnpm lint` passent.

### **Phase 1 — Auth & multi-tenant** (j3-5)
- Schémas users / organizations / memberships
- Sign up (crée user + org default + membership owner)
- Sign in / forgot password / magic link
- Middleware de protection routes `/dashboard/*`
- Helper `requireOrg()` côté serveur
- **Livrable** : on peut s'inscrire, se connecter, voir un dashboard vide.

### **Phase 2 — Stripe Billing & sub gate** (j6-9)
- 3 prix Stripe créés (script de seed)
- Page `/pricing` publique avec CTA → checkout
- Webhook Stripe : `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
- Lifetime traité différemment : one-time price, on stamp `lifetime_purchased_at` et `status='active'` à vie
- Middleware sub gate sur `/dashboard/*` : redirect vers `/pricing` si pas active
- Lien Stripe Customer Portal dans settings → gestion CB / annulation
- **Livrable** : un nouvel user peut payer monthly/annual/lifetime, accéder au dashboard, gérer sa carte.

### **Phase 3 — Restaurant & branding** (j10-12)
- CRUD restaurants (1 par défaut à la signup, possibilité d'en ajouter)
- Onboarding wizard : nom, adresse, téléphone, horaires, logo, couleur primaire
- Upload logo/cover via R2 (signed URL)
- Page settings/general
- Slug unique généré à partir du nom
- **Livrable** : owner peut configurer son resto, slug réservé.

### **Phase 4 — Menu builder** (j13-19)
- CRUD menus (multiple par resto, ex midi/soir)
- CRUD catégories avec drag-to-reorder (`@dnd-kit`)
- CRUD items : photo, nom, description, prix, allergènes (multi-select), dispo on/off
- CRUD options + choices (cuisson, suppléments, taille)
- Édition bilingue avec onglets FR/EN si la langue est activée pour le resto
- **Live preview** : panneau latéral qui montre la vue client en temps réel
- Templates pré-remplis (Bistrot français, Pizzeria, Asiatique) — optionnel, voir §6
- **Livrable** : owner peut construire un menu complet et voir son rendu.

### **Phase 5 — Tables & QR** (j20-22)
- CRUD tables avec groupes
- Génération token unique
- Bouton "Régénérer token" (invalide l'ancien QR)
- Génération PDF imprimable A4 : 4 ou 8 QR par page, logo resto, label table, branding minimaliste
- Téléchargement bulk + par table individuelle
- **Livrable** : owner imprime son PDF, plastifie, colle sur les tables.

### **Phase 6 — App client (PWA)** (j23-29)
- Route publique `/r/[slug]/t/[token]` : résout resto + table, charge le menu actif (selon heure/jour)
- Manifest PWA + service worker minimal (offline = "reconnexion impossible")
- UI menu : tabs catégories sticky, scroll items, photo + prix
- Modal item : description, allergènes, options, quantité, "ajouter au panier"
- Drawer panier (localStorage par token de table)
- Checkout : nom optionnel, note (allergies, "sans oignon"), valider
- Création commande (POST `/api/orders`)
- Page suivi `/r/[slug]/t/[token]/order/[id]` : statut en temps réel via Pusher
- Bouton "Appeler un serveur" (crée un event, voir §6)
- i18n FR/EN selon resto
- **Livrable** : un client peut scanner, commander, voir son statut. End-to-end fonctionnel.

### **Phase 7 — Dashboard cuisine temps réel** (j30-34)
- Route `/dashboard/kitchen`
- Subscribe au canal Pusher `private-restaurant-{id}`
- Cards de commandes en colonnes (Reçues / En cuisine / Prêtes)
- Boutons transitions de statut
- Son + flash visuel sur nouvelle commande
- Filtres par table / par catégorie de plat (cuisine vs bar pour boissons — phase 2 si trop)
- Bouton "Imprimer ticket" (window.print sur layout dédié)
- Permission par rôle (staff_kitchen vs staff_waiter — vues différentes)
- **Livrable** : staff peut piloter le service depuis tablette/PC.

### **Phase 8 — Analytics resto** (j35-37)
- Page `/dashboard/analytics`
- KPIs jour/semaine/mois : nb commandes, CA estimé, ticket moyen, top items
- Graph Recharts ou Tremor
- Export CSV
- **Livrable** : owner voit ses chiffres.

### **Phase 9 — Admin plateforme** (j38-39)
- Route `/admin` protégée par flag `is_platform_admin` sur user
- Liste orgs + restos + status sub
- MRR / ARR / churn calculés
- **Livrable** : on peut piloter notre business.

### **Phase 10 — Marketing & conformité FR** (j40-46)
- Landing `/` : value prop, screenshots, témoignages (placeholder), pricing, FAQ, CTA
- Pages légales : mentions, CGU, CGV, politique de confidentialité, politique cookies
- Bandeau cookies (Tarteaucitron ou maison)
- SEO basique (meta, OG, sitemap.xml, robots.txt)
- Email signup transactionnel (Resend)
- Email résumé quotidien des commandes (Resend, cron Vercel)
- Sentry intégré
- **Livrable** : prêt à mettre en prod et démarcher des restos.

### **Phase 11 — Tests E2E & polish** (j47-50)
- Playwright sur 3 flows critiques :
  1. Signup → checkout → onboarding → menu créé → QR généré
  2. Client scan → commande passée
  3. Cuisine reçoit en temps réel et change le statut
- Audit accessibilité (axe-core)
- Performance Lighthouse sur le menu client (cible >90, c'est le hot path)
- Tests de charge léger (k6 sur l'endpoint commande)
- **Livrable** : production-ready.

**Total estimé : ~50 jours de dev solo focus.** Réaliste si tu y bosses tous les jours.

---

## 6. Décisions

### Tranchées

| # | Décision | Choix |
|---|---|---|
| 1 | Multi-resto par owner | **Non** — 1 abo = 1 resto strict |
| 2 | Bilingue FR + EN dès MVP | **Oui** |
| 3 | Pricing abos | **49 €/mois · 499 €/an · 2000 € lifetime** |
| 4 | TVA / facture officielle | **Non** — la commande digitale n'a pas valeur fiscale, la note papier en fin de repas reste l'officielle |
| 5 | Tip / pourboire dans flow | **Non** par défaut |
| 6 | Staff multiples par resto | **Illimité** sur tous les tiers (KISS) |
| 7 | Modes service | **Table uniquement** pour MVP. Click & collect / à emporter = V2 |

### Défauts pris (révisables à tout moment)

| # | Question | Default proposé | Justif |
|---|---|---|---|
| 8 | Templates de menu | **Pas dans MVP.** Onboarding part d'un menu vide. | Ajout +2j si l'onboarding patine — facile à brancher après coup |
| 9 | Domaine | **Placeholder `qr-resto.fr`** dans la config. Path-based : `/r/{slug}/t/{token}` | Le vrai nom se choisit en parallèle, le code n'en dépend pas |
| 10 | Branding côté client | **Footer discret "Propulsé par [nom]"** | Acquisition gratuite. Option "white-label" en V2 sur tier sup |
| 11 | Bouton "Appeler le serveur" | **Inclus dans MVP** | ~1 jour de code, valeur évidente côté client |
| 12 | Impression cuisine | **Web print (`window.print`)** sur layout ticket dédié | ESC/POS thermique = V2 si la demande monte |

---

## 7. Risques techniques identifiés

| Risque | Mitigation |
|---|---|
| **Charge cuisine en rush** : 30 commandes/min sur un service du soir | Pusher gère sans problème, queue côté DB indexée, batch d'inserts |
| **Mauvais wifi dans certains restos** | PWA avec optimistic UI côté staff, retry sur Pusher reconnect, banner "hors ligne" sur menu client |
| **Photos lourdes uploadées** | Limite 5 MB côté upload, génération thumbnail server-side (sharp), Next/Image pour le rendu |
| **Spam commandes anonymes** | Rate-limit IP + token de table, captcha invisible (Turnstile Cloudflare) si abus |
| **Plagiat / copie du menu d'un concurrent** | Page menu publique = inhérent au produit ; on `noindex` les pages clients pour pas être indexées Google |
| **Conformité RGPD** | Pas de cookie tracking sur le menu client, opt-in analytics, data minimization (pas de tel/email client par défaut) |
| **Lifetime à long terme** : si on baisse le service plus tard, dette de support à vie | Limiter à un volume d'achats lifetime (ex 100 places early-bird), ou clause CGV "le lifetime couvre tant que le service existe" |

---

## 8. Ce qui n'est PAS dans le MVP

À noter pour ne pas s'éparpiller :
- ❌ Paiement en ligne client (Stripe Connect) — explicitement hors scope
- ❌ Réservations de table
- ❌ Programme de fidélité / cartes de fidélité
- ❌ Intégration POS existant (Lightspeed, Zelty, L'Addition…)
- ❌ App mobile native staff
- ❌ Notifications push
- ❌ Click & collect / livraison
- ❌ Avis Google / TripAdvisor
- ❌ Multi-devises (EUR only)
- ❌ Inventaire / stocks

Tout ça = roadmap V2 si traction OK.

---

## 9. Prêt à démarrer

Toutes les décisions bloquantes sont prises (ou un défaut sensé est posé). Sur GO, j'attaque la **Phase 0** : init du repo, Next.js 15, Drizzle/Neon connecté, Better Auth installé, base layout. ~1-2 jours pour avoir les fondations propres avant d'attaquer la phase 1 (auth & multi-tenant).
