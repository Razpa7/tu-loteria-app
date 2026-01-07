import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PaymentVerificationPanel } from "@/components/payment-verification-panel"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function PaymentVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Obtener el sorteo y verificar que el usuario es el creador
  const { data: lottery, error: lotteryError } = await supabase
    .from("lotteries")
    .select("*, lottery_tickets(*)")
    .eq("id", id)
    .eq("created_by", data.user.id)
    .single()

  if (lotteryError || !lottery) {
    notFound()
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/my-lotteries">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Sorteos
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">Verificación de Pagos</h1>
          <p className="text-muted-foreground">{lottery.prize_title}</p>
        </div>

        <PaymentVerificationPanel
          lotteryId={lottery.id}
          lotteryTitle={lottery.prize_title}
          tickets={lottery.lottery_tickets}
        />
      </div>
    </div>
  )
}
