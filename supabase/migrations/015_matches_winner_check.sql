-- ============================================================
-- matches.winner gegen die beiden Spieler der Zeile constrainen
-- ============================================================
-- winner war freier Text ohne Einschraenkung. Ein Write mit Tippfehler
-- oder fremdem Namen ging durch — und die Scoring-Views vergleichen
-- predicted_winner = winner: ein invalider winner ergibt still 0 Punkte
-- fuer alle Tipps des Matches. winner_letters hatte seinen CHECK von
-- Anfang an, winner selbst nicht.

ALTER TABLE matches
  ADD CONSTRAINT matches_winner_valid
  CHECK (winner IS NULL OR winner IN (player_a, player_b));
