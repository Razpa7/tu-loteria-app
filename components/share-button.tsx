"use client"

import { Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function ShareButton({ shareCode }: { shareCode: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    const url = `${window.location.origin}/lottery/${shareCode}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Gran Sorteo",
          url,
        })
        return
      }
    } catch (error) {
      // Si navigator.share falla (permission denied, cancelado, etc),
      // continuar con el fallback de clipboard
      console.log("Share API not available or denied, using clipboard fallback")
    }

    // Fallback: copiar al portapapeles
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "¡Link copiado!",
        description: "El link del sorteo se copió al portapapeles",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (clipboardError) {
      toast({
        title: "Error",
        description: "No se pudo compartir el link",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      onClick={handleShare}
      className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-3 py-1.5 h-auto rounded font-bold gap-1"
    >
      {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
      {copied ? "¡Copiado!" : "Compartir"}
    </Button>
  )
}
