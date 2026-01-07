import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LotterySelector } from "@/components/lottery-selector"
import { MyEntries } from "@/components/my-entries"
import { Button } from "@/components/ui/button"
import { LogOut, Eye } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="w-full flex justify-center mb-6">
          <video autoPlay loop muted playsInline className="h-16 md:h-20 w-auto">
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20TuLoteria-GBJnTKldTjceSlm4QcFzofpuUwykaN.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">{data.user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/explorar-sorteos">
                <Eye className="h-4 w-4 mr-2" />
                Explorar Sorteos
              </Link>
            </Button>
            <form action="/api/auth/logout" method="POST">
              <Button variant="outline" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Lottery Selector */}
          <LotterySelector userId={data.user.id} />

          {/* My Entries */}
          <MyEntries userId={data.user.id} />
        </div>
      </div>
    </div>
  )
}
