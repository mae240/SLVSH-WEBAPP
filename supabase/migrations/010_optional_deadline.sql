-- ============================================================
-- Make deadline_at optional on rounds
-- NULL = no deadline, predictions allowed as long as is_open + !is_locked
-- ============================================================

ALTER TABLE rounds ALTER COLUMN deadline_at DROP NOT NULL;

-- ── Update prediction RLS policies to handle NULL deadline ──

DROP POLICY "predictions: insert own before deadline" ON predictions;
DROP POLICY "predictions: update own before deadline" ON predictions;
DROP POLICY "predictions: delete own before deadline" ON predictions;

-- Insert: is_open + not locked + (no deadline OR deadline not passed)
CREATE POLICY "predictions: insert own before deadline"
  ON predictions FOR INSERT
  TO authenticated
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

-- Update: same conditions
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
  WITH CHECK (user_id = auth.uid());

-- Delete: same conditions
CREATE POLICY "predictions: delete own before deadline"
  ON predictions FOR DELETE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_id
        AND r.is_open = true
        AND r.is_locked = false
        AND (r.deadline_at IS NULL OR r.deadline_at > now())
    )
  );
