-- Allow all authenticated users to read all profiles
-- Needed because non-admins viewing locked rounds need to see
-- other users' display_names via the predictions join
DROP POLICY "profiles: read own or admin" ON profiles;

CREATE POLICY "profiles: authenticated can view"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
