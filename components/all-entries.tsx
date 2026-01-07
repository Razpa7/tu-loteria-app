"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface Entry {
  id: string
  user_id: string
  digit_1: number
  digit_2: number
  digit_3: number
  digit_4: number
  payment_status: string
  payment_id: string | null
  created_at: string
  profiles: {
    email: string
  } | null
}

export function AllEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("lottery_entries")
        .select(`
          *,
          profiles (
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error loading entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePaymentStatus = async (entryId: string, status: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("lottery_entries")
        .update({
          payment_status: status,
          payment_id: status === "paid" ? `PAY-${Date.now()}` : null,
        })
        .eq("id", entryId)

      if (error) throw error
      loadEntries()
    } catch (error) {
      console.error("Error updating payment:", error)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Todas las Participaciones</CardTitle>
        <CardDescription>Gestiona los pagos y verifica las entradas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No hay participaciones aún</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Números</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>ID Pago</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.profiles?.email || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {[entry.digit_1, entry.digit_2, entry.digit_3, entry.digit_4].map((digit, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center justify-center h-8 w-8 rounded bg-primary/10 text-primary font-semibold text-sm"
                          >
                            {String(digit).padStart(2, "0")}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.payment_status === "paid" ? "default" : "secondary"}>
                        {entry.payment_status === "paid" ? "Pagado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.payment_id || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {entry.payment_status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updatePaymentStatus(entry.id, "paid")}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprobar
                          </Button>
                        )}
                        {entry.payment_status === "paid" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updatePaymentStatus(entry.id, "pending")}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Rechazar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
