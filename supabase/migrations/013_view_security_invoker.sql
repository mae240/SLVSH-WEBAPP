-- ============================================================
-- Views auf security_invoker umstellen + UPDATE-Policy dicht machen
-- ============================================================
-- Problem 1: Postgres-Views laufen per Default mit den Rechten des
-- View-Owners (postgres), nicht des aufrufenden Users. Dadurch
-- umgehen scored_predictions / leaderboard_totals / leaderboard_by_round
-- die RLS-Policies der Basistabellen komplett (Supabase-Linter:
-- "security_definer_view"): jeder eingeloggte User konnte ueber
-- scored_predictions die Tipps ALLER User sehen, auch in offenen,
-- noch nicht gesperrten Runden — obwohl die SELECT-Policy auf
-- predictions (008) fremde Tipps erst nach dem Lock freigibt.
--
-- Fix: security_invoker = true, damit die Views mit den Rechten
-- (und RLS-Policies) des aufrufenden Users laufen.
--
-- Datenpfad-Analyse (bricht dadurch nichts fuer legitime User):
-- * predictions-SELECT-Policy (008): eigene Zeilen immer sichtbar,
--   fremde erst wenn r.is_locked = true, Admins sehen alles.
--   → "Meine Tipps" in offenen Runden (RoundPage/MatchPredictionCard
--   via useScoredPredictions) funktioniert weiter, weil eigene
--   Predictions von der Policy nie gefiltert werden.
-- * matches / rounds / tournaments: SELECT fuer authenticated mit
--   USING (true) (001) — Join in scored_predictions unveraendert.
-- * profiles: SELECT fuer alle authenticated (009) — der
--   display_name-Join liefert weiter alle Namen.
-- * Leaderboards aggregieren nur noch sichtbare Zeilen. Punkte
--   (total_points > 0) gibt es erst bei m.is_finished, und Runden
--   werden bei Deadline automatisch gesperrt (auto_lock_expired_rounds)
--   bzw. vom Admin gelockt, bevor Ergebnisse eingetragen werden —
--   gewertete Predictions sind also fuer alle sichtbar. Einzige
--   theoretische Abweichung: wird ein Match in einer noch NICHT
--   gesperrten Runde als finished markiert, sehen andere User diese
--   Punkte erst nach dem Lock. Das entspricht genau dem gewollten
--   Sichtbarkeitsmodell (Tipps privat bis Lock).
-- * anon: alle predictions-Policies gelten TO authenticated, die App
--   fragt die Views nur eingeloggt ab — anon sieht leere Views statt
--   (wie bisher) alles. Gewollt.

ALTER VIEW scored_predictions SET (security_invoker = true);
ALTER VIEW leaderboard_totals SET (security_invoker = true);
ALTER VIEW leaderboard_by_round SET (security_invoker = true);

-- ============================================================
-- Problem 2: Die UPDATE-Policy auf predictions (zuletzt 010) prueft
-- die Rundenbedingungen (offen, nicht gesperrt, Deadline nicht
-- abgelaufen) nur im USING — also nur fuer die ALTE Zeile. WITH CHECK
-- prueft lediglich user_id. Per API laesst sich damit eine bestehende
-- Prediction einer offenen Runde auf round_id/match_id einer bereits
-- gesperrten Runde umbiegen (nachtraegliches Tippen nach Deadline).
--
-- Fix: WITH CHECK prueft dieselben Rundenbedingungen wie USING,
-- bezogen auf die NEUE Zeile (inkl. Optional-Deadline-Handling aus 010).

DROP POLICY "predictions: update own before deadline" ON predictions;

CREATE POLICY "predictions: update own before deadline"
  ON predictions FOR UPDATE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_id
        AND r.is_open = true
        AND r.is_locked = false
        AND (r.deadline_at IS NULL OR r.deadline_at > now())
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_id
        AND r.is_open = true
        AND r.is_locked = false
        AND (r.deadline_at IS NULL OR r.deadline_at > now())
    )
  );
