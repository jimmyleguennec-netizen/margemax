-- ============================================================
-- MARGEMAX - Historique des analyses AliExpress persisté par compte
-- A exécuter UNE FOIS dans Supabase SQL Editor (non destructif : n'ajoute
-- que des colonnes optionnelles à la table public.search_history déjà
-- existante, ne supprime ni ne modifie aucune donnée).
--
-- Pourquoi : public.search_history existait déjà (query/result_count/
-- status/user_id/created_at) mais ne stockait pas de quoi reconstruire
-- une carte d'historique utile (titre, lien, coûts, statut de
-- complétude) -- le tableau de bord ("Historique") ne persistait donc
-- ses entrées qu'en mémoire côté navigateur (perdues au rechargement).
-- Tant que cette migration n'est pas exécutée, l'API /api/history se
-- dégrade proprement (voir app/api/history/route.ts) : l'historique reste
-- limité à la session en cours, avec un avertissement explicite affiché
-- à l'utilisateur -- jamais une erreur silencieuse.
-- ============================================================

alter table public.search_history add column if not exists title text;
alter table public.search_history add column if not exists product_url text;
alter table public.search_history add column if not exists subtotal numeric;
alter table public.search_history add column if not exists shipping numeric;
alter table public.search_history add column if not exists shipping_status text;
alter table public.search_history add column if not exists import_fee numeric;
alter table public.search_history add column if not exists import_fee_status text;
alter table public.search_history add column if not exists variant_status text;
-- total REEL, uniquement quand shipping/import_fee/variant sont tous
-- confirmes -- jamais un champ manquant remplace par 0 dans cette colonne
-- (voir lib/aliexpress-search.ts, AliExpressSearchResult.total). NULL est
-- une valeur legitime et attendue ici, pas une erreur.
alter table public.search_history add column if not exists total numeric;
-- cout partiel TOUJOURS calculable (frais inconnus comptes pour 0 dans CE
-- calcul uniquement) -- jamais affiche comme "Coût total" cote UI.
alter table public.search_history add column if not exists partial_total numeric;
alter table public.search_history add column if not exists is_complete boolean;
alter table public.search_history add column if not exists currency text;
