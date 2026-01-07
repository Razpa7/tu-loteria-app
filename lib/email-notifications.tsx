import { Resend } from "resend"

// Inicializar Resend de forma segura
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Resend solo permite enviar desde dominios verificados
// El único dominio que funciona sin verificación es onboarding@resend.dev
const FROM_EMAIL = "Tu Lotería <onboarding@resend.dev>"

console.log("[v0] 📧 Email configurado como:", FROM_EMAIL)

const getEmailTemplate = (params: {
  title: string
  subtitle: string
  content: string
  actionButton?: { text: string; url: string }
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: white; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🎰 Tu Lotería
              </h1>
            </td>
          </tr>
          
          <!-- Título -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <h2 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: bold;">
                ${params.title}
              </h2>
              ${params.subtitle ? `<p style="margin: 10px 0 0; color: #6b7280; font-size: 16px;">${params.subtitle}</p>` : ""}
            </td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                ${params.content}
              </div>
              
              ${
                params.actionButton
                  ? `
              <div style="text-align: center; margin-top: 30px;">
                <a href="${params.actionButton.url}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  ${params.actionButton.text}
                </a>
              </div>
              `
                  : ""
              }
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Este es un correo automático del sistema de sorteos Tu Lotería
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                Por favor no respondas a este email
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export async function sendPaymentConfirmationEmail(
  participantEmail: string,
  lotteryTitle: string,
  participantName: string,
  selectedNumbers: number[],
  lotteryDetails?: {
    prizeDescription: string
    drawDate: string
    ticketPrice: number
    organizerName: string
    organizerEmail: string
    organizerPhone: string
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] 📧 Enviando confirmación de pago a:", participantEmail)

    if (!resend) {
      console.warn("[v0] ⚠️ Resend no está configurado. El email no se enviará.")
      return { success: false, error: "Resend API Key missing" }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: participantEmail,
      subject: `✅ Comprobante recibido - ${lotteryTitle}`,
      html: getEmailTemplate({
        title: "¡Comprobante Recibido!",
        subtitle: "Hemos recibido tu comprobante de pago",
        content: `
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Hola ${participantName},</strong>
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            Hemos recibido tu comprobante de pago para el sorteo <strong>${lotteryTitle}</strong>.
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Números seleccionados:</strong> ${selectedNumbers.map((n) => `#${n}`).join(", ")}
          </p>
          ${
            lotteryDetails
              ? `
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: bold;">📋 Detalles del Sorteo</h3>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Premio:</strong> ${lotteryDetails.prizeDescription}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Fecha del sorteo:</strong> ${lotteryDetails.drawDate}</p>
            <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Precio por número:</strong> $${lotteryDetails.ticketPrice}</p>
          </div>
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: bold;">👤 Datos del Organizador</h3>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Nombre:</strong> ${lotteryDetails.organizerName}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Email:</strong> ${lotteryDetails.organizerEmail}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Teléfono:</strong> ${lotteryDetails.organizerPhone}</p>
            <p style="margin: 15px 0 0; color: #6b7280; font-size: 12px; font-style: italic;">Puedes contactar al organizador si tienes alguna pregunta sobre el sorteo.</p>
          </div>
          `
              : ""
          }
          <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
            El organizador verificará tu pago pronto y te notificaremos por email.
          </p>
        `,
      }),
    })

    if (error) {
      console.error("[v0] ❌ Error enviando email:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Email enviado exitosamente:", data)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] ❌ Error fatal enviando email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendPaymentApprovedEmail(
  participantEmail: string,
  lotteryTitle: string,
  participantName: string,
  selectedNumbers: number[],
  lotteryDetails?: {
    prizeDescription: string
    drawDate: string
    ticketPrice: number
    organizerName: string
    organizerEmail: string
    organizerPhone: string
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] 📧 Enviando aprobación de pago a:", participantEmail)
    console.log("[v0] 📝 Email details:", {
      to: participantEmail,
      subject: `✅ ¡Pago Aprobado! - ${lotteryTitle}`,
      numbers: selectedNumbers,
    })

    if (!resend) {
      console.warn("[v0] ⚠️ Resend no está configurado. El email no se enviará.")
      return { success: false, error: "Resend API Key missing" }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: participantEmail,
      subject: `✅ ¡Pago Aprobado! - ${lotteryTitle}`,
      html: getEmailTemplate({
        title: "¡Pago Aprobado!",
        subtitle: "Tu participación ha sido confirmada",
        content: `
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>¡Excelente noticia ${participantName}!</strong>
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            Tu pago ha sido verificado y aprobado para el sorteo <strong>${lotteryTitle}</strong>.
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Números confirmados:</strong> ${selectedNumbers.map((n) => `#${n}`).join(", ")}
          </p>
          <p style="margin: 0 0 15px; color: #16a34a; font-size: 18px; font-weight: bold;">
            ✅ ¡Ya estás participando oficialmente!
          </p>
          ${
            lotteryDetails
              ? `
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: bold;">📋 Detalles del Sorteo</h3>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Premio:</strong> ${lotteryDetails.prizeDescription}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Fecha del sorteo:</strong> ${lotteryDetails.drawDate}</p>
            <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Precio pagado:</strong> $${lotteryDetails.ticketPrice * selectedNumbers.length}</p>
          </div>
          <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: bold;">👤 Datos del Organizador</h3>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Nombre:</strong> ${lotteryDetails.organizerName}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Email:</strong> ${lotteryDetails.organizerEmail}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Teléfono:</strong> ${lotteryDetails.organizerPhone}</p>
            <p style="margin: 15px 0 0; color: #6b7280; font-size: 12px; font-style: italic;">Puedes contactar al organizador si tienes alguna pregunta sobre el sorteo.</p>
          </div>
          `
              : ""
          }
          <p style="margin: 15px 0 0; color: #374151; font-size: 14px;">
            Te notificaremos por email cuando se realice el sorteo y se anuncien los ganadores.
          </p>
        `,
      }),
    })

    if (error) {
      console.error("[v0] ❌ Error enviando email de aprobación:", error)
      console.error("[v0] ❌ Error details:", JSON.stringify(error))
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Email de aprobación enviado exitosamente")
    console.log("[v0] 📧 Resend email ID:", data?.id)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] ❌ Error fatal enviando email de aprobación:", error)
    return { success: false, error: error.message }
  }
}

export async function sendPaymentRejectedEmail(
  participantEmail: string,
  lotteryTitle: string,
  participantName: string,
  selectedNumbers: number[],
  rejectionReason?: string,
  lotteryDetails?: {
    prizeDescription: string
    drawDate: string
    ticketPrice: number
    organizerName: string
    organizerEmail: string
    organizerPhone: string
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] 📧 Enviando rechazo de pago a:", participantEmail)

    if (!resend) {
      console.warn("[v0] ⚠️ Resend no está configurado. El email no se enviará.")
      return { success: false, error: "Resend API Key missing" }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: participantEmail,
      subject: `❌ Comprobante Rechazado - ${lotteryTitle}`,
      html: getEmailTemplate({
        title: "Comprobante Rechazado",
        subtitle: "Tu comprobante no pudo ser verificado",
        content: `
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Hola ${participantName},</strong>
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            Lamentablemente, tu comprobante de pago no es legible o tiene defectos, para el sorteo <strong>${lotteryTitle}</strong>.
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Números que intentaste seleccionar:</strong> ${selectedNumbers.map((n) => `#${n}`).join(", ")}
          </p>
          ${
            rejectionReason
              ? `
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0 0 10px; color: #991b1b; font-size: 16px; font-weight: bold;">
              📋 Motivo del rechazo:
            </p>
            <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.6;">
              ${rejectionReason}
            </p>
          </div>
          `
              : ""
          }
          ${
            lotteryDetails
              ? `
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: bold;">📋 Detalles del Sorteo</h3>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Premio:</strong> ${lotteryDetails.prizeDescription}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Fecha del sorteo:</strong> ${lotteryDetails.drawDate}</p>
            <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Precio por número:</strong> $${lotteryDetails.ticketPrice}</p>
          </div>
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: bold;">👤 Datos del Organizador</h3>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Nombre:</strong> ${lotteryDetails.organizerName}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Email:</strong> ${lotteryDetails.organizerEmail}</p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Teléfono:</strong> ${lotteryDetails.organizerPhone}</p>
            <p style="margin: 15px 0 0; color: #6b7280; font-size: 12px; font-style: italic;">Puedes contactar al organizador si tienes dudas sobre el rechazo.</p>
          </div>
          `
              : ""
          }
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
              ⚠️ <strong>Los números que seleccionaste ahora están disponibles nuevamente</strong> para otros participantes. Si deseas participar, deberás volver a seleccionar números disponibles y subir un nuevo comprobante válido y legible.
            </p>
          </div>
          <p style="margin: 0; color: #dc2626; font-size: 16px; font-weight: bold;">
            Por favor, asegúrate de subir un comprobante completamente legible y correcto.
          </p>
        `,
      }),
    })

    if (error) {
      console.error("[v0] ❌ Error enviando email:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Email de rechazo enviado exitosamente:", data)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] ❌ Error fatal enviando email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendWinnerNotificationEmail(
  participantEmail: string,
  lotteryTitle: string,
  participantName: string,
  winningNumber: number,
  prize: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] 🏆 Enviando notificación de GANADOR a:", participantEmail)

    if (!resend) {
      console.warn("[v0] ⚠️ Resend no está configurado. El email no se enviará.")
      return { success: false, error: "Resend API Key missing" }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: participantEmail,
      subject: `🎉 ¡FELICIDADES! Ganaste el sorteo - ${lotteryTitle}`,
      html: getEmailTemplate({
        title: "🎉 ¡GANASTE!",
        subtitle: "¡Eres el ganador del sorteo!",
        content: `
          <p style="margin: 0 0 20px; color: #374151; font-size: 18px; line-height: 1.6; font-weight: bold; text-align: center;">
            🎊 ¡FELICIDADES ${participantName.toUpperCase()}! 🎊
          </p>
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 10px; color: white; font-size: 16px; font-weight: 600;">
              Número Ganador
            </p>
            <p style="margin: 0; color: white; font-size: 64px; font-weight: bold; line-height: 1;">
              #${winningNumber}
            </p>
          </div>
          <p style="margin: 20px 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Sorteo:</strong> ${lotteryTitle}
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Premio:</strong> ${prize}
          </p>
          <p style="margin: 20px 0 0; color: #16a34a; font-size: 18px; font-weight: bold; text-align: center;">
            🏆 ¡El organizador se pondrá en contacto contigo pronto! 🏆
          </p>
        `,
      }),
    })

    if (error) {
      console.error("[v0] ❌ Error enviando email de ganador:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Email de ganador enviado exitosamente:", data)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] ❌ Error fatal enviando email de ganador:", error)
    return { success: false, error: error.message }
  }
}

export async function sendNonWinnerNotificationEmail(
  participantEmail: string,
  lotteryTitle: string,
  participantName: string,
  winningNumber: number,
  userNumber: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] 📧 Enviando notificación de no ganador a:", participantEmail)

    if (!resend) {
      console.warn("[v0] ⚠️ Resend no está configurado. El email no se enviará.")
      return { success: false, error: "Resend API Key missing" }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: participantEmail,
      subject: `Resultado del sorteo - ${lotteryTitle}`,
      html: getEmailTemplate({
        title: "Resultado del Sorteo",
        subtitle: "El sorteo ha finalizado",
        content: `
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Hola ${participantName},</strong>
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            El sorteo <strong>${lotteryTitle}</strong> ha finalizado.
          </p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
              Número Ganador
            </p>
            <p style="margin: 0 0 15px; color: #1f2937; font-size: 48px; font-weight: bold;">
              #${winningNumber}
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Tu número fue: #${userNumber}
            </p>
          </div>
          <p style="margin: 20px 0 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
            Esta vez no fue tu turno, pero gracias por participar.<br/>
            ¡Te esperamos en el próximo sorteo!
          </p>
        `,
      }),
    })

    if (error) {
      console.error("[v0] ❌ Error enviando email:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Email enviado exitosamente:", data)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] ❌ Error fatal enviando email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendNewPaymentNotificationToCreator(
  creatorEmail: string,
  lotteryTitle: string,
  participantName: string,
  selectedNumbers: number[],
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] 📧 Enviando notificación al creador:", creatorEmail)

    if (!resend) {
      console.warn("[v0] ⚠️ Resend no está configurado. El email no se enviará.")
      return { success: false, error: "Resend API Key missing" }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: creatorEmail,
      subject: `🔔 Nuevo pago pendiente - ${lotteryTitle}`,
      html: getEmailTemplate({
        title: "Nuevo Pago Pendiente",
        subtitle: "Un participante ha subido su comprobante",
        content: `
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>${participantName}</strong> ha subido un comprobante de pago para tu sorteo.
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Sorteo:</strong> ${lotteryTitle}
          </p>
          <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>Números:</strong> ${selectedNumbers.map((n) => `#${n}`).join(", ")}
          </p>
          <p style="margin: 20px 0 0; color: #f97316; font-size: 16px; font-weight: bold;">
            Ve a tu panel de control para verificar el pago.
          </p>
        `,
        actionButton: {
          text: "Verificar Pago",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/my-lotteries`,
        },
      }),
    })

    if (error) {
      console.error("[v0] ❌ Error enviando email:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Email enviado exitosamente:", data)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] ❌ Error fatal enviando email:", error)
    return { success: false, error: error.message }
  }
}
