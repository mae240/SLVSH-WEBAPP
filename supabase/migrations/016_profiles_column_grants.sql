-- ============================================================
-- profiles: email/is_admin nicht mehr fuer alle User lesbar
-- ============================================================
-- 009 oeffnete SELECT auf profiles fuer alle authenticated (USING true) —
-- noetig, damit Leaderboards/Predictions fremde display_names zeigen.
-- Nebenwirkung: jeder User konnte email und is_admin ALLER User lesen,
-- denn RLS filtert Zeilen, keine Spalten.
--
-- Fix auf der Spalten-Ebene: authenticated behaelt den Zeilenzugriff
-- (Policy aus 009 bleibt), verliert aber den Tabellen-SELECT und bekommt
-- ihn nur fuer die unkritischen Spalten zurueck. Die security_invoker-Views
-- (013) lesen nur display_name und funktionieren weiter.
--
-- Das eigene is_admin-Flag holt der Client ueber die bestehende
-- SECURITY-DEFINER-Funktion is_admin() (001/012) — die laeuft als Owner
-- und ist von den Spalten-Grants nicht betroffen. email braucht der
-- Client nirgends (Login-E-Mail ist synthetisch <username>@slvsh.local).
-- service_role behaelt ALL (014) fuer Seed/Admin-Pfad.

REVOKE SELECT ON TABLE profiles FROM authenticated;
GRANT SELECT (id, display_name, created_at) ON TABLE profiles TO authenticated;
