-- Allow the handle_new_user trigger to insert profiles
-- The trigger runs as SECURITY DEFINER but we need a policy for service_role inserts too

CREATE POLICY "profiles: service insert"
  ON profiles FOR INSERT
  WITH CHECK (true);
