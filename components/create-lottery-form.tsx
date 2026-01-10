"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Calendar, DollarSign, Ticket, CreditCard, User, Phone } from "lucide-react"
import {
  validateCreateLotteryForm,
  createISODateTime,
  parseLotteryPrice,
  type CreateLotteryFormData,
  type ValidationError
} from "@/lib/lottery-validators"

interface CreateLotteryFormProps {
  userId: string
}

export function CreateLotteryForm({ userId }: CreateLotteryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    organizerName: "",
    organizerPhone: "",
    prizeTitle: "",
    drawDate: "",
    drawTime: "",
    ticketPrice: "",
    bankAccount: "",
    bankAlias: "",
    bankName: "",
    themeColor: "#ea580c",
    backgroundColor: "#f5f5f5",
    numberColor: "#ef4444",
    buttonColor: "#ea580c",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 5))
    }
  }

  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.organizerName,
          phone: formData.organizerPhone,
        })
        .eq("id", userId)

      if (profileError) {
        console.error("Error updating profile:", profileError)
        // Don't throw error, continue with lottery creation
      }

      const drawDateTime = new Date(`${formData.drawDate}T${formData.drawTime}`)

      const imageUrls: string[] = []

      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split(".").pop()
          const fileName = `${userId}/${Date.now()}-${Math.random()}.${fileExt}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("lottery-images")
            .upload(fileName, image)

          if (uploadError) throw uploadError

          const {
            data: { publicUrl },
          } = supabase.storage.from("lottery-images").getPublicUrl(fileName)

          imageUrls.push(publicUrl)
        }
      }

      const shareCode = generateShareCode()

      const { data: lottery, error: lotteryError } = await supabase
        .from("lotteries")
        .insert({
          created_by: userId,
          prize_title: formData.prizeTitle,
          prize_images: imageUrls,
          draw_date: drawDateTime.toISOString(),
          ticket_price: Math.round(Number.parseFloat(formData.ticketPrice) * 100) / 100,
          share_code: shareCode,
          status: "active",
          bank_account: formData.bankAccount,
          bank_alias: formData.bankAlias,
          bank_name: formData.bankName,
          theme_color: formData.themeColor,
          background_color: formData.backgroundColor,
          number_color: formData.numberColor,
          button_color: formData.buttonColor,
        })
        .select()
        .single()

      if (lotteryError) throw lotteryError

      await supabase.from("notifications").insert({
        user_id: userId,
        lottery_id: lottery.id,
        type: "lottery_created",
        title: "Sorteo Creado",
        message: `Tu sorteo "${formData.prizeTitle}" ha sido creado exitosamente`,
      })

      router.push(`/lottery-created/${shareCode}`)
    } catch (err) {
      console.error("Error creating lottery:", err)
      setError(err instanceof Error ? err.message : "Error al crear el sorteo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" />
          Detalles del Sorteo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Tus Datos Personales
            </h3>
            <p className="text-sm text-muted-foreground">
              Esta información se compartirá con los participantes en los correos electrónicos
            </p>

            <div className="space-y-2">
              <Label htmlFor="organizerName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre Completo
              </Label>
              <Input
                id="organizerName"
                placeholder="Juan Pérez"
                required
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizerPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="organizerPhone"
                type="tel"
                placeholder="+54 9 11 1234-5678"
                required
                value={formData.organizerPhone}
                onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Los participantes podrán contactarte en caso de dudas o consultas
              </p>
            </div>
          </div>

          {/* Premio */}
          <div className="space-y-2">
            <Label htmlFor="prize" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Premio del Sorteo
            </Label>
            <Input
              id="prize"
              placeholder="Ej: iPhone 15 Pro, $10,000 en efectivo, Auto 0km..."
              required
              value={formData.prizeTitle}
              onChange={(e) => setFormData({ ...formData, prizeTitle: e.target.value })}
            />
          </div>

          {/* Imágenes */}
          <div className="space-y-2">
            <Label htmlFor="images" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Fotos del Premio (opcional, máx. 5)
            </Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            {images.length > 0 && (
              <p className="text-sm text-muted-foreground">{images.length} imagen(es) seleccionada(s)</p>
            )}
          </div>

          {/* Fecha y hora */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha del Sorteo
              </Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.drawDate}
                onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora del Sorteo</Label>
              <Input
                id="time"
                type="time"
                required
                value={formData.drawTime}
                onChange={(e) => setFormData({ ...formData, drawTime: e.target.value })}
              />
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Precio por Número
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="10.00"
              required
              value={formData.ticketPrice}
              onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
            />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Datos para Pagos
            </h3>

            <div className="space-y-2">
              <Label htmlFor="bankName">Nombre del Banco</Label>
              <Input
                id="bankName"
                placeholder="Ej: Banco Santander, BBVA, Mercado Pago..."
                required
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">Número de Cuenta / CBU / CVU</Label>
              <Input
                id="bankAccount"
                placeholder="0000003100010000000000"
                required
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAlias">Alias (opcional)</Label>
              <Input
                id="bankAlias"
                placeholder="SORTEO.PREMIO.MP"
                value={formData.bankAlias}
                onChange={(e) => setFormData({ ...formData, bankAlias: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">El alias facilita que los participantes realicen el pago</p>
            </div>
          </div>

          {/* Personalización del Sorteo */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">🎨 Personalización del Sorteo</h3>
            <p className="text-sm text-muted-foreground">
              Personaliza los colores de tu página de sorteo para que coincida con tu marca
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="themeColor" className="text-xs">
                  Color Principal
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="themeColor"
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="h-10 w-full cursor-pointer"
                  />
                  <span className="text-xs font-mono">{formData.themeColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor" className="text-xs">
                  Fondo
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="h-10 w-full cursor-pointer"
                  />
                  <span className="text-xs font-mono">{formData.backgroundColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberColor" className="text-xs">
                  Números
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="numberColor"
                    type="color"
                    value={formData.numberColor}
                    onChange={(e) => setFormData({ ...formData, numberColor: e.target.value })}
                    className="h-10 w-full cursor-pointer"
                  />
                  <span className="text-xs font-mono">{formData.numberColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonColor" className="text-xs">
                  Botón
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="buttonColor"
                    type="color"
                    value={formData.buttonColor}
                    onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                    className="h-10 w-full cursor-pointer"
                  />
                  <span className="text-xs font-mono">{formData.buttonColor}</span>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-xs font-semibold">Vista Previa:</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold"
                  style={{ borderColor: formData.numberColor, color: formData.numberColor }}
                >
                  42
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded font-bold text-white text-sm"
                  style={{ backgroundColor: formData.buttonColor }}
                >
                  Continuar al Pago
                </button>
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Creando publicación..." : "Crear Publicación"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
