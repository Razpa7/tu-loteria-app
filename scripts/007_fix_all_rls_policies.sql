-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can update their own tickets" ON lottery_tickets;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;

-- Allow anyone to update lottery tickets (for receipt upload)
CREATE POLICY "Anyone can update tickets for receipt upload"
ON lottery_tickets FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow service role to insert notifications
CREATE POLICY "Service role can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Allow users to view their own notifications
CREATE POLICY "Users can view their notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);
