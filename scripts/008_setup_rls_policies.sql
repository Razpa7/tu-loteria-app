-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA 'profiles'
CREATE POLICY "Los usuarios pueden ver su propio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- POLÍTICAS PARA 'lotteries'
CREATE POLICY "Cualquiera puede ver sorteos activos"
ON public.lotteries FOR SELECT
USING (status = 'active' OR auth.uid() = created_by);

CREATE POLICY "Usuarios autenticados pueden crear sorteos"
ON public.lotteries FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creadores pueden actualizar sus sorteos"
ON public.lotteries FOR UPDATE
USING (auth.uid() = created_by);

-- POLÍTICAS PARA 'participations' (Anteriormente lottery_tickets)
CREATE POLICY "Cualquiera puede ver participaciones de sorteos activos"
ON public.participations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lotteries 
    WHERE id = lottery_id AND (status = 'active' OR auth.uid() = created_by)
  )
);

CREATE POLICY "Cualquiera puede registrar una participación"
ON public.participations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar sus participaciones (subir comprobante)"
ON public.participations FOR UPDATE
USING (true)
WITH CHECK (true);

-- POLÍTICAS PARA 'winners'
CREATE POLICY "Cualquiera puede ver los ganadores"
ON public.winners FOR SELECT
USING (true);

CREATE POLICY "Solo el sistema o creador puede insertar ganadores"
ON public.winners FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lotteries 
    WHERE id = lottery_id AND auth.uid() = created_by
  )
);
