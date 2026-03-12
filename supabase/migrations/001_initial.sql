-- ============================================================
-- SLVSH Bets — Initial Schema
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email        text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

create table tournaments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  status      text not null default 'draft' check (status in ('draft', 'active', 'finished')),
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now()
);

create table rounds (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name          text not null,
  round_order   integer not null,
  deadline_at   timestamptz not null,
  is_locked     boolean not null default false,
  created_at    timestamptz not null default now()
);

create table matches (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round_id      uuid not null references rounds(id) on delete cascade,
  match_number  integer not null,
  player_a      text not null,
  player_b      text not null,
  winner        text,
  winner_letters text check (winner_letters in ('S', 'SL', 'SLV', 'SLVS')),
  is_finished   boolean not null default false,
  created_at    timestamptz not null default now()
);

create table predictions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  tournament_id    uuid not null references tournaments(id) on delete cascade,
  round_id         uuid not null references rounds(id) on delete cascade,
  match_id         uuid not null references matches(id) on delete cascade,
  predicted_winner text not null,
  predicted_winner_letters text not null check (predicted_winner_letters in ('S', 'SL', 'SLV', 'SLVS')),
  submitted_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────

create index on rounds (tournament_id, round_order);
create index on matches (round_id, match_number);
create index on predictions (match_id);
create index on predictions (user_id);
create index on predictions (round_id);

-- ────────────────────────────────────────────────────────────
-- TRIGGER: auto-update predictions.updated_at
-- ────────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger predictions_updated_at
  before update on predictions
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- TRIGGER: auto-create profile on signup
-- ────────────────────────────────────────────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ────────────────────────────────────────────────────────────
-- VIEWS
-- ────────────────────────────────────────────────────────────

-- Scored predictions: points per prediction
create or replace view scored_predictions as
select
  p.id,
  p.user_id,
  p.tournament_id,
  p.round_id,
  p.match_id,
  p.predicted_winner,
  p.predicted_letters,
  m.winner,
  m.loser_letters,
  m.is_finished,
  pr.display_name as user_display_name,
  case when m.is_finished and p.predicted_winner = m.winner then 1 else 0 end as winner_points,
  case when m.is_finished and p.predicted_letters = m.loser_letters then 2 else 0 end as letters_points,
  case when m.is_finished then
    (case when p.predicted_winner = m.winner then 1 else 0 end) +
    (case when p.predicted_letters = m.loser_letters then 2 else 0 end)
  else 0 end as total_points
from predictions p
join matches m on m.id = p.match_id
join profiles pr on pr.id = p.user_id;

-- Leaderboard totals per tournament
create or replace view leaderboard_totals as
select
  sp.user_id,
  sp.tournament_id,
  sp.user_display_name,
  sum(sp.total_points) as total_points,
  count(*) filter (where sp.is_finished) as matches_scored,
  rank() over (partition by sp.tournament_id order by sum(sp.total_points) desc) as rank
from scored_predictions sp
group by sp.user_id, sp.tournament_id, sp.user_display_name;

-- Leaderboard per round
create or replace view leaderboard_by_round as
select
  sp.user_id,
  sp.tournament_id,
  sp.round_id,
  sp.user_display_name,
  sum(sp.total_points) as total_points,
  count(*) filter (where sp.is_finished) as matches_scored,
  rank() over (partition by sp.round_id order by sum(sp.total_points) desc) as rank
from scored_predictions sp
group by sp.user_id, sp.tournament_id, sp.round_id, sp.user_display_name;

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table profiles    enable row level security;
alter table tournaments enable row level security;
alter table rounds      enable row level security;
alter table matches     enable row level security;
alter table predictions enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid()),
    false
  );
$$;

-- ── profiles ──────────────────────────────────────────────

-- Users can read their own profile; admins can read all
create policy "profiles: read own or admin"
  on profiles for select
  using (id = auth.uid() or is_admin());

-- Users can update their own profile
create policy "profiles: update own"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── tournaments ──────────────────────────────────────────

-- Authenticated users can view tournaments
create policy "tournaments: authenticated can view"
  on tournaments for select
  to authenticated
  using (true);

-- Admins can insert/update/delete
create policy "tournaments: admin manage"
  on tournaments for all
  using (is_admin())
  with check (is_admin());

-- ── rounds ───────────────────────────────────────────────

create policy "rounds: authenticated can view"
  on rounds for select
  to authenticated
  using (true);

create policy "rounds: admin manage"
  on rounds for all
  using (is_admin())
  with check (is_admin());

-- ── matches ──────────────────────────────────────────────

create policy "matches: authenticated can view"
  on matches for select
  to authenticated
  using (true);

create policy "matches: admin manage"
  on matches for all
  using (is_admin())
  with check (is_admin());

-- ── predictions ──────────────────────────────────────────

-- Users can insert their own predictions (only before deadline and not locked)
create policy "predictions: insert own before deadline"
  on predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from rounds r
      where r.id = round_id
        and r.deadline_at > now()
        and r.is_locked = false
    )
  );

-- Users can update their own predictions (only before deadline and not locked)
create policy "predictions: update own before deadline"
  on predictions for update
  using (
    user_id = auth.uid()
    and exists (
      select 1 from rounds r
      where r.id = round_id
        and r.deadline_at > now()
        and r.is_locked = false
    )
  )
  with check (user_id = auth.uid());

-- Visibility: users see their own always; others' only after deadline/locked; admins see all
create policy "predictions: select visibility"
  on predictions for select
  to authenticated
  using (
    user_id = auth.uid()
    or is_admin()
    or exists (
      select 1 from rounds r
      where r.id = round_id
        and (r.deadline_at <= now() or r.is_locked = true)
    )
  );

-- Admins can update predictions (for corrections)
create policy "predictions: admin update"
  on predictions for update
  using (is_admin())
  with check (is_admin());

-- Users can delete their own predictions before deadline
create policy "predictions: delete own before deadline"
  on predictions for delete
  using (
    user_id = auth.uid()
    and exists (
      select 1 from rounds r
      where r.id = round_id
        and r.deadline_at > now()
        and r.is_locked = false
    )
  );
