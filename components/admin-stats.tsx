"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Users, Ticket, DollarSign, CheckCircle } from "lucide-react"

export function AdminStats() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    paidEntries: 0,
    pendingEntries: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()

    try {
      const { data: entries, error } = await supabase.from("lottery_entries").select("payment_status")

      if (error) throw error

      if (entries) {
        const paid = entries.filter((e) => e.payment_status === "paid").length
        const pending = entries.filter((e) => e.payment_status === "pending").length

        setStats({
          totalEntries: entries.length,
          paidEntries: paid,
          pendingEntries: pending,
          totalRevenue: paid * 100, // Assuming 100 per entry
        })
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const statCards = [
    {
      title: "Total Participaciones",
      value: stats.totalEntries,
      icon: Ticket,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pagos Completados",
      value: stats.paidEntries,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pagos Pendientes",
      value: stats.pendingEntries,
      icon: Users,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Ingresos Totales",
      value: `$${stats.totalRevenue}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`h-8 w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
