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

### **Phase 1 — Auth & multi-tenant** ✅ FAIT
- ✅ Schéma Drizzle : Better Auth tables (`user`, `session`, `account`, `verification`) + `restaurants` (avec champs sub Stripe inline) + `memberships` (user → restaurant + role)
- ✅ Better Auth wired : email/password, sessions cookie-cached, plugin `nextCookies`
- ✅ Routes `/signin`, `/signup` (Shadcn forms)
- ✅ Onboarding `/onboarding` : server action transactionnelle qui crée resto + membership owner avec slug auto-généré et déduplication
- ✅ Proxy Next 16 (`src/proxy.ts`) : redirect vers `/signin` si protégé sans session, vers `/dashboard` si déjà connecté
- ✅ Helpers `requireSession()` + `requireRestaurant()` dans `src/lib/server/session.ts`
- ✅ Layout dashboard avec header + bouton déconnexion + page placeholder
- ⏳ Forgot password / magic link → reportés en Phase 2 (besoin Resend pour les emails)
- **Livrable** : signup → onboarding → dashboard fonctionne end-to-end. Build prod passe.
- **Migration DB** générée : `drizzle/0000_curious_crusher_hogan.sql` (à appliquer avec `pnpm db:push` ou `pnpm db:migrate` une fois le `DATABASE_URL` Neon configuré).

### **Phase 2 — Stripe Billing & sub gate** ✅ FAIT
- ✅ Stripe SDK installé, lib `src/lib/stripe.ts` avec lazy init + `TIER_CONFIG` (mode subscription vs payment selon tier)
- ✅ ENV Stripe optionnelles (5 vars) — code throw au runtime si appelé sans config
- ✅ Page `/pricing` avec 3 cards (49 € / 499 € / 2000 €), highlight sur l'annuel, gestion `?checkout=canceled`
- ✅ Server action `startCheckoutAction` : crée Stripe customer si absent, crée checkout session avec metadata `restaurantId` + `tier`, retourne `{ url }` pour redirect côté client
- ✅ Webhook `/api/stripe/webhook` : signature verified, gère `checkout.session.completed` (lifetime stamp ou subscription), `customer.subscription.{created,updated,deleted}` et `invoice.payment_failed`
- ✅ Sub gate dans `dashboard/layout.tsx` : redirect `/pricing` si pas `active|trialing|past_due`. Banner d'alerte si `past_due`.
- ✅ Page `/dashboard/settings` : statut abo + bouton "Gérer mon abonnement" → Stripe Customer Portal
- ✅ Lifetime géré : `subStatus='active'` + `lifetimePurchasedAt` stamp, pas de portal (rien à gérer)
- ⏳ Script de seed des 3 prix Stripe → reporté (le user crée à la main dans Stripe Dashboard, plus simple pour MVP)
- **Livrable** : signup → onboarding → /pricing → Stripe Checkout → webhook → /dashboard accessible. Gestion abo via Stripe Portal pour mensuel/annuel.
- **Pour tester en local** : `stripe listen --forward-to localhost:3000/api/stripe/webhook` et coller le whsec_ dans `.env.local`. Créer 3 produits Stripe (test mode) avec recurring 49€/mois, 499€/an, one-time 2000€ et coller les `price_id`.

### **Phase 3 — Restaurant & branding** ✅ FAIT
- ✅ Schema : table `restaurant_hours` (1 créneau par jour, 7 jours, isClosed flag)
- ✅ Lib `src/lib/storage.ts` : client R2 lazy-init, `uploadToR2()` helper, validations type/taille
- ✅ ENV R2 : 5 vars optionnelles (lazy-throw au runtime)
- ✅ Layout `/dashboard/settings/*` avec nav latérale (Abonnement / Informations / Branding / Horaires) + active state via `usePathname`
- ✅ `/dashboard/settings/general` : nom, description, adresse, code postal, ville, tél, email, toggle bilingue FR+EN
- ✅ `/dashboard/settings/branding` : upload logo (carré) + cover (16/6) avec preview + bouton "Retirer", picker couleur primaire (hex)
- ✅ `/dashboard/settings/hours` : 7 lignes lundi→dimanche, checkbox fermé, time pickers open/close, validation `close > open`, upsert transactionnel
- ✅ Migration `0001_sour_masked_marvel.sql` générée
- **Livrable** : owner peut configurer entièrement son resto. Settings UX propre avec sidebar.
- **Note** : pour MVP, 1 créneau par jour. Services midi/soir distincts = V2.

### **Phase 4 — Menu builder** 🏗️ EN COURS (4A fait)

**4A — Schema + CRUD basique** ✅ FAIT
- ✅ Schema : `menus`, `menu_categories`, `menu_items`, `menu_item_options`, `menu_item_option_choices` + enum `option_type` + const `ALLERGENS` (14 UE)
- ✅ Migration 0002 générée
- ✅ `/dashboard/menu` : liste cards + create form
- ✅ `/dashboard/menu/[menuId]` : éditeur menu (rename, publish toggle, delete) + sections par catégorie avec items
- ✅ Catégories CRUD inline (add form, rename inline, delete avec confirm)
- ✅ Items CRUD avec form complet : nom FR+EN, description FR+EN, prix € (input number step 0.10), 14 allergènes UE, dispo toggle, rupture quick-toggle
- ✅ Bilingue conditionnel : si `restaurant.languages` contient "en", form expose les champs EN
- ✅ Helpers d'ownership (ensureMenu/Category/ItemOwnership) pour empêcher le cross-tenant access
- ✅ Header dashboard : ajout du lien "Menus"

**4B — Photos + options** ✅ FAIT
- ✅ Upload + remove photo par item (R2, namespace `restaurants/{id}/items/{itemId}-{ts}.{ext}`)
- ✅ CRUD options + choices : add option (single/multiple, required toggle), add choice (nom FR+EN, prix delta, default), delete option (cascade choices), delete choice
- ✅ Section Options imbriquée sur `/dashboard/menu/[menuId]/items/[itemId]` avec forms client compacts
- ⏳ Drag-and-drop reorder (`@dnd-kit`) → reporté (input `sort_order` numérique en attendant si vraiment besoin)
- ⏳ Templates pré-remplis (Bistrot, Pizzeria...) → reporté hors MVP

### **Phase 5 — Tables & QR** ✅ FAIT
- ✅ Schema : table `tables` (label, groupName optionnel, token unique 16 chars hex, isActive flag) — migration 0003
- ✅ Lib `src/lib/qr.ts` : `generateTableToken` (crypto.randomBytes), `buildTableUrl`, `generateQRDataURL` (PNG 512×512, error correction M)
- ✅ Lib `src/lib/pdf.tsx` : `buildQrPdf` avec `@react-pdf/renderer` — A4, 4 cards par page (2×2), label en gros + groupe + QR + "Scannez pour commander"
- ✅ Page `/dashboard/tables` : CRUD complet, ajout single ou en lot (T1...T20 avec préfixe + start + count + group), groupage par `groupName`
- ✅ Actions : create, bulk create, update (rename + group), delete, **regenerate token** (invalide l'ancien QR), toggle active
- ✅ Endpoint `/api/qr-pdf` (Node runtime) : tous les QR du resto, ou un seul via `?tableId=X`. Returns PDF download.
- ✅ Lien direct par table : "PDF" pour télécharger un QR seul, lien URL scannée pour preview
- ✅ Lien "Tables" dans header dashboard
- **Livrable** : `pnpm dev` → /dashboard/tables → ajouter 10 tables → "Télécharger tous les QR" → PDF prêt à imprimer/plastifier.

### **Phase 6 — App client (PWA)** ✅ FAIT (6A + 6B + 6C)

**6A — Schema + menu + cart** ✅
- ✅ Schema : `orders`, `order_items` (avec snapshots prix/options en jsonb), `service_requests` + migration 0004
- ✅ Helper `resolvePublicTable` : valide slug+token, table active, sub active
- ✅ `loadPublicMenu` : 1er menu publié, catégories visibles, items+options+choices
- ✅ Layout publique avec header (logo+nom+label table), thème CSS variable depuis resto
- ✅ Page menu : nav sticky catégories, cards items avec photo+allergens+prix
- ✅ Page item détail : photo, description, allergènes, options (radio/checkbox), quantity, ajout panier
- ✅ Cart store via `useSyncExternalStore` (SSR-safe), localStorage par token

**6B — Checkout + suivi + appel serveur** ✅
- ✅ `createOrderAction` : re-fetch prix/options server-side (anti-tampering), validation `isAvailable`, scoping resto via joins, snapshots dans `order_items`
- ✅ CheckoutForm : nom + note optionnels, clear cart à succès, redirect `/order/[id]`
- ✅ Page `/order/[orderId]` : statut + récap + total avec étapes visuelles (pending → accepted → in_kitchen → ready → served)
- ✅ `PollStatus` client : `router.refresh()` toutes les 5s tant que pas final (en attendant Pusher Phase 7)
- ✅ `callWaiterAction` + bouton "Appeler" dans le header (cooldown 30s visuel)

**6C — i18n contenu + PWA** ✅
- ✅ Cookie `qr_locale` via `getPublicLocale()` server-side
- ✅ `LocaleSwitcher` FR/EN dans le header (uniquement si resto bilingue)
- ✅ Helpers `pickLocalizedText` + `pickLocalizedDescription`
- ✅ Pages menu + item + add-to-cart utilisent la locale (noms catégories/items/options + allergens labels)
- ✅ Manifest PWA via `app/manifest.ts` (installable à l'écran d'accueil)
- ⏳ UI complète FR/EN (boutons "Voir mon panier", etc.) → reportée, on a juste les principaux strings traduits inline
- ⏳ Service worker offline → reporté V2 (PWA installable suffit pour MVP)

**Livrable** : scan QR → menu → ajout panier → checkout → suivi temps réel (5s polling) → appel serveur. End-to-end fonctionnel.

### **Phase 7 — Dashboard cuisine temps réel** ✅ FAIT
- ✅ Lib `pusher.ts` (server, lazy-init) avec `triggerRestaurantEvent` + `triggerTableEvent`, no-op silencieux si pas configuré
- ✅ Lib `pusher-client.ts` avec singleton `getPusherClient()`
- ✅ ENV Pusher 6 vars optionnelles ; le polling client (5s + 8s kitchen fallback) compense si absent
- ✅ Page `/dashboard/kitchen` avec section "Appels serveur" en haut + 4 colonnes (Reçues / Acceptées / En cuisine / Prêtes)
- ✅ `OrderCard` client : items + note client + transitions (Accepter → Démarrer → Marquer prête → Servie) + Annuler avec confirm
- ✅ `ServiceRequestCard` : badge ambre, bouton "Vu ✓"
- ✅ `KitchenSubscriber` client : Pusher subscribe avec fallback polling 8s
- ✅ Server actions : `updateOrderStatusAction` (avec validation transitions valides), `resolveServiceRequestAction`
- ✅ Triggers Pusher sur `createOrderAction`, `callWaiterAction`, `updateOrderStatusAction`, `resolveServiceRequestAction`
- ✅ Lien "Cuisine" dans header dashboard
- ⏳ Son sur nouvelle commande → reporté (V2 si demande staff)
- ⏳ Filtres par table / catégorie + impression ticket → reportés (suffit pour MVP)
- ⏳ Vues différentes par rôle (staff_kitchen vs staff_waiter) → reporté, pour MVP tous voient tout
- **Livrable** : staff ouvre `/dashboard/kitchen`, voit les commandes en temps réel, change leur statut, traite les appels serveur. Avec Pusher : instant. Sans : 8s.

### **Phase 8 — Analytics resto** ✅ FAIT
- ✅ Lib `src/lib/server/analytics.ts` : `getRestaurantKpis` (today/week/month), `getTopItems` (group by name_snapshot), `getDailySeries` (30 jours, padded zero days)
- ✅ Page `/dashboard/analytics` avec 3 cards KPIs (CA + nb commandes + ticket moyen)
- ✅ `DailyChart` mini-bar chart 100% CSS (pas de dep recharts), tooltip natif via `title`
- ✅ Top 10 plats sur 30 jours (quantité + revenue)
- ✅ Endpoint `/api/analytics/export?days=30` : CSV avec BOM UTF-8 (Excel FR), séparateur `;`, format date FR
- ✅ Lien "Stats" dans header dashboard
- **Livrable** : owner voit ses KPIs jour/semaine/mois, top plats, courbe CA, et exporte tout en CSV.
- **Note** : seules les commandes `served` sont comptées dans CA et ticket moyen — les annulations/brouillons sont ignorés.

### **Phase 9 — Admin plateforme** ✅ FAIT
- ✅ Helpers `isPlatformAdmin(userId)` + `requirePlatformAdmin()` (redirect `/dashboard` si pas admin)
- ✅ Layout `/admin/*` distinct du dashboard avec badge "Internal" + retour vers son resto
- ✅ Page `/admin` : 4 KPIs (MRR, ARR projeté, Lifetime revenue, total restos) calculés depuis `restaurants` (`monthlyActive × 49 + annualActive × 499/12`, etc. via `TIER_CONFIG`)
- ✅ Banner d'alerte si retards de paiement ou annulations
- ✅ Tableau complet des restos : nom + slug, owner (jointure memberships role=owner + user), tier, statut sub avec badge couleur, date inscription
- ✅ Lien "Admin" conditionnel dans header dashboard (apparaît uniquement si `user.isPlatformAdmin`)
- **Activation** : `UPDATE "user" SET "isPlatformAdmin" = true WHERE email = 'votre@email.fr';` — pas d'UI pour MVP, c'est interne
- **Livrable** : on pilote notre MRR + voit qui paie quoi en un coup d'œil.

### **Phase 10 — Marketing & conformité FR** ✅ FAIT (10A + 10B)

**10A — Landing + légales + SEO** ✅
- ✅ Route group `(marketing)` avec layout (header sticky + footer 4 colonnes)
- ✅ Landing `/` : hero, comment ça marche (3 étapes), 6 features, pricing 3 cards, FAQ details/summary, CTA final
- ✅ Pages légales `/legal/*` : `mentions-legales`, `cgu`, `cgv`, `confidentialite` (RGPD complet avec sous-traitants), `cookies` — placeholders à valider juridiquement avant prod
- ✅ `CookieBanner` (useSyncExternalStore + localStorage `qr_cookie_consent`)
- ✅ Metadata root layout : title template, OG, Twitter, robots index
- ✅ `app/sitemap.ts` + `app/robots.ts` (disallow /r/, /api/, /dashboard/, /admin/, /onboarding)
- ✅ Pages légales static-rendered (SEO friendly)

**10B — Email transactionnel via Resend** ✅
- ✅ Lib `src/lib/email.ts` lazy-init, no-op silencieux + log si pas configuré
- ✅ Templates HTML inline : `welcomeEmail`, `subscriptionConfirmedEmail`
- ✅ Hook `databaseHooks.user.create.after` dans Better Auth → email welcome au signup
- ✅ Stripe webhook `checkout.session.completed` → email "abo activé" à l'owner du resto

**⏳ Reportés post-MVP** : email résumé quotidien (cron Vercel), Sentry monitoring (à brancher au déploiement), screenshots produits dans la landing
- **Livrable** : marketing en place, conformité RGPD couverte (pages à valider), emails transactionnels fonctionnels.

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
