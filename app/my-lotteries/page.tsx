import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Users, Plus, FileCheck, Trophy, TrendingUp, Clock, Mail, Phone, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ShareLotteryButton } from "@/components/share-lottery-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteLotteryButton } from "@/components/delete-lottery-button"
import { PerformDrawButton } from "@/components/perform-draw-button"

export default async function MyLotteriesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: lotteries } = await supabase
    .from("lotteries")
    .select("*, lottery_tickets(count)")
    .eq("created_by", data.user.id)
    .order("created_at", { ascending: false })

  const lotteriesWithDetails = await Promise.all(
    (lotteries || []).map(async (lottery) => {
      const { count: pendingCount } = await supabase
        .from("lottery_tickets")
        .select("*", { count: "exact", head: true })
        .eq("lottery_id", lottery.id)
        .eq("payment_status", "verifying")

      const { count: verifiedCount } = await supabase
        .from("lottery_tickets")
        .select("*", { count: "exact", head: true })
        .eq("lottery_id", lottery.id)
        .eq("payment_status", "verified")

      let winnerTicket = null
      if (lottery.winner_number) {
        const { data } = await supabase
          .from("lottery_tickets")
          .select("participant_name, participant_email, participant_phone, selected_number, payment_verified_at")
          .eq("lottery_id", lottery.id)
          .eq("selected_number", lottery.winner_number)
          .maybeSingle()

        winnerTicket = data
      }

      const drawDate = new Date(lottery.draw_date)
      const now = new Date()
      const isActive = drawDate > now

      return {
        ...lottery,
        isActive,
        pendingPayments: pendingCount || 0,
        verifiedPayments: verifiedCount || 0,
        winnerInfo: winnerTicket,
      }
    }),
  )

  const activeLotteries = lotteriesWithDetails.filter((l: any) => l.isActive)
  const completedLotteries = lotteriesWithDetails.filter((l: any) => !l.isActive)

  const totalRevenue = lotteriesWithDetails.reduce(
    (sum: number, lottery: any) => sum + lottery.verifiedPayments * Number.parseFloat(lottery.ticket_price),
    0,
  )
  const totalPendingPayments = lotteriesWithDetails.reduce(
    (sum: number, lottery: any) => sum + lottery.pendingPayments,
    0,
  )
  const totalParticipants = lotteriesWithDetails.reduce(
    (sum: number, lottery: any) => sum + lottery.verifiedPayments,
    0,
  )

  const LotteryCard = ({ lottery, showDelete = false }: { lottery: any; showDelete?: boolean }) => (
    <Card key={lottery.id}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl">{lottery.prize_title}</CardTitle>
          <Badge variant={lottery.isActive ? "default" : "secondary"}>
            {lottery.isActive ? "Activo" : "Finalizado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lottery.prize_images && lottery.prize_images[0] && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={lottery.prize_images[0] || "/placeholder.svg"}
              alt={lottery.prize_title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(lottery.draw_date).toLocaleString("es-ES", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />${lottery.ticket_price} por número
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {lottery.verifiedPayments} participante{lottery.verifiedPayments !== 1 ? "s" : ""} verificado
            {lottery.verifiedPayments !== 1 ? "s" : ""}
          </div>
          {!lottery.isActive && lottery.winnerInfo && (
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-lg mt-2">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold mb-3 text-base">
                <Trophy className="h-6 w-6" />
                ¡Sorteo Completado!
              </div>

              <div className="space-y-2 bg-white/50 dark:bg-black/20 p-3 rounded-md">
                <div className="text-sm">
                  <span className="font-semibold text-foreground">Número Ganador:</span>{" "}
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">#{lottery.winner_number}</span>
                </div>

                <div className="border-t border-green-200/50 dark:border-green-800/50 pt-2 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Datos del Ganador
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{lottery.winnerInfo.participant_name}</p>
                      </div>
                    </div>

                    {lottery.winnerInfo.participant_email && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-muted-foreground break-all">
                          {lottery.winnerInfo.participant_email}
                        </p>
                      </div>
                    )}

                    {lottery.winnerInfo.participant_phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{lottery.winnerInfo.participant_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-3 text-center">
                ✓ Todos los participantes fueron notificados por correo electrónico
              </div>
            </div>
          )}
        </div>

        {lottery.pendingPayments > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {lottery.pendingPayments} pago{lottery.pendingPayments > 1 ? "s" : ""} pendiente
              {lottery.pendingPayments > 1 ? "s" : ""} de verificación
            </p>
          </div>
        )}

        <div className="space-y-2">
          {lottery.isActive && !lottery.winner_number && lottery.verifiedPayments > 0 && (
            <PerformDrawButton
              lotteryId={lottery.id}
              lotteryTitle={lottery.prize_title}
              verifiedCount={lottery.verifiedPayments}
            />
          )}

          <Button asChild className="w-full">
            <Link href={`/my-lotteries/${lottery.id}/payments`}>
              <FileCheck className="h-4 w-4 mr-2" />
              Verificar Pagos ({lottery.pendingPayments})
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href={`/lottery/${lottery.share_code}`}>Ver Sorteo</Link>
            </Button>
            <ShareLotteryButton shareCode={lottery.share_code} />
          </div>

          {showDelete && !lottery.isActive && <DeleteLotteryButton lotteryId={lottery.id} />}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="w-full flex justify-center mb-6">
          <video autoPlay loop muted playsInline className="h-16 md:h-20 w-auto">
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20TuLoteria-GBJnTKldTjceSlm4QcFzofpuUwykaN.mp4" type="video/mp4" />
          </video>
        </div>
        {/* </CHANGE> */}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Panel de Control</h1>
            <p className="text-muted-foreground">Gestiona tus sorteos, verifica pagos y revisa ganadores</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="lg" variant="outline">
              <Link href="/explorar-sorteos">
                <Eye className="h-4 w-4 mr-2" />
                Explorar Sorteos
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/create-lottery">
                <Plus className="h-4 w-4 mr-2" />
                Crear Nuevo Sorteo
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sorteos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{lotteriesWithDetails.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeLotteries.length} activos, {completedLotteries.length} finalizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pagos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalPendingPayments}</div>
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requieren verificación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold">{totalParticipants}</div>
                <Users className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pagos verificados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">${totalRevenue.toFixed(2)}</div>
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">De pagos verificados</p>
            </CardContent>
          </Card>
        </div>

        {!lotteriesWithDetails || lotteriesWithDetails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No has creado ningún sorteo aún</p>
              <Button asChild>
                <Link href="/create-lottery">Crear Mi Primer Sorteo</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active">Sorteos Activos ({activeLotteries.length})</TabsTrigger>
              <TabsTrigger value="completed">Historial ({completedLotteries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {activeLotteries.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">No tienes sorteos activos</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeLotteries.map((lottery: any) => (
                    <LotteryCard key={lottery.id} lottery={lottery} showDelete={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedLotteries.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">No tienes sorteos finalizados</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedLotteries.map((lottery: any) => (
                    <LotteryCard key={lottery.id} lottery={lottery} showDelete={true} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
