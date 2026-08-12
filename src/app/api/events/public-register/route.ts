import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const { eventId, formData } = await req.json()

    if (!eventId || !formData || !formData.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Extract core fields if they exist in schema, otherwise they stay in customData
    const email = formData.email || null
    const phone = formData.phone || null
    const teamName = formData.teamName || null

    // Create attendee
    const attendee = await prisma.attendee.create({
      data: {
        eventId,
        name: formData.name,
        email,
        phone,
        ticketCode: uuidv4().substring(0, 8).toUpperCase(),
        customData: formData, // Store the entire form submission as JSON
      }
    })

    return NextResponse.json({ success: true, attendeeId: attendee.id })
  } catch (error: any) {
    console.error("Public registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
