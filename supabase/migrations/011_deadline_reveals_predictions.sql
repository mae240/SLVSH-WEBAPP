-- ============================================================
-- Auto-lock rounds when deadline passes + reveal predictions
-- ============================================================

-- 1) Function: lock all rounds whose deadline has passed
CREATE OR REPLACE FUNCTION auto_lock_expired_rounds()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE rounds
  SET is_locked = true
  WHERE is_locked = false
    AND deadline_at IS NOT NULL
    AND deadline_at <= now();
$$;

-- 2) Cron job: run every minute
SELECT cron.schedule(
  'auto-lock-expired-rounds',
  '* * * * *',
  $$ SELECT auto_lock_expired_rounds(); $$
);

-- 3) No change needed to SELECT visibility policy —
--    it already checks is_locked, which the cron job now sets automatically.
