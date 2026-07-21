-- ============================================================
-- match_id/round_id/tournament_id strukturell koppeln
-- ============================================================
-- Die INSERT/UPDATE-Policies auf predictions pruefen Deadline und
-- Lock ueber die VOM CLIENT gelieferte round_id — nichts erzwang
-- bisher, dass match_id tatsaechlich zu dieser Runde gehoert.
-- Angriffspfad: Sobald in einer gelockten Runde Ergebnisse
-- eingetragen sind (matches ist fuer authenticated lesbar, inkl.
-- winner), insertet ein User eine Prediction mit der match_id des
-- entschiedenen Matches und der round_id irgendeiner noch offenen
-- Runde. Die Policy prueft nur die offene Runde und winkt durch;
-- die Scoring-Views joinen ausschliesslich ueber match_id —
-- garantierte Punkte nach Abpfiff. Analog liessen sich Punkte via
-- fremder round_id/tournament_id in beliebige Leaderboard-
-- Partitionen buchen.
--
-- Fix auf Schema-Ebene statt in jeder Policy: Composite-FKs
-- erzwingen die Kette predictions -> matches -> rounds. Damit ist
-- die client-gelieferte round_id/tournament_id per Konstruktion
-- die des Matches, und die bestehenden Policies pruefen wieder
-- genau die Runde, zu der der Tipp gehoert.

-- Backfill: bestehende inkonsistente Zeilen auf die Werte des
-- referenzierten Matches bzw. der Runde ziehen (idempotent, no-op
-- auf konsistenten Daten).
UPDATE matches m
SET    tournament_id = r.tournament_id
FROM   rounds r
WHERE  r.id = m.round_id
  AND  m.tournament_id <> r.tournament_id;

UPDATE predictions p
SET    round_id      = m.round_id,
       tournament_id = m.tournament_id
FROM   matches m
WHERE  m.id = p.match_id
  AND  (p.round_id <> m.round_id OR p.tournament_id <> m.tournament_id);

-- matches ist in sich konsistent: round_id gehoert zum tournament.
ALTER TABLE rounds
  ADD CONSTRAINT rounds_id_tournament_unique UNIQUE (id, tournament_id);

ALTER TABLE matches
  ADD CONSTRAINT matches_round_tournament_fk
  FOREIGN KEY (round_id, tournament_id)
  REFERENCES rounds (id, tournament_id) ON DELETE CASCADE;

-- predictions ist an das Match gekoppelt: round_id und
-- tournament_id sind zwingend die des Matches.
ALTER TABLE matches
  ADD CONSTRAINT matches_id_round_tournament_unique
  UNIQUE (id, round_id, tournament_id);

ALTER TABLE predictions
  ADD CONSTRAINT predictions_match_round_tournament_fk
  FOREIGN KEY (match_id, round_id, tournament_id)
  REFERENCES matches (id, round_id, tournament_id) ON DELETE CASCADE;
