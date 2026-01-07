import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Sorteo no Encontrado</h2>
          <p className="text-muted-foreground">El sorteo que buscas no existe o ha sido eliminado.</p>
          <Button asChild className="w-full">
            <Link href="/home">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
