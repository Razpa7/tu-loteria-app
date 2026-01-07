import { NextResponse } from "next/server"
import {
  sendPaymentConfirmationEmail,
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
  sendWinnerNotificationEmail,
  sendNonWinnerNotificationEmail,
  sendNewPaymentNotificationToCreator,
} from "@/lib/email-notifications"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    console.log("[v0] 📧 Sending notification type:", type)
    console.log("[v0] 📝 Email data:", JSON.stringify(data, null, 2))

    let result: { success: boolean; error?: string }

    switch (type) {
      case "payment_confirmation":
        result = await sendPaymentConfirmationEmail(
          data.participantEmail,
          data.lotteryTitle,
          data.participantName,
          data.selectedNumbers,
          data.lotteryDetails,
        )
        break

      case "payment_approved":
        if (!data.participantEmail || !data.lotteryTitle || !data.participantName) {
          console.error("[v0] ❌ Missing required fields for payment_approved email")
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        result = await sendPaymentApprovedEmail(
          data.participantEmail,
          data.lotteryTitle,
          data.participantName,
          data.selectedNumbers,
          data.lotteryDetails,
        )
        break

      case "payment_rejected":
        result = await sendPaymentRejectedEmail(
          data.participantEmail,
          data.lotteryTitle,
          data.participantName,
          data.selectedNumbers,
          data.rejectionReason,
          data.lotteryDetails,
        )
        break

      case "winner_notification":
        if (!data.participantEmail || !data.winningNumber) {
          console.error("[v0] ❌ Missing required fields for winner notification")
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        result = await sendWinnerNotificationEmail(
          data.participantEmail,
          data.lotteryTitle,
          data.participantName,
          data.winningNumber,
          data.prize,
        )
        break

      case "non_winner_notification":
        if (!data.participantEmail || !data.winningNumber || !data.userNumber) {
          console.error("[v0] ❌ Missing required fields for non-winner notification")
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        result = await sendNonWinnerNotificationEmail(
          data.participantEmail,
          data.lotteryTitle,
          data.participantName,
          data.winningNumber,
          data.userNumber,
        )
        break

      case "new_payment_to_creator":
        result = await sendNewPaymentNotificationToCreator(
          data.creatorEmail,
          data.lotteryTitle,
          data.participantName,
          data.selectedNumbers,
        )
        break

      default:
        console.error("[v0] ❌ Invalid notification type:", type)
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    if (!result.success) {
      console.error("[v0] ❌ Email failed:", result.error)
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 })
    }

    console.log("[v0] ✅ Email sent successfully")
    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("[v0] ❌ Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
