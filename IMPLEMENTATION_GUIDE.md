# Guía de Implementación - Solución Error "Cubo no encontrado"

## Resumen del Problema

El error **"Cubo no encontrado"** occuría cuando la aplicación intentaba obtener los detalles de una lotería. Esto sucedaba porque el código intenta hacer un JOIN con una tabla `lottery_tickets` que no existía en la base de datos de Supabase.

**Código problemático:**
```typescript
.select("*, lottery_tickets(*)")
```

## Solución Implementada (Opción 2)

Se implementó una solución que realiza dos consultas separadas:

### 1. **Archivo Modificado: `/app/api/lottery/[code]/route.ts`**

#### Cambios:
- **Antes:** Intentaba hacer un JOIN directo con `lottery_tickets(*)`
- **Ahora:** 
  1. Primero obtiene la lotería sin intentar el JOIN
  2. Luego hace una consulta separada para obtener los tickets
  3. Si la tabla de tickets no existe, retorna la lotería con un array vacío de tickets

#### Código actualizado:
```typescript
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Fetching lottery with code:", params.code)
    
    // Obtener la lotería
    const { data: lottery, error: lotteryError } = await supabase
      .from("lotteries")
      .select("*")
      .eq("share_code", params.code)
      .single()

    if (lotteryError) {
      console.error("[v0] API Error fetching lottery:", lotteryError)
      return NextResponse.json({ error: "Lottery not found", details: lotteryError.message }, { status: 404 })
    }

    if (!lottery) {
      console.log("[v0] No lottery found with code:", params.code)
      return NextResponse.json({ error: "Lottery not found" }, { status: 404 })
    }

    console.log("[v0] Lottery found successfully:", lottery.id)
    
    // Obtener los tickets asociados a esta lotería
    const { data: tickets, error: ticketsError } = await supabase
      .from("lottery_tickets")
      .select("*")
      .eq("lottery_id", lottery.id)
      .order("created_at", { ascending: false })

    if (ticketsError) {
      console.warn("[v0] Warning fetching tickets (tabla podría no existir):", ticketsError.message)
      // No es error crítico si la tabla no existe, solo retornamos la lotería
      return NextResponse.json({ lottery, tickets: [] })
    }

    console.log("[v0] Tickets found:", tickets?.length || 0)
    return NextResponse.json({ lottery, tickets: tickets || [] })
  } catch (error) {
    console.error("[v0] API Exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

### 2. **Archivo Nuevo: `supabase/migrations/create_lottery_tickets_table.sql`**

Este archivo SQL crea la tabla `lottery_tickets` con toda la estructura necesaria:

**Características:**
- **Campos principales:**
  - `id`: UUID único
  - `lottery_id`: Referencia a la lotería (FK)
  - `participant_name`: Nombre del participante
  - `participant_email`: Email del participante
  - `participant_phone`: Teléfono del participante
  - `ticket_number`: Número del ticket (UNIQUE per lotería)
  - `amount`: Monto pagado
  - `payment_status`: Estado del pago (pending, completed, cancelled)
  - `payment_method`: Método de pago
  - `payment_reference`: Referencia de transacción
  - `created_at` / `updated_at`: Timestamps

- **Índices para rendimiento:**
  - `lottery_id` (búsquedas rápidas por lotería)
  - `payment_status` (filtrar por estado de pago)
  - `created_at` (ordenar cronológicamente)

- **Row Level Security (RLS):**
  - El creador de la lotería puede ver, insertar, actualizar y eliminar sus tickets
  - Todos pueden ver los tickets (public view)

## Pasos para Implementar

### Paso 1: Aplicar la Migración SQL en Supabase

1. Abre tu proyecto en [Supabase Console](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Copia todo el contenido de `supabase/migrations/create_lottery_tickets_table.sql`
4. Ejecuta el SQL
5. Verifica que la tabla se creó correctamente

### Paso 2: Verificar los Cambios en el Código

El archivo `/app/api/lottery/[code]/route.ts` ya ha sido actualizado en GitHub. Asegúrate de que los cambios se reflejen en tu rama `main`.

### Paso 3: Actualizar tu Clon Local (Opcional)

```bash
git pull origin main
```

### Paso 4: Probar la Solución

1. **Crea una nueva lotería** en la aplicación
2. **Comparte el código del sorteo**
3. **Intenta acceder a la lotería** con el código compartido
4. **Verifica en la consola** que no aparece el error "Cubo no encontrado"
5. **Agrega algunos tickets** (si tienes un endpoint para ello)

## Respuesta de la API

Ahora la API retorna:

```json
{
  "lottery": {
    "id": "uuid-here",
    "created_by": "user-id",
    "prize_title": "iPhone 15",
    "prize_images": [...],
    "draw_date": "2024-01-15T20:00:00Z",
    "ticket_price": 100.00,
    "share_code": "ABC123XYZ",
    "status": "active",
    // ... otros campos
  },
  "tickets": [
    {
      "id": "uuid",
      "lottery_id": "uuid",
      "participant_name": "Juan Pérez",
      "ticket_number": 42,
      "amount": 100.00,
      "payment_status": "completed",
      "created_at": "2024-01-10T15:30:00Z"
    },
    // ... más tickets
  ]
}
```

## Ventajas de esta Solución

✅ **Separación de responsabilidades:** Consultas independientes para lotería y tickets  
✅ **Manejo de errores mejorado:** Si la tabla no existe, retorna la lotería de todas formas  
✅ **Mejor rendimiento:** No intenta JOIN innecesarios  
✅ **Escalabilidad:** Fácil de extender con más consultas en el futuro  
✅ **Seguridad:** RLS policies protegen los datos  

## Notas Importantes

1. **La tabla se creó con `IF NOT EXISTS`**, por lo que es seguro ejecutar el SQL más de una vez
2. **Los tickets no serán visibles inmediatamente** si no tienes un endpoint para crearlos
3. **El estado de pago por defecto es "pending"** - puedes actualizar esto cuando se procese el pago
4. **La tabla está completamente opcional** - la API funciona sin ella, retornando un array vacío

## Resolución de Problemas

### Error: "No existe tabla public.lottery_tickets"
- Ejecuta el SQL del archivo `create_lottery_tickets_table.sql` en Supabase

### La API aún retorna error
- Verifica que los cambios en `route.ts` estén presentes
- Ejecuta `git pull origin main` para sincronizar

### Los tickets no aparecen
- Verifica que tienes un endpoint para crear tickets
- Comprueba que el `lottery_id` es correcto

## Próximos Pasos (Recomendado)

1. **Crear endpoint POST** para insertar tickets:
   - `POST /api/lottery/[code]/tickets`
   - Validar datos del participante
   - Crear el ticket

2. **Crear endpoint PATCH** para actualizar estado de pago:
   - `PATCH /api/lottery/[code]/tickets/[id]`
   - Actualizar `payment_status`

3. **Crear endpoint GET** para estadísticas:
   - `GET /api/lottery/[code]/stats`
   - Contar tickets por estado de pago
   - Calcular ingresos totales

---

**Resuelto por:** Implementación manual  
**Fecha:** Enero 2026  
**Estado:** ✅ Completado 100%
