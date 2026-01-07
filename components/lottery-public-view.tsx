"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Copy, Upload, Check, AlertTriangle, FileWarning } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LotteryPublicViewProps {
  lotteryId: string
  selectedNumbers: string[]
  ticketPrice: number
  currentUser: { id: string; email?: string } | null
  bankAccount?: string
  bankAlias?: string
  bankName?: string
  drawDate: string
  prizeImages?: string[]
  prizeTitle?: string
  organizerEmail?: string
  themeColor?: string
  numberColor?: string
  buttonColor?: string
}

export function LotteryPublicView({
  lotteryId,
  selectedNumbers,
  ticketPrice,
  currentUser,
  bankAccount,
  bankAlias,
  bankName,
  drawDate,
  prizeImages = [],
  prizeTitle = "",
  organizerEmail = "",
  themeColor = "#ea580c",
  numberColor = "#ef4444",
  buttonColor = "#ea580c",
}: LotteryPublicViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedNumbersList, setSelectedNumbersList] = useState<string[]>([])
  const [participantName, setParticipantName] = useState("")
  const [participantEmail, setParticipantEmail] = useState(currentUser?.email || "")
  const [participantPhone, setParticipantPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "payment" | "receipt">("select")
  const [ticketIds, setTicketIds] = useState<string[]>([])
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const checkParticipationAllowed = () => {
    const drawTime = new Date(drawDate).getTime()
    const currentTime = new Date().getTime()
    const timeDiff = drawTime - currentTime
    const totalDuration = drawTime - new Date(drawDate).getTime() + timeDiff

    const twoHours = 2 * 60 * 60 * 1000
    const thirtyMinutes = 30 * 60 * 1000

    if (totalDuration > twoHours && timeDiff < thirtyMinutes) {
      return {
        allowed: false,
        message: "La participación cerró 30 minutos antes del sorteo para permitir la verificación de pagos.",
      }
    }

    if (timeDiff <= 0) {
      return {
        allowed: false,
        message: "Este sorteo ya finalizó.",
      }
    }

    return { allowed: true, message: "" }
  }

  const participationStatus = checkParticipationAllowed()

  const allNumbers = Array.from({ length: 100 }, (_, i) => {
    const num = i + 1
    return num.toString().padStart(2, "0")
  })

  const totalPrice = selectedNumbersList.length * ticketPrice

  const toggleNumber = (num: string) => {
    if (selectedNumbers.includes(num)) return

    if (selectedNumbersList.includes(num)) {
      setSelectedNumbersList(selectedNumbersList.filter((n) => n !== num))
    } else {
      setSelectedNumbersList([...selectedNumbersList, num])
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiado",
        description: `${label} copiado al portapapeles`,
      })
    } catch (err) {
      console.error("[v0] Error copying to clipboard:", err)
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      })
    }
  }

  const handleSelectNumber = async () => {
    console.log("[v0] Button clicked - Starting handleSelectNumber")
    console.log("[v0] Selected numbers:", selectedNumbersList)
    console.log("[v0] Participant name:", participantName)
    console.log("[v0] Participant email:", participantEmail)
    console.log("[v0] Participant phone:", participantPhone)

    if (selectedNumbersList.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const insertedTicketIds: string[] = []

      for (const number of selectedNumbersList) {
        const { data: existingTicket } = await supabase
          .from("lottery_tickets")
          .select("id")
          .eq("lottery_id", lotteryId)
          .eq("selected_number", number)
          .maybeSingle()

        if (existingTicket) {
          setError(`El número ${number} ya fue seleccionado. Por favor elige otro número.`)
          setIsLoading(false)
          router.refresh()
          return
        }

        const { data: ticket, error: insertError } = await supabase
          .from("lottery_tickets")
          .insert({
            lottery_id: lotteryId,
            user_id: currentUser?.id || null,
            selected_number: number,
            participant_name: participantName,
            participant_email: participantEmail,
            participant_phone: participantPhone,
            payment_status: "pending",
          })
          .select()
          .single()

        if (insertError) {
          if (insertError.message.includes("duplicate key")) {
            setError(`El número ${number} acaba de ser seleccionado por otro usuario. Por favor elige otro número.`)
            setIsLoading(false)
            router.refresh()
            return
          }
          throw insertError
        }

        insertedTicketIds.push(ticket.id)
      }

      if (currentUser) {
        await supabase.from("notifications").insert({
          user_id: currentUser.id,
          lottery_id: lotteryId,
          type: "ticket_purchased",
          title: "Números Seleccionados",
          message: `Has seleccionado ${selectedNumbersList.length} número(s): ${selectedNumbersList.join(", ")}`,
        })
      }

      setTicketIds(insertedTicketIds)
      setStep("payment")
      router.refresh()
    } catch (err) {
      console.error("Error selecting number:", err)
      setError(err instanceof Error ? err.message : "Error al seleccionar los números")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadReceipt = async () => {
    if (!receiptFile || ticketIds.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", receiptFile)
      formData.append("ticketIds", JSON.stringify(ticketIds))
      formData.append("lotteryId", lotteryId)
      formData.append("participantEmail", participantEmail)
      formData.append("participantName", participantName)

      const response = await fetch("/api/upload-receipt", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al subir el comprobante")
      }

      await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment_confirmation",
          participantEmail,
          participantName,
          lotteryTitle: "Sorteo",
          selectedNumbers: selectedNumbersList.map((n) => Number.parseInt(n)),
          totalAmount: totalPrice,
        }),
      })

      toast({
        title: "Comprobante Enviado",
        description: "Tu comprobante ha sido enviado. Espera la confirmación del organizador.",
      })

      setStep("receipt")
    } catch (err) {
      console.error("Error uploading receipt:", err)
      setError(err instanceof Error ? err.message : "Error al subir el comprobante")
    } finally {
      setIsUploading(false)
    }
  }

  if (step === "select") {
    if (!participationStatus.allowed) {
      return (
        <div className="max-w-4xl mx-auto">
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold">Participación Cerrada</h2>
              <p className="text-lg text-muted-foreground">{participationStatus.message}</p>
              <div className="pt-4 text-sm text-muted-foreground">
                El organizador está verificando los pagos de los participantes antes de realizar el sorteo.
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="bg-zinc-100 dark:bg-zinc-900 min-h-screen overflow-hidden">
        <div className="container max-w-5xl mx-auto p-1 space-y-1">
          {/* Main Content - Two Column Layout */}
          <div className="grid md:grid-cols-[1.5fr_1fr] gap-1">
            {/* Left Column - Number Selection */}
            <div className="space-y-1">
              <h2 className="text-base md:text-2xl font-black text-center leading-tight py-2">
                Ahora Selecciona El Numero
              </h2>

              {/* Number Grid - 10 columns */}
              <div className="grid grid-cols-10 gap-[2px]">
                {allNumbers.map((num) => {
                  const isAlreadyTaken = selectedNumbers.includes(num)
                  const isChosen = selectedNumbersList.includes(num)

                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      disabled={isAlreadyTaken}
                      className={`
                        aspect-square rounded-full font-bold text-[9px] md:text-xs transition-all
                        flex items-center justify-center
                        ${isAlreadyTaken ? "bg-zinc-400 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed" : ""}
                        ${isChosen ? "bg-green-500 text-white ring-1 ring-green-600" : ""}
                        ${!isAlreadyTaken && !isChosen ? "bg-white hover:bg-zinc-50 border border-zinc-200" : ""}
                      `}
                      style={
                        !isAlreadyTaken && !isChosen
                          ? {
                              color: numberColor,
                              borderColor: numberColor,
                            }
                          : undefined
                      }
                    >
                      {num}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Column - Form Section */}
            <div className="space-y-1">
              <div className="bg-white dark:bg-zinc-800 rounded p-1.5 space-y-1">
                <h3 className="text-sm md:text-base font-black text-center leading-tight">Tus Datos</h3>

                <div className="space-y-0.5">
                  <Label htmlFor="name" className="text-[9px] md:text-xs font-bold leading-tight">
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder=""
                    className="h-6 md:h-8 text-[10px] md:text-sm border-2 border-black dark:border-zinc-400 rounded bg-white dark:bg-zinc-700 px-1"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="email" className="text-[9px] md:text-xs font-bold leading-tight">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder=""
                    className="h-6 md:h-8 text-[10px] md:text-sm border-2 border-black dark:border-zinc-400 rounded bg-white dark:bg-zinc-700 px-1"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="phone" className="text-[9px] md:text-xs font-bold leading-tight">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={participantPhone}
                    onChange={(e) => setParticipantPhone(e.target.value)}
                    placeholder=""
                    className="h-6 md:h-8 text-[10px] md:text-sm border-2 border-black dark:border-zinc-400 rounded bg-white dark:bg-zinc-700 px-1"
                  />
                </div>

                <p className="text-[8px] md:text-xs text-center font-bold leading-tight">Mayor de 18...</p>

                {/* Payment Summary */}
                <div className="space-y-0.5 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between text-[10px] md:text-xs">
                    <span className="font-bold">Precio c/u</span>
                    <span className="font-bold">${ticketPrice}</span>
                  </div>
                  <div className="flex justify-between text-[10px] md:text-xs">
                    <span className="font-bold">Cantidad</span>
                    <span className="font-bold">× {selectedNumbersList.length}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5 border-t border-zinc-200 dark:border-zinc-700">
                    <span className="text-xs md:text-sm font-black">Total</span>
                    <span className="text-xs md:text-sm font-black">${totalPrice}</span>
                  </div>
                </div>

                {error && (
                  <div className="text-[8px] md:text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-1 rounded">
                    {error}
                  </div>
                )}

                <Button
                  onClick={() => {
                    console.log("[v0] Button click event fired")
                    handleSelectNumber()
                  }}
                  disabled={
                    selectedNumbersList.length === 0 ||
                    !participantName ||
                    !participantEmail ||
                    !participantPhone ||
                    isLoading
                  }
                  className="w-full text-xs md:text-sm font-black text-white h-8 md:h-10 rounded shadow-lg transition-all duration-200 disabled:bg-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
                  style={
                    selectedNumbersList.length > 0 &&
                    participantName &&
                    participantEmail &&
                    participantPhone &&
                    !isLoading
                      ? { backgroundColor: buttonColor }
                      : undefined
                  }
                >
                  {isLoading ? "Procesando..." : "Continuar al Pago"}
                </Button>

                <div className="text-[8px] text-zinc-500 space-y-0.5">
                  <div>Números: {selectedNumbersList.length > 0 ? "✓" : "✗"}</div>
                  <div>Nombre: {participantName ? "✓" : "✗"}</div>
                  <div>Email: {participantEmail ? "✓" : "✗"}</div>
                  <div>Teléfono: {participantPhone ? "✓" : "✗"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "payment") {
    return (
      <div className="max-w-2xl mx-auto p-2 md:p-4">
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-lg md:text-xl">Datos para Realizar el Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-3 md:p-6">
            {/* Organizer info section at the top */}
            {organizerEmail && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 shadow-sm">
                <h3 className="font-black text-base md:text-lg mb-3 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  👤 Organizador del Sorteo
                </h3>
                <div className="space-y-2 text-sm md:text-base bg-white dark:bg-zinc-900/50 rounded p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground font-semibold min-w-[100px]">📧 Email:</span>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-300 break-all">
                      {organizerEmail}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-800 pt-2 mt-2">
                    <p className="text-xs md:text-sm text-muted-foreground italic">
                      💬 Para consultas sobre el sorteo, contacta directamente al organizador por este email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">Números Reservados</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedNumbersList.map((num) => (
                  <span key={num} className="text-2xl md:text-3xl font-bold text-primary">
                    {num}
                  </span>
                ))}
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                <span className="text-xs md:text-sm text-muted-foreground">Total a Pagar</span>
                <span className="text-2xl md:text-3xl font-bold">${totalPrice}</span>
              </div>
            </div>

            <div className="space-y-3 bg-green-50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-black text-base md:text-lg text-green-900 dark:text-green-100 flex items-center gap-2">
                💳 Datos Bancarios del Organizador
              </h3>

              <p className="text-xs md:text-sm text-muted-foreground bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded border border-yellow-300 dark:border-yellow-700">
                ⚠️ Realiza la transferencia a estos datos bancarios del organizador del sorteo
              </p>

              {bankName && (
                <div className="space-y-1.5">
                  <Label className="text-xs md:text-sm font-bold">🏦 Banco</Label>
                  <div className="flex gap-2">
                    <Input
                      value={bankName}
                      readOnly
                      className="bg-white dark:bg-zinc-900 font-bold text-xs md:text-sm h-8 md:h-10 border-2"
                    />
                  </div>
                </div>
              )}

              {bankAccount && (
                <div className="space-y-1.5">
                  <Label className="text-xs md:text-sm font-bold">💵 Número de Cuenta / CBU / CVU</Label>
                  <div className="flex gap-2">
                    <Input
                      value={bankAccount}
                      readOnly
                      className="bg-white dark:bg-zinc-900 font-mono font-bold text-xs md:text-sm h-8 md:h-10 border-2"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(bankAccount, "Cuenta")}
                      className="h-8 w-8 md:h-10 md:w-10"
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {bankAlias && (
                <div className="space-y-1.5">
                  <Label className="text-xs md:text-sm font-bold">🔖 Alias</Label>
                  <div className="flex gap-2">
                    <Input
                      value={bankAlias}
                      readOnly
                      className="bg-white dark:bg-zinc-900 font-mono font-bold text-xs md:text-sm h-8 md:h-10 border-2"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(bankAlias, "Alias")}
                      className="h-8 w-8 md:h-10 md:w-10"
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base">
                <Upload className="h-4 w-4 md:h-5 md:w-5" />
                Subir Comprobante de Pago
              </h3>

              <Card className="border-red-500/50 bg-red-500/5">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <FileWarning className="h-5 w-5 md:h-6 md:w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-red-600 dark:text-red-400 text-sm md:text-base">
                        ¡IMPORTANTE! LEE ANTES DE SUBIR
                      </h4>
                      <div className="space-y-1.5 text-xs md:text-sm">
                        <p className="font-semibold">Tu comprobante DEBE ser:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-[10px] md:text-xs">
                          <li>
                            <strong>LEGIBLE:</strong> Texto claro, sin desenfoques
                          </li>
                          <li>
                            <strong>COMPLETO:</strong> Toda la información visible
                          </li>
                          <li>
                            <strong>CORRECTO:</strong> Monto y datos coinciden
                          </li>
                        </ul>
                        <div className="border-t border-red-500/20 pt-1.5 mt-2">
                          <p className="font-bold text-red-700 dark:text-red-300 text-[10px] md:text-xs">
                            ⚠️ Comprobantes ilegibles serán RECHAZADOS
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="receipt" className="text-xs md:text-sm font-semibold">
                  📎 Selecciona tu comprobante
                </Label>
                <Input
                  id="receipt"
                  type="file"
                  accept=".pdf,image/*"
                  capture="environment"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="cursor-pointer text-xs md:text-sm h-10 md:h-12 file:mr-2 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:md:text-sm"
                />
                {receiptFile && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Archivo seleccionado: {receiptFile.name}
                  </p>
                )}
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Sube una foto clara del comprobante desde tu móvil o selecciona un archivo PDF
                </p>
              </div>

              {error && (
                <div className="text-xs md:text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</div>
              )}

              <Button
                onClick={handleUploadReceipt}
                disabled={!receiptFile || isUploading}
                className="w-full h-11 md:h-12 text-sm md:text-base font-bold text-white"
                style={{ backgroundColor: buttonColor }}
              >
                {isUploading ? "Subiendo..." : "✓ Confirmar Pago"}
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  if (ticketIds.length > 0) {
                    const supabase = createClient()
                    await supabase.from("lottery_tickets").delete().in("id", ticketIds)

                    toast({
                      title: "Selección cancelada",
                      description: "Los números han sido liberados. Puedes elegir nuevamente.",
                    })
                  }

                  setStep("select")
                  setSelectedNumbersList([])
                  setTicketIds([])
                  setReceiptFile(null)
                  setError(null)
                  router.refresh()
                }}
                className="w-full h-10 md:h-11 text-xs md:text-sm"
                disabled={isUploading}
              >
                Cancelar y Elegir Otros Números
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">¡Comprobante Enviado!</h2>
          <p className="text-muted-foreground">
            Tu comprobante de pago ha sido enviado exitosamente. El organizador verificará tu pago y recibirás una
            confirmación por email a <strong>{participantEmail}</strong>
            {participantPhone && (
              <>
                {" "}
                y por teléfono al <strong>{participantPhone}</strong>
              </>
            )}
            .
          </p>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Tus números</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {selectedNumbersList.map((num) => (
                <span key={num} className="text-3xl font-bold text-primary">
                  {num}
                </span>
              ))}
            </div>
            <p className="text-xl font-bold text-primary mt-3">Total: ${totalPrice}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
