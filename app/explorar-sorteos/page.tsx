import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DollarSign, Users, Calendar } from "lucide-react"

interface Lottery {
  id: string
  prize_title: string
  prize_images: string[]
  ticket_price: number
  draw_date: string
  share_code: string
  status: string
  background_color: string
  theme_color: string
  button_color: string
  winner_number: string | null
  created_at: string
}

interface TicketCount {
  lottery_id: string
  verified_count: number
}

export default async function ExplorarSorteosPage() {
  let supabase
  try {
    supabase = await createClient()
    console.log("[v0] Supabase client created successfully")
  } catch (error) {
    console.error("[v0] Error creating Supabase client:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12 text-center">
            <p className="text-xl text-destructive mb-4">Error de conexión</p>
            <p className="text-muted-foreground mb-6">No se pudo conectar con la base de datos</p>
            <Link href="/">
              <Button>Volver al Inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const now = new Date().toISOString()

  const { data: lotteries, error } = await supabase
    .from("lotteries")
    .select("*")
    .is("winner_number", null)
    .gt("draw_date", now)
    .order("draw_date", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching lotteries:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12 text-center">
            <p className="text-xl text-destructive mb-4">Error al cargar sorteos</p>
            <p className="text-muted-foreground mb-6">{error.message || "No se pudieron cargar los sorteos"}</p>
            <Link href="/">
              <Button>Volver al Inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log("[v0] Lotteries loaded successfully:", lotteries?.length || 0)

  const { data: ticketCounts } = await supabase
    .from("lottery_tickets")
    .select("lottery_id")
    .eq("payment_status", "verified")

  // Count tickets per lottery
  const ticketCountMap: Record<string, number> = {}
  ticketCounts?.forEach((ticket) => {
    ticketCountMap[ticket.lottery_id] = (ticketCountMap[ticket.lottery_id] || 0) + 1
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Explora Sorteos Disponibles</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre todos los sorteos activos y participa para ganar increíbles premios
          </p>
        </div>
      </div>

      {/* Lotteries Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {!lotteries || lotteries.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-xl text-muted-foreground mb-4">No hay sorteos disponibles en este momento</p>
              <Link href="/">
                <Button>Volver al Inicio</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lotteries.map((lottery) => {
              const drawDate = new Date(lottery.draw_date)
              const participantCount = ticketCountMap[lottery.id] || 0

              return (
                <Card
                  key={lottery.id}
                  className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/30"
                  style={{ borderColor: lottery.theme_color || undefined }}
                >
                  <CardHeader className="p-0" style={{ backgroundColor: lottery.background_color || "#f5f5f5" }}>
                    {/* Prize Image */}
                    <div className="relative aspect-video bg-gradient-to-br from-blue-400 to-blue-600">
                      {lottery.prize_images && lottery.prize_images[0] ? (
                        <img
                          src={lottery.prize_images[0] || "/placeholder.svg"}
                          alt={lottery.prize_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                          🎁
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600">Activo</Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="text-xl font-bold line-clamp-2 min-h-[3.5rem]">{lottery.prize_title}</h3>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-muted-foreground text-xs">Precio</p>
                          <p className="font-bold">${Number(lottery.ticket_price).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-muted-foreground text-xs">Participantes</p>
                          <p className="font-bold">{participantCount}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 col-span-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-muted-foreground text-xs">Fecha del Sorteo</p>
                          <p className="font-semibold">
                            {drawDate.toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href={`/lottery/${lottery.share_code}`} className="block">
                      <Button
                        className="w-full font-bold"
                        style={{ backgroundColor: lottery.button_color || undefined }}
                      >
                        Ver Sorteo y Participar
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Quieres crear tu propio sorteo?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Crea sorteos personalizados, gestiona participantes y realiza sorteos transparentes
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Crear Cuenta Gratis
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                Conocer Más
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
