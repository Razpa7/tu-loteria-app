-- Agregar campo de teléfono a los tickets
ALTER TABLE lottery_tickets 
ADD COLUMN IF NOT EXISTS participant_phone text;

-- Actualizar el comentario de la tabla
COMMENT ON COLUMN lottery_tickets.participant_phone IS 'Número de teléfono del participante';
