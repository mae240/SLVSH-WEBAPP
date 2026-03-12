-- ============================================================
-- Add is_open column to rounds for admin release workflow
-- ============================================================

-- Add column (new rounds default to closed)
ALTER TABLE rounds ADD COLUMN is_open boolean NOT NULL DEFAULT false;

-- Existing rounds were already active → set them open
UPDATE rounds SET is_open = true;

-- ── Update prediction RLS policies to require is_open ──

-- Drop old insert/update/delete policies for normal users
DROP POLICY "predictions: insert own before deadline" ON predictions;
DROP POLICY "predictions: update own before deadline" ON predictions;
DROP POLICY "predictions: delete own before deadline" ON predictions;

-- Also update select visibility: others' predictions only visible when locked (not just past deadline)
DROP POLICY "predictions: select visibility" ON predictions;

-- Recreate: insert own prediction (requires is_open + before deadline + not locked)
CREATE POLICY "predictions: insert own before deadline"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_id
        AND r.is_open = true
        AND r.deadline_at > now()
        AND r.is_locked = false
    )
  );

-- Recreate: update own prediction (same conditions)
CREATE POLICY "predictions: update own before deadline"
  ON predictions FOR UPDATE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_id
        AND r.is_open = true
        AND r.deadline_at > now()
        AND r.is_locked = false
    )
  )
  WITH CHECK (user_id = auth.uid());

-- Recreate: delete own prediction (same conditions)
CREATE POLICY "predictions: delete own before deadline"
  ON predictions FOR DELETE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_id
        AND r.is_open = true
        AND r.deadline_at > now()
        AND r.is_locked = false
    )
  );

-- Recreate: select visibility
-- Own predictions always visible; others only when round is locked; admins see all
CREATE POLICY "predictions: select visibility"
  ON predictions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_id
        AND r.is_locked = true
    )
  );
