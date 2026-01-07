-- Tabla para los sorteos creados por usuarios
CREATE TABLE IF NOT EXISTS public.lotteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_title TEXT NOT NULL,
  prize_images TEXT[], -- URLs de las imágenes del premio
  draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL,
  share_code TEXT UNIQUE NOT NULL, -- Código único para compartir
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  winner_number TEXT,
  winner_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para las participaciones en sorteos
CREATE TABLE IF NOT EXISTS public.lottery_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id UUID NOT NULL REFERENCES public.lotteries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  selected_number TEXT NOT NULL, -- 01-99
  participant_name TEXT,
  participant_email TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, confirmed
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lottery_id, selected_number)
);

-- Tabla para notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lottery_id UUID REFERENCES public.lotteries(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- lottery_created, ticket_purchased, lottery_drawn, winner_announced
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_lotteries_share_code ON public.lotteries(share_code);
CREATE INDEX IF NOT EXISTS idx_lotteries_status ON public.lotteries(status);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery_id ON public.lottery_tickets(lottery_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- RLS Policies para lotteries
ALTER TABLE public.lotteries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active lotteries"
  ON public.lotteries FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own lotteries"
  ON public.lotteries FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own lotteries"
  ON public.lotteries FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies para lottery_tickets
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tickets for active lotteries"
  ON public.lottery_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lotteries 
      WHERE id = lottery_id AND status = 'active'
    )
  );

CREATE POLICY "Anyone can insert tickets"
  ON public.lottery_tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own tickets"
  ON public.lottery_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
