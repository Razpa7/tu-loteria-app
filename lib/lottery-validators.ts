/**
 * Lottery Form Validators
 * Comprehensive validation functions for lottery creation form
 */

export interface CreateLotteryFormData {
  organizerName: string
  organizerPhone: string
  prizeTitle: string
  drawDate: string
  drawTime: string
  ticketPrice: string
  bankName: string
  bankAccount: string
  bankAlias?: string
  themeColor?: string
  backgroundColor?: string
  numberColor?: string
  buttonColor?: string
}

export interface ValidationError {
  field: string
  message: string
}

/**
 * Validate all required fields
 */
export function validateAllFields(formData: CreateLotteryFormData): ValidationError[] {
  const errors: ValidationError[] = []

  // Validate organizer name
  if (!formData.organizerName?.trim()) {
    errors.push({ field: 'organizerName', message: 'El nombre del organizador es requerido' })
  } else if (formData.organizerName.trim().length < 3) {
    errors.push({ field: 'organizerName', message: 'El nombre debe tener al menos 3 caracteres' })
  }

  // Validate phone
  if (!formData.organizerPhone?.trim()) {
    errors.push({ field: 'organizerPhone', message: 'El teléfono es requerido' })
  } else if (!/^[+\d\s\-()]+$/.test(formData.organizerPhone)) {
    errors.push({ field: 'organizerPhone', message: 'Formato de teléfono inválido' })
  }

  // Validate prize
  if (!formData.prizeTitle?.trim()) {
    errors.push({ field: 'prizeTitle', message: 'La descripción del premio es requerida' })
  }

  // Validate date and time
  if (!formData.drawDate) {
    errors.push({ field: 'drawDate', message: 'La fecha del sorteo es requerida' })
  }

  if (!formData.drawTime) {
    errors.push({ field: 'drawTime', message: 'La hora del sorteo es requerida' })
  }

  // Validate price
  if (!formData.ticketPrice) {
    errors.push({ field: 'ticketPrice', message: 'El precio por número es requerido' })
  } else {
    const price = parseFloat(formData.ticketPrice)
    if (isNaN(price)) {
      errors.push({ field: 'ticketPrice', message: 'El precio debe ser un número válido' })
    } else if (price <= 0) {
      errors.push({ field: 'ticketPrice', message: 'El precio debe ser mayor a 0' })
    }
  }

  // Validate bank info
  if (!formData.bankName?.trim()) {
    errors.push({ field: 'bankName', message: 'El nombre del banco es requerido' })
  }

  if (!formData.bankAccount?.trim()) {
    errors.push({ field: 'bankAccount', message: 'El número de cuenta es requerido' })
  }

  return errors
}

/**
 * Validate date and time specifically
 */
export function validateDateTime(drawDate: string, drawTime: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!drawDate) {
    errors.push({ field: 'drawDate', message: 'La fecha del sorteo es requerida' })
    return errors // Exit early if date is missing
  }

  if (!drawTime) {
    errors.push({ field: 'drawTime', message: 'La hora del sorteo es requerida' })
    return errors // Exit early if time is missing
  }

  try {
    // Create date from ISO format (YYYY-MM-DD) and time (HH:mm)
    const drawDateTime = new Date(`${drawDate}T${drawTime}:00`)

    // Check if date is valid
    if (isNaN(drawDateTime.getTime())) {
      errors.push({ field: 'drawDate', message: 'Fecha u hora inválida' })
      return errors
    }

    // Check if date is in the future
    const now = new Date()
    if (drawDateTime <= now) {
      errors.push({ field: 'drawDate', message: 'La fecha del sorteo debe ser en el futuro' })
    }

    // Check if date is not too far in the future (max 5 years)
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 5)
    if (drawDateTime > maxDate) {
      errors.push({ field: 'drawDate', message: 'La fecha del sorteo no puede ser más de 5 años en el futuro' })
    }
  } catch (error) {
    errors.push({ field: 'drawDate', message: 'Error al procesar la fecha y hora' })
  }

  return errors
}

/**
 * Complete validation of entire form
 */
export function validateCreateLotteryForm(formData: CreateLotteryFormData): ValidationError[] {
  const allErrors: ValidationError[] = []

  // Validate all fields
  allErrors.push(...validateAllFields(formData))

  // Only validate date/time if no general errors for these fields
  if (!allErrors.some((e) => e.field === 'drawDate' || e.field === 'drawTime')) {
    allErrors.push(...validateDateTime(formData.drawDate, formData.drawTime))
  }

  return allErrors
}

/**
 * Parse price safely
 */
export function parseLotteryPrice(price: string): number {
  try {
    const parsed = parseFloat(price)
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100
  } catch {
    return 0
  }
}

/**
 * Create ISO datetime string from date and time inputs
 */
export function createISODateTime(drawDate: string, drawTime: string): string | null {
  try {
    if (!drawDate || !drawTime) return null
    const dateTime = new Date(`${drawDate}T${drawTime}:00`)
    if (isNaN(dateTime.getTime())) return null
    return dateTime.toISOString()
  } catch {
    return null
  }
}
