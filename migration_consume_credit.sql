-- Recree (idempotent) le debit atomique d'un credit + ses droits.
-- A executer dans Supabase -> SQL Editor si /api/analyze repond
-- "Impossible de finaliser l'analyse" (le debit RPC echoue).

alter table public.profiles add column if not exists credits integer not null default 3;
alter table public.profiles add column if not exists credits_gauge_max integer not null default 3;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create or replace function public.consume_credit(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'consume_credit: non autorise pour cet utilisateur';
  end if;

  update public.profiles
  set credits = credits - 1,
      updated_at = now()
  where id = p_user_id
    and credits > 0
  returning credits into v_new_balance;

  return v_new_balance;
end;
$$;

revoke all on function public.consume_credit(uuid) from public;
grant execute on function public.consume_credit(uuid) to authenticated;

-- Force PostgREST a recharger son cache de schema (fonction "introuvable").
notify pgrst, 'reload schema';
