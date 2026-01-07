import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendWinnerNotificationEmail, sendNonWinnerNotificationEmail } from "@/lib/email-notifications"

// Cliente de Supabase con service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function getSecureRandomIndex(max: number): number {
  // Usar Web Crypto API para números aleatorios seguros
  const randomBuffer = new Uint32Array(1)
  crypto.getRandomValues(randomBuffer)
  return randomBuffer[0] % max
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    const { lotteryId } = await request.json()

    if (!lotteryId) {
      return NextResponse.json({ error: "Lottery ID is required" }, { status: 400 })
    }

    console.log("[v0] 🎲 Starting lottery draw for ID:", lotteryId)

    // Obtener el sorteo
    const { data: lottery, error: lotteryError } = await supabase
      .from("lotteries")
      .select("*")
      .eq("id", lotteryId)
      .single()

    if (lotteryError || !lottery) {
      console.error("[v0] Lottery not found:", lotteryError)
      return NextResponse.json({ error: "Lottery not found" }, { status: 404 })
    }

    // Verificar que el sorteo no haya sido realizado ya
    if (lottery.winner_number) {
      console.log("[v0] Lottery already drawn, winner:", lottery.winner_number)
      return NextResponse.json({ error: "Lottery already drawn" }, { status: 400 })
    }

    const { data: allTickets, error: allTicketsError } = await supabase
      .from("lottery_tickets")
      .select("*")
      .eq("lottery_id", lotteryId)

    if (allTicketsError) {
      console.error("[v0] Error fetching all tickets:", allTicketsError)
    } else {
      console.log("[v0] 📋 All tickets in lottery:", allTickets?.length || 0)
      if (allTickets && allTickets.length > 0) {
        const statusCounts = allTickets.reduce((acc: any, ticket: any) => {
          acc[ticket.payment_status] = (acc[ticket.payment_status] || 0) + 1
          return acc
        }, {})
        console.log("[v0] 📊 Ticket statuses:", statusCounts)
      }
    }

    // Obtener todos los tickets verificados O en verificación para sorteo automático
    const { data: tickets, error: ticketsError } = await supabase
      .from("lottery_tickets")
      .select("*")
      .eq("lottery_id", lotteryId)
      .in("payment_status", ["verified", "verifying"])

    if (ticketsError) {
      console.error("[v0] Error fetching tickets:", ticketsError)
      return NextResponse.json({ error: "Error fetching tickets" }, { status: 500 })
    }

    if (!tickets || tickets.length === 0) {
      console.log("[v0] ⚠️ No verified or verifying participants - Lottery cannot be drawn")
      console.log("[v0] 📊 Total tickets in database:", allTickets?.length || 0)

      await supabase
        .from("lotteries")
        .update({
          status: "completed",
          winner_number: null,
        })
        .eq("id", lotteryId)

      console.log("[v0] ✅ Lottery marked as completed with no winner (insufficient verified participants)")

      return NextResponse.json(
        {
          success: true,
          noWinner: true,
          message: "Sorteo finalizado sin ganador por falta de participantes con pagos verificados",
          details: {
            totalTickets: allTickets?.length || 0,
            statusBreakdown: allTickets?.reduce((acc: any, ticket: any) => {
              acc[ticket.payment_status] = (acc[ticket.payment_status] || 0) + 1
              return acc
            }, {}),
          },
        },
        { status: 200 },
      )
    }

    console.log("[v0] Total participants for draw:", tickets.length)
    console.log("[v0] (Including verified + verifying statuses)")

    const randomIndex = getSecureRandomIndex(tickets.length)
    const winnerTicket = tickets[randomIndex]

    console.log("[v0] 🎯 Winner selected using secure random:")
    console.log("[v0] - Random index:", randomIndex, "out of", tickets.length)
    console.log("[v0] - Winner ticket:", winnerTicket.id)
    console.log("[v0] - Winner number:", winnerTicket.selected_number)
    console.log("[v0] - Winner name:", winnerTicket.participant_name)
    console.log("[v0] - Winner payment status:", winnerTicket.payment_status)

    if (winnerTicket.payment_status === "verifying") {
      console.log("[v0] 📝 Auto-verifying winner ticket")
      await supabase.from("lottery_tickets").update({ payment_status: "verified" }).eq("id", winnerTicket.id)
    }

    // Actualizar el sorteo con el número ganador
    const { error: updateError } = await supabase
      .from("lotteries")
      .update({
        winner_number: winnerTicket.selected_number,
        status: "completed",
      })
      .eq("id", lotteryId)

    if (updateError) {
      console.error("[v0] Error updating lottery:", updateError)
      return NextResponse.json({ error: "Error updating lottery" }, { status: 500 })
    }

    console.log("[v0] ✅ Lottery updated with winner")

    console.log("[v0] 📧 Starting email notifications to all", tickets.length, "participants...")

    let successCount = 0
    let errorCount = 0
    const emailResults = []

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i]
      const isWinner = ticket.id === winnerTicket.id

      try {
        console.log(
          `[v0] Sending email ${i + 1}/${tickets.length} to ${ticket.participant_email} (${isWinner ? "WINNER 🏆" : "participant"})`,
        )

        if (isWinner) {
          const result = await sendWinnerNotificationEmail(
            ticket.participant_email,
            lottery.prize_title,
            ticket.participant_name,
            winnerTicket.selected_number,
            lottery.prize_description || "Premio del sorteo",
          )

          if (!result.success) {
            throw new Error(result.error || "Failed to send winner email")
          }
        } else {
          const result = await sendNonWinnerNotificationEmail(
            ticket.participant_email,
            lottery.prize_title,
            ticket.participant_name,
            winnerTicket.selected_number,
            Number.parseInt(ticket.selected_number),
          )

          if (!result.success) {
            throw new Error(result.error || "Failed to send non-winner email")
          }
        }

        successCount++
        emailResults.push({
          email: ticket.participant_email,
          status: "sent",
          isWinner,
        })
        console.log(`[v0] ✅ Email sent successfully to ${ticket.participant_email}`)

        if (i < tickets.length - 1) {
          console.log(`[v0] ⏳ Waiting 600ms before next email (rate limit protection)...`)
          await delay(600)
        }
      } catch (emailError: any) {
        errorCount++
        emailResults.push({
          email: ticket.participant_email,
          status: "failed",
          error: emailError.message,
          isWinner,
        })
        console.error(`[v0] ❌ Error sending email to ${ticket.participant_email}:`, emailError)

        if (i < tickets.length - 1) {
          await delay(600)
        }
      }
    }

    console.log(`[v0] 📊 Email summary:`)
    console.log(`[v0] - Success: ${successCount}`)
    console.log(`[v0] - Errors: ${errorCount}`)
    console.log(`[v0] - Total participants: ${tickets.length}`)

    return NextResponse.json({
      success: true,
      winner: {
        name: winnerTicket.participant_name,
        email: winnerTicket.participant_email,
        number: winnerTicket.selected_number,
      },
      emailsSent: successCount,
      emailsFailed: errorCount,
      totalParticipants: tickets.length,
      emailResults,
    })
  } catch (error) {
    console.error("[v0] Error performing draw:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
