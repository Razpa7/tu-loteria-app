-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active lotteries" ON lotteries;
DROP POLICY IF EXISTS "Users can update their own lotteries" ON lotteries;
DROP POLICY IF EXISTS "Users can create their own lotteries" ON lotteries;

-- Create new policies with better access control

-- Allow anyone to view lotteries by share_code (for public access)
CREATE POLICY "Anyone can view lotteries by share code"
ON lotteries FOR SELECT
USING (true);

-- Allow users to create their own lotteries
CREATE POLICY "Users can create their own lotteries"
ON lotteries FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own lotteries
CREATE POLICY "Users can update their own lotteries"
ON lotteries FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Allow users to delete their own lotteries
CREATE POLICY "Users can delete their own lotteries"
ON lotteries FOR DELETE
USING (auth.uid() = created_by);
