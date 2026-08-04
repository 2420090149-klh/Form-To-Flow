"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "mock_user@ethereal.email",
    pass: process.env.SMTP_PASS || "mock_pass",
  },
})

export async function addTeamMember(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const eventId = formData.get("eventId") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string // "MANAGER" or "SCANNER"

  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerId: session.user.id }
  })
  if (!event) throw new Error("Only the owner can add team members")

  let user = await prisma.user.findUnique({ where: { email } })

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@eventflow.com"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"))

    // Always generate a temporary password for team invites (to make testing and logging in easy)
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: email.split("@")[0]
        }
      })
    } else {
      // Update existing user with new temp password
      user = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
    }

    // Send invite email with temporary password
    try {
      await transporter.sendMail({
        from: `"Event Team" <${fromEmail}>`,
        to: email,
        subject: `You've been invited to ${event.title}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h2>Welcome to EventFlow!</h2>
            <p>You have been added to the team for <strong>${event.title}</strong> as a <strong>${role}</strong>.</p>
            <p>Here are your login details to access the dashboard:</p>
            <p><strong>Email:</strong> ${email}<br>
            <strong>Password:</strong> ${tempPassword}</p>
            <p><a href="${appUrl}/login">Click here to log in</a> and access your dashboard.</p>
            <p><em>Please change your password after logging in.</em></p>
          </div>
        `
      })
    } catch (err) {
      console.error("Failed to send invite email:", err)
    }

  // Upsert the team member so if they exist, their role is updated
  await prisma.teamMember.upsert({
    where: {
      eventId_userId: {
        eventId,
        userId: user.id
      }
    },
    update: {
      role
    },
    create: {
      eventId,
      userId: user.id,
      role
    }
  })

  revalidatePath(`/dashboard/events/${eventId}/team`)
}

export async function removeTeamMember(eventId: string, userId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerId: session.user.id }
  })
  if (!event) throw new Error("Only the owner can remove team members")

  await prisma.teamMember.delete({
    where: {
      eventId_userId: {
        eventId,
        userId
      }
    }
  })

  revalidatePath(`/dashboard/events/${eventId}/team`)
}
