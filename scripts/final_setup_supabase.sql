-- 1. RENOMBRAR TABLA (Para compatibilidad con el código)
ALTER TABLE IF EXISTS public.participations RENAME TO lottery_tickets;

-- 2. HABILITAR RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR POLÍTICAS EXISTENTES (Para evitar duplicados)
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Cualquiera puede ver sorteos activos" ON public.lotteries;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear sorteos" ON public.lotteries;
DROP POLICY IF EXISTS "Creadores pueden actualizar sus sorteos" ON public.lotteries;
DROP POLICY IF EXISTS "Cualquiera puede ver participaciones" ON public.lottery_tickets;
DROP POLICY IF EXISTS "Cualquiera puede registrar una participación" ON public.lottery_tickets;
DROP POLICY IF EXISTS "Actualización de participaciones" ON public.lottery_tickets;
DROP POLICY IF EXISTS "Cualquiera puede ver los ganadores" ON public.winners;

-- 4. CREAR NUEVAS POLÍTICAS

-- Perfiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Loterías
CREATE POLICY "Cualquiera puede ver sorteos activos" ON public.lotteries FOR SELECT USING (status = 'active' OR auth.uid() = created_by);
CREATE POLICY "Usuarios autenticados pueden crear sorteos" ON public.lotteries FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creadores pueden actualizar sus sorteos" ON public.lotteries FOR UPDATE USING (auth.uid() = created_by);

-- Tickets (Participaciones)
CREATE POLICY "Cualquiera puede ver participaciones" ON public.lottery_tickets FOR SELECT USING (true);
CREATE POLICY "Cualquiera puede registrar una participación" ON public.lottery_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización para subir comprobantes" ON public.lottery_tickets FOR UPDATE USING (true) WITH CHECK (true);

-- Ganadores
CREATE POLICY "Cualquiera puede ver los ganadores" ON public.winners FOR SELECT USING (true);
CREATE POLICY "Solo creadores pueden insertar ganadores" ON public.winners FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.lotteries WHERE id = lottery_id AND auth.uid() = created_by)
);
