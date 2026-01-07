import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Share2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { ShareLotteryButton } from "@/components/share-lottery-button"

export default async function LotteryCreatedPage({ params }: { params: { code: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: lottery } = await supabase
    .from("lotteries")
    .select("*")
    .eq("share_code", params.code)
    .eq("created_by", user.id)
    .single()

  if (!lottery) {
    redirect("/home")
  }

  const lotteryUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"}/lottery/${params.code}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">¡Publicación Creada Exitosamente!</CardTitle>
            <p className="text-muted-foreground text-lg">
              Tu sorteo <span className="font-semibold text-foreground">"{lottery.prize_title}"</span> está listo para
              compartir
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Preview del sorteo */}
            <div className="border rounded-lg p-4 space-y-3 bg-secondary/30">
              <h3 className="font-semibold text-lg">Vista Previa del Sorteo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Premio:</span>
                  <span className="font-medium">{lottery.prize_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio por número:</span>
                  <span className="font-medium">${lottery.ticket_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha del sorteo:</span>
                  <span className="font-medium">{new Date(lottery.draw_date).toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código único:</span>
                  <span className="font-mono font-bold text-primary">{lottery.share_code}</span>
                </div>
              </div>
            </div>

            {/* Link para compartir */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Comparte tu Sorteo
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lotteryUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-secondary border rounded-lg font-mono text-sm"
                />
                <ShareLotteryButton code={params.code} url={lotteryUrl} />
              </div>
              <p className="text-sm text-muted-foreground">
                Los participantes podrán acceder a este link para seleccionar sus números sin necesidad de registrarse
              </p>
            </div>

            {/* Botones de acción */}
            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <Button asChild variant="outline" size="lg">
                <Link href={`/lottery/${params.code}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Sorteo Público
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/my-lotteries">Ver Mis Sorteos</Link>
              </Button>
            </div>

            {/* Información adicional */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Próximos Pasos
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Comparte el link en redes sociales y grupos de WhatsApp</li>
                <li>Los participantes seleccionarán números y subirán sus comprobantes de pago</li>
                <li>Recibirás notificaciones cuando haya nuevos pagos para verificar</li>
                <li>El sorteo se realizará automáticamente en la fecha programada</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
