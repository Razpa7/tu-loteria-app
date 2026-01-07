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

    const { data: lottery, error } = await supabase
      .from("lotteries")
      .select("*, lottery_tickets(*)")
      .eq("share_code", params.code)
      .single()

    if (error) {
      console.error("[v0] API Error fetching lottery:", error)
      return NextResponse.json({ error: "Lottery not found", details: error.message }, { status: 404 })
    }

    if (!lottery) {
      console.log("[v0] No lottery found with code:", params.code)
      return NextResponse.json({ error: "Lottery not found" }, { status: 404 })
    }

    console.log("[v0] Lottery found successfully:", lottery.id)
    return NextResponse.json({ lottery })
  } catch (error) {
    console.error("[v0] API Exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
