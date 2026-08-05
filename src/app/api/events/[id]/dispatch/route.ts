import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import sharp from "sharp"

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
    const { attendeeIds, groupLink, locationLink, note } = body

    const whereClause: any = { eventId }
    if (Array.isArray(attendeeIds) && attendeeIds.length > 0) {
      whereClause.id = { in: attendeeIds }
    }

    const attendees = await prisma.attendee.findMany({
      where: whereClause
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"))
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@eventflow.com"

    let templateData = null
    try {
      if (event.templateConfig) templateData = JSON.parse(event.templateConfig)
    } catch (e) {}
    const isCustom = templateData?.template === "custom" && event.customTemplateImage && event.customTemplateLayout

    let sentCount = 0
    for (const attendee of attendees) {
      if (attendee.email) {
        let htmlContent = ""
        let attachments: any[] = []

        if (isCustom) {
          try {
            const layout = JSON.parse(event.customTemplateLayout!)
            const bgBase64 = event.customTemplateImage!.replace(/^data:image\/\w+;base64,/, "")
            const bgBuffer = Buffer.from(bgBase64, 'base64')
            
            const qrRes = await fetch(`https://quickchart.io/qr?text=${encodeURIComponent(attendee.ticketCode)}&size=${layout.size}&margin=0`)
            const qrBuffer = Buffer.from(await qrRes.arrayBuffer())

            const bgMetadata = await sharp(bgBuffer).metadata()
            const bgW = bgMetadata.width || 800
            const bgH = bgMetadata.height || 600

            const left = Math.round((layout.x / 100) * bgW - (layout.size / 2))
            const top = Math.round((layout.y / 100) * bgH - (layout.size / 2))
            
            const safeLeft = Math.max(0, Math.min(left, bgW - layout.size))
            const safeTop = Math.max(0, Math.min(top, bgH - layout.size))

            const mergedBuffer = await sharp(bgBuffer)
              .composite([{ input: qrBuffer, top: safeTop, left: safeLeft }])
              .jpeg({ quality: 85 })
              .toBuffer()

            attachments.push({
              filename: 'event-pass.jpg',
              content: mergedBuffer,
              cid: 'eventpassimage'
            })

            htmlContent = `
              <div style="font-family: sans-serif; max-w: 800px; margin: 0 auto; text-align: center; background: #fafafa; padding: 20px;">
                <h1 style="color: #333; margin-bottom: 20px;">Your Pass for ${event.title}</h1>
                <img src="cid:eventpassimage" alt="Event Pass" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
                  ${attendee.ticketCode}
                </p>
                ${note ? `
                  <div style="margin-top: 25px; padding: 15px; background: #fff; border-left: 4px solid #4f46e5; text-align: left; font-size: 15px; color: #444; white-space: pre-wrap;">
                    ${note.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                  </div>
                ` : ""}
            `
          } catch (e) {
            console.error("Failed to generate custom pass", e)
          }
        } 
        
        if (!htmlContent) {
          // Fallback to standard template
          const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(attendee.ticketCode)}&size=300`
          htmlContent = `
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
              ${note ? `
                <div style="margin-top: 25px; padding: 15px; background: #fff; border-left: 4px solid #4f46e5; text-align: left; font-size: 15px; color: #444; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); white-space: pre-wrap;">
                  <strong>Note from Organizer:</strong><br/>
                  ${note.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                </div>
              ` : ""}
          `
        }

        if (groupLink) {
          htmlContent += `
            <div style="margin-top: 30px; padding: 20px; background: #eef2ff; border-radius: 8px; border: 1px solid #c7d2fe; text-align: center;">
              <h3 style="color: #4338ca; margin-top: 0; margin-bottom: 10px;">Join the Community!</h3>
              <p style="color: #4f46e5; font-size: 14px; margin-bottom: 15px;">In case you missed it during registration, join our official group to stay updated.</p>
              <a href="${groupLink}" style="background: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;">Join Group</a>
            </div>
          `
        }

        if (locationLink) {
          htmlContent += `
            <div style="margin-top: 20px; padding: 20px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0; text-align: center;">
              <h3 style="color: #047857; margin-top: 0; margin-bottom: 10px;">Venue Location</h3>
              <p style="color: #059669; font-size: 14px; margin-bottom: 15px;">Click the button below to get directions to the event.</p>
              <a href="${locationLink}" style="background: #059669; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;">Open in Maps</a>
            </div>
          `
        }

        htmlContent += `
            <p style="color: #888; font-size: 12px; margin-top: 40px; text-align: center;">
              Powered by Form-To-Flow
            </p>
          </div>
        `
        
        try {
          await transporter.sendMail({
            from: `"Event Team" <${fromEmail}>`,
            to: attendee.email,
            subject: `Your Pass for ${event.title}`,
            html: htmlContent,
            attachments: attachments
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
