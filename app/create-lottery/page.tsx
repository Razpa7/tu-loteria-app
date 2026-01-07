import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateLotteryForm } from "@/components/create-lottery-form"

export default async function CreateLotteryPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Crear Sorteo</h1>
          <p className="text-muted-foreground">Completa el formulario para crear tu sorteo y compartirlo con otros</p>
        </div>

        <CreateLotteryForm userId={data.user.id} />
      </div>
    </div>
  )
}
