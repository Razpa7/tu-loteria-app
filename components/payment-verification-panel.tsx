"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, ExternalLink, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"

interface Ticket {
  id: string
  selected_number: string
  participant_name: string
  participant_email: string
  payment_status: string
  payment_receipt_url?: string
  created_at: string
  payment_verified_at?: string
  payment_rejected_at?: string
  payment_rejection_reason?: string
}

interface PaymentVerificationPanelProps {
  lotteryId: string
  lotteryTitle: string
  tickets: Ticket[]
}

export function PaymentVerificationPanel({ lotteryId, lotteryTitle, tickets }: PaymentVerificationPanelProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState("")

  const pendingTickets = tickets.filter((t) => t.payment_status === "verifying")
  const verifiedTickets = tickets.filter((t) => t.payment_status === "verified")
  const rejectedTickets = tickets.filter((t) => t.payment_status === "rejected")

  const handleVerifyPayment = async (ticket: Ticket) => {
    setIsProcessing(true)
    try {
      const supabase = createClient()

      await supabase
        .from("lottery_tickets")
        .update({
          payment_status: "verified",
          payment_verified_at: new Date().toISOString(),
        })
        .eq("id", ticket.id)

      const { data: ticketData } = await supabase.from("lottery_tickets").select("user_id").eq("id", ticket.id).single()

      if (ticketData?.user_id) {
        await supabase.from("notifications").insert({
          user_id: ticketData.user_id,
          lottery_id: lotteryId,
          type: "payment_verified",
          title: "Pago Verificado",
          message: "Tu pago ha sido verificado exitosamente. ¡Estás participando en el sorteo!",
        })
      }

      console.log("[v0] 📧 Sending payment approval email to:", ticket.participant_email)

      const { data: lotteryData } = await supabase
        .from("lotteries")
        .select("prize_title, draw_date, ticket_price, created_by")
        .eq("id", lotteryId)
        .single()

      let organizerEmail = "No disponible"
      let organizerName = "Organizador"
      let organizerPhone = "No disponible"

      if (lotteryData?.created_by) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email, phone, full_name")
          .eq("id", lotteryData.created_by)
          .single()

        if (profileData) {
          organizerEmail = profileData.email || "No disponible"
          organizerName = profileData.full_name || profileData.email?.split("@")[0] || "Organizador"
          organizerPhone = profileData.phone || "No disponible"
        }
      }

      const emailResponse = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment_approved",
          participantEmail: ticket.participant_email,
          participantName: ticket.participant_name,
          lotteryTitle: lotteryTitle,
          selectedNumbers: [Number.parseInt(ticket.selected_number)],
          lotteryDetails: lotteryData
            ? {
                prizeDescription: lotteryData.prize_title,
                drawDate: new Date(lotteryData.draw_date).toLocaleString("es-ES", {
                  dateStyle: "long",
                  timeStyle: "short",
                }),
                ticketPrice: lotteryData.ticket_price,
                organizerName: organizerName,
                organizerEmail: organizerEmail,
                organizerPhone: organizerPhone,
              }
            : undefined,
        }),
      })

      const emailResult = await emailResponse.json()

      if (!emailResponse.ok) {
        console.error("[v0] ❌ Failed to send approval email:", emailResult)
        alert("Pago verificado, pero hubo un problema al enviar el email de confirmación")
      } else {
        console.log("[v0] ✅ Approval email sent successfully")
        alert("✅ Pago verificado y email enviado exitosamente")
      }

      router.refresh()
    } catch (error) {
      console.error("Error verifying payment:", error)
      alert("Error al verificar el pago")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectPayment = async () => {
    if (!selectedTicket || !rejectionReason) return

    setIsProcessing(true)
    try {
      const supabase = createClient()

      console.log("[v0] ❌ Rejecting payment for number:", selectedTicket.selected_number)

      const { error: updateError } = await supabase
        .from("lottery_tickets")
        .update({
          payment_status: "rejected",
          payment_rejected_at: new Date().toISOString(),
          payment_rejection_reason: rejectionReason,
        })
        .eq("id", selectedTicket.id)

      if (updateError) {
        console.error("[v0] ❌ Error rejecting ticket:", updateError)
        throw updateError
      }

      const { data: lotteryData } = await supabase
        .from("lotteries")
        .select("prize_title, draw_date, ticket_price, created_by")
        .eq("id", lotteryId)
        .single()

      let organizerEmail = "No disponible"
      let organizerName = "Organizador"
      let organizerPhone = "No disponible"

      if (lotteryData?.created_by) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email, phone, full_name")
          .eq("id", lotteryData.created_by)
          .single()

        if (profileData) {
          organizerEmail = profileData.email || "No disponible"
          organizerName = profileData.full_name || profileData.email?.split("@")[0] || "Organizador"
          organizerPhone = profileData.phone || "No disponible"
        }
      }

      await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment_rejected",
          participantEmail: selectedTicket.participant_email,
          participantName: selectedTicket.participant_name,
          lotteryTitle: lotteryTitle,
          selectedNumbers: [Number.parseInt(selectedTicket.selected_number)],
          rejectionReason: rejectionReason,
          lotteryDetails: lotteryData
            ? {
                prizeDescription: lotteryData.prize_title,
                drawDate: new Date(lotteryData.draw_date).toLocaleString("es-ES", {
                  dateStyle: "long",
                  timeStyle: "short",
                }),
                ticketPrice: lotteryData.ticket_price,
                organizerName: organizerName,
                organizerEmail: organizerEmail,
                organizerPhone: organizerPhone,
              }
            : undefined,
        }),
      })

      console.log("[v0] ✅ Ticket rejected successfully, number is available but ticket kept in history")
      alert(`✅ Pago rechazado. El ticket se guardó en el historial de rechazados.`)

      setShowRejectDialog(false)
      setSelectedTicket(null)
      setRejectionReason("")
      router.refresh()
    } catch (error) {
      console.error("Error rejecting payment:", error)
      alert("Error al rechazar el pago")
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowRejectDialog(true)
  }

  const openReceiptDialog = (url: string) => {
    setReceiptUrl(url)
    setShowReceiptDialog(true)
  }

  const renderTicketCard = (ticket: Ticket, showActions = false) => (
    <Card key={ticket.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Número {ticket.selected_number}
              {ticket.payment_status === "verified" && <Badge className="bg-green-500">Verificado</Badge>}
              {ticket.payment_status === "verifying" && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendiente
                </Badge>
              )}
              {ticket.payment_status === "rejected" && <Badge variant="destructive">Rechazado</Badge>}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{ticket.participant_name}</p>
            <p className="text-xs text-muted-foreground">{ticket.participant_email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs text-muted-foreground">
          Reservado: {new Date(ticket.created_at).toLocaleString("es-ES")}
        </div>

        {ticket.payment_receipt_url && (
          <div>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
              onClick={() => openReceiptDialog(ticket.payment_receipt_url)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Comprobante
            </Button>
          </div>
        )}

        {ticket.payment_rejection_reason && (
          <div className="p-3 bg-destructive/10 rounded-md text-sm">
            <p className="font-semibold text-destructive">Motivo de rechazo:</p>
            <p className="text-muted-foreground">{ticket.payment_rejection_reason}</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleVerifyPayment(ticket)}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Verificar
            </Button>
            <Button
              onClick={() => openRejectDialog(ticket)}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Pagos pendientes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Pagos Pendientes de Verificación ({pendingTickets.length})</h2>
        {pendingTickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay pagos pendientes de verificación
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTickets.map((ticket) => renderTicketCard(ticket, true))}
          </div>
        )}
      </div>

      {/* Pagos verificados */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Pagos Verificados ({verifiedTickets.length})</h2>
        {verifiedTickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No hay pagos verificados aún</CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedTickets.map((ticket) => renderTicketCard(ticket, false))}
          </div>
        )}
      </div>

      {/* Pagos rechazados */}
      {rejectedTickets.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Pagos Rechazados ({rejectedTickets.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedTickets.map((ticket) => renderTicketCard(ticket, false))}
          </div>
        </div>
      )}

      {/* Dialog para rechazar pago */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Pago</DialogTitle>
            <DialogDescription>
              Ingresa el motivo por el cual estás rechazando este pago. El participante recibirá una notificación por
              email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Ej: El comprobante no es legible, el monto no coincide, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleRejectPayment}
                disabled={!rejectionReason || isProcessing}
                variant="destructive"
                className="flex-1"
              >
                Confirmar Rechazo
              </Button>
              <Button
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectionReason("")
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver comprobante */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {receiptUrl && (
              <div className="flex justify-center">
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={receiptUrl || "/placeholder.svg"}
                    alt="Comprobante de Pago"
                    width={800}
                    height={600}
                    className="rounded-md max-w-full h-auto"
                  />
                </a>
              </div>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <Button asChild variant="outline">
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                  Abrir en Nueva Pestaña
                </a>
              </Button>
              <Button onClick={() => setShowReceiptDialog(false)}>Cerrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
