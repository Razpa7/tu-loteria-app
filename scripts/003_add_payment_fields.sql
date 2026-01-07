-- Agregar campos de cuenta bancaria/alias a la tabla lotteries
ALTER TABLE lotteries
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS bank_alias TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- Agregar campos de comprobante a lottery_tickets
ALTER TABLE lottery_tickets
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT,
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_rejection_reason TEXT;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_payment_status ON lottery_tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery_id ON lottery_tickets(lottery_id);

-- Actualizar políticas RLS para permitir al creador ver todos los tickets de su sorteo
CREATE POLICY "Lottery creators can view all tickets for their lotteries"
  ON lottery_tickets FOR SELECT
  USING (
    lottery_id IN (
      SELECT id FROM lotteries WHERE created_by = auth.uid()
    )
  );

-- Permitir al creador actualizar el estado de pago de los tickets de su sorteo
CREATE POLICY "Lottery creators can update ticket payment status"
  ON lottery_tickets FOR UPDATE
  USING (
    lottery_id IN (
      SELECT id FROM lotteries WHERE created_by = auth.uid()
    )
  );
