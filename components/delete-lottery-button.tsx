"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
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
import { useState } from "react"

interface DeleteLotteryButtonProps {
  lotteryId: string
}

export function DeleteLotteryButton({ lotteryId }: DeleteLotteryButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      // Delete all associated tickets first
      const { error: ticketsError } = await supabase.from("lottery_tickets").delete().eq("lottery_id", lotteryId)

      if (ticketsError) throw ticketsError

      // Delete the lottery
      const { error: lotteryError } = await supabase.from("lotteries").delete().eq("id", lotteryId)

      if (lotteryError) throw lotteryError

      toast.success("Sorteo eliminado correctamente")
      router.refresh()
    } catch (error: any) {
      console.error("Error deleting lottery:", error)
      toast.error("Error al eliminar el sorteo: " + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full" disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar Sorteo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el sorteo y todos los datos asociados
            (participantes, pagos, etc.).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
