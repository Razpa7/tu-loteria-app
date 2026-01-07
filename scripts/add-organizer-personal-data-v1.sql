-- Add personal data columns to profiles table for organizers
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comment to document the purpose
COMMENT ON COLUMN profiles.full_name IS 'Nombre completo del usuario/organizador del sorteo';
COMMENT ON COLUMN profiles.phone IS 'Teléfono del usuario/organizador del sorteo';
