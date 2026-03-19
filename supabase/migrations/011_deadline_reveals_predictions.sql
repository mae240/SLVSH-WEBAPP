-- ============================================================
-- Auto-lock rounds when deadline passes (callable by any user)
-- SECURITY DEFINER bypasses RLS so non-admins can trigger it
-- ============================================================

CREATE OR REPLACE FUNCTION auto_lock_expired_rounds()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE rounds
  SET is_locked = true
  WHERE is_locked = false
    AND deadline_at IS NOT NULL
    AND deadline_at <= now();
$$;
