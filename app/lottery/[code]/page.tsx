import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LotteryPublicView } from "@/components/lottery-public-view"
import { CountdownTimer } from "@/components/countdown-timer"
import { Card, CardContent } from "@/components/ui/card"
import { ShareButton } from "@/components/share-button"

type PageProps = {
  params: Promise<{ code: string }>
}

export default async function LotteryPublicPage({ params }: PageProps) {
  const { code } = await params

  const supabase = await createClient()

  const { data: lottery, error } = await supabase
    .from("lotteries")
    .select(
      `
      *,
      lottery_tickets (
        id,
        selected_number,
        participant_name,
        participant_email,
        payment_status
      )
    `,
    )
    .eq("share_code", code)
    .single()

  if (error || !lottery) {
    notFound()
  }

  let organizerData = null
  if (lottery.created_by) {
    const { data: organizer } = await supabase
      .from("profiles")
      .select("email, full_name, phone")
      .eq("id", lottery.created_by)
      .maybeSingle()

    organizerData = organizer
  }

  if (!lottery.bank_account || !lottery.bank_name) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-xl font-bold">Sorteo Incompleto</h2>
            <p className="text-muted-foreground">
              Este sorteo no tiene toda la información necesaria. Por favor contacta al creador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedNumbers =
    lottery.lottery_tickets
      ?.filter((t: { payment_status: string }) => t.payment_status !== "rejected")
      .map((t: { selected_number: string }) => t.selected_number) || []

  let winnerInfo = null
  if (lottery.winner_number) {
    const winnerTicket = lottery.lottery_tickets?.find((t: any) => t.selected_number === lottery.winner_number)
    if (winnerTicket) {
      winnerInfo = {
        name: winnerTicket.participant_name,
        number: lottery.winner_number,
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: lottery.background_color || "#f5f5f5" }}>
      <div className="bg-white dark:bg-zinc-800 border-b-2 border-zinc-200 dark:border-zinc-700">
        <div className="container max-w-5xl mx-auto px-2 py-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-shrink-0">
              <video autoPlay loop muted playsInline className="h-10 md:h-12 w-auto">
                <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20TuLoteria-GBJnTKldTjceSlm4QcFzofpuUwykaN.mp4" type="video/mp4" />
              </video>
            </div>

            <h1 className="text-lg md:text-3xl font-black text-center flex-1 mx-2">
              {lottery.prize_title || "Sorteo"}
            </h1>

            <ShareButton shareCode={code} />
          </div>

          {lottery.prize_images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-2">
              {lottery.prize_images.slice(0, 4).map((url: string, index: number) => (
                <div
                  key={index}
                  className="aspect-video md:aspect-square rounded bg-blue-500 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`${lottery.prize_title} - imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-xs md:text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Fecha: {new Date(lottery.draw_date).toLocaleDateString()} | Hora:{" "}
            {new Date(lottery.draw_date).toLocaleTimeString()} | Valor: ${lottery.ticket_price}
          </div>
        </div>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 p-2">
        <div className="container max-w-5xl mx-auto">
          {winnerInfo ? (
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardContent className="p-3 text-center space-y-1">
                <div className="text-3xl font-black text-green-600 dark:text-green-400">#{winnerInfo.number}</div>
                <div>
                  <h2 className="text-base font-bold">¡Sorteo Finalizado!</h2>
                  <p className="text-sm">
                    Ganador: <span className="font-bold">{winnerInfo.name}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CountdownTimer drawDate={lottery.draw_date} lotteryId={lottery.id} shareCode={code} />
          )}
        </div>
      </div>

      <LotteryPublicView
        lotteryId={lottery.id}
        selectedNumbers={selectedNumbers}
        ticketPrice={lottery.ticket_price}
        currentUser={null}
        bankAccount={lottery.bank_account}
        bankAlias={lottery.bank_alias}
        bankName={lottery.bank_name}
        drawDate={lottery.draw_date}
        prizeImages={lottery.prize_images || []}
        prizeTitle={lottery.prize_title}
        organizerEmail={organizerData?.email || "Organizador"}
        themeColor={lottery.theme_color || "#ea580c"}
        numberColor={lottery.number_color || "#ef4444"}
        buttonColor={lottery.button_color || "#ea580c"}
      />
    </div>
  )
}
