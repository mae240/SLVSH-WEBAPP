-- ============================================================
-- Reveal predictions after deadline passes (no pg_cron needed)
-- Treat deadline_at <= now() as effectively locked for visibility
-- ============================================================

DROP POLICY "predictions: select visibility" ON predictions;

CREATE POLICY "predictions: select visibility"
  ON predictions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_id
        AND (r.is_locked = true OR (r.deadline_at IS NOT NULL AND r.deadline_at <= now()))
    )
  );
