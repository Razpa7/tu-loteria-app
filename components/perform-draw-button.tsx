"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PerformDrawButtonProps {
  lotteryId: string
  lotteryTitle: string
  verifiedCount: number
}

export function PerformDrawButton({ lotteryId, lotteryTitle, verifiedCount }: PerformDrawButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePerformDraw = async () => {
    if (verifiedCount === 0) {
      setError("No hay participantes verificados para realizar el sorteo")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/perform-draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lotteryId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al realizar el sorteo")
      }

      console.log("[v0] Draw successful:", data)
      alert(
        `¡Sorteo realizado exitosamente!\n\nGanador: ${data.winner.name}\nNúmero: ${data.winner.number}\n\nSe enviaron ${data.totalNotifications} notificaciones por email.`,
      )

      // Recargar la página para ver el ganador
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error performing draw:", err)
      setError(err.message || "Error al realizar el sorteo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full" size="lg" disabled={verifiedCount === 0}>
          <Trophy className="h-4 w-4 mr-2" />
          Realizar Sorteo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Realizar el sorteo ahora?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción seleccionará un ganador aleatorio entre los {verifiedCount} participantes con pago verificado y
            enviará notificaciones por email a TODOS los participantes.
            <br />
            <br />
            <strong>Esta acción no se puede deshacer.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handlePerformDraw} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Realizando...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Confirmar Sorteo
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </AlertDialogContent>
    </AlertDialog>
  )
}
