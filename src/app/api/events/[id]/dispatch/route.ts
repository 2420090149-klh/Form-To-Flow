import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

// Create a test account or mock transport for Nodemailer
// For production, you'd use your SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "mock_user@ethereal.email",
    pass: process.env.SMTP_PASS || "mock_pass",
  },
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

    const resolvedParams = await params
    const eventId = resolvedParams.id
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        ownerId: session.user.id
      }
    })

    if (!event) return new Response("Forbidden", { status: 403 })

    const body = await req.json().catch(() => ({}))
    const { attendeeIds } = body

    const whereClause: any = { eventId }
    if (Array.isArray(attendeeIds) && attendeeIds.length > 0) {
      whereClause.id = { in: attendeeIds }
    }

    const attendees = await prisma.attendee.findMany({
      where: whereClause
    })

    let sentCount = 0
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@eventflow.com"

    for (const attendee of attendees) {
      if (attendee.email) {
        // Generate QR code URL (using an external service so it loads in email clients)
        const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(attendee.ticketCode)}&size=300`
        
        try {
          await transporter.sendMail({
            from: `"Event Team" <${fromEmail}>`,
            to: attendee.email,
            subject: `Your Pass for ${event.title}`,
            html: `
              <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; text-align: center; border: 1px solid #eee; padding: 40px; border-radius: 12px; background: #fafafa;">
                <h1 style="color: #333; margin-bottom: 5px;">${event.title}</h1>
                <p style="color: #666; margin-top: 0;">${event.date ? new Date(event.date).toLocaleDateString() : ''} - ${event.location || ''}</p>
                <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <h2 style="color: #333; font-size: 24px;">Hi ${attendee.name},</h2>
                <p style="color: #555; font-size: 16px;">Here is your official event pass. Please present the QR code below at the check-in desk.</p>
                
                <div style="background: white; display: inline-block; padding: 20px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <img src="${qrCodeUrl}" alt="Ticket QR Code" width="200" height="200" style="display: block; margin: 0 auto; border: none; outline: none;"/>
                </div>
                
                <p style="font-family: monospace; font-size: 18px; letter-spacing: 2px; color: #333; background: #eee; display: inline-block; padding: 8px 16px; border-radius: 6px;">
                  ${attendee.ticketCode}
                </p>
                
                <p style="color: #888; font-size: 12px; margin-top: 40px;">
                  Powered by Form-To-Flow
                </p>
              </div>
            `
          })
          
          console.log(`[EMAIL SENT] Pass sent to ${attendee.email}`)
          sentCount++
        } catch (mailError) {
          console.error(`Failed to send email to ${attendee.email}:`, mailError)
        }
      }
    }

    // Ideally, update the attendees to mark emailSent = true. 
    // We didn't add this field, so we just return the sent count.
    
    return new Response(JSON.stringify({ sentCount }), { status: 200 })
  } catch (error) {
    console.error("Dispatch error:", error)
    return new Response("Internal Error", { status: 500 })
  }
}
