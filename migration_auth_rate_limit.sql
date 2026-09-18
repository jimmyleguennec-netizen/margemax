-- ============================================================
-- MARGEMAX - MIGRATION NON DESTRUCTIVE
-- Rate limiting anti-bruteforce (connexion / inscription / reset mdp),
-- stocke en Postgres pour rester fiable en environnement serverless
-- (Vercel) ou aucune memoire de process n'est partagee entre invocations.
-- A executer UNE FOIS dans Supabase SQL Editor.
-- Ne supprime aucune table ni donnee existante.
-- ============================================================

create table if not exists public.auth_rate_limits (
    key text primary key,
    attempts integer not null default 1,
    window_started_at timestamptz not null default now(),
    locked_until timestamptz
);

-- RLS activee sans AUCUNE policy : cette table ne "appartient" a aucun
-- utilisateur individuel (des tentatives non authentifiees aussi, par IP)
-- -- seul le role service_role (qui contourne RLS), utilise exclusivement
-- par web/lib/rate-limit.ts via createAdminClient(), peut y acceder.
alter table public.auth_rate_limits enable row level security;

-- Verifie ET enregistre atomiquement une tentative pour p_key (ex.
-- "login:email:jimmy@...", "login:ip:203.0.113.4"). Retourne true si la
-- tentative est autorisee, false si la cle est bloquee. Une seule
-- instruction UPSERT pour eviter toute race condition entre requetes
-- concurrentes sur la meme cle (verrouillage de ligne Postgres).
create or replace function public.register_auth_attempt(
    p_key text,
    p_max_attempts integer,
    p_window_seconds integer,
    p_lock_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_now timestamptz := now();
    v_row public.auth_rate_limits;
begin
    insert into public.auth_rate_limits (key, attempts, window_started_at, locked_until)
    values (p_key, 1, v_now, null)
    on conflict (key) do update
        set attempts = case
                -- Deja verrouille : ne touche plus au compteur.
                when public.auth_rate_limits.locked_until is not null
                     and public.auth_rate_limits.locked_until > v_now
                    then public.auth_rate_limits.attempts
                -- Fenetre glissante expiree : redemarre a 1.
                when v_now - public.auth_rate_limits.window_started_at
                     > make_interval(secs => p_window_seconds)
                    then 1
                else public.auth_rate_limits.attempts + 1
            end,
            window_started_at = case
                when public.auth_rate_limits.locked_until is not null
                     and public.auth_rate_limits.locked_until > v_now
                    then public.auth_rate_limits.window_started_at
                when v_now - public.auth_rate_limits.window_started_at
                     > make_interval(secs => p_window_seconds)
                    then v_now
                else public.auth_rate_limits.window_started_at
            end
    returning * into v_row;

    if v_row.locked_until is not null and v_row.locked_until > v_now then
        return false;
    end if;

    if v_row.attempts > p_max_attempts then
        update public.auth_rate_limits
            set locked_until = v_now + make_interval(secs => p_lock_seconds)
            where key = p_key;
        return false;
    end if;

    return true;
end;
$$;

-- Reinitialise une cle (ex. apres une connexion reussie). Echec silencieux
-- accepte : un reset manque ne fait au pire que garder le compteur un peu
-- plus longtemps, jamais bloquer un utilisateur legitime a tort au-dela
-- de la fenetre normale.
create or replace function public.reset_auth_attempts(p_key text) returns void
language sql
security definer
set search_path = public
as $$
    delete from public.auth_rate_limits where key = p_key;
$$;
