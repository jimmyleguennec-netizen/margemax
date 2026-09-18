-- ============================================================
-- STRIPE CUSTOMER ID -- necessaire pour le portail de facturation Stripe
-- (bouton "Gerer mes factures" du dashboard, onglet Mon compte).
-- A executer UNE FOIS dans Supabase SQL Editor. Non destructif.
-- ============================================================

alter table public.profiles
  add column if not exists stripe_customer_id text;

-- Un seul profil par client Stripe (empeche une incoherence si le meme
-- ID Stripe se retrouvait associe a deux comptes MargeMax par erreur).
-- Partiel (where non null) : de nombreux profils n'ont pas encore de
-- client Stripe (jamais achete de credits) et ne doivent pas entrer en
-- conflit entre eux sur une valeur NULL partagee.
create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- Le webhook (app/api/webhooks/stripe/route.ts) ecrit cette colonne via
-- la service_role key -- aucune policy RLS supplementaire necessaire,
-- "profiles_select_own" (deja en place) suffit pour que le client puisse
-- lire son propre stripe_customer_id si besoin.
