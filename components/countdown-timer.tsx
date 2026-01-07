"use client"

import { useEffect, useState } from "react"
import { Clock, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface CountdownTimerProps {
  drawDate: string
  lotteryId: string
  shareCode: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ drawDate, lotteryId, shareCode }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [winner, setWinner] = useState<{ name: string; number: number } | null>(null)
  const [isInCutoffPeriod, setIsInCutoffPeriod] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(drawDate).getTime() - new Date().getTime()

      if (difference <= 0) {
        if (!isExpired && !isDrawing) {
          setIsExpired(true)
          performAutoDraw()
        }
        return null
      }

      const thirtyMinutes = 30 * 60 * 1000
      if (difference <= thirtyMinutes) {
        setIsInCutoffPeriod(true)
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    const performAutoDraw = async () => {
      setIsDrawing(true)
      console.log("[v0] ⏰ Time expired! Performing auto-draw for lottery:", lotteryId)

      try {
        const response = await fetch("/api/perform-draw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lotteryId }),
        })

        const result = await response.json()

        if (response.ok) {
          console.log("[v0] ✅ Auto-draw successful:", result)
          console.log(`[v0] 📧 Emails sent: ${result.emailsSent}/${result.totalParticipants}`)

          if (result.winner) {
            setWinner({
              name: result.winner.name,
              number: result.winner.number,
            })
          }

          setTimeout(() => {
            router.refresh()
          }, 3000)
        } else {
          console.error("[v0] ❌ Auto-draw failed:", result.error)
        }
      } catch (error) {
        console.error("[v0] ❌ Error performing auto-draw:", error)
      } finally {
        setIsDrawing(false)
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [drawDate, lotteryId, isExpired, isDrawing, router])

  if (winner) {
    return (
      <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold mb-3">¡Sorteo Realizado!</h3>
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mb-3">
            <div className="text-sm text-muted-foreground mb-1">Número Ganador</div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">#{winner.number}</div>
          </div>
          <div className="text-lg font-semibold text-green-700 dark:text-green-300">🎉 {winner.name}</div>
          <p className="text-sm text-muted-foreground mt-3">
            Todos los participantes han sido notificados por correo electrónico
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isDrawing) {
    return (
      <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
        <CardContent className="p-6 text-center">
          <Clock className="h-12 w-12 mx-auto mb-3 text-orange-500 animate-spin" />
          <h3 className="text-xl font-bold mb-2">Realizando Sorteo...</h3>
          <p className="text-muted-foreground text-sm">Seleccionando ganador y enviando notificaciones</p>
        </CardContent>
      </Card>
    )
  }

  if (!timeLeft) {
    return null
  }

  return (
    <div className="space-y-3">
      {isInCutoffPeriod && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-orange-700 dark:text-orange-400">Participación Cerrada</p>
                <p className="text-muted-foreground">
                  Ya no se aceptan nuevos participantes. El organizador está verificando los pagos antes del sorteo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4" />
            <h3 className="text-sm md:text-base font-bold">Tiempo Restante</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center bg-white/10 rounded p-2">
              <div className="text-2xl md:text-4xl font-bold text-red-500">{timeLeft.days}</div>
              <div className="text-[10px] md:text-xs font-medium mt-1">Días</div>
            </div>
            <div className="text-center bg-white/10 rounded p-2">
              <div className="text-2xl md:text-4xl font-bold text-orange-500">{timeLeft.hours}</div>
              <div className="text-[10px] md:text-xs font-medium mt-1">Horas</div>
            </div>
            <div className="text-center bg-white/10 rounded p-2">
              <div className="text-2xl md:text-4xl font-bold text-yellow-500">{timeLeft.minutes}</div>
              <div className="text-[10px] md:text-xs font-medium mt-1">Min</div>
            </div>
            <div className="text-center bg-white/10 rounded p-2">
              <div className="text-2xl md:text-4xl font-bold text-orange-400">{timeLeft.seconds}</div>
              <div className="text-[10px] md:text-xs font-medium mt-1">Seg</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
