-- Add customization columns to lotteries table
ALTER TABLE lotteries
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#ea580c',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#f5f5f5',
ADD COLUMN IF NOT EXISTS number_color TEXT DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS button_color TEXT DEFAULT '#ea580c';

-- Add comment
COMMENT ON COLUMN lotteries.theme_color IS 'Main theme color for the lottery page (hex)';
COMMENT ON COLUMN lotteries.background_color IS 'Background color for the lottery page (hex)';
COMMENT ON COLUMN lotteries.number_color IS 'Color for the number selection grid (hex)';
COMMENT ON COLUMN lotteries.button_color IS 'Color for the main action button (hex)';
