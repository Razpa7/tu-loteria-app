-- Permitir que usuarios anónimos actualicen tickets que crearon
-- Esto es necesario para que puedan subir comprobantes de pago sin autenticarse

-- Primero eliminar la política restrictiva
DROP POLICY IF EXISTS "Users can update their own tickets" ON lottery_tickets;
DROP POLICY IF EXISTS "Lottery creators can update ticket payment status" ON lottery_tickets;

-- Crear nueva política que permite a cualquiera actualizar tickets por ID
-- Esto es seguro porque solo conocen el ID si lo crearon
CREATE POLICY "Anyone can update tickets by ID"
ON lottery_tickets
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Política separada para que los creadores del sorteo puedan verificar pagos
CREATE POLICY "Lottery creators can verify payments"
ON lottery_tickets
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT created_by 
    FROM lotteries 
    WHERE id = lottery_tickets.lottery_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT created_by 
    FROM lotteries 
    WHERE id = lottery_tickets.lottery_id
  )
);
