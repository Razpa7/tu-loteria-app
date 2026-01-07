"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Ticket } from "lucide-react"

interface LotteryEntry {
  id: string
  digit_1: number
  digit_2: number
  digit_3: number
  digit_4: number
  payment_status: string
  created_at: string
}

interface MyEntriesProps {
  userId: string
}

export function MyEntries({ userId }: MyEntriesProps) {
  const [entries, setEntries] = useState<LotteryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [userId])

  const loadEntries = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("lottery_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error loading entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Mis Participaciones</CardTitle>
        <CardDescription>Historial de números seleccionados</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aún no tienes participaciones</p>
            <p className="text-sm mt-2">Selecciona tus números para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border"
              >
                <div className="flex gap-2">
                  {[entry.digit_1, entry.digit_2, entry.digit_3, entry.digit_4].map((digit, index) => (
                    <div
                      key={index}
                      className="h-12 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary"
                    >
                      {String(digit).padStart(2, "0")}
                    </div>
                  ))}
                </div>
                <Badge variant={entry.payment_status === "paid" ? "default" : "secondary"}>
                  {entry.payment_status === "paid" ? "Pagado" : "Pendiente"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
