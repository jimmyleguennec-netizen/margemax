# Passation — MargeMax

## Correctifs P0-P2 (2026-09-18, session "audit et sécurisation")

Session déclenchée par 5 constats confirmés par l'utilisateur en conditions
réelles : (1) recherche "chargeur à induction pour iPhone" → aucune annonce,
(2) analyse d'un lien produit direct → "The operation was aborted due to
timeout", (3) prix d'achat "abc"/-10 → converti en 0 € (marge gonflée),
(4) prix de vente nul → marge % affichée à 0 % au lieu de "non calculable",
(5) `/login` restait affiché pour un utilisateur déjà connecté.

**P0 — cause racine identifiée et corrigée pour (2), correctifs de
robustesse pour (1) (non re-testables ici, pas d'accès réseau) :**
- **Cause confirmée du bug (2)** : `lib/aliexpress-search.ts` laissait
  fuir tel quel le message brut anglais d'une `DOMException` "TimeoutError"
  (`AbortSignal.timeout()`) jusqu'au client, ET aucune route API n'avait de
  `maxDuration` — sur Vercel, une recherche par mot-clé peut enchaîner 2
  appels ScraperAPI (`render=true`, notoirement lent sur AliExpress),
  largement au-delà du timeout de fonction par défaut (10-15 s). Corrigé :
  `maxDuration = 60` sur `app/api/search` et `app/api/analyze`, timeout
  ScraperAPI réduit à 20 s/appel, et toute exception réseau/timeout est
  désormais traduite en `AliExpressSearchError` avec un message français
  clair (jamais le message brut du fetch).
- Pour (1) : ciblage `fr.aliexpress.com` + `country_code=fr` (au lieu de
  `www.aliexpress.com` sans géolocalisation) pour aligner recherche et prix
  sur la vitrine France réellement visée par l'app, regex d'extraction du
  lien produit élargie (variante JSON échappée), et marqueurs de blocage
  anti-bot étendus (pages Cloudflare "Attention Required"/"Checking your
  browser"). **Non re-testé en conditions réelles** (pas de clé ScraperAPI
  ni d'accès réseau ici) — cause exacte de (1) non confirmée à 100 %,
  seulement des améliorations défendables.
- Parcours d'échec : message français, saisie conservée, bouton réactivé,
  **bouton "Réessayer" ajouté**, aucun crédit débité sur échec (déjà
  garanti côté serveur, comportement préservé). Résultat réussi enrichi :
  variante (si connue), destination (France), date d'analyse serveur,
  chaque frais étiqueté "confirmé"/"manquant", badge "Vérifié" désormais
  conditionné à l'absence de champ manquant (avant : toujours affiché,
  contradiction possible avec un frais marqué manquant juste en dessous).

**P1 — Calculateur (`lib/margin-estimate.ts`, entièrement réécrit) :**
- `parseDecimalInput()` : virgule/point acceptés, mais un texte non
  numérique ou un nombre négatif retourne désormais `null` (jamais 0
  silencieux) — le calculateur suspend tout le bloc de résultats et affiche
  une erreur tant qu'un champ est invalide, au lieu de gonfler la marge.
- Dénominateur nul → `null` ("Non calculable") pour marge %, ROI %, et
  ROI haut/bas — plus jamais un faux "0 %".
- **Score de fiabilité retiré** (`97 - importRatio*35` borné 60-99 était
  une precision injustifiable) et remplacé par un palier qualitatif
  Élevée/Moyenne/Faible (`ReliabilityBadge`), basé sur la part des frais
  d'import dans le coût total — méthode documentée dans l'UI.
- Méthode du prix conseillé documentée en clair dans l'UI (coût × 1,8/2,3/1,5,
  arrondi au 0,90 psychologique).
- Budget pub : exclusions précisées explicitement (frais de transaction,
  commissions pub, impôts sur le profit — non déduits).
- `CountUp` (compteur animé) ne fait plus défiler de fausses valeurs
  intermédiaires 0→final (risque de capture d'écran trompeuse sur un
  montant financier) : affiche directement la vraie valeur avec un simple
  fondu.

**P1 — Compte et paiement :**
- `/login` et `/signup` redirigent désormais serveur-side vers `/dashboard`
  (pack en attente conservé via `?pack=`) si l'utilisateur est déjà
  connecté — corrige le bug confirmé (5).
- Navbar : "Mon espace" remplace Connexion/Essayer quand connecté (topbar,
  desktop, mobile).
- `CheckoutConsentDialog` récapitule désormais pack, crédits et montant dû
  avant confirmation.
- CGV et texte de consentement clarifiés : le paiement crédite
  immédiatement le compte mais n'est que le DÉBUT de l'exécution du
  service (art. L.221-25/L.221-28) — le service s'exécute réellement au
  fil de l'utilisation des crédits, pas en un bloc au paiement. **Nuance
  non validée par un juriste**, signalé comme tel dans la page CGV.
- **Faille de sécurité trouvée et corrigée dans le webhook Stripe**
  (`app/api/webhooks/stripe/route.ts`) : `client_reference_id` (qui décide
  du pack crédité) transite par l'URL du Payment Link et est donc
  modifiable côté client — un attaquant pouvait ouvrir le Payment Link du
  pack le moins cher, éditer `client_reference_id=ultimate:...` dans
  l'URL avant de payer, et recevoir 200 crédits pour le prix de 5. Le
  webhook vérifie désormais que `session.amount_total` correspond au prix
  réel du pack déclaré (tolérance 2 centimes pour l'arrondi Stripe) avant
  de créditer quoi que ce soit. Idempotence (event.id + stripe_session_id,
  contraintes uniques Postgres) et vérification de signature étaient déjà
  solides, confirmées par relecture du schéma.

**P2 — Textes :**
- "Total réel checkout" → "Coût total estimé" (demo.tsx, un composant
  était estimé) ; "Scan des annonces en direct" → "Exemple de recherche"
  (quick-guide.tsx) ; "Volume d'analyses par mois" → "Nombre d'analyses
  prévues" (credit-calculator.tsx, aria-label).
- Contraste : quelques textes `text-white/30` → `/40` sur les disclaimers
  du dashboard (recherche + calculateur). **Pas un balayage exhaustif** du
  site — signalé comme non vérifié visuellement (pas de navigateur/rendu
  possible ici).
- Aide de premier lancement ajoutée (`first-launch-hint.tsx`, bandeau
  dismissible localStorage) expliquant les 3 onglets du dashboard.
- Tutoiement/vouvoiement : recherche de marqueurs de tutoiement dans
  `components/` → aucun trouvé, déjà 100 % vouvoiement, rien à changer.

**Tests ajoutés** (`web/lib/margin-estimate.test.ts`, Vitest — **nouvelle
dépendance devDependencies, jamais installée/exécutée ici, faute de
npm**) : saisies invalides (texte, négatif, vide), division par zéro
(coût total nul → tout `null`), arrondi psychologique, paliers de
fiabilité. Portée volontairement limitée au module pur testable sans
mock réseau/DB — pas de test automatisé pour le webhook (idempotence
Postgres, non simulable utilement sans instance réelle) ni pour le
scraping (nécessiterait de mocker `fetch`, risque trop élevé de test
incorrect que je ne peux pas exécuter pour vérifier).

**⚠️ Aucune de ces corrections n'a pu être compilée, lintée, buildée ou
testée dans cet environnement** (toujours pas de Node/npm/accès réseau,
voir contrainte ci-dessous) — relecture statique minutieuse uniquement.
**Exécuter `npm install && npm run lint && npm run build && npm test`
avant tout déploiement de confiance.**

## Objectif du projet & état actuel

MargeMax est une SaaS de sourcing/calcul de marge pour l'e-commerce AliExpress : un utilisateur colle un mot-clé ou un lien produit AliExpress, l'app récupère le coût réel (prix, livraison, taxes d'importation) via ScraperAPI, et calcule marge/ROI/prix de vente conseillé. Le modèle économique est un système de crédits prépayés à l'acte (1 crédit = 1 analyse), sans abonnement, avec 3 crédits offerts à l'inscription.

- Stack : Next.js 14 (App Router) / React / TypeScript / Tailwind / Framer Motion, dans `web/`.
- Auth : Supabase (`@supabase/ssr`, cookies), avec OTP par e-mail à l'inscription, OAuth Google (Apple non affiché tant qu'il n'est pas configuré), reset de mot de passe fonctionnel (`/forgot-password` → `/auth/callback` → `/reset-password`).
- Paiement : Stripe **Payment Links** statiques (pas encore de Stripe Checkout Sessions dynamiques) + webhook (`app/api/webhooks/stripe/route.ts`) qui crédite atomiquement via une RPC Postgres (`consume_credit` / `add_credits`), avec déduplication sur `stripe_webhook_events.event_id` et `credit_purchases.stripe_session_id`.
- Dépôt : `jimmyleguennec-netizen/margemax`, branche `main`, déployé sur Vercel : https://margemax-esse-beta.vercel.app/
- **Contrainte d'environnement** : cet environnement de travail n'a ni Node/npm/npx, ni accès réseau sortant. Impossible d'exécuter `npm run build`, lint, tests, ou de vérifier quoi que ce soit en conditions réelles (Stripe test mode, Supabase live, rendu mobile réel). Toutes les corrections sont faites par lecture/relecture du code source, jamais testées en exécution dans cette session.
- État global : le parcours email → dashboard → 3 crédits fonctionne et a été confirmé par l'utilisateur. Le pack "Avancé" (`/login?pack=avance`) fonctionne. Une recherche "iphone" provoquait "Aucune annonce trouvée" sans debit visible (bug confirmé, corrigé au niveau code cette session — voir section Bugs).

## Dernières modifications apportées

Dernier commit poussé : voir git log — session du 2026-09-18 : nettoyage
d'un dossier parasite (page AliExpress enregistrée par erreur dans le repo),
renommage `assets/margemax_logo.png` → `assets/logo.png`, et ajout de la
case à cocher "exécution immédiate + renonciation au droit de rétractation"
(art. L.221-28) dans le parcours d'achat (voir section suivante).

Résumé des lots livrés dans la session précédente (du plus ancien au plus récent) :

1. **`b5b9418`** — distinction des vrais modes d'échec de recherche AliExpress (blocage anti-bot vs vraie absence de résultat), correction du bug d'arrondi ROI 120,5 % → 120,6 %, première passe de tutoiement.
2. **`728a20f`** — suppression du faux formulaire de carte bancaire décoratif dans Paramètres, remplacé par le solde réel + historique d'achats réel (table `credit_purchases`).
3. **`2c26456`** — recommandation réelle de combinaison de packs au-delà de 200 crédits (algorithme glouton dans `lib/packs.ts`), vérifiée sur l'exemple 220 crédits = Ultimate + Essentiel + Starter = 70,97 €.
4. **`097c347`** (dernier) — gros lot correctif suite à un nouveau brief détaillé (11 sections) :
   - Suppression des icônes sociales factices (aucune URL réelle) et correction du lien "Guide" → "Tutoriel MargeMax".
   - **Suppression de fonctionnalités marketing fantômes** : "Générateur de fiche IA" et "Carnet & comparateur (favoris/export)" étaient vendus en marketing (hero, pricing, features, FAQ) sans aucune implémentation réelle côté produit — retirés, remplacés par une description honnête de l'historique de session (qui, lui, existe réellement mais est non persistant).
   - Accessibilité : bandeau répété rendu accessible (`role=marquee` + `aria-hidden`), formulaire auth masqué par l'overlay rendu `inert`, fausses barres de fenêtre macOS des démos en `aria-hidden`.
   - Libellés trompeurs corrigés : "marge nette (vérifiée)" → "marge avant publicité et autres frais", boutons "Appliquer Marge Basse/Haute" → "Appliquer prix de vente bas/haut" (ce sont des prix, pas des marges).
   - **Repasse complète en vouvoiement** partout (annule une passe de tutoiement faite par erreur plus tôt dans la session — attention, ce point a fait l'aller-retour plusieurs fois selon les briefs reçus, voir section Bugs).
   - Formulaire de contact : vraie validation (regex e-mail, erreurs locales), anti double-soumission.
   - Pages légales (`mentions-legales`, `cgv`) : les notes internes "À compléter (ne pas inventer)" étaient visibles publiquement — retirées et reformulées en "en cours de finalisation", **sans bloquer les achats** (décision explicite de l'utilisateur, qui a refusé l'option de bloquer les ventes).

## Audit de sécurité authentification (2026-09-18)

Audit demandé par l'utilisateur sur 5 points, résultat point par point :

1. **Rate limiting anti-bruteforce — ajouté cette session, migration exécutée et rate limiting actif depuis le 2026-09-18.** `login`, `signup` et `requestPasswordReset` (`web/lib/actions/auth.ts`) sont limités via `web/lib/rate-limit.ts`, avec une double clé IP + e-mail (l'IP arrête un bruteforce distribué sur beaucoup de comptes, l'e-mail arrête un bruteforce ciblé sur un seul compte via VPN/IP tournante). Stocké en Postgres (`migration_auth_rate_limit.sql`, exécutée) plutôt qu'en mémoire, pour rester fiable en serverless (Vercel) où rien n'est partagé entre invocations. Fail-open déliberé conservé même après migration : si la vérification échoue ponctuellement (Supabase indisponible), la tentative passe plutôt que de bloquer tout le monde à cause d'une panne annexe.
2. **Messages d'erreur génériques sur /login — déjà conforme, aucun changement de code nécessaire.** `login()` renvoyait déjà "Email ou mot de passe incorrect." pour toute erreur Supabase, email inexistant ou mot de passe faux confondus (Supabase lui-même ne distingue pas les deux cas). Un commentaire a été ajouté pour expliciter que c'est intentionnel. **Nuance repérée mais non traitée** : le retour OAuth Google (`callbackError === "account_not_found"` dans `neon-auth-panel.tsx`) affiche lui un message qui révèle qu'aucun compte MargeMax n'est associé à l'e-mail Google — comportement produit assumé existant (l'app exige un compte MargeMax préalable pour lier Google), pas un bruteforce de mot de passe puisqu'il faut déjà posséder le compte Google en question. Signalé ici au cas où ce compromis devrait être revu plus tard.
3. **Vérification serveur des routes protégées — renforcée en défense en profondeur.** `/dashboard` était déjà protégé côté serveur (Server Component dans `app/dashboard/page.tsx`, pas un simple contrôle client). Ajout d'un second contrôle dans `web/lib/supabase/middleware.ts` (`PROTECTED_PREFIXES`) qui redirige vers `/login` avant même le rendu si aucune session n'est trouvée — pour que toute future route ajoutée sous `/dashboard` soit protégée automatiquement même si son propre garde-fou est oublié.
4. **Mots de passe en clair — confirmé conforme, aucun changement.** Aucune colonne mot de passe dans `profiles` ni ailleurs (vérifié dans `schema_margemax.sql`) ; 100 % géré par `auth.users` de Supabase via `signInWithPassword`/`signUp`/`updateUser`. Aucun `console.log`/`console.error` ne journalise de mot de passe en clair (vérifié par recherche globale).
5. **Expiration de session (JWT) — partiellement code, partiellement hors de portée de cet environnement.** Déjà en place : la case "Se souvenir de moi" décochée transforme les cookies Supabase en cookies de session navigateur (sans `maxAge`/`expires`, voir `web/lib/supabase/server.ts`), donc perdus à la fermeture du navigateur. **La durée d'expiration du token JWT lui-même (access token) et la rotation des refresh tokens sont des réglages du projet Supabase (Authentication → Settings), pas du code** — impossibles à vérifier ou modifier depuis cet environnement sans accès réseau. **À vérifier manuellement par l'utilisateur** : "Access token (JWT) expiry" (recommandé : 3600 s, ne pas désactiver) et activer "Refresh token rotation" si pas déjà actif.

## Fichiers clés travaillés

- `migration_auth_rate_limit.sql` — **exécutée le 2026-09-18** : crée `public.auth_rate_limits` + les fonctions `register_auth_attempt()`/`reset_auth_attempts()` (rate limiting atomique login/signup/reset mdp).
- `web/lib/rate-limit.ts` — nouveau : seuils (`RATE_LIMITS`), `checkRateLimit()`/`resetRateLimit()` (via `createAdminClient()`, fail-open sur erreur), `getClientIp()`.
- `web/lib/supabase/middleware.ts` — ajout de la redirection `/login` pour les routes protégées (`PROTECTED_PREFIXES`), en plus du rafraîchissement de session déjà existant.
- `migration_checkout_consent.sql` — **exécutée le 2026-09-18** : crée `public.checkout_consents` (preuve de consentement "exécution immédiate + renonciation rétractation").
- `web/lib/legal-consent.ts` — nouveau : source unique de vérité du texte de consentement (`IMMEDIATE_EXECUTION_WAIVER_LABEL`) et de sa version (`CGV_CONSENT_VERSION`), partagée entre le dialogue et la route API.
- `web/app/api/consent/checkout/route.ts` — nouveau : enregistre le consentement côté serveur (auth Supabase + insert `checkout_consents`) AVANT toute redirection Stripe ; `cgv_version` vient uniquement de la constante serveur, jamais du client.
- `web/components/purchase/checkout-consent-dialog.tsx` — nouveau : modale avec la case à cocher, appelée juste avant chaque redirection vers un Payment Link Stripe réel (jamais avant `/login?pack=...`, qui n'est pas encore un achat). POST `/api/consent/checkout` puis redirection ; si le POST échoue, la redirection est bloquée.
- `web/components/ui/animated-buy-button.tsx` — ajout d'un prop `onIntercept` : quand fourni, le clic délègue entièrement au parent (ouverture de la modale de consentement) au lieu d'animer/rediriger lui-même.
- `web/lib/packs.ts` — source unique de vérité des 5 packs (Starter/Essentiel/Avancé/Pro/Ultimate) + `recommendPackCombinationForVolume()`.
- `web/lib/stripe-links.ts` — construit l'URL de checkout ; sans utilisateur connu, force systématiquement `/login?pack=<clé>` avant tout lien Stripe (conservation du pack à travers connexion/inscription).
- `web/lib/margin-estimate.ts` — formules de marge/ROI/palier de fiabilité qualitatif partagées entre le calculateur manuel et les résultats de recherche réels, + `parseDecimalInput()` (validation stricte des saisies). Voir section "Correctifs P0-P2" ci-dessus pour le détail.
- `web/lib/aliexpress-search.ts` — scraping/extraction partagé entre `/api/search` (public) et `/api/analyze` (crédité), avec détection de blocage anti-bot (`looksLikeBotBlock`).
- `web/lib/actions/auth.ts` — Server Actions login/signup/reset password, anti-énumération de comptes.
- `web/app/api/analyze/route.ts` — parcours crédité réel : vérifie session → lit solde → lance l'analyse → débite 1 crédit atomiquement via RPC `consume_credit` (jamais si l'analyse échoue).
- `web/app/api/webhooks/stripe/route.ts` — webhook Stripe idempotent, crédite via RPC.
- `web/components/auth/neon-auth-panel.tsx` — panneau login/signup avec bascule overlay ; contient la logique de reprise du pack après connexion, qui ouvre désormais la modale de consentement au lieu de rediriger directement vers Stripe.
- `web/components/dashboard/search-panel.tsx` / `calculator-panel.tsx` — UI dashboard réelle (recherche créditée / calculateur manuel).
- `web/components/landing/*` — toute la page d'accueil marketing (hero, features, pricing, credit-calculator, demo, interactive-demo, quick-guide, faq, contact, footer, navbar).
- `web/app/mentions-legales/page.tsx`, `web/app/cgv/page.tsx` — pages légales, encore incomplètes sur des points factuels (voir Bugs).

## Problématiques/Bugs en cours à résoudre

- **Paiement encore sur Stripe Payment Links, pas Stripe Checkout Sessions.** Décision explicite de l'utilisateur (2026-09-18) : conserver les Payment Links pour l'instant, ne pas migrer vers Checkout Sessions dynamiques tout de suite.
- **Case à cocher "exécution immédiate + renonciation rétractation" — codée et déployée, migration exécutée.** La modale (`checkout-consent-dialog.tsx`) et la route API (`/api/consent/checkout`) sont en place, la table `public.checkout_consents` existe en base. **Reste à vérifier en conditions réelles** (achat complet de bout en bout sur les 3 parcours). Choix produit fait par l'utilisateur : une seule case combinant les deux mentions (plutôt que deux cases séparées) — à valider avec un juriste si besoin, le texte exact est dans `web/lib/legal-consent.ts`.
- **Mentions légales incomplètes.** SIREN, ville RCS, capital social, TVA intracommunautaire, téléphone, nom du Président, et l'identité du médiateur de la consommation sont absents — remplacés par des mentions "en cours de finalisation" (visibles publiquement mais honnêtes) au lieu d'inventer des valeurs. **Ces informations réelles doivent être fournies par l'utilisateur pour compléter la page.**
- **Contradictions répétées entre briefs successifs sur tutoiement vs vouvoiement.** Le site est actuellement en vouvoiement partout (vérifié à nouveau le 2026-09-18, aucun marqueur de tutoiement trouvé) — vérifier avec l'utilisateur avant de relancer une passe de style si un nouveau brief le redemande.
- **Framework de test ajouté (Vitest) mais jamais installé/exécuté ici.** `web/lib/margin-estimate.test.ts` couvre le calculateur (saisies invalides, division par zéro, arrondis, paliers de fiabilité). Exécuter `npm install && npm test` pour confirmer que ça passe réellement — jamais vérifié faute de Node dans cet environnement.
- **Recherche "chargeur à induction pour iPhone" / "iphone" → "Aucune annonce trouvée"** : cause probable identifiée (recherche sur `www.aliexpress.com` sans géolocalisation FR) et corrigée (`fr.aliexpress.com` + `country_code=fr`, regex d'extraction élargie, marqueurs anti-bot étendus), mais **non re-testée en conditions réelles** (pas de clé ScraperAPI ni d'accès réseau ici) — cause exacte non confirmée à 100 %.
- **Timeout "The operation was aborted due to timeout" sur analyse de lien direct** : cause racine confirmée (message d'exception brut non traduit + absence de `maxDuration` sur les routes API, en-dessous du temps réel nécessaire à ScraperAPI en mode `render=true`) et corrigée (`maxDuration=60`, timeout interne réduit à 20 s, traduction systématique en message français). **Non re-testé en conditions réelles.**
- **`OTP_LENGTH = 8`** dans `otp-verify-form.tsx` doit correspondre exactement à la longueur de code configurée côté Supabase (Authentication → Settings). Non vérifiable depuis cet environnement — si la config Supabase envoie des codes à 6 chiffres, l'écran de vérification refusera un code pourtant valide.
- **Historique des recherches non persistant** : l'onglet "Historique" du dashboard est purement en mémoire côté client (reset au rechargement de page), ce n'est pas une vraie sauvegarde en base. C'est maintenant documenté honnêtement dans l'UI, mais reste une limite produit réelle.

## Prochaines étapes prioritaires

1. **Exécuter `npm install && npm run lint && npm run build && npm test`** — bloquant, jamais fait dans cet environnement (pas de Node). Le build n'a jamais été vérifié pour TOUTE cette session de correctifs P0-P2 (voir cette section plus haut) : c'est la priorité absolue avant tout déploiement de confiance.
2. **Vérifier en conditions réelles avec une vraie clé ScraperAPI** : recherche "chargeur à induction pour iPhone", analyse du lien `fr.aliexpress.com/item/1005006478208156.html` — les deux corrections (géolocalisation FR + traduction des timeouts + `maxDuration=60`) sont des corrections de cause probable, **jamais re-testées** faute d'accès réseau ici.
3. **Vérifier en conditions réelles (Stripe test mode)** le nouveau contrôle anti-fraude du webhook (`app/api/webhooks/stripe/route.ts`) : payer un pack via son Payment Link normal doit toujours créditer correctement ; un `client_reference_id` trafiqué doit être rejeté sans créditer (vérifiable en modifiant l'URL manuellement en environnement de test).
4. **Vérifier dans Supabase Dashboard → Authentication → Settings** : durée d'expiration du JWT (access token) et rotation des refresh tokens — non vérifiable depuis cet environnement (voir section Audit de sécurité, point 5).
5. **Demander à l'utilisateur les informations légales réelles** (SIREN, RCS, capital social, TVA, téléphone, Président, médiateur de la consommation) pour compléter `mentions-legales` et `cgv` — actuellement bloqué par l'absence de ces données, jamais inventées. L'utilisateur a dit les fournir plus tard.
6. **Faire relire par un juriste** la nuance L.221-25/L.221-28 ajoutée cette session (paiement = début d'exécution, pas exécution complète) dans `cgv/page.tsx` et `checkout-consent-dialog.tsx` — rédigée de bonne foi mais non validée par un professionnel du droit.
7. **Vérifier en conditions réelles** (déploiement Vercel + Supabase + Stripe live) : la case à cocher de consentement + récapitulatif sur les 3 parcours d'achat (pricing landing, calculateur de crédits, reprise après connexion), le rate limiting login/signup/reset mdp, `/login` et `/signup` qui redirigent bien un utilisateur déjà connecté (avec pack conservé), "Mon espace" dans la navbar connectée, les 5 packs, le parcours OTP (longueur de code), le reset de mot de passe, le webhook Stripe en mode test avec replay.
8. **Balayage de contraste complet** (P2) : seuls quelques `text-white/30` du dashboard ont été relevés à `/40` cette session ; le reste du site (landing notamment) n'a pas été audité visuellement — nécessite un vrai rendu navigateur, impossible ici.
9. Si un futur brief redemande un changement de tutoiement/vouvoiement, **clarifier explicitement avec l'utilisateur** lequel est définitif avant de relancer une passe complète, pour éviter un nouvel aller-retour.
10. Stripe Payment Links → Checkout Sessions : mis en pause sur décision explicite de l'utilisateur, ne pas relancer sans confirmation.
