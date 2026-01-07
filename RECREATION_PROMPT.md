# Prompt para Recrear "Tu Lotería" - Sistema Premium de Sorteos

## DESCRIPCIÓN GENERAL
Crea una aplicación web completa llamada "Tu Lotería" - un sistema premium de sorteos y rifas para personas que gestionan sorteos en redes sociales. La aplicación debe permitir a organizadores crear sorteos con números seleccionables, gestionar verificación de pagos, y realizar sorteos automáticos con notificaciones por email.

---

## STACK TECNOLÓGICO OBLIGATORIO

**Framework:** Next.js 16 (App Router)
**Base de datos:** Supabase (PostgreSQL)
**Autenticación:** Supabase Auth (email/password únicamente)
**Emails:** Resend
**Estilos:** Tailwind CSS v4 + shadcn/ui
**Lenguaje:** TypeScript

---

## ESTRUCTURA DE BASE DE DATOS (Supabase)

### Tabla: lotteries
\`\`\`sql
CREATE TABLE lotteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  prize_description TEXT,
  total_numbers INTEGER NOT NULL,
  price_per_number DECIMAL(10,2) NOT NULL,
  draw_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  winner_number INTEGER,
  winner_name TEXT,
  code TEXT UNIQUE NOT NULL, -- Código de 8 caracteres para acceso público
  creator_id UUID REFERENCES auth.users(id),
  payment_info JSONB, -- {method, account_name, account_number, bank, etc}
  prize_images TEXT[], -- Array de URLs de imágenes del premio
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### Tabla: tickets
\`\`\`sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id UUID REFERENCES lotteries(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT,
  selected_numbers INTEGER[] NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'verifying', 'verified', 'rejected'
  payment_receipt_url TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### RLS Policies
- Usuarios autenticados pueden crear, leer, actualizar y eliminar sus propios sorteos
- Cualquier persona puede leer sorteos por código
- Cualquier persona puede crear tickets (participación anónima)
- Cualquier persona puede actualizar sus propios tickets por ID (para subir comprobantes)
- Service role bypasea todas las políticas RLS

---

## PALETA DE COLORES Y DISEÑO

**Colores principales (usar en globals.css):**
- Primarios: Naranjas (#f97316, #ea580c, #c2410c)
- Secundarios: Amarillos (#fbbf24, #f59e0b)
- Acentos: Rojos (#ef4444, #dc2626)
- Neutrales: Blancos, grises (#f3f4f6, #e5e7eb, #9ca3af)
- Verde para ganadores: (#10b981, #059669)

**Tipografía:**
- Fuente principal: Geist Sans
- Fuente mono: Geist Mono
- Títulos: font-bold, text-4xl a text-6xl
- Cuerpo: text-base, leading-relaxed

**Gradientes (usar con moderación):**
- Fondo hero: `bg-gradient-to-br from-orange-500 via-amber-400 to-red-500`
- Botones CTA: `bg-gradient-to-r from-orange-600 to-red-600`
- Cards destacados: Bordes con gradiente

---

## FUNCIONALIDADES PRINCIPALES

### 1. LANDING PAGE (/)
**Diseño:**
- Hero section con gradiente naranja/amarillo/rojo
- Título grande: "Sistema Premium de Sorteos"
- Descripción: "Crea sorteos o rifas de forma segura para personas que viven su día a día y necesitan realizar sus sorteos en redes sociales. Tendrás manejo de un panel de control sobre las verificaciones de pago de los participantes que adquieren tus rifas o sorteos. Las verificaciones son enviadas a los diferentes participantes, tanto para avisar de confirmación de pagos como si son o no ganadores de las rifas o sorteos."
- Botón CTA: "Iniciar Sesión" (botón grande con gradiente)
- Imagen de fondo decorativa: Bola de lotería con números coloridos (usar la imagen proporcionada)
- Sección "Ve cómo funciona" con 2 videos side-by-side mostrando:
  - Video 1: Cómo crear un sorteo
  - Video 2: Panel de control para gestionar
- Videos con autoplay, loop, muted, poster

**Características:**
- Responsive (mobile-first)
- Animaciones suaves en scroll
- Links a tutorial y login

---

### 2. AUTENTICACIÓN

**Login (/auth/login):**
- Formulario simple: email + password
- Botón "Iniciar Sesión"
- Link "¿No tienes cuenta? Regístrate"
- Usar Supabase Auth: `supabase.auth.signInWithPassword()`

**Register (/auth/register):**
- Formulario: email + password + confirmar password
- Validación: mínimo 6 caracteres
- Botón "Crear Cuenta"
- Usar Supabase Auth: `supabase.auth.signUp()`
- Configurar `emailRedirectTo` con variable de entorno `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

**Middleware (middleware.ts):**
- Proteger rutas /my-lotteries, /dashboard
- Refrescar tokens en cada request
- Redirigir a /auth/login si no autenticado

---

### 3. CREAR SORTEO (/dashboard)

**Formulario (components/create-lottery-form.tsx):**

Campos obligatorios:
- Título del sorteo
- Descripción del sorteo
- Descripción del premio
- Cantidad de números disponibles (10-1000)
- Precio por número (decimal)
- Fecha y hora del sorteo (datetime-local)

Información de pago (JSON):
- Método de pago (texto libre)
- Nombre de cuenta
- Número de cuenta
- Banco
- Instrucciones adicionales

Imágenes del premio:
- Upload múltiple de imágenes
- Previsualización antes de crear
- Guardar URLs en array

**Funcionalidad:**
- Generar código único de 8 caracteres aleatorio
- Insertar en tabla `lotteries` con creator_id
- Al crear exitosamente, mostrar código y link para compartir
- Copiar link al portapapeles
- Redirigir a /my-lotteries

---

### 4. MIS SORTEOS (/my-lotteries)

**Vista de lista:**
- Grid de cards con todos los sorteos del usuario
- Cada card muestra:
  - Título
  - Código del sorteo
  - Fecha del sorteo
  - Status badge (Activo/Completado/Cancelado)
  - Contador de participantes
  - Botón "Ver Detalles"
  - Si está completado: mostrar panel verde grande con:
    * Icono de trofeo
    * "¡Sorteo Realizado!"
    * Número ganador en grande (#XX)
    * Nombre del ganador
    * Email del ganador
    * Teléfono del ganador (si disponible)
    * "Todos los participantes fueron notificados por correo"

**Filtros:**
- Todos / Activos / Completados / Cancelados

**Botón flotante:**
- "Crear Nuevo Sorteo" (sticky bottom en mobile)

---

### 5. DETALLE DE SORTEO (/my-lotteries/[id])

**Panel de información:**
- Título, descripción, premio
- Fecha y hora del sorteo
- Código para compartir (con botón copiar)
- Link público: `/lottery/[code]`
- Total de números disponibles vs seleccionados
- Precio por número
- Total recaudado (números vendidos × precio)

**Información de pago:**
- Card con todos los datos de pago configurados
- Visible para el organizador

**Imágenes del premio:**
- Galería de imágenes en grid
- Click para ampliar

**Botón "Verificar Pagos":**
- Redirige a /my-lotteries/[id]/payments

**Botón "Realizar Sorteo" (solo si hay participantes verificados):**
- Componente: components/perform-draw-button.tsx
- Llama a /api/perform-draw
- Muestra diálogo de confirmación antes de sortear

---

### 6. VERIFICACIÓN DE PAGOS (/my-lotteries/[id]/payments)

**Componente:** components/payment-verification-panel.tsx

**Vista de tickets:**
- Lista de todos los tickets del sorteo
- Filtros: Todos / Pendientes / Verificando / Verificados / Rechazados

**Cada ticket muestra:**
- Nombre del participante
- Email
- Teléfono
- Números seleccionados (badges)
- Status badge con colores:
  - pending: gris
  - verifying: amarillo
  - verified: verde
  - rejected: rojo
- Comprobante de pago (si existe):
  - Imagen clickeable para ampliar
  - Botón "Ver Comprobante"

**Acciones para tickets en "verifying":**
- Botón "✓ Aprobar Pago" (verde):
  - Actualiza payment_status a "verified"
  - Envía email de confirmación al participante
  - Muestra toast de éxito
- Botón "✗ Rechazar Pago" (rojo):
  - Muestra input para motivo de rechazo
  - Actualiza payment_status a "rejected"
  - Guarda rejection_reason
  - Envía email de rechazo con el motivo
  - Libera los números seleccionados (elimina ticket)
  - Muestra toast de éxito

**Estadísticas:**
- Total de participantes
- Pagos pendientes
- Pagos verificados
- Pagos rechazados
- Total recaudado

---

### 7. VISTA PÚBLICA DEL SORTEO (/lottery/[code])

**Componente principal:** components/lottery-public-view.tsx

**Header con información:**
- Título del sorteo
- Descripción
- Premio
- Precio por número
- Fecha del sorteo
- Galería de imágenes del premio (grid 2-3-5 columnas responsive)

**Contador regresivo (components/countdown-timer.tsx):**
- Posicionado al lado de las imágenes (o debajo en mobile)
- Diseño con gradiente naranja/amarillo
- Muestra: Días, Horas, Minutos, Segundos
- Actualización en tiempo real cada segundo
- Cuando llega a 0: ejecuta sorteo automático
- Si el sorteo dura más de 2 horas: cierra participación 30 minutos antes
- Cuando faltan menos de 30 min: muestra alerta naranja "Participación cerrada - verificación de pagos en curso"

**Grid de números:**
- Grid responsive de números (ej: 10 columnas en desktop, 5 en mobile)
- Cada número es un botón clickeable
- Estados visuales:
  - Disponible: bg-muted, hover:bg-orange-100, cursor-pointer
  - Seleccionado por el usuario actual: bg-orange-500, text-white
  - Ocupado por otro: bg-gray-300, cursor-not-allowed, opacity-50
- Al hacer click: toggle selección
- Mostrar contador de seleccionados
- Límite máximo configurable (ej: 10 números por participante)

**Botón "Participar":**
- Solo visible si hay números seleccionados
- Fijo en bottom en mobile (sticky)
- Al hacer click: muestra formulario modal

**Formulario de participación (paso 2):**
- Campos:
  - Nombre completo (requerido)
  - Email (requerido, validación)
  - Teléfono (opcional)
- Botón "Continuar al Pago"
- Validación antes de continuar
- Al enviar:
  - Crea tickets en tabla con status "pending"
  - Los números quedan "reservados" por 10 minutos
  - Avanza a paso 3

**Información de pago (paso 3):**
- Card grande destacada con toda la información de pago del organizador:
  - Método de pago
  - Nombre de cuenta
  - Número de cuenta
  - Banco
  - Instrucciones adicionales
- Monto total a pagar calculado (números × precio)
- Instrucción clara: "Realiza el pago y sube tu comprobante"

**Subida de comprobante (paso 3):**
- ADVERTENCIA CRÍTICA visible (recuadro rojo pulsante):
  \`\`\`
  ⚠️ IMPORTANTE - LEA CUIDADOSAMENTE
  
  Su comprobante de pago debe ser:
  • LEGIBLE y COMPLETO
  • Mostrar claramente el monto pagado
  • Incluir fecha de la transacción
  • Ser una imagen o PDF de calidad
  
  ❌ Comprobantes ilegibles, incompletos o incorrectos 
  serán RECHAZADOS sin posibilidad de reclamo.
  
  Es su responsabilidad enviar un comprobante válido.
  \`\`\`
- Input de archivo (imagen o PDF)
- Previsualización del archivo seleccionado
- Botón "Subir Comprobante y Confirmar Participación"
- Al subir:
  - Llama a /api/upload-receipt
  - Actualiza ticket con receipt_url y status "verifying"
  - Muestra mensaje de éxito
  - Instrucción: "Tu comprobante está en revisión. Recibirás un email cuando sea verificado."

**Botón "Cancelar y Elegir Otros Números":**
- Visible en paso de pago
- Al hacer click:
  - Elimina los tickets pendientes
  - Libera los números
  - Vuelve al paso 1 (selección de números)
  - Resetea el formulario

**Si el sorteo ya se realizó:**
- Ocultar grid de números
- Mostrar panel grande verde con:
  - Icono de trofeo
  - "¡Sorteo Realizado!"
  - Número ganador: #XX (muy grande)
  - Nombre del ganador
  - Mensaje: "El ganador ha sido notificado por correo electrónico"

---

### 8. SISTEMA DE SORTEO AUTOMÁTICO

**API Route:** /api/perform-draw/route.ts

**Algoritmo robusto y criptográfico:**
\`\`\`typescript
function selectRandomWinner(validNumbers: number[]): number {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const randomIndex = randomBuffer[0] % validNumbers.length;
  return validNumbers[randomIndex];
}
\`\`\`

**Proceso:**
1. Obtener todos los tickets con payment_status "verified" o "verifying"
2. Si no hay tickets: retornar error con detalles
3. Extraer números de tickets válidos
4. Seleccionar número ganador aleatoriamente con crypto
5. Obtener información del ganador (nombre, email, teléfono)
6. Actualizar sorteo:
   - status = "completed"
   - winner_number = número ganador
   - winner_name = nombre del ganador
7. Si el ticket ganador estaba en "verifying": auto-verificarlo
8. Enviar emails a TODOS los participantes:
   - Email de GANADOR: con diseño especial verde, felicitación, instrucciones de contacto
   - Email de NO GANADOR: con diseño neutro, agradecimiento, número ganador
9. Retornar resultado con: winner_number, winner_name, total_notified

**Llamado automático:**
- El countdown-timer llama a /api/perform-draw cuando expira
- El botón manual "Realizar Sorteo" también llama a esta API
- Solo se puede realizar sorteo UNA vez por lotería

**Logs detallados:**
\`\`\`
console.log("[v0] 🎲 Performing lottery draw...");
console.log("[v0] Found X verified participants");
console.log("[v0] 🎉 Winner selected: #XX - Name");
console.log("[v0] 📧 Sending notifications to Y participants");
console.log("[v0] ✅ Winner email sent successfully");
console.log("[v0] ✅ Non-winner emails sent to Z participants");
\`\`\`

---

### 9. SISTEMA DE NOTIFICACIONES POR EMAIL

**Librería:** lib/email-notifications.tsx

**Configuración Resend:**
\`\`\`typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Tu Lotería <onboarding@resend.dev>"; // Usar dominio de prueba
\`\`\`

**Variables de entorno requeridas:**
- RESEND_API_KEY
- EMAIL_FROM (opcional, se usa fallback)

**Plantillas HTML con estilos inline (para emails):**

Todas las plantillas deben incluir:
- Gradientes naranjas/amarillos/rojos
- Logo o título "Tu Lotería"
- Información completa del sorteo
- Footer con instrucciones
- Diseño responsive

**Funciones a implementar:**

1. **sendPaymentConfirmationEmail(to, participantName, lotteryTitle, numbers)**
   - Asunto: "Comprobante recibido - [Título Sorteo]"
   - Contenido: Confirma recepción del comprobante, está en revisión
   
2. **sendPaymentApprovedEmail(to, participantName, lotteryTitle, numbers)**
   - Asunto: "✅ Pago Verificado - [Título Sorteo]"
   - Contenido: Pago aprobado, participación confirmada, números asignados
   - Diseño: Verde, positivo
   
3. **sendPaymentRejectedEmail(to, participantName, lotteryTitle, numbers, reason)**
   - Asunto: "❌ Pago Rechazado - [Título Sorteo]"
   - Contenido: Pago rechazado, motivo, números liberados
   - Diseño: Rojo, explicativo
   
4. **sendWinnerEmail(to, participantName, lotteryTitle, winnerNumber, prizeDescription)**
   - Asunto: "🎉 ¡FELICIDADES! Ganaste el sorteo [Título]"
   - Contenido: Gran felicitación, número ganador, premio, instrucciones de contacto
   - Diseño: Verde brillante, celebratorio, emojis
   
5. **sendNonWinnerEmail(to, participantName, lotteryTitle, winnerNumber, winnerName)**
   - Asunto: "Resultados del sorteo - [Título Sorteo]"
   - Contenido: Agradecimiento por participar, número ganador, nombre del ganador
   - Diseño: Neutro, agradecido

**Manejo de errores:**
- Cada función debe retornar `{ success: boolean, error?: string }`
- Loggear intentos y resultados
- Si falla el envío: loggear pero no detener el proceso

---

### 10. API ROUTES

**POST /api/send-notification/route.ts**
- Body: `{ type, to, participantName, lotteryTitle, numbers?, reason?, winnerNumber?, winnerName?, prizeDescription? }`
- Types: 'payment_confirmation' | 'payment_approved' | 'payment_rejected' | 'winner' | 'non_winner'
- Llama a la función de email correspondiente según type
- Retorna: `{ success, message }`

**POST /api/upload-receipt/route.ts**
- Body: FormData con file + ticketIds (array)
- Usa Supabase Storage para guardar el archivo
- Actualiza tickets con receipt_url y status "verifying"
- Envía email de confirmación de recepción
- Usa service role de Supabase (bypasea RLS)
- Retorna: `{ success, receipt_url }`

**POST /api/perform-draw/route.ts**
- Body: `{ lottery_id }`
- Implementa algoritmo criptográfico de selección
- Actualiza base de datos
- Envía emails masivos
- Retorna: `{ success, winner_number, winner_name, total_notified }`

---

### 11. PÁGINA DE TUTORIAL (/tutorial)

**Estructura:**

**Header:**
- Título grande: "Cómo Usar Tu Lotería"
- Subtítulo: Guía completa para organizadores y participantes

**ADVERTENCIA CRÍTICA DESTACADA:**
\`\`\`
⚠️ RESPONSABILIDAD ABSOLUTA DE LOS ORGANIZADORES ⚠️

ATENCIÓN: DEBE LEER ESTO ANTES DE CREAR SORTEOS

🔴 VERIFICACIÓN DE PAGOS - RESPONSABILIDAD DEL ORGANIZADOR

USTED ES 100% RESPONSABLE de verificar los comprobantes de pago ANTES 
que se realice el sorteo. Una vez realizado el sorteo, NO SE ACEPTAN 
RECLAMOS por pagos mal verificados.

⏰ TIEMPO LÍMITE
• Sorteos mayores a 2 horas: la participación se cierra 30 minutos antes
• Este tiempo es para que USTED verifique los pagos manualmente
• Si no verifica a tiempo, los pagos se incluirán automáticamente

✅ DEBE VERIFICAR
• Que el comprobante sea legible y completo
• Que el monto coincida exactamente
• Que la fecha sea correcta
• Que los datos bancarios correspondan

❌ NO HABRÁ RECLAMOS
Una vez realizado el sorteo, los resultados son FINALES e IRREVOCABLES.
Es SU RESPONSABILIDAD verificar correctamente.
\`\`\`

**Para Organizadores (8 pasos):**
1. Crear cuenta e iniciar sesión
2. Ir a Dashboard y hacer click en "Crear Nuevo Sorteo"
3. Completar formulario con todos los datos del sorteo
4. Agregar imágenes del premio (hasta 5 imágenes)
5. Configurar información de pago para que participantes sepan cómo pagar
6. Copiar el código y link del sorteo para compartir en redes sociales
7. **CRÍTICO:** Ir a "Verificar Pagos" regularmente y revisar comprobantes
   - Aprobar pagos válidos (botón verde)
   - Rechazar pagos inválidos con motivo (botón rojo)
   - DEBE hacerlo ANTES que expire el tiempo
8. El sorteo se realiza automáticamente al expirar el tiempo
   - Puedes realizarlo manualmente desde el botón si lo prefieres
   - Todos los participantes reciben email con resultados

**Para Participantes (7 pasos):**
1. Recibir link del sorteo por redes sociales
2. Entrar al link y ver información del sorteo
3. Seleccionar números disponibles (máximo 10)
4. Llenar formulario con nombre, email, teléfono
5. Ver información de pago y realizar la transferencia/depósito
6. **IMPORTANTE:** Subir comprobante LEGIBLE y COMPLETO
7. Esperar verificación (recibirás email) y resultados del sorteo

**Consejos y Tips:**
- Comparte el link en todas tus redes para más participantes
- Verifica los pagos rápidamente para dar confianza
- Usa imágenes atractivas del premio
- Sé claro en las instrucciones de pago
- Responde dudas de participantes por email

---

### 12. COMPONENTES REUTILIZABLES

**components/lottery-card.tsx**
- Card visual para mostrar un sorteo
- Props: lottery object
- Muestra: título, fecha, status, código, números vendidos
- Botón "Ver Detalles"

**components/number-grid.tsx**
- Grid de números seleccionables
- Props: totalNumbers, selectedNumbers, occupiedNumbers, onSelect
- Responsive: 10 cols desktop, 5 mobile
- Estados visuales claros

**components/payment-info-card.tsx**
- Card destacada con información de pago
- Props: paymentInfo object
- Diseño: Gradiente naranja, texto grande, copiable

**components/winner-display.tsx**
- Panel verde grande para mostrar ganador
- Props: winnerNumber, winnerName, winnerEmail, winnerPhone
- Icono de trofeo animado
- Confetti opcional (usar canvas-confetti)

---

### 13. CONSIDERACIONES TÉCNICAS

**Supabase Client:**
- Crear cliente para browser: `createBrowserClient()` de @supabase/ssr
- Crear cliente para server: `createServerClient()` de @supabase/ssr
- Middleware para refresh de tokens
- RLS habilitado en todas las tablas

**Environment Variables:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (solo server-side)
- RESEND_API_KEY
- EMAIL_FROM (opcional)
- NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL (para desarrollo)
- NEXT_PUBLIC_SITE_URL (para producción)

**Seguridad:**
- Todas las operaciones sensibles usan service role
- Validación de inputs en API routes
- Sanitización de datos antes de mostrar
- CORS configurado correctamente
- Rate limiting en APIs críticas (opcional pero recomendado)

**Performance:**
- Lazy loading de imágenes
- Optimización de queries (select solo campos necesarios)
- Caching de sorteos públicos (opcional)
- Compresión de imágenes al subir

**Responsive Design:**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly (botones mínimo 44px)
- Navegación móvil simplificada

---

### 14. FLUJO COMPLETO DE USUARIO

**Flujo Organizador:**
1. Login → Dashboard
2. Crear sorteo (formulario completo)
3. Compartir código/link en redes
4. Monitorear participantes en tiempo real
5. Verificar comprobantes de pago en /payments
6. Aprobar/rechazar pagos (envía emails automáticos)
7. Esperar a que expire tiempo O realizar sorteo manual
8. Ver ganador en historial
9. Contactar al ganador con datos mostrados

**Flujo Participante:**
1. Recibir link de sorteo
2. Ver información y premio
3. Seleccionar números disponibles
4. Llenar datos personales
5. Ver info de pago y realizar pago
6. Subir comprobante LEGIBLE
7. Recibir email: "Comprobante recibido"
8. Recibir email: "Pago verificado" o "Pago rechazado"
9. Esperar sorteo
10. Recibir email: "Ganaste" o "Resultados del sorteo"

---

### 15. ESTILOS Y ANIMACIONES

**Animaciones con Tailwind:**
- `animate-pulse` para alertas críticas
- `hover:scale-105 transition-transform` para botones
- `animate-bounce` para iconos de trofeo
- Smooth scroll: `scroll-smooth`

**Efectos hover:**
- Botones: elevar con shadow-lg
- Cards: border con gradiente
- Números: cambio de color suave

**Estados de loading:**
- Spinners para acciones async
- Skeleton loaders para listas
- Progress bars para uploads

**Toasts/Notifications:**
- Usar shadcn/ui toast
- Tipos: success (verde), error (rojo), info (azul), warning (amarillo)
- Auto-dismiss en 5 segundos

---

### 16. MENSAJES Y COPY

**Tono de voz:** Claro, directo, profesional pero amigable

**Ejemplos de mensajes:**
- "¡Sorteo creado exitosamente! Comparte el código con tus participantes."
- "⚠️ Tu comprobante será revisado. Te notificaremos por email."
- "🎉 ¡Felicidades! Ganaste el sorteo. Revisa tu email para instrucciones."
- "❌ Comprobante rechazado: [Motivo]. Intenta nuevamente con un comprobante válido."
- "⏰ Participación cerrada. Los pagos están siendo verificados."
- "✅ Pago verificado. ¡Estás participando oficialmente!"

**Errores:**
- "No se encontró el sorteo. Verifica el código."
- "Ya no hay números disponibles."
- "El sorteo ya finalizó."
- "Debes seleccionar al menos un número."
- "Email inválido. Verifica e intenta nuevamente."

---

### 17. TESTING Y VALIDACIÓN

**Casos de prueba críticos:**
1. Crear sorteo con todos los campos
2. Participar con múltiples números
3. Subir comprobante (imagen y PDF)
4. Aprobar pago → verificar email
5. Rechazar pago → verificar email y liberación de números
6. Realizar sorteo manual
7. Sorteo automático al expirar tiempo
8. Verificar que ganador recibe email especial
9. Verificar que no ganadores reciben email con ganador
10. Cancelar participación y volver a elegir

**Edge cases:**
- Sorteo sin participantes → no se puede realizar
- Todos los pagos rechazados → no se puede realizar
- Múltiples usuarios seleccionando mismo número → solo uno lo reserva
- Expiración de reserva de números (10 minutos)
- Intentar participar después de cierre (30 min antes)

---

### 18. DEPLOYMENT

**Vercel (recomendado):**
1. Conectar repo de GitHub
2. Configurar variables de entorno
3. Deploy automático en push a main
4. Preview deployments en pull requests

**Configuración necesaria:**
- Framework: Next.js
- Build command: `next build`
- Output directory: `.next`
- Node version: 18.x o superior

---

### 19. CARACTERÍSTICAS ADICIONALES OPCIONALES

**Para MVP no incluir, pero considerar a futuro:**
- Sistema de referidos
- Múltiples ganadores por sorteo
- Sorteos privados (con contraseña)
- Compartir en redes con Open Graph images
- Estadísticas y analytics
- Exportar lista de participantes a CSV
- Modo oscuro
- Multi-idioma
- Pagos integrados (Stripe)
- WhatsApp notifications
- QR codes para compartir

---

## CHECKLIST FINAL DE IMPLEMENTACIÓN

✅ Base de datos Supabase configurada con RLS
✅ Autenticación funcionando (login/register)
✅ CRUD de sorteos completo
✅ Vista pública con selección de números
✅ Sistema de reserva temporal de números
✅ Upload de comprobantes con validación
✅ Panel de verificación de pagos
✅ Emails configurados con Resend (todas las plantillas)
✅ Sorteo automático con countdown
✅ Sorteo manual desde panel
✅ Algoritmo criptográfico de selección
✅ Notificaciones a ganadores y no ganadores
✅ Historial con información completa del ganador
✅ Landing page con diseño especificado
✅ Tutorial detallado con advertencias
✅ Cierre anticipado de participación (30 min)
✅ Responsive en todos los tamaños
✅ Colores y estilos según paleta
✅ Logs de debugging con [v0]
✅ Manejo de errores en todas las APIs
✅ Validación de inputs en formularios
✅ Loading states en operaciones async
✅ Toast notifications para feedback
✅ Middleware de autenticación
✅ Variables de entorno documentadas

---

## PROMPT RESUMIDO PARA COPIAR Y PEGAR

Crea "Tu Lotería" - sistema premium de sorteos Next.js 16 + Supabase + Resend. Organizadores crean sorteos con números seleccionables (grid visual), participantes anónimos eligen números, suben comprobantes de pago, organizador verifica pagos desde panel (/my-lotteries/[id]/payments) con botones aprobar/rechazar que envían emails. Sorteo automático al expirar countdown (algoritmo criptográfico con crypto.getRandomValues), envía emails a TODOS (ganadores y no ganadores) con plantillas HTML gradiente naranja/amarillo. Landing page hero con texto "Sistema Premium de Sorteos... para personas que gestionan sorteos en redes sociales... panel de control... verificaciones de pago... notificaciones a participantes". Colores: naranjas #f97316, amarillos #fbbf24, rojos #ef4444, verde ganador #10b981. Tutorial con ADVERTENCIA CRÍTICA roja pulsante sobre responsabilidad de verificar pagos a tiempo. Sorteos >2hrs cierran participación 30min antes para verificar. Historial muestra ganador con datos completos (nombre, email, teléfono). Base de datos: lotteries (title, description, prize, numbers, price, draw_date, status, winner_number, winner_name, code, payment_info json, prize_images array) y tickets (lottery_id, participant_name, participant_email, participant_phone, selected_numbers array, payment_status, payment_receipt_url, rejection_reason). RLS para autenticación. Service role para APIs. Responsive mobile-first. Implementa TODOS los emails: payment_confirmation, payment_approved, payment_rejected, winner, non_winner. Resend con from "Tu Lotería <onboarding@resend.dev>". Grid números 10 cols desktop, 5 mobile, estados: disponible (muted), seleccionado (orange-500), ocupado (gray-300 disabled). Botón sticky "Participar" → modal formulario → info pago → upload comprobante con advertencia CRÍTICA sobre legibilidad. API /api/perform-draw con logs detallados. components/countdown-timer.tsx ejecuta auto-draw al llegar a 0. components/payment-verification-panel.tsx con filtros y acciones aprobar/rechazar. Landing incluye videos autoplay loop muted. Auth solo email/password Supabase. Middleware protege rutas. Código sorteo 8 caracteres aleatorio. Link público /lottery/[code]. Panel ganador verde con trofeo, número grande, nombre, email, teléfono. Implementa TODO lo especificado en detalle arriba.

---

**NOTA IMPORTANTE:** Este prompt describe la aplicación completa en producción. Sigue cada especificación exactamente para recrear "Tu Lotería" de forma idéntica.
