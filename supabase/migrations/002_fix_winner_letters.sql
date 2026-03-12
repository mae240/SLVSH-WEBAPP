-- Rename loser_letters → winner_letters
-- In SLVSH: the winner accumulates letters (S, SL, SLV, SLVS)
-- The loser always ends at SLVSH — so the variable field is the winner's letters

alter table matches
  rename column loser_letters to winner_letters;

alter table predictions
  rename column predicted_letters to predicted_winner_letters;

-- Re-create views with corrected column names

drop view if exists leaderboard_by_round;
drop view if exists leaderboard_totals;
drop view if exists scored_predictions;

create or replace view scored_predictions as
select
  p.id,
  p.user_id,
  p.tournament_id,
  p.round_id,
  p.match_id,
  p.predicted_winner,
  p.predicted_winner_letters,
  m.winner,
  m.winner_letters,
  m.is_finished,
  pr.display_name as user_display_name,
  case when m.is_finished and p.predicted_winner = m.winner then 1 else 0 end as winner_points,
  case when m.is_finished and p.predicted_winner_letters = m.winner_letters then 2 else 0 end as letters_points,
  case when m.is_finished then
    (case when p.predicted_winner = m.winner then 1 else 0 end) +
    (case when p.predicted_winner_letters = m.winner_letters then 2 else 0 end)
  else 0 end as total_points
from predictions p
join matches m on m.id = p.match_id
join profiles pr on pr.id = p.user_id;

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
