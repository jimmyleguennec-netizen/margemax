# Passation — MargeMax

## UI fix : vrais tracés SVG officiels pour les moyens de paiement (2026-09-18, session "official payment logos")

**Les icônes du footer dessinées à la main lors du sprint précédent ont
été remplacées par les vrais tracés SVG officiels**, récupérés en direct
(navigateur intégré) depuis `simple-icons` (bibliothèque MIT open-source
de logos de marque en tracé unique) via jsdelivr, PAS approximés :

- **Visa** : tracé officiel exact (`simple-icons`, slug `visa`), couleur
  officielle `#1A1F71`.
- **Stripe** : tracé officiel exact (slug `stripe`), couleur officielle
  `#635BFF`.
- **Apple Pay** : tracé officiel exact — logo complet pomme + "Pay" en un
  seul tracé (slug `applepay`), couleur officielle `#000000`.
- **Google Pay** : tracé officiel exact — logo complet "G Pay" en un seul
  tracé (slug `googlepay`), couleur officielle `#4285F4`.
- **Mastercard** : **volontairement PAS** le tracé simple-icons (qui est
  un monochrome à un seul ton rouge) — gardé les deux cercles géométriques
  dessinés précédemment, mais avec les **vraies couleurs officielles
  Mastercard** (rouge `#EB001B` / orange `#F79E1B`, chevauchement
  `#FF5F00`, conformes aux brand guidelines Mastercard) : plus fidèle au
  vrai logo qu'une silhouette monochrome.
- **CB (Cartes Bancaires)** : **aucun tracé officiel disponible** dans
  simple-icons (marque française de niche, non couverte par cette
  bibliothèque) — reste le badge stylisé "CB" du sprint précédent, ce
  n'est PAS un logo officiel. À signaler si l'utilisateur a besoin d'un
  vrai logo CB (il faudrait le récupérer depuis le kit de marque officiel
  du Groupement des Cartes Bancaires, non accessible depuis cet
  environnement).

**Toujours pas de nouvelle dépendance npm** (react-icons/simple-icons ne
sont pas installés, pas de Node/npm disponible ici pour en ajouter une en
sécurité) : les tracés sont copiés tels quels dans
`web/components/ui/payment-icons.tsx`, comme on copierait un SVG exporté
d'un logiciel de design — mais ce sont maintenant les VRAIS tracés
officiels plutôt que des approximations.

**Toutes les icônes sur fond blanc uniforme désormais** (au lieu du mix
noir/blanc/violet du sprint précédent) : plus cohérent visuellement, et
les logos de paiement sont conçus pour un fond clair.

## Bug fix critique : recherche par mots-clés cassée en production (2026-09-18, session "fix keyword search 16-digit IDs")

**Cause racine trouvée et confirmée en conditions réelles** (navigateur
intégré, vraie page de résultats `fr.aliexpress.com/w/wholesale-...html`
ouverte en direct) : **les ID produit AliExpress font aujourd'hui 16
chiffres** (ex. `1005012427087010`, `1005012690129627`...), alors que les
trois regex d'extraction d'ID dans `web/lib/aliexpress-search.ts`
plafonnaient à 15 chiffres (`\d{9,15}`). Résultat : **aucun** lien produit
réel — ni en résultat de recherche par mot-clé, ni dans une URL collée
directement — ne pouvait plus matcher, d'où "Aucune annonce trouvée pour
ce mot-clé sur AliExpress" sur absolument toute recherche. Testé en direct
sur `fr.aliexpress.com/w/wholesale-coque-iphone-17.html` : le premier ID
produit réel de la page fait bien 16 chiffres, confirmant le bug avant
correctif.

**Fix** : les trois regex (`extractProductId` — URL directe et ID brut
collé, et `findFirstProductIdFromKeyword` — résultat de recherche par
mot-clé) n'ont plus de borne haute sur le nombre de chiffres (`\d{9,}` au
lieu de `\d{9,15}`) — seule une borne basse à 9 chiffres subsiste pour
éviter de capturer un petit nombre incident. Le suffixe `.html` (ou la fin
de chaîne pour un ID brut) délimite déjà le nombre, donc une borne haute
n'apportait aucune sécurité, seulement un risque de re-casser au prochain
allongement d'ID côté AliExpress — ce qui est exactement ce qui s'est
produit ici.

**La séparation URL directe / mot-clé demandée dans le brief existait déjà
et était correcte** (`performAliExpressSearch` : `extractProductId(query)`
d'abord, `findFirstProductIdFromKeyword(query)` seulement si ça échoue) —
le vrai bug n'était pas un problème d'aiguillage entre les deux chemins,
mais cette regex commune aux deux qui rejetait silencieusement tout ID
produit moderne, quel que soit le chemin emprunté.

**Sans lien avec le fix précédent (isolement du bloc produit pour les
frais de port/taxes)** : ce fix-là opère uniquement sur le HTML de la
fiche produit déjà trouvée, jamais sur la détection de l'ID lui-même — les
deux bugs étaient distincts et indépendants.

## UI fix : icônes SVG pour les moyens de paiement du footer (2026-09-18, session "payment icons")

**Badges texte remplacés par de vraies icônes SVG vectorielles**
(`web/components/ui/payment-icons.tsx`, nouveau fichier) : Apple Pay,
Google Pay, Visa, Mastercard, CB et Stripe ont chacune leur propre
composant SVG dessiné à la main, sur un fond clair uniforme (`h-8`,
`rounded-md`) — les vrais logos de moyens de paiement sont conçus pour un
fond clair, les poser directement sur le footer sombre les aurait rendus
illisibles/dénaturés.

**Pourquoi dessinées à la main plutôt qu'une bibliothèque d'icônes
(react-icons, simple-icons...)** : aucune n'est installée dans ce projet
(seul `lucide-react` l'est, qui ne contient aucun logo de marque), et il
n'y a **pas de Node/npm disponible dans cet environnement** pour ajouter
une dépendance et régénérer `package-lock.json` en toute sécurité —
contrainte déjà rencontrée et documentée dans les sessions précédentes
(voir plus bas, `contact@` et le fix Firecrawl). Chaque icône reste une
**représentation simplifiée et reconnaissable** (formes/couleurs
caractéristiques) plutôt qu'une reproduction pixel-perfect du fichier de
logo officiel — pratique standard pour ce type de badge "moyens de
paiement acceptés".

**Non vérifié visuellement dans un vrai navigateur** : pas de Node/npm
pour lancer le serveur de dev Next.js, et le rendu HTML de test construit
en dehors du projet (pour vérifier les tracés SVG à l'œil) n'a pas pu être
ouvert dans le navigateur intégré de cette session (accès fichier local
hors dossier projet refusé, et data: URL non supportée par l'outil de
navigation disponible ici). Le pictogramme "pomme" (Apple Pay) a
volontairement été simplifié au maximum (ellipse + petite feuille + queue,
formes géométriques simples) plutôt qu'une courbe complexe dessinée à
l'aveugle, justement pour limiter le risque de rendu incorrect sans
pouvoir vérifier visuellement avant déploiement. **À vérifier par
l'utilisateur après déploiement Vercel.**

## Bug fix critique : parsing prix/livraison/taxes AliExpress (2026-09-18, session "fix extraction shipping/tax")

**Cause racine trouvée en conditions réelles** (navigateur intégré, vraie
fiche produit `fr.aliexpress.com/item/...` ouverte en direct) — deux
problèmes distincts empilés :

**1. Faux positif de frais de port ("1,00 €" au lieu du vrai montant).**
L'ancien regex de `extractShippingAndImportFee` (`web/lib/aliexpress-search.ts`)
cherchait le mot "Livraison"/"Shipping" sur la page HTML **entière**, sans
se limiter au produit réellement analysé. Or une fiche produit AliExpress
contient toujours plus bas un bloc "Vous aimerez aussi" (recommandations)
avec DES PRIX ET DES BADGES "Livraison gratuite" **d'articles complètement
différents** — vérifié en direct : le tout premier "Livraison gratuite"
rencontré sur une vraie fiche appartenait à un smartphone recommandé sans
aucun rapport avec le produit analysé. **Fix : le HTML est maintenant
tronqué avant le premier bloc "hors produit" (avis clients, recommandations,
articles similaires) avant toute extraction** (`isolateMainProductHtml`),
et l'extraction balaie désormais TOUTES les occurrences valides plutôt que
de s'arrêter sur la première (`findFirstValidAmount`) — un bandeau promo
rejeté ("Livraison gratuite **dès** 10€ d'achat", texte à seuil/condition,
détecté et exclu via `THRESHOLD_WORDS`) n'empêche plus de trouver un
montant réel plus loin dans le même bloc produit.

**2. Taxes d'importation "manquant" en permanence — CE N'EST PAS UN BUG
D'EXTRACTION, c'est une limite réelle du site.** Vérifié en direct sur une
vraie fiche produit : AliExpress affiche littéralement **"Les droits de
douane sont calculés lors du paiement"** — ce montant n'existe nulle part
avant l'étape de paiement réelle (identifiants + adresse + panier), donc
strictement inaccessible à un scraper anonyme (Firecrawl inclus, quel que
soit le réglage). **Fix : repli explicite sur une estimation TVA France 20 %
du sous-total** (`estimateImportFee`, demandé explicitement par le
brief) quand aucun vrai montant n'est lisible — mais **toujours marqué**
via le nouveau champ `importFeeEstimated: true` sur `AliExpressSearchResult`,
jamais confondu avec une valeur confirmée. Le coût total inclut désormais
cette estimation (ne sous-estime plus systématiquement le vrai montant
payé), et l'UI (`search-panel.tsx`) distingue clairement 3 états sur la
ligne "Taxes d'importation" : **manquant** (ambre, rien trouvé, pas
d'estimation) / **estimé (TVA 20 %)** (cyan, repli TVA) / **confirmé**
(vert, vraie valeur lue sur la page) — le badge d'en-tête "Vérifié" exige
maintenant les trois conditions (frais de port ET taxes ET taxes NON
estimées) pour s'afficher, sinon "Partiellement vérifié".

**Frais de port : toujours `null`/"manquant" si non trouvé, PAS
d'estimation par défaut** — conforme à la demande explicite du brief
("les frais de livraison réels... au lieu de valeurs par défaut/fallback"),
contrairement aux taxes d'importation où une estimation a été explicitement
demandée. Sur la fiche produit testée en direct, le vrai coût de livraison
de CE produit n'apparaissait nulle part non plus (uniquement une date de
livraison, "sep. 23-26", pas un prix) — un "manquant" honnête reste
préférable à un prix inventé.

**Non testable de bout en bout depuis cet environnement** : pas de clé
`FIRECRAWL_API_KEY` ni d'appel Firecrawl réel disponible ici, et pas de
Node/npm pour builder. Le diagnostic et la nouvelle logique de scoping/
validation ont été vérifiés contre le VRAI HTML d'une fiche produit
AliExpress live (via le navigateur intégré), mais le comportement de
Firecrawl sur cette même page (avec `rawHtml`, `waitFor: 3000`, `proxy:
"auto"`) reste à confirmer par l'utilisateur après déploiement, avec un
vrai produit dont le total attendu est connu (comme l'exemple du brief :
sous-total 11,19€ / livraison 5,41€ / droits 3,61€ / total 20,21€).

## Sprint urgent mobile : écran noir au scroll & menu burger (2026-09-18, session "fix mobile scroll")

**Cause racine identifiée pour l'écran noir au scroll : `web/components/landing/hero.tsx`.**
Le halo décoratif du hero liait sa position au scroll (`useTransform` sur
`scrollYProgress`, `y: orbY`) **par-dessus** un filtre `blur-3xl` sur un
calque de 720×420px, en plus d'une animation `scale`/`opacity` infinie
concurrente. Recalculer un `transform` à chaque frame de scroll sur un
calque aussi lourdement flouté est une combinaison connue pour faire
clignoter l'écran en noir sur Safari/Chrome mobile (le compositeur peine à
suivre). **Fix : le parallax scroll-lié a été retiré entièrement** (plus de
`useScroll`/`useTransform` dans ce fichier) — le halo reste fixe pendant le
scroll, seule la respiration douce (`scale`/`opacity`, sans dépendance au
scroll) subsiste. Le flou est aussi réduit sur mobile (`blur-2xl` au lieu
de `blur-3xl`, `sm:blur-3xl` restauré à partir du desktop).

**Deuxième cause probable, header sticky : `web/components/landing/navbar.tsx`.**
Le header (`position: sticky`) portait un `backdrop-blur-xl` permanent,
animé en filigrane à chaque scroll par le changement de hauteur/opacité
lié à l'état `scrolled`. `backdrop-filter` + `position: sticky` recalculé
en continu pendant le scroll est un autre déclencheur connu de glitches de
rendu mobile. **Fix : le flou est retiré sur mobile** (`sm:backdrop-blur-xl`
au lieu d'un flou permanent), compensé par un fond plus opaque sur mobile
(`bg-black/80` / `bg-slate-950/95` selon l'état `scrolled`) pour garder un
rendu visuellement propre sans le coût du filtre.

**Flash noir à la fermeture du menu burger : même fichier, `MobileMenu`.**
L'overlay plein écran avait `bg-black/95 backdrop-blur-xl` — le flou était
redondant (fond déjà quasi opaque) et coûteux à animer en opacité
(`initial={{opacity:0}}` → `animate={{opacity:1}}`) sur un calque plein
écran. **Fix : `backdrop-blur-xl` retiré**, le fond `bg-black/95` seul
suffit visuellement et supprime ce coût.

**Non touché délibérément :** les halos statiques du footer (`blur-[100px]`,
non liés au scroll, pas de `transform` animé dessus) et les petites
animations `opacity`/`scale`/`x` sur des éléments ponctuels (points
lumineux du quick-guide, bouton conic-gradient tournant) — aucun de ces
éléments ne combine scroll + transform + flou lourd, donc hors de la cause
racine identifiée. Impossible de reproduire l'écran noir en local (pas de
Node/npm disponible dans cet environnement pour lancer un `npm run build`
ni un test live sur device réel) — fix basé sur l'analyse du code, à
confirmer par l'utilisateur sur son téléphone après déploiement.

## Sprint footer, humour formulaires & finitions (2026-09-18, session "footer & humour")

**TikTok volontairement non ajouté.** Le brief demandait une icône TikTok
pointant vers "le compte officiel" — aucune URL TikTok n'existe nulle part
dans le code, et une session précédente avait explicitement retiré les
autres icônes sociales (Instagram/Facebook/X) faute de comptes réels,
justement pour ne jamais publier de lien mort ou faux. Question posée à
l'utilisateur en cours de session : confirmé qu'il n'y a pas encore de
compte réel, lien à ajouter plus tard. **Ne pas ajouter de lien TikKTok
avant d'avoir l'URL réelle fournie explicitement.**

**1. Champ "Entreprise" (inscription) — n'existait pas avant cette
session**, ajouté avec le placeholder demandé, **facultatif** (jamais
requis pour créer un compte). Stocké uniquement dans les métadonnées
Supabase (`auth.users.raw_user_meta_data.company_name`, via
`options.data` de `signUp()`) — **pas de colonne dans `public.profiles`**
volontairement, pour ne jamais faire dépendre l'inscription d'une
migration SQL non encore exécutée. Récupérable plus tard sans perte si
une colonne dédiée est ajoutée un jour.

**2. Sous-texte mot de passe — nombre corrigé de 8 à 6.** Le brief
demandait "Minimum 8 caractères", mais la vraie validation (
`lib/actions/auth.ts`, `password.length < 6`, et `minLength={6}` sur les
deux champs) exige 6 depuis toujours. Gardé l'humour tel quel, corrigé le
chiffre — la blague sur "123456" ne fonctionne d'ailleurs QUE si le
minimum est 6 (123456 fait exactement 6 caractères ; à 8 le mot de passe
de la blague ne serait même pas accepté).

**3. Champ téléphone/fax — non ajouté.** N'existe nulle part dans le code
(vérifié par recherche), et le brief lui-même le conditionnait ("si
présent"). Rien à quoi accrocher ce placeholder.

**4. Footer** : avertissement humoristique et rangée de badges "Moyens de
paiement acceptés" (Apple Pay/Google Pay/Visa/Mastercard/CB/Stripe —
réellement exacts, ce sont ceux que Stripe Checkout propose
automatiquement) ajoutés. Badges texte avec une couleur d'accent par
marque plutôt que des logos reconstitués à la main (aucune bibliothèque
d'icônes de marque n'est installée dans ce projet).

**5. Logique du menu déroulant / onglets dashboard** : confirmée déjà
correcte depuis la session précédente (Aide → modale FAQ, Service client
→ modale contact, Mon compte → `?tab=account`), et le bouton d'état vide
de l'Historique est toujours en place — aucun changement de code
nécessaire sur ce point, juste vérifié.

## Sprint de finalisation : extracteur, formulaire, UI compte (2026-09-18, session "finalisation")

**⚠️ Deux actions manuelles bloquantes avant que tout fonctionne réellement :**

1. **`RESEND_API_KEY` toujours absente de Vercel.** Le message d'erreur
   "L'envoi de message n'est pas encore configuré" que l'utilisateur a vu
   est EXACTEMENT le comportement codé pour ce cas (voir sessions
   précédentes) — ce n'est pas un bug, c'est la variable d'environnement
   qui manque encore. Rien à corriger côté code, juste à renseigner la clé.
2. **Nouvelle migration `migration_stripe_customer.sql` à exécuter dans
   Supabase SQL Editor** (ajoute `profiles.stripe_customer_id`), ET **le
   portail client Stripe à activer une fois dans le Dashboard Stripe**
   (Settings → Billing → Customer portal) — sans ça,
   `stripe.billingPortal.sessions.create()` échoue avec une erreur Stripe
   explicite. Les achats de crédits faits AVANT cette session n'ont pas
   de `stripe_customer_id` (capturé uniquement à partir de maintenant par
   le webhook) : le bouton "Gérer mes factures" ne fonctionnera pour un
   utilisateur existant qu'après son PROCHAIN achat.

**1. Extraction Firecrawl temps réel / pas de prix en dur** : re-vérifié
(grep sur le chemin réel de recherche/calcul pour les prix d'exemple
connus) — déjà entièrement traité lors d'une session précédente, aucun
changement de code nécessaire.

**2. Formulaire de contact** : voir le blocage RESEND_API_KEY ci-dessus.
Code déjà correct et inchangé sur ce point.

**3. Menu déroulant (engrenage header) — les 3 items menaient tous au
même endroit avant cette session, corrigé :**
- Onglet actif du dashboard maintenant reflété dans l'URL
  (`?tab=recherche|calculateur|historique|account`, via
  `history.replaceState`, relu au montage) — `/dashboard?tab=account`
  fonctionne comme lien direct et survit à un rechargement. Clé interne
  de l'onglet renommée `parametres` → `account` pour correspondre.
- **"Aide et paramètres"** ouvre maintenant une vraie modale FAQ
  (`help-modal.tsx`, nouveau) au lieu de basculer vers Mon compte —
  réutilise le même contenu que la FAQ publique de la landing
  (extrait dans `lib/faq.ts`, source unique désormais partagée par les
  deux, pour ne plus jamais diverger).
- **"Service client"** ouvre le formulaire de contact DANS le dashboard
  (`contact-modal.tsx`, nouveau) au lieu de renvoyer un utilisateur
  connecté vers `/#contact` sur la landing publique. Le formulaire
  lui-même a été extrait de `contact.tsx` vers
  `components/shared/contact-form.tsx`, réutilisé par la landing ET
  cette modale (même logique d'envoi, jamais deux implémentations qui
  divergent).

**4. Pages du dashboard :**
- Recherche : suggestions de mots-clés populaires cliquables ajoutées
  (remplissent le champ, ne soumettent jamais automatiquement — une
  analyse coûte un crédit, l'utilisateur garde le contrôle).
- Historique : bouton d'état vide déjà en place depuis une session
  précédente, rien à ajouter.
- Mon compte : nouveau bloc "Moyen de paiement & factures" (bouton →
  `POST /api/stripe/billing-portal` → `stripe.billingPortal.sessions.create`,
  nouveau fichier + migration, voir ci-dessus) et un récapitulatif
  d'usage (crédits achetés / nombre d'achats / montant dépensé total,
  calculés uniquement à partir du tableau `purchases` réel).
  **Décision délibérée : pas de statistique "crédits utilisés"** — ça
  aurait supposé connaître le nombre de crédits offerts à l'inscription
  comme une constante fixe non trackée nulle part dans le code (seulement
  en dur dans des textes marketing), fragile si ce nombre change ou si un
  solde est ajusté manuellement en base. Mieux valait ne rien afficher
  que d'afficher un chiffre qui pourrait dériver silencieusement de la
  réalité.

## Sprint correctifs finaux : contact, burger, textes (2026-09-18, session "correctifs finaux")

**Nouvelle dépendance externe requise : Resend.** Le formulaire de contact
(`/#contact`) envoyait auparavant un `mailto:` (ouvre l'appli e-mail du
visiteur, ne transmet réellement rien tant qu'il n'a pas lui-même cliqué
"envoyer" dedans — pas un vrai envoi automatique). Remplacé par
`app/api/contact/route.ts` (nouveau), qui appelle l'API REST de Resend en
direct (`fetch`, pas le SDK npm `resend` — évite de toucher
`package.json`/`package-lock.json` dans un environnement toujours sans
Node pour régénérer le lockfile correctement ; même approche que
l'intégration Firecrawl). Forme de la requête Resend (`from`/`to`/
`subject`/`html`/`reply_to`) vérifiée via l'accès Firecrawl-developer-search
de cette session avant d'écrire le code, pas de mémoire. Protégé par
rate-limit IP (`lib/rate-limit.ts`, nouveau preset `contactByIp`,
réutilise la RPC `register_auth_attempt` déjà en place).

**⚠️ Bloquant tant que non fait : `RESEND_API_KEY` doit être renseignée
dans Vercel → Project Settings → Environment Variables** (voir
`.env.example`) pour que l'envoi fonctionne réellement — sans elle, le
formulaire affiche un message d'erreur clair ("L'envoi de message n'est
pas encore configuré...") au lieu d'échouer silencieusement, exactement
comme le fait déjà `FIRECRAWL_API_KEY` absente pour la recherche. Optionnel
mais recommandé : `RESEND_FROM_EMAIL` avec un domaine vérifié dans le
compte Resend (sans elle, repli sur `onboarding@resend.dev`, le domaine de
test de Resend qui fonctionne sans vérification mais n'est pas fait pour
un usage de production durable). **Non testé en conditions réelles**
(pas de compte/clé Resend accessible depuis cet environnement).

**Menu burger mobile** (`navbar.tsx`) : **non reproduit** en testant en
direct sur le site déployé (375px, navigateur intégré) — un clic
`document.elementFromPoint()` au centre du bouton retombait bien sur un
descendant du bouton lui-même (pas de calque bloquant trouvé), et un clic
réel a ouvert le menu du premier coup. Durci quand même, comme demandé :
`z-index`/`pointer-events` explicites sur le bouton, et **verrouillage du
scroll de la page (`document.body.style.overflow`) tant que le menu plein
écran est ouvert**, restauré à la fermeture/démontage — absent avant cette
session, c'est la cause la plus probable d'un ressenti "pas fluide" sur un
vrai téléphone (la page derrière l'overlay pouvait défiler au swipe).

**Texte "au doigt mouillé"** : une seule occurrence dans tout le code
(`demo.tsx`, vérifié par recherche globale) — remplacée par le texte
fourni tel quel, tutoiement inclus (voir plus haut dans ce fichier : la
bannière `TAB_HELP` du dashboard est aussi en tutoiement délibéré,
troisième occurrence de ce choix de ton dans les briefs récents — le site
reste vouvoiement partout ailleurs, signalé une fois de plus au cas où ce
ne serait pas voulu pour un titre de landing aussi visible).

## Sprint final : webscraping Firecrawl, UI header & harmonisation (2026-09-18, session "sprint final v2")

Cette session avait un accès MCP à Firecrawl côté Claude (outils
`firecrawl_search`/`firecrawl_developer_search`, un index de recherche
documentaire/code — **pas** un outil de scrape générique). Utilisé pour
**vérifier** le fix Firecrawl du tour précédent contre la vraie doc/des
exemples réels avant de continuer à construire dessus, plutôt que de
refaire confiance à ma seule mémoire :
- Confirmé : `waitFor`, `proxy` (`"basic"|"stealth"|"auto"`), `location`,
  `formats` sont bien les vrais paramètres de l'API Firecrawl `/v1/scrape`
  — le fix de la session précédente était correctement formé.
- Confirmé : `https://fr.aliexpress.com/w/wholesale-<slug>.html` est bien
  l'URL canonique réelle de recherche AliExpress (plusieurs guides de
  scraping indépendants la documentent, avec le même détail que celui
  utilisé dans le fix précédent : `?SearchText=` fait un 302 vers cette
  forme). Toujours **pas d'outil pour scraper une vraie page AliExpress
  depuis cette session** — impossible de tester le pipeline complet en
  conditions réelles malgré l'accès Firecrawl.

**Point 1 (recherche Firecrawl temps réel, nettoyage URL, pas de prix en
dur)** : déjà entièrement traité dans le commit précédent
(`017619d`) — revérifié intact, aucun changement nécessaire.

**Point 2 — incohérence trouvée et corrigée entre landing et dashboard** :
le bloc "Comparateur d'offres AliExpress" (Offre 1 vs Offre 2) de
`demo.tsx` annonçait une fonctionnalité qui n'existe nulle part dans le
produit — aucun comparateur cote-à-cote de deux annonces n'a jamais été
construit (le dashboard ne montre qu'UN résultat par recherche). Remplacé
par un aperçu fidèle du vrai onglet Calculateur de marge, avec **les mêmes
valeurs par défaut que `calculator-panel.tsx`** (14,49 €/0 €/3,60 € de
coûts, 29,90 € de prix de vente). En reconciliant les deux, un DEUXIÈME
problème plus discret a été trouvé : les chiffres de marge/ROI/prix
conseillé de la fenêtre Mac (21,81 €, 120,6 %, 39,90 €) étaient codés en
dur depuis avant la centralisation de `lib/margin-estimate.ts` et avaient
divergé de ce que `computeMarginEstimate()` calcule réellement pour ce
produit (32,90 € conseillé, pas 39,90 €). Les deux fenêtres de démo
appellent maintenant `computeMarginEstimate()` directement au lieu de
chiffres figés — la landing ne peut plus diverger silencieusement de la
formule réelle du dashboard.

**Point 3 (icônes & dédoublonnement bannières)** :
- Onglet "Mon compte" : icône engrenage → icône profil (`User`).
  L'engrenage reste réservé au menu déroulant tout à droite du header
  (`AccountMenu`, déjà en place depuis une session précédente) — un seul
  engrenage visible à l'écran désormais.
- `FirstLaunchHint` (bandeau statique "voici ce que fait chaque onglet",
  affiché une fois) supprimé : il faisait doublon avec `ActiveTabHint`
  (bandeau dynamique par onglet, ajouté lors d'une session précédente et
  désormais toujours présent) — les deux ensemble donnaient l'effet d'un
  "sous-titre redondant sous la navigation" au premier chargement.
  `first-launch-hint.tsx` supprimé entièrement (plus aucune référence
  dans le code).

## Fix urgent extraction Firecrawl AliExpress (2026-09-18, session "fix Firecrawl")

Symptôme rapporté : recherches par mot-clé ET par URL directe échouaient
systématiquement avec "AliExpress a limité ou bloqué l'accès" ou "Cette
annonce n'a pas pu être analysée". Trois causes probables corrigées
d'un coup dans `lib/aliexpress-search.ts` (non re-testé en conditions
réelles — toujours pas de clé Firecrawl ni d'accès réseau sortant ici,
relecture statique uniquement) :

1. **URL de recherche par mot-clé changée** : `buildSearchUrl` utilisait
   `https://fr.aliexpress.com/wholesale?SearchText=<mot-clé>`, remplacé par
   `https://fr.aliexpress.com/w/wholesale-<slug>.html` — la forme "jolie"
   vers laquelle l'ancienne redirige côté client (JS) dans un vrai
   navigateur. Un scraper qui ne déclenche pas cette redirection JS
   restait sur l'ancienne forme, plus souvent servie avec une page de
   vérification anti-bot. `slugifyKeyword()` fait la slugification
   (normalize NFD + suppression des diacritiques U+0300-U+036F, construite
   via `String.fromCharCode` plutôt qu'un littéral regex avec séquences
   d'échappement — **piège technique rencontré et documenté ci-dessous**).
2. **Options Firecrawl anti-bot ajoutées** : `waitFor: 3000` (AliExpress
   rend son contenu côté client en React — sans attendre, Firecrawl peut
   capturer une coquille HTML vide, indépendamment de tout vrai blocage)
   et `proxy: "auto"` (Firecrawl n'escalade vers son proxy
   anti-détection, plus lent/coûteux, que si la tentative simple échoue —
   jamais systématiquement). Budget timeout par appel remonté de 20 s à
   25 s pour laisser la place à `waitFor` ; le pire cas (recherche par
   mot-clé, 2 appels Firecrawl chaînés) passe à 2×25 = 50 s, toujours sous
   le `maxDuration=60` des deux routes API — marge plus courte qu'avant,
   à surveiller si de nouveaux timeouts apparaissent.
3. **Nettoyage d'URL (tracking params `pdp_npi`, `search_p4p_id`...)** :
   déjà géré avant cette session — `extractProductId` n'extrait que l'ID
   numérique d'une URL collée, et `buildProductUrl` reconstruit toujours
   une URL canonique propre à partir de ce seul ID, sans jamais transmettre
   les paramètres de tracking d'origine à Firecrawl. Vérifié, aucun
   changement de code nécessaire sur ce point.
4. **Repli sur métadonnées OpenGraph/meta** (`extractOpenGraphFallback`,
   nouveau) : `performAliExpressSearch` ne rejette plus immédiatement sur
   un blocage anti-bot détecté ou un prix JSON-LD manquant — il tente
   d'abord de reconstruire une fiche à partir de `og:title`/`og:image`/
   `product:price:amount` (les fonctions d'extraction existantes sont sans
   danger à appeler même sur une page partiellement bloquée, elles se
   dégradent simplement en `{}`/`null`). L'erreur bloquante n'est levée
   que si même ce repli échoue — **jamais de prix inventé**.

**Piège technique rencontré et à retenir pour la suite** : écrire une
séquence d'échappement Unicode du type `̀` directement dans le
paramètre d'un appel d'outil d'édition (Edit) la fait décoder par le
parseur JSON du paramètre AVANT qu'elle n'atteigne le fichier — le fichier
reçoit alors le caractère Unicode littéral (ex. un vrai accent combinant),
pas le texte `̀` attendu dans le code source. Repéré ici par relecture
attentive (le rendu affichait des caractères bizarres dans une classe de
caractères regex) et vérifié par inspection des octets bruts
(`xxd`/recherche par plage Unicode). Corrigé en construisant la valeur via
`String.fromCharCode(0x0300)` (texte 100 % ASCII dans le fichier source)
plutôt qu'un littéral d'échappement direct. **À vérifier systématiquement
si un futur correctif introduit un caractère Unicode via une séquence
d'échappement dans un outil d'édition.**

## Sprint structuration globale : ergonomie, stabilité & mobile (2026-09-18, session "structuration globale")

Toujours sans Node/npm sur cette machine — relecture statique + vérification
en direct sur le site Vercel déployé (navigateur intégré, 375-430px) partout
où c'était accessible sans authentification.

- **Vrai bug de freeze trouvé et corrigé** (`neon-auth-panel.tsx`) :
  l'appel `supabase.auth.getUser()` juste après une connexion/inscription
  réussie (pour reprendre un achat de pack en attente, `?pack=<clé>`)
  n'avait aucun `try/catch`. Un blip réseau à cet instant précis laissait
  l'utilisateur bloqué indéfiniment sur l'écran "Redirection en cours..."
  (succès affiché, mais ni la modale de consentement ni la redirection
  `/dashboard` n'étaient jamais atteintes) — nécessitait un rechargement
  manuel. Corrigé : repli systématique sur `/dashboard` en cas d'échec.
  Les autres flux async (recherche, `BuyCreditsModal`, `CheckoutConsentDialog`,
  toutes les Server Actions de `lib/actions/auth.ts`) ont été relus et
  résolvent déjà correctement leur promesse dans tous les cas — rien
  d'autre à corriger sur ce point.
- **Saut d'écran au rechargement** (`app/layout.tsx`) : script inline
  (avant hydratation React) qui désactive `history.scrollRestoration` et
  force `window.scrollTo(0,0)` — **sauf si l'URL contient une ancre**
  (`#pricing`, `#contact`, `#faq`) pour ne pas casser les liens profonds
  utilisés ailleurs dans l'app (ex. le nouveau menu du compte). Aucun
  `autoFocus` ni `.focus()` impératif nulle part dans le code (vérifié par
  recherche globale) — rien d'autre ne tirait la page vers le bas au
  chargement.
- **`overflow-x: hidden` sur `html`/`body`** : déjà présent avant cette
  session (`app/layout.tsx`). Vérifié en direct sur le site déployé à
  375px et 430px : **aucun scroll horizontal page-level**, et aucun
  élément des cartes de prix, du slider du calculateur de crédits, ou du
  comparateur d'offres ne dépasse la largeur de viewport à ces tailles
  (vérifié par script mesurant les `getBoundingClientRect()` de tous les
  éléments de ces sections) — rien à corriger côté landing. Les
  correctifs mobile du dashboard (tableaux, header) restent ceux de la
  session précédente.
- **Redirections Stripe** (`/signup?pack=`, `/api/checkout`) : déjà
  corrigées intégralement lors d'une session précédente — vérifiées à
  nouveau intactes, aucune régression.
- **Menu du compte** (nouveau, `account-menu.tsx` + `ui/dropdown-menu.tsx`) :
  icône engrenage seule (sans texte) après le bouton "+" de crédits dans
  le header, toujours visible (même en mode démo, même sans crédits
  connus). Construit sur `@radix-ui/react-dropdown-menu`, **déjà une
  dépendance installée** (`^2.1.2` dans `package.json`, jamais utilisée
  avant) — aucune nouvelle dépendance ajoutée, donc rien à faire tourner
  avec `npm install` pour que ça fonctionne. Contenu du menu : "Aide et
  paramètres" et "Votre compte" basculent tous deux vers l'onglet "Mon
  compte" ; "Service client" pointe vers `/#contact` (section réelle de la
  landing, confirmée existante) ; "Se connecter" (mode démo) ou "Se
  déconnecter" (appelle directement la Server Action `logout()`, sans
  `<form>` intermédiaire). **Langue : Français / Pays : France / Devise :
  Euro (€) affichés comme simples lignes d'information NON cliquables**
  — décision délibérée : le produit n'a aucun système multilingue,
  multi-pays ou multi-devise réel, donc les présenter comme des réglages
  actionnables aurait été exactement le type de fonctionnalité fantôme
  déjà retirée ailleurs sur ce site (générateur de fiche IA, comparateur,
  voir plus bas dans ce fichier) — **si un vrai sélecteur de langue/devise
  est souhaité plus tard, ce sera un travail produit à part entière, pas
  une case à cocher dans ce menu.**
- **Onglet "Paramètres" renommé "Mon compte"** (`dashboard-shell.tsx`,
  label du tab + titre du bandeau d'aide contextuel). Le panneau
  lui-même était déjà nettoyé (une seule carte crédits) depuis la session
  précédente — rien de plus à faire là.

## Sprint final unifié : Firecrawl réel, redirections Stripe & UI/mobile (2026-09-18, session "sprint final")

Session avec accès disque réel (git repo détecté cette fois), toujours sans
Node/npm — relecture statique uniquement. **Testé en direct sur le site
Vercel déployé** (landing + /login, 375px et 890px, via le navigateur intégré)
pour vérifier l'hypothèse de scroll horizontal AVANT de corriger : aucun
scroll horizontal page-level trouvé sur ces pages publiques — confirme que
le problème, s'il existe, est spécifique au dashboard (protégé par
authentification, non testable en direct ici sans identifiants).

- **Firecrawl — note/avis ajoutés** (`lib/aliexpress-search.ts`) :
  extraction de `aggregateRating` (ratingValue/reviewCount, avec repli sur
  `ratingCount`) depuis les données structurées JSON-LD, `null` si
  l'annonce ne l'expose pas (jamais inventé). Titre/prix/devise/image pour
  mot-clé ET lien direct, ainsi que "aucun crédit débité en cas
  d'échec", étaient déjà en place (voir sprint précédent) — juste vérifiés
  à nouveau ici. Toujours **non testé en conditions réelles** (pas de clé
  Firecrawl ni d'accès réseau sortant ici).
- **Bug racine du header mobile trouvé et corrigé** (`dashboard-shell.tsx`) :
  le logo (`h-14` = 56px de haut, ratio ~3.5:1 ≈ 196px de large) et le badge
  de crédits ("X / Y crédits" + bouton "+") ensemble dépassaient largement
  la largeur disponible sur un téléphone (375-414px, ~311px utilisables
  après le padding du conteneur) — calcul vérifié à la main
  (196px + ~150px > ~311px), sur un `<div className="flex justify-between">`
  sans `flex-wrap`, ce qui forçait un débordement horizontal du header.
  Corrigé : logo réduit à `h-9` sous `sm:` (640px), badge de crédits
  compacté (mot "crédits" masqué sous `sm:`, ne garde que l'icône + les
  chiffres), `shrink-0` ajouté partout pour empêcher un écrasement
  imprévisible par le flex.
- **Tableaux de résultats/historique remplacés** (`search-panel.tsx`,
  `history-panel.tsx`) : les deux `<table className="min-w-[480px]">`
  (carte de résultat d'analyse, liste d'historique) forçaient un défilement
  horizontal interne dès qu'un écran faisait moins de ~480px de large —
  remplacés par des listes de lignes label/valeur empilées (même motif
  déjà utilisé par le calculateur), lisibles à toute largeur sans jamais
  avoir besoin de défiler.
- **Calculateur** : espacement/padding resserrés sur la ligne de stats
  Marge/Marge %/ROI (3 colonnes) pour plus de marge sur téléphone étroit —
  la disposition Coûts/Marge en 1 colonne sous `lg:` (1024px) était déjà en
  place depuis le sprint précédent, rien à changer là.
- **Bandeau d'aide contextuelle — texte mis à jour, tutoiement conservé
  DÉLIBÉRÉMENT.** Le brief de cette session a redonné le même bandeau en
  tutoiement, pour la deuxième fois consécutive (la première fois, la
  session précédente l'avait converti en vouvoiement sans demander, en
  citant la cohérence du site). Face à cette répétition, le texte a été
  intégré tel quel cette fois (tutoiement), avec un commentaire dans le
  code expliquant ce choix — **à confirmer avec l'utilisateur** : est-ce
  un choix de ton assumé pour ce bandeau précis (differencié du reste du
  site, en vouvoiement partout ailleurs), ou une incohérence non voulue ?
  Voir aussi plus bas dans ce fichier : contradictions déjà notées comme
  point de friction récurrent.
- **Flux paiement Stripe (redirections `/signup`, `/api/checkout`)** :
  déjà corrigé intégralement lors du sprint précédent (voir section
  suivante ci-dessous) — vérifié à nouveau ici, aucune régression, rien
  d'autre à faire.

## Sprint correctifs urgents : Stripe, images & UX dashboard (2026-09-18, session "sprint urgent")

Toujours aucun Node/npm sur cette machine (revérifié) — relecture statique
uniquement, push en s'appuyant sur le build Vercel comme filet de sécurité.

- **Bug racine du paiement identifié et corrigé** : `buildPackCheckoutHref`
  (`lib/stripe-links.ts`) repliait sur `/login?pack=<cle>` dès que le
  Payment Link Stripe d'UN SEUL pack n'était pas configuré
  (`NEXT_PUBLIC_STRIPE_LINK_*` absente en prod) — y compris pour un
  utilisateur déjà connecté dans le dashboard, dont le `userId` était
  pourtant bien renseigné. Ce cas renvoyait vers `/login`, qui redirige
  aussitôt un utilisateur connecté vers `/dashboard?pack=...` (fix P1
  précédent), rouvrant la modale de consentement en boucle sans jamais
  atteindre Stripe ni expliquer pourquoi.
- **Fix** : nouvelle route `app/api/checkout/route.ts` (POST
  `{ packKey }`) qui résout l'URL Stripe réelle **côté serveur**, à partir
  de la session Supabase authentifiée (jamais d'un `user.id` fourni par le
  client) — retourne une erreur claire (502, "Ce pack n'est pas
  disponible...") si le Payment Link est manquant, au lieu d'un repli
  silencieux vers `/login`. `lib/stripe-links.ts` scindé en
  `buildStripeCheckoutUrl` (résolution serveur pack+userId → URL Stripe ou
  `null`) et `buildPackCheckoutHref` (href du bouton pour un visiteur
  anonyme uniquement, désormais `/signup?pack=<cle>` au lieu de
  `/login?pack=<cle>` — un clic sur un pack depuis la Landing sans être
  connecté est plus probablement un nouveau visiteur qu'un compte
  existant). `checkout-consent-dialog.tsx` (utilisé par les 3 parcours :
  pricing landing, calculateur de crédits, `BuyCreditsModal`/Paramètres du
  dashboard) appelle désormais `/api/checkout` pour la redirection finale
  et affiche l'erreur serveur au lieu de silencieusement échouer.
  **Non re-testé en conditions réelles** (pas d'accès Stripe test mode
  ici) — à vérifier : payer chaque pack depuis les 3 parcours, et
  confirmer qu'un Payment Link volontairement mal configuré affiche bien
  l'erreur 502 au lieu de rediriger vers /login.
- **Image de l'exemple "Voir une analyse exemple"** (`search-panel.tsx`) :
  affichait l'icône générique (`ProductThumbnail` sans `product_image_url`,
  donc repli sur l'icône `Package`) au lieu d'une vraie photo. Corrigé en
  pointant vers `public/images/product-charger.jpg`, asset déjà présent
  dans le repo mais jamais référencé nulle part (vérifié par recherche
  globale avant ce fix) — fichier JPEG valide (en-tête vérifié). La
  démonstration de la landing (`demo.tsx`) n'a PAS été touchée : elle
  affiche volontairement le logo MargeMax (`MIconBadge`), pas une photo
  produit — ce n'est pas un placeholder cassé mais un choix de design
  différent, aucune preuve dans le code d'un slot image prévu et non
  rempli à cet endroit.
- **Bannière d'aide contextuelle** (`dashboard-shell.tsx`, nouveau composant
  `ActiveTabHint`) : ajoutée dans le header, change de texte selon l'onglet
  actif (Recherche/Calculateur/Historique/Paramètres). **Texte fourni par
  l'utilisateur en tutoiement, converti en vouvoiement** avant intégration
  pour rester cohérent avec le reste du site (voir plus bas dans ce fichier :
  repasse complète en vouvoiement déjà faite une fois, contradictions
  répétées identifiées comme point de friction récurrent) — sens et
  structure inchangés, seule la conjugaison a changé. **À confirmer avec
  l'utilisateur si le tutoiement était en fait voulu spécifiquement pour ce
  bandeau.** Coexiste avec `FirstLaunchHint` (aide de premier lancement,
  dismissible, non touchée).
- **Nettoyage `ParametresPanel`** : la ligne "X crédits sur Y disponibles"
  de la première carte (email/déconnexion) supprimée — le solde ne
  s'affiche plus qu'une fois, dans la carte "Crédits" dédiée juste en
  dessous (gros chiffre + bouton "Acheter des crédits"). Le badge de
  crédits dans le header du dashboard (bouton "+") n'a pas été touché : il
  est visible sur tous les onglets, pas seulement Paramètres, ce n'est pas
  la répétition signalée.

## Finalisation sprint P0-P3 & mentions légales (2026-09-18, session "reprise")

Reprise de session sur une machine avec accès disque complet mais **toujours
sans Node/npm** (vérifié à nouveau : ni dans PATH, ni dans les emplacements
d'installation habituels — `npm run build` reste impossible à exécuter dans
cet environnement, comme documenté depuis le début du projet). Relecture
statique complète du diff en attente (11 fichiers modifiés + 1 nouveau)
avant commit — voir détail des points vérifiés ci-dessous.

**Commit `3feaf5e`** (contenait déjà, non committé jusqu'ici, le travail
d'une session précédente non documentée dans ce fichier — repris et vérifié
ici) :
- **Migration ScraperAPI → Firecrawl** (`lib/aliexpress-search.ts`) :
  `fetchHtmlViaScraperApi` → `fetchHtmlViaFirecrawl`, appel
  `POST https://api.firecrawl.dev/v1/scrape` avec `formats: ["rawHtml"]`
  (pas `"html"`, qui est nettoyé par Firecrawl et retirerait les
  `<script type="application/ld+json">` dont dépendent les extracteurs) et
  `location: { country: "FR", languages: ["fr"] }` pour préserver la
  géolocalisation France déjà en place. Variable d'env renommée
  `SCRAPER_API_KEY` → `FIRECRAWL_API_KEY` (`.env.example`,
  `.env.local.example`). Traduction des erreurs/timeouts en français
  préservée à l'identique. **Aucune référence à ScraperAPI restante**
  (vérifié par recherche globale). **Non testé en conditions réelles**
  (pas de clé Firecrawl ni d'accès réseau ici) — relecture statique
  uniquement, cohérence du contrat API Firecrawl vérifiée par lecture de
  la doc publique connue au moment de l'écriture, pas par appel réel.
- **Fix double-soumission Auth** (`neon-auth-panel.tsx`) : garde
  synchrone (`submittingRef`) sur les formulaires login/signup, en plus
  de `useFormStatus().pending` (qui ne désactive le bouton qu'après le
  premier re-render suivant le clic — un double-clic rapide ou un Entrée
  maintenu pouvait déclencher deux soumissions natives avant ce re-render).
  Réinitialisé sur tout changement de `state` (succès ou erreur). Profité
  de l'occasion pour synchroniser `document.title` et l'URL affichée
  (`history.replaceState`, pas `router.replace` qui remonterait le
  composant) avec le mode login/signup réellement affiché dans le panneau
  glissant.
- **`BuyCreditsModal`** (nouveau, `components/dashboard/buy-credits-modal.tsx`)
  + retouches `dashboard-shell.tsx` : achat de crédits sans quitter le
  dashboard (bouton "+" dans le header à côté du solde, et bouton
  "Acheter des crédits" dans Paramètres, qui redirigeait avant vers
  `/#pricing` sur la landing). Le modal ne fait que choisir un pack ; la
  case de consentement retrait/exécution immédiate et la redirection
  Stripe restent gérées par `CheckoutConsentDialog`, déjà en place et
  inchangé.
- **UX dashboard** : `search-panel.tsx` — bouton "Voir une analyse exemple"
  (données statiques identiques à la démo de la landing, aucun appel
  réseau ni crédit consommé, bandeau "Exemple illustratif" affiché sur le
  résultat pour ne jamais le confondre avec une vraie analyse) ;
  `history-panel.tsx` — CTA "Analyser mon premier produit" sur l'état vide
  de l'historique ; `calculator-panel.tsx` — réorganisation en 2 colonnes
  sur desktop (coûts à gauche, marge à droite), **logique de calcul et
  formules inchangées**, uniquement du réagencement JSX.
- **Mentions légales & CGV** (`web/app/mentions-legales/page.tsx`,
  `web/app/cgv/page.tsx`) : les placeholders "en cours de finalisation"
  remplacés par les informations réelles fournies par l'utilisateur cette
  session — SIREN 107 057 432, SIRET 107 057 432 00018, RCS Narbonne,
  capital social 251 €, Jimmy Le Guennec comme président et directeur de
  la publication, hébergeur Vercel Inc. avec lien vers vercel.com. Email
  de contact corrigé `contact@autoutilshop.com` → `contact@autoutilshop.fr`
  partout où il apparaissait (mentions légales, CGV, confidentialité,
  formulaire de contact `contact.tsx`, footer, commentaires
  `.env.example`/`.env.local.example`) pour cohérence — l'utilisateur
  n'avait donné le domaine `.fr` que pour les pages légales, corrigé
  ailleurs par déduction du même fait (adresse de contact réelle), pas
  une donnée inventée. **Restent en placeholder "en cours de
  finalisation"** (non fournis par l'utilisateur, non inventés) : numéro
  de TVA intracommunautaire, numéro de téléphone, identité du médiateur
  de la consommation (nom/adresse/site).

**⚠️ Toujours aucune exécution possible de `npm install`/`lint`/`build`/
`test` dans cet environnement** (Node absent, recherché en profondeur dans
PATH et emplacements d'installation habituels — pas seulement "pas dans le
PATH courant"). Le commit a été poussé sur `main` en s'appuyant sur le
build Vercel au déploiement comme filet de sécurité (Vercel ne promeut pas
un déploiement dont le build échoue). **Recommandé à l'utilisateur : vérifier
le statut du déploiement Vercel après ce push.**

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
- `web/app/mentions-legales/page.tsx`, `web/app/cgv/page.tsx` — pages légales ; SIREN/SIRET/RCS/capital/président/hébergeur/email complétés le 2026-09-18 (voir section "Finalisation sprint P0-P3 & mentions légales" en tête de fichier), TVA intracommunautaire/téléphone/médiateur de la consommation encore en placeholder (voir Bugs).

## Problématiques/Bugs en cours à résoudre

- **Paiement encore sur Stripe Payment Links, pas Stripe Checkout Sessions.** Décision explicite de l'utilisateur (2026-09-18) : conserver les Payment Links pour l'instant, ne pas migrer vers Checkout Sessions dynamiques tout de suite.
- **Case à cocher "exécution immédiate + renonciation rétractation" — codée et déployée, migration exécutée.** La modale (`checkout-consent-dialog.tsx`) et la route API (`/api/consent/checkout`) sont en place, la table `public.checkout_consents` existe en base. **Reste à vérifier en conditions réelles** (achat complet de bout en bout sur les 3 parcours). Choix produit fait par l'utilisateur : une seule case combinant les deux mentions (plutôt que deux cases séparées) — à valider avec un juriste si besoin, le texte exact est dans `web/lib/legal-consent.ts`.
- **Mentions légales — TVA intracommunautaire, téléphone et médiateur de la consommation encore manquants.** SIREN, SIRET, RCS, capital social et président ont été complétés le 2026-09-18 (voir section en tête de fichier) avec les vraies valeurs fournies par l'utilisateur. Restent en placeholder "en cours de finalisation" (visibles publiquement mais honnêtes, jamais inventés) : numéro de TVA intracommunautaire, numéro de téléphone, et l'identité (nom/adresse/site) du médiateur de la consommation désigné par AutOutilShop SAS. **Ces informations réelles doivent être fournies par l'utilisateur pour compléter la page.**
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
5. **Demander à l'utilisateur les informations légales encore manquantes** (TVA intracommunautaire, téléphone, identité du médiateur de la consommation) pour finir de compléter `mentions-legales` — SIREN/RCS/capital social/Président ont été fournis et intégrés le 2026-09-18, bloqué seulement sur ces 3 derniers points, jamais inventés.
6. **Faire relire par un juriste** la nuance L.221-25/L.221-28 ajoutée cette session (paiement = début d'exécution, pas exécution complète) dans `cgv/page.tsx` et `checkout-consent-dialog.tsx` — rédigée de bonne foi mais non validée par un professionnel du droit.
7. **Vérifier en conditions réelles** (déploiement Vercel + Supabase + Stripe live) : la case à cocher de consentement + récapitulatif sur les 3 parcours d'achat (pricing landing, calculateur de crédits, reprise après connexion), le rate limiting login/signup/reset mdp, `/login` et `/signup` qui redirigent bien un utilisateur déjà connecté (avec pack conservé), "Mon espace" dans la navbar connectée, les 5 packs, le parcours OTP (longueur de code), le reset de mot de passe, le webhook Stripe en mode test avec replay.
8. **Balayage de contraste complet** (P2) : seuls quelques `text-white/30` du dashboard ont été relevés à `/40` cette session ; le reste du site (landing notamment) n'a pas été audité visuellement — nécessite un vrai rendu navigateur, impossible ici.
9. Si un futur brief redemande un changement de tutoiement/vouvoiement, **clarifier explicitement avec l'utilisateur** lequel est définitif avant de relancer une passe complète, pour éviter un nouvel aller-retour.
10. Stripe Payment Links → Checkout Sessions : mis en pause sur décision explicite de l'utilisateur, ne pas relancer sans confirmation.
