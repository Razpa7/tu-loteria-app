import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload receipt API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const ticketIds = JSON.parse(formData.get("ticketIds") as string)
    const lotteryId = formData.get("lotteryId") as string
    const participantEmail = formData.get("participantEmail") as string
    const participantName = formData.get("participantName") as string

    console.log("[v0] Received data:", { ticketIds, lotteryId, participantEmail, participantName })

    if (!file || !ticketIds || ticketIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Upload file to storage
    const fileExt = file.name.split(".").pop()
    const fileName = `receipts/${lotteryId}/${ticketIds[0]}-${Date.now()}.${fileExt}`

    console.log("[v0] Uploading file:", fileName)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("lottery-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("[v0] Upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    console.log("[v0] File uploaded successfully")

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("lottery-images").getPublicUrl(fileName)

    console.log("[v0] Public URL:", publicUrl)

    for (const ticketId of ticketIds) {
      console.log("[v0] Updating ticket:", ticketId)

      const { error: updateError } = await supabase
        .from("lottery_tickets")
        .update({
          payment_receipt_url: publicUrl,
          payment_status: "verifying",
        })
        .eq("id", ticketId)

      if (updateError) {
        console.error("[v0] Update error:", updateError)
        return NextResponse.json({ error: `Error actualizando ticket: ${updateError.message}` }, { status: 500 })
      }

      console.log("[v0] Ticket updated successfully")
    }

    const { data: lottery } = await supabase
      .from("lotteries")
      .select("created_by, prize_title, draw_date, ticket_price")
      .eq("id", lotteryId)
      .single()

    if (lottery) {
      console.log("[v0] Creating notification for user:", lottery.created_by)

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, phone, full_name")
        .eq("id", lottery.created_by)
        .single()

      try {
        const organizerEmail = profile?.email || "No disponible"
        const organizerPhone = profile?.phone || "No disponible"
        const organizerName = profile?.full_name || profile?.email?.split("@")[0] || "Organizador"

        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "payment_confirmation",
            participantEmail,
            participantName,
            lotteryTitle: lottery.prize_title,
            selectedNumbers: ticketIds
              .map((id: string) => {
                const ticket = formData.get(`number_${id}`)
                return ticket ? Number.parseInt(ticket as string) : 0
              })
              .filter((n: number) => n > 0),
            lotteryDetails: {
              prizeDescription: lottery.prize_title,
              drawDate: new Date(lottery.draw_date).toLocaleString("es-ES", {
                dateStyle: "long",
                timeStyle: "short",
              }),
              ticketPrice: lottery.ticket_price,
              organizerName,
              organizerEmail,
              organizerPhone,
            },
          }),
        })
        console.log("[v0] ✅ Confirmation email sent with lottery details")
      } catch (emailError) {
        console.error("[v0] ❌ Error sending confirmation email:", emailError)
      }
    }

    console.log("[v0] Upload receipt completed successfully")
    return NextResponse.json({ success: true, publicUrl })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
