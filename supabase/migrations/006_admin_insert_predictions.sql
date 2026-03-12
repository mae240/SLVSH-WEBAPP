-- Allow admins to insert predictions for any user (for corrections)
CREATE POLICY "predictions: admin insert"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());
