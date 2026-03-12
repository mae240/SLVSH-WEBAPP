-- Allow winner to have 0 letters (5-0 win)
-- NULL in winner_letters/predicted_winner_letters means "keine Buchstaben"

-- matches: winner_letters is already nullable, just update the CHECK
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_winner_letters_check;
ALTER TABLE matches ADD CONSTRAINT matches_winner_letters_check
  CHECK (winner_letters IS NULL OR winner_letters IN ('S', 'SL', 'SLV', 'SLVS'));

-- predictions: make predicted_winner_letters nullable
ALTER TABLE predictions ALTER COLUMN predicted_winner_letters DROP NOT NULL;
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_predicted_winner_letters_check;
ALTER TABLE predictions ADD CONSTRAINT predictions_predicted_winner_letters_check
  CHECK (predicted_winner_letters IS NULL OR predicted_winner_letters IN ('S', 'SL', 'SLV', 'SLVS'));

-- Recreate scored_predictions view to handle NULL comparison
CREATE OR REPLACE VIEW scored_predictions AS
SELECT
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
  pr.display_name AS user_display_name,
  CASE WHEN m.is_finished AND p.predicted_winner = m.winner THEN 1 ELSE 0 END AS winner_points,
  CASE WHEN m.is_finished AND (
    (p.predicted_winner_letters IS NULL AND m.winner_letters IS NULL)
    OR p.predicted_winner_letters = m.winner_letters
  ) THEN 2 ELSE 0 END AS letters_points,
  CASE WHEN m.is_finished THEN
    (CASE WHEN p.predicted_winner = m.winner THEN 1 ELSE 0 END) +
    (CASE WHEN (p.predicted_winner_letters IS NULL AND m.winner_letters IS NULL)
          OR p.predicted_winner_letters = m.winner_letters THEN 2 ELSE 0 END)
  ELSE 0 END AS total_points
FROM predictions p
JOIN matches m ON m.id = p.match_id
JOIN profiles pr ON pr.id = p.user_id;

-- Recreate dependent views
CREATE OR REPLACE VIEW leaderboard_totals AS
SELECT
  sp.user_id,
  sp.tournament_id,
  sp.user_display_name,
  SUM(sp.total_points) AS total_points,
  COUNT(*) FILTER (WHERE sp.is_finished) AS matches_scored,
  RANK() OVER (PARTITION BY sp.tournament_id ORDER BY SUM(sp.total_points) DESC) AS rank
FROM scored_predictions sp
GROUP BY sp.user_id, sp.tournament_id, sp.user_display_name;

CREATE OR REPLACE VIEW leaderboard_by_round AS
SELECT
  sp.user_id,
  sp.tournament_id,
  sp.round_id,
  sp.user_display_name,
  SUM(sp.total_points) AS total_points,
  COUNT(*) FILTER (WHERE sp.is_finished) AS matches_scored,
  RANK() OVER (PARTITION BY sp.round_id ORDER BY SUM(sp.total_points) DESC) AS rank
FROM scored_predictions sp
GROUP BY sp.user_id, sp.tournament_id, sp.round_id, sp.user_display_name;
