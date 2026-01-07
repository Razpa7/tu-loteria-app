import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminStats } from "@/components/admin-stats"
import { AllEntries } from "@/components/all-entries"
import { Button } from "@/components/ui/button"
import { LogOut, Shield } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // In production, you'd check if user is admin from database
  // For now, all logged-in users can access admin panel

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground">{data.user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/dashboard">Ver Dashboard</a>
            </Button>
            <form action="/api/auth/logout" method="POST">
              <Button variant="outline" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>

        {/* Stats */}
        <AdminStats />

        {/* All Entries */}
        <AllEntries />
      </div>
    </div>
  )
}
