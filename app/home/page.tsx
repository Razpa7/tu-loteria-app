import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, PlusCircle, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Bienvenido</h1>
            <p className="text-muted-foreground text-lg">{data.user.email}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <Button variant="outline" type="submit" className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Lottery Card */}
          <Link href="/create-lottery" className="group">
            <Card className="h-full border-2 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20 cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <PlusCircle className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Crear Sorteo</CardTitle>
                <CardDescription className="text-base">
                  Configura un nuevo sorteo con premios, fecha y números
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="text-sm text-muted-foreground">
                  Define el premio, establece la fecha del sorteo y comparte el link con tus participantes
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* My Lotteries Card */}
          <Link href="/my-lotteries" className="group">
            <Card className="h-full border-2 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20 cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <LayoutDashboard className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Mis Sorteos</CardTitle>
                <CardDescription className="text-base">Gestiona tus sorteos y verifica pagos</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="text-sm text-muted-foreground">
                  Revisa estadísticas, verifica comprobantes de pago y gestiona ganadores de tus sorteos activos
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">Panel de control de sorteos premium</p>
        </div>
      </div>
    </div>
  )
}
