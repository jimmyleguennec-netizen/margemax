MARGEMAX — VERSION FINALE
==========================

CONTENU
-------
- app.py : application Streamlit complète
- assets/margemax_logo.png : logo officiel MargeMax
- .env : configuration Supabase + AliExpress déjà renseignée
- schema_margemax.sql : migration Supabase non destructive
- requirements.txt : dépendances Python
- run_local.bat : lancement Windows

DEMARRAGE
---------
1. Extraire le ZIP dans un nouveau dossier.
2. Si vos tables Supabase actuelles ne possèdent pas les colonnes plan/searches_used,
   exécuter UNE FOIS schema_margemax.sql dans Supabase SQL Editor.
3. Double-cliquer sur run_local.bat.

IMPORTANT AVANT COMMERCIALISATION
---------------------------------
1. L'application AliExpress est encore en statut TEST.
2. Le code OAuth reçu expire rapidement et n'est pas un Access Token.
   ALIEXPRESS_ACCESS_TOKEN reste donc vide tant que le vrai token n'a pas été délivré.
3. Les formules payantes sont déjà affichées et les droits sont codés,
   mais les boutons d'achat restent volontairement désactivés tant que les identifiants
   du prestataire de paiement ne sont pas ajoutés dans .env.
4. Les deux espaces publicitaires des utilisateurs Gratuit sont opérationnels comme
   emplacements internes. Remplir AD_TOP_HTML et AD_BOTTOM_HTML pour de vraies créations publicitaires.
5. Ne jamais publier le fichier .env dans un dépôt Git public.
6. Avant mise en production publique, faire tourner l'App Secret AliExpress puisqu'il a été exposé
   dans des captures et dans le processus de développement.

PLANS
-----
Gratuit : 0 € / 3 recherches / publicités
Pass Flash : 6,99 € / semaine / illimité 7 jours / sans publicité
Pro Mensuel : 14,99 € / mois / illimité + calculateur + historique/favoris
Pro Annuel : 49,99 € / an / illimité + export CSV + générateur fiche produit
