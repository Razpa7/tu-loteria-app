import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Fetching lottery with code:", params.code)
    
    // Obtener la lotería
    const { data: lottery, error: lotteryError } = await supabase
      .from("lotteries")
      .select("*")
      .eq("share_code", params.code)
      .single()

    if (lotteryError) {
      console.error("[v0] API Error fetching lottery:", lotteryError)
      return NextResponse.json({ error: "Lottery not found", details: lotteryError.message }, { status: 404 })
    }

    if (!lottery) {
      console.log("[v0] No lottery found with code:", params.code)
      return NextResponse.json({ error: "Lottery not found" }, { status: 404 })
    }

    console.log("[v0] Lottery found successfully:", lottery.id)
    
    // Obtener los tickets asociados a esta lotería
    const { data: tickets, error: ticketsError } = await supabase
      .from("lottery_tickets")
      .select("*")
      .eq("lottery_id", lottery.id)
      .order("created_at", { ascending: false })

    if (ticketsError) {
      console.warn("[v0] Warning fetching tickets (tabla podría no existir):", ticketsError.message)
      // No es error crítico si la tabla no existe, solo retornamos la lotería
      return NextResponse.json({ lottery, tickets: [] })
    }

    console.log("[v0] Tickets found:", tickets?.length || 0)
    return NextResponse.json({ lottery, tickets: tickets || [] })
  } catch (error) {
    console.error("[v0] API Exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
