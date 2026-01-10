# Reporte de Bugs y Soluciones - Tu Loteria App

## Problemas Identificados

### 1. **Error al Crear Sorteo - "Error al crear el sorteo"**

**Ubicación**: `/components/create-lottery-form.tsx` (línea 70 en el método `handleSubmit`)

**Descripción del Problema**:
El formulario falla al crear un sorteo con el error "Error al crear el sorteo". Después de investigar la interfaz de usuario y el código fuente, se identificaron múltiples problemas:

#### Problema Principal: Validación de Fecha y Hora
```javascript
const drawDateTime = new Date(`${formData.drawDate}T${formData.drawTime}`)
```

- **Cause**: Los campos HTML5 `<input type="date">` y `<input type="time">` tienen validación nativa deficiente
- **Impact**: Cuando los campos están vacíos o contienen valores inválidos, la creación de la fecha falla
- **Síntoma**: Se produce un error silencioso y se muestra "Error al crear el sorteo"

### 2. **Problemas de Inputs HTML5 Date/Time**

**Ubicación**: `/components/create-lottery-form.tsx` (líneas 262-271)

**Descripción**:
- Los campos `<input type="date">` y `<input type="time">` no están siendo capturados correctamente en navegadores
- La máscara de entrada confunde al usuario (dd/mm/aaaa vs YYYY-MM-DD)
- No hay validación previa al envío del formulario

### 3. **Falta de Validación de Campos Requeridos**

**Ubicación**: `/components/create-lottery-form.tsx` (en `handleSubmit`)

**Descripción**:
- No se validan los campos requeridos antes de enviar los datos
- No hay feedback visual claro sobre cuál campo causó el error
- Los mensajes de error son genéricos y no ayudan al usuario

## Soluciones Propuestas

### Solución 1: Mejorar Validación de Fecha y Hora

Agregar validación robusta antes de crear la fecha:

```typescript
const validateDateAndTime = (): boolean => {
  if (!formData.drawDate || !formData.drawTime) {
    setError("La fecha y hora del sorteo son requeridas")
    return false
  }
  
  try {
    const drawDateTime = new Date(`${formData.drawDate}T${formData.drawTime}`)
    if (isNaN(drawDateTime.getTime())) {
      setError("Fecha u hora inválida. Por favor verifica el formato.")
      return false
    }
    
    if (drawDateTime < new Date()) {
      setError("La fecha del sorteo debe ser en el futuro")
      return false
    }
    
    return true
  } catch (err) {
    setError("Error al procesar la fecha y hora")
    return false
  }
}
```

### Solución 2: Validar Todos los Campos Requeridos

Agregar validación comprensiva antes del `handleSubmit`:

```typescript
const validateFormData = (): boolean => {
  const requiredFields = [
    { key: 'organizerName', message: 'Nombre del organizador es requerido' },
    { key: 'organizerPhone', message: 'Teléfono es requerido' },
    { key: 'prizeTitle', message: 'Descripción del premio es requerida' },
    { key: 'drawDate', message: 'Fecha del sorteo es requerida' },
    { key: 'drawTime', message: 'Hora del sorteo es requerida' },
    { key: 'ticketPrice', message: 'Precio por número es requerido' },
    { key: 'bankName', message: 'Nombre del banco es requerido' },
    { key: 'bankAccount', message: 'Número de cuenta es requerido' },
  ]
  
  for (const field of requiredFields) {
    if (!formData[field.key as keyof typeof formData]) {
      setError(field.message)
      return false
    }
  }
  
  // Validar formato de teléfono
  if (!/^[+\d\s\-()]+$/.test(formData.organizerPhone)) {
    setError("Formato de teléfono inválido")
    return false
  }
  
  // Validar precio
  const price = parseFloat(formData.ticketPrice)
  if (isNaN(price) || price <= 0) {
    setError("El precio debe ser un número positivo")
    return false
  }
  
  return true
}
```

### Solución 3: Mejorar Manejo de Errores en el Servidor

Agregar mejor logging y validación en el lado del servidor (si existe un endpoint API específico):

```typescript
// En handleSubmit, antes de la consulta a base de datos
if (!validateFormData()) {
  return
}

if (!validateDateAndTime()) {
  return
}
```

### Solución 4: Agregar Try-Catch Más Específico

Mejorar el manejo de errores para diferenciar entre tipos de errores:

```typescript
try {
  // ... código de validación y creación
} catch (err) {
  if (err instanceof RangeError) {
    setError("Valores fuera de rango. Verifica los datos ingresados.")
  } else if (err instanceof SyntaxError) {
    setError("Formato de datos incorrecto")
  } else if (err instanceof TypeError) {
    setError("Tipo de dato incorrecto en uno de los campos")
  } else {
    setError(err instanceof Error ? err.message : "Error desconocido al crear el sorteo")
  }
  console.error("Error detallado:", err)
}
```

## Problemas de UI/UX Observados

1. **Campos de Fecha/Hora No Responden**: Los campos `<input type="date">` y `<input type="time">` mostraban placeholders pero no aceptaban entrada correctamente
2. **Sin Validación en Tiempo Real**: El usuario no recibe feedback inmediato sobre errores
3. **Mensajes de Error Genéricos**: "Error al crear el sorteo" no indica cuál es el problema específico
4. **Sin Indicadores de Campos Requeridos**: No está claro visualmente cuáles campos son obligatorios

## Recomendaciones Adicionales

1. **Usar librerías de validación**: Implementar `zod` o `yup` para validación robusta
2. **Mejorar UX de Fecha**: Considerar usar una librería como `react-datepicker` para mejor UX
3. **Agregar feedback visual**: Marcar campos con error en rojo y mostrar tooltip
4. **Logging mejorado**: Agregar console.error detallado para debugging
5. **Pruebas unitarias**: Crear tests para validación de formulario

## Archivos a Modificar

- `/components/create-lottery-form.tsx` - Principal (agregar validaciones)
- `/app/create-lottery/page.tsx` - Opcional (mejorar manejo de errores)
- Crear `/lib/validators/lottery.ts` - Nuevo archivo para lógica de validación
