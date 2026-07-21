-- ============================================================
-- Explizite Schema-Grants statt Plattform-Defaults
-- ============================================================
-- Problem: Keine Migration enthielt bisher ein einziges GRANT — das
-- Schema verliess sich darauf, dass Supabase passende Default-Privileges
-- fuer anon/authenticated/service_role mitbringt. Auf gehosteten
-- Projekten stimmt das; auf einer frischen lokalen Instanz
-- (supabase db reset) fehlten die Grants und schon das Seed-Skript
-- scheiterte mit "permission denied for table tournaments".
--
-- Fix: Grants explizit und gestuft setzen. Wichtig fuers Modell:
-- Grants sind die GROBE Objekt-Schicht; die Zeilen-Ebene regelt
-- weiterhin ausschliesslich RLS (alle Tabellen haben RLS enabled,
-- Policies TO authenticated; Views laufen seit 013 als
-- security_invoker). Ein GRANT an authenticated oeffnet also keine
-- fremden Zeilen — ohne passende Policy bleibt das Ergebnis leer
-- bzw. der Schreibzugriff verboten.
--
-- Gestuft:
-- * service_role  — ALL. Umgeht RLS by design (Admin-/Seed-Pfad,
--   laeuft nie im Client).
-- * authenticated — CRUD auf den Tabellen, SELECT auf den Views.
--   Jede Operation wird von den RLS-Policies gefiltert.
-- * anon          — bewusst KEIN Grant. Alle Policies sind
--   TO authenticated; die App fragt Daten erst nach dem Login ab.
--
-- Rein additiv: keine REVOKEs. Auf Instanzen, die die Rechte ueber
-- Default-Privileges bereits haben (z. B. die Live-Instanz), ist
-- diese Migration ein No-op.

GRANT USAGE ON SCHEMA public TO authenticated, service_role;

GRANT ALL ON TABLE profiles, tournaments, rounds, matches, predictions
  TO service_role;
GRANT ALL ON TABLE scored_predictions, leaderboard_totals, leaderboard_by_round
  TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE profiles, tournaments, rounds, matches, predictions
  TO authenticated;
GRANT SELECT
  ON TABLE scored_predictions, leaderboard_totals, leaderboard_by_round
  TO authenticated;
