-- ============================================================
-- Security hardening for the profiles RLS model
-- ============================================================
-- Problem: the "profiles: update own" policy (001) only checks
-- id = auth.uid() with no column restriction. Since is_admin()
-- reads profiles.is_admin, any authenticated user could run
--   update profiles set is_admin = true where id = auth.uid()
-- and self-promote to admin. This locks that door and hardens the
-- SECURITY DEFINER helpers.

-- ── 1. Prevent privilege escalation on profiles ────────────
-- A BEFORE UPDATE/INSERT trigger blocks normal app clients
-- (roles anon / authenticated) from setting or changing is_admin.
-- service_role (BYPASSRLS) and DB admins provision admins as before.

create or replace function prevent_is_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' and coalesce(new.is_admin, false) is distinct from false then
      raise exception 'setting is_admin is not permitted';
    elsif tg_op = 'UPDATE' and new.is_admin is distinct from old.is_admin then
      raise exception 'changing is_admin is not permitted';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_is_admin_change on profiles;
create trigger profiles_prevent_is_admin_change
  before insert or update on profiles
  for each row execute function prevent_is_admin_change();

-- ── 2. Tighten the profiles INSERT policy ──────────────────
-- 004 used WITH CHECK (true) for every role. The handle_new_user
-- trigger is SECURITY DEFINER and service_role bypasses RLS, so
-- clients only ever need to insert their own row (never for others).

drop policy if exists "profiles: service insert" on profiles;
create policy "profiles: self insert"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ── 3. Harden SECURITY DEFINER helpers with search_path ────
-- Pin search_path so a hostile object on an attacker-controlled
-- schema can't shadow referenced tables/functions.

create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid()),
    false
  );
$$;

create or replace function auto_lock_expired_rounds()
returns void
language sql
security definer
set search_path = public
as $$
  update rounds
  set is_locked = true
  where is_locked = false
    and deadline_at is not null
    and deadline_at <= now();
$$;
