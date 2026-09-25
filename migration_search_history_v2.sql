-- ============================================================
-- MARGEMAX - Historique persistant : colonnes complementaires + RLS
-- A executer UNE FOIS dans Supabase -> SQL Editor (idempotent, non
-- destructif). Complete migration_search_history_details.sql : la table
-- public.search_history est la table d'historique (pas de doublon
-- "searches"). Correspondance avec les noms demandes :
--   product_title -> title      shipping_fee -> shipping
--   import_taxes  -> import_fee total_cost   -> total / partial_total
-- ============================================================

-- Colonnes de base (au cas ou la migration "details" n'aurait pas ete lancee).
alter table public.search_history add column if not exists title text;
alter table public.search_history add column if not exists product_url text;
alter table public.search_history add column if not exists subtotal numeric;
alter table public.search_history add column if not exists shipping numeric;
alter table public.search_history add column if not exists shipping_status text;
alter table public.search_history add column if not exists import_fee numeric;
alter table public.search_history add column if not exists import_fee_status text;
alter table public.search_history add column if not exists variant_status text;
alter table public.search_history add column if not exists total numeric;
alter table public.search_history add column if not exists partial_total numeric;
alter table public.search_history add column if not exists is_complete boolean;
alter table public.search_history add column if not exists currency text;

-- Nouveautes : image du produit + donnees de marge (prix bas/conseille/haut,
-- marges, comparaison de fournisseurs).
alter table public.search_history add column if not exists image_url text;
alter table public.search_history add column if not exists margin_data jsonb;

-- RLS : chaque utilisateur ne peut LIRE et INSERER que ses propres lignes.
alter table public.search_history enable row level security;

drop policy if exists "history_select_own" on public.search_history;
create policy "history_select_own" on public.search_history
for select using (auth.uid() = user_id);

drop policy if exists "history_insert_own" on public.search_history;
create policy "history_insert_own" on public.search_history
for insert with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
