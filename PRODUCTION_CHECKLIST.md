# Production checklist

Avant d'ouvrir le service à des restos qui paient, vérifier chaque ligne ci-dessous.
Cocher au fur et à mesure.

## 1. Setup des services externes

- [ ] **Neon Postgres** : projet créé, branch `main` (prod) + branch `dev` (preview/test)
- [ ] **Stripe** (mode live, pas test)
  - [ ] Compte vérifié, IBAN renseigné
  - [ ] 3 produits créés : `Mensuel 49 €/mois`, `Annuel 499 €/an`, `À vie 2000 € one-time`
  - [ ] Webhook configuré sur `https://[domain]/api/stripe/webhook`
  - [ ] `STRIPE_WEBHOOK_SECRET` copié depuis le dashboard
- [ ] **Cloudflare R2** : bucket créé, public access activé, token API créé (read+write)
- [ ] **Pusher** : app créée (cluster `eu`), credentials copiés
- [ ] **Resend** : compte créé, **domaine vérifié** (DKIM/SPF), `EMAIL_FROM` configuré
- [ ] **Vercel** : projet lié au repo, ENV variables remplies (toutes celles de `.env.example`)
- [ ] **Domaine** : acheté, DNS pointant vers Vercel, HTTPS actif

## 2. Variables d'environnement (Vercel)

Toutes ces vars doivent être renseignées en production. Voir `.env.example` pour le format.

- [ ] `DATABASE_URL` (Neon prod, pas dev)
- [ ] `BETTER_AUTH_SECRET` (`openssl rand -base64 32` — différent de l'env dev)
- [ ] `BETTER_AUTH_URL` = `https://[domain]`
- [ ] `APP_URL` = `https://[domain]`
- [ ] `STRIPE_SECRET_KEY` (sk_live_…)
- [ ] `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME`
- [ ] R2 : 5 vars
- [ ] Pusher : 6 vars (dont 2 `NEXT_PUBLIC_*`)
- [ ] Resend : 2 vars

## 3. Migrations DB

- [ ] `pnpm db:generate` → vérifier qu'aucun changement de schéma non commité
- [ ] `pnpm db:migrate` (ou `db:push` au déploiement) sur la prod Neon

## 4. Conformité légale (FR)

- [ ] Pages `/legal/*` **relues par un juriste** et adaptées à la situation réelle
- [ ] Mentions légales : raison sociale, SIREN, capital, adresse, dir. publication
- [ ] CGV : tribunaux compétents, ville
- [ ] Confidentialité : DPO si nécessaire (>250 employés ou traitement à grande échelle)
- [ ] Cookies : vérifier qu'aucun cookie tiers de tracking n'est posé sans consentement
- [ ] Bandeau cookies fonctionnel et accessible
- [ ] DPA signés avec Vercel, Neon, Stripe, Cloudflare, Pusher, Resend (formulaires en ligne)

## 5. Tests manuels avant ouverture

### Flow restaurateur (à faire avec un compte test)

- [ ] Signup → email welcome reçu (inbox + spam)
- [ ] Onboarding → resto créé
- [ ] /pricing → checkout Stripe (en mode live avec carte test puis live)
- [ ] Webhook reçu → email "Abo activé" reçu
- [ ] /dashboard accessible
- [ ] Settings/general → modifier infos resto, langues
- [ ] Settings/branding → uploader logo + cover (vérifier qu'ils s'affichent)
- [ ] Settings/hours → renseigner horaires
- [ ] Menu builder → créer 2 catégories, 5 plats avec photos, options, allergens
- [ ] Tables → créer 10 tables en bulk
- [ ] Télécharger le PDF QR → vérifier qu'il s'imprime correctement
- [ ] Settings → "Gérer mon abonnement" ouvre le portail Stripe

### Flow client (sur mobile réel, pas DevTools)

- [ ] Scanner un QR imprimé
- [ ] Page menu charge en moins de 3s
- [ ] Naviguer dans les catégories
- [ ] Ajouter au panier (avec options)
- [ ] Bouton panier visible bottom
- [ ] Checkout : nom + note → soumettre
- [ ] Page suivi affiche "Reçue"
- [ ] Bouton "Appeler" envoie une notif

### Flow cuisine (sur tablette)

- [ ] Ouvrir /dashboard/kitchen
- [ ] Quand le client passe une commande → apparaît instantanément (Pusher)
- [ ] Transitions Acceptée → En cuisine → Prête → Servie fonctionnent
- [ ] Côté client : statut update en temps réel (5s polling)
- [ ] Appel serveur s'affiche

## 6. Performance

- [ ] Lighthouse `/r/[slug]/t/[token]` (mobile) : score >85 sur perf, accessibility, best-practices, SEO
- [ ] Lighthouse `/` : idem
- [ ] Bundle size : vérifier `pnpm build` que la route client `/r/*` reste légère

## 7. Monitoring & ops

- [ ] **Sentry** ou équivalent installé et configuré
- [ ] Logs Vercel monitorés (au moins 1 fois/jour la 1ère semaine)
- [ ] Backup DB configuré (Neon le fait par défaut, vérifier la rétention)
- [ ] Alerte email Stripe pour `invoice.payment_failed` et `customer.subscription.deleted`

## 8. Activation de ton compte admin

```sql
UPDATE "user" SET "isPlatformAdmin" = true WHERE email = 'leon.becquet999@gmail.com';
```

Vérifier que `/admin` est accessible et les KPIs s'affichent.

## 9. Avant les premiers clients payants

- [ ] Mode test Stripe → désactivé, seulement mode live actif
- [ ] Comptes test du dev nettoyés en DB (ou marqués `is_published=false`)
- [ ] Email de support actif (`contact@[domain]`)
- [ ] Page de statut ou plan de réponse aux incidents
- [ ] Backup du `.env` quelque part de sûr (1Password, vault)

## 10. Reportés post-MVP (à prioriser selon traction)

- [ ] Email résumé quotidien des commandes (cron Vercel + Resend)
- [ ] Drag-and-drop reorder catégories/items dans le menu builder
- [ ] Templates pré-remplis (Bistrot, Pizzeria, Asiatique)
- [ ] UI complète bilingue (boutons, headers — pas seulement le contenu)
- [ ] Impression thermique ESC/POS
- [ ] Bouton "Imprimer ticket" sur kitchen
- [ ] Vues différenciées staff_kitchen vs staff_waiter
- [ ] Click & collect / à emporter
- [ ] Programme de fidélité
- [ ] Réservations
