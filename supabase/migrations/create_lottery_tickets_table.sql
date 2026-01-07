-- Crear tabla lottery_tickets para almacenar los tickets vendidos de una lotería
CREATE TABLE IF NOT EXISTS public.lottery_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id UUID NOT NULL REFERENCES public.lotteries(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255),
  participant_phone VARCHAR(20),
  ticket_number INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
  payment_method VARCHAR(50), -- bank_transfer, cash, etc
  payment_reference VARCHAR(255), -- reference number or transaction ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lottery_id, ticket_number)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery_id ON public.lottery_tickets(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_payment_status ON public.lottery_tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_created_at ON public.lottery_tickets(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Permitir que el usuario creador de la lotería vea todos sus tickets
CREATE POLICY "Lottery creator can view their lottery tickets"
  ON public.lottery_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lotteries
      WHERE lotteries.id = lottery_tickets.lottery_id
      AND lotteries.created_by = auth.uid()
    )
  );

-- Permitir que todos vean los tickets (para sitios públicos)
CREATE POLICY "Anyone can view lottery tickets"
  ON public.lottery_tickets
  FOR SELECT
  USING (TRUE);

-- Permitir que el creador inserte tickets
CREATE POLICY "Lottery creator can insert tickets"
  ON public.lottery_tickets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lotteries
      WHERE lotteries.id = lottery_tickets.lottery_id
      AND lotteries.created_by = auth.uid()
    )
  );

-- Permitir que el creador actualice tickets
CREATE POLICY "Lottery creator can update tickets"
  ON public.lottery_tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lotteries
      WHERE lotteries.id = lottery_tickets.lottery_id
      AND lotteries.created_by = auth.uid()
    )
  );

-- Permitir que el creador elimine tickets
CREATE POLICY "Lottery creator can delete tickets"
  ON public.lottery_tickets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lotteries
      WHERE lotteries.id = lottery_tickets.lottery_id
      AND lotteries.created_by = auth.uid()
    )
  );
