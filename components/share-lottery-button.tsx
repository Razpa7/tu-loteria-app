"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ShareLotteryButton({ shareCode }: { shareCode: string }) {
  const handleShare = () => {
    const url = `${window.location.origin}/lottery/${shareCode}`
    navigator.clipboard.writeText(url)
    toast.success("Link copiado al portapapeles")
  }

  return (
    <Button variant="outline" size="icon" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
    </Button>
  )
}
